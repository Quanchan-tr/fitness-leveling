package com.fittrack.app.ui.modal

import android.app.Activity
import android.content.Intent
import android.graphics.Typeface
import android.os.Bundle
import android.text.Editable
import android.text.TextWatcher
import android.view.Gravity
import android.view.View
import android.view.ViewGroup
import android.widget.ImageView
import android.widget.LinearLayout
import android.widget.TextView
import android.widget.Toast
import androidx.appcompat.app.AlertDialog
import androidx.appcompat.app.AppCompatActivity
import androidx.core.content.ContextCompat
import androidx.lifecycle.lifecycleScope
import androidx.recyclerview.widget.LinearLayoutManager
import androidx.recyclerview.widget.RecyclerView
import com.fittrack.app.R
import com.fittrack.app.data.api.ApiClient
import com.fittrack.app.data.models.ExerciseDto
import com.fittrack.app.data.models.RoutineExerciseLocal
import com.fittrack.app.data.models.RoutineSetLocal
import com.fittrack.app.databinding.ActivityModalExercisePickerBinding
import com.fittrack.app.util.WindowInsetsHelper
import com.fittrack.app.util.loadUrl
import com.google.gson.Gson
import kotlinx.coroutines.Dispatchers
import kotlinx.coroutines.Job
import kotlinx.coroutines.delay
import kotlinx.coroutines.launch
import kotlinx.coroutines.withContext

class ExercisePickerModalActivity : AppCompatActivity() {

    private lateinit var binding: ActivityModalExercisePickerBinding
    private val selectedMap = linkedMapOf<String, ExerciseDto>()
    private var fullDataset: List<ExerciseDto> = emptyList()
    private var filteredList: List<ExerciseDto> = emptyList()

    private var selectedMuscleFilter: String? = null
    private var selectedEquipmentFilter: String? = null
    private var searchJob: Job? = null

    private lateinit var adapter: ExercisePickerAdapter

    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)
        binding = ActivityModalExercisePickerBinding.inflate(layoutInflater)
        setContentView(binding.root)

        WindowInsetsHelper.applySystemInsets(this, binding.root, binding.layoutHeader, binding.layoutBottomCta)

        adapter = ExercisePickerAdapter()
        binding.rvExerciseList.layoutManager = LinearLayoutManager(this)
        binding.rvExerciseList.adapter = adapter

        setupListeners()
        setupSearch()
        fetchDatasetExercises()
    }

    private fun setupListeners() {
        binding.btnClosePicker.setOnClickListener { finish() }
        binding.btnFilterEquipment.setOnClickListener { showEquipmentPopup() }
        binding.btnFilterMuscle.setOnClickListener { showMusclePopup() }
        binding.tvPickerStatus.setOnClickListener {
            if (fullDataset.isEmpty()) fetchDatasetExercises()
        }

        binding.btnAddToWorkout.setOnClickListener {
            if (selectedMap.isEmpty()) {
                Toast.makeText(this, "Vui lòng chọn ít nhất 1 bài tập", Toast.LENGTH_SHORT).show()
                return@setOnClickListener
            }
            val resultList = selectedMap.values.map { ex ->
                RoutineExerciseLocal(
                    exerciseId = ex.id,
                    name = ex.name,
                    targetMuscle = ex.targetMuscle ?: ex.bodyPart ?: "Toàn thân",
                    equipment = ex.equipment ?: "Tự do",
                    gifUrl = ex.gifUrl ?: ex.thumbnailUrl,
                    instructions = ex.instructions,
                    setsCount = 3,
                    reps = 10,
                    weightKg = 20f,
                    restSeconds = 60,
                    note = "",
                    sets = mutableListOf(
                        RoutineSetLocal(1, 20f, 10),
                        RoutineSetLocal(2, 20f, 10),
                        RoutineSetLocal(3, 20f, 10)
                    )
                )
            }
            val resultIntent = Intent().apply {
                putExtra("SELECTED_EXERCISES_JSON", Gson().toJson(resultList))
            }
            setResult(Activity.RESULT_OK, resultIntent)
            finish()
        }
    }

    private fun fetchDatasetExercises() {
        binding.tvPickerStatus.visibility = View.VISIBLE
        binding.tvPickerStatus.text = "Đang tải thư viện bài tập từ máy chủ..."
        binding.rvExerciseList.visibility = View.GONE

        lifecycleScope.launch {
            try {
                val res = withContext(Dispatchers.IO) {
                    ApiClient.getService(this@ExercisePickerModalActivity).getExercises(perPage = 2000)
                }
                if (res.isSuccessful && res.body()?.data != null) {
                    fullDataset = res.body()!!.data!!
                    applyFiltersAndRender()
                } else {
                    showErrorState("Không thể tải dữ liệu bài tập (${res.code()}). Chạm để thử lại.")
                }
            } catch (e: Exception) {
                showErrorState("Lỗi kết nối máy chủ: ${e.localizedMessage ?: "Không xác định"}. Chạm để thử lại.")
            }
        }
    }

    private fun showErrorState(msg: String) {
        binding.rvExerciseList.visibility = View.GONE
        binding.tvPickerStatus.visibility = View.VISIBLE
        binding.tvPickerStatus.text = msg
    }

    private fun showEquipmentPopup() {
        if (fullDataset.isEmpty()) {
            Toast.makeText(this, "Dữ liệu bài tập chưa sẵn sàng", Toast.LENGTH_SHORT).show()
            return
        }
        val distinctEquipments = fullDataset.mapNotNull { it.equipment?.trim()?.takeIf { e -> e.isNotBlank() } }
            .distinctBy { it.lowercase() }
            .sorted()
        val options = listOf<String?>(null) + distinctEquipments
        val labels = options.map { it ?: "Tất cả dụng cụ" }.toTypedArray()
        val checkedIndex = options.indexOfFirst { it.equals(selectedEquipmentFilter, ignoreCase = true) }.coerceAtLeast(0)
        var pendingIndex = checkedIndex

        AlertDialog.Builder(this)
            .setTitle("🏋️ Lọc theo Dụng cụ (${distinctEquipments.size})")
            .setSingleChoiceItems(labels, checkedIndex) { _, which ->
                pendingIndex = which
            }
            .setPositiveButton("Áp dụng") { _, _ ->
                selectedEquipmentFilter = options[pendingIndex]
                binding.btnFilterEquipment.text = if (selectedEquipmentFilter == null) {
                    "🏋️ Dụng cụ: Tất cả ▾"
                } else {
                    "🏋️ ${selectedEquipmentFilter} ▾"
                }
                applyFiltersAndRender()
            }
            .setNegativeButton("Hủy", null)
            .show()
    }

    private fun showMusclePopup() {
        if (fullDataset.isEmpty()) {
            Toast.makeText(this, "Dữ liệu bài tập chưa sẵn sàng", Toast.LENGTH_SHORT).show()
            return
        }
        val distinctMuscles = fullDataset.mapNotNull {
            (it.bodyPart ?: it.category ?: it.targetMuscle)?.trim()?.takeIf { m -> m.isNotBlank() }
        }
            .distinctBy { it.lowercase() }
            .sorted()
        val options = listOf<String?>(null) + distinctMuscles
        val labels = options.map { it ?: "Tất cả nhóm cơ" }.toTypedArray()
        val checkedIndex = options.indexOfFirst { it.equals(selectedMuscleFilter, ignoreCase = true) }.coerceAtLeast(0)
        var pendingIndex = checkedIndex

        AlertDialog.Builder(this)
            .setTitle("💪 Lọc theo Nhóm cơ (${distinctMuscles.size})")
            .setSingleChoiceItems(labels, checkedIndex) { _, which ->
                pendingIndex = which
            }
            .setPositiveButton("Áp dụng") { _, _ ->
                selectedMuscleFilter = options[pendingIndex]
                binding.btnFilterMuscle.text = if (selectedMuscleFilter == null) {
                    "💪 Nhóm cơ: Tất cả ▾"
                } else {
                    "💪 ${selectedMuscleFilter} ▾"
                }
                applyFiltersAndRender()
            }
            .setNegativeButton("Hủy", null)
            .show()
    }

    private fun setupSearch() {
        binding.etSearchExercise.addTextChangedListener(object : TextWatcher {
            override fun beforeTextChanged(s: CharSequence?, start: Int, count: Int, after: Int) {}
            override fun onTextChanged(s: CharSequence?, start: Int, before: Int, count: Int) {}
            override fun afterTextChanged(s: Editable?) {
                searchJob?.cancel()
                searchJob = lifecycleScope.launch {
                    delay(200)
                    applyFiltersAndRender()
                }
            }
        })
    }

    private fun applyFiltersAndRender() {
        val query = binding.etSearchExercise.text.toString().trim()
        val equip = selectedEquipmentFilter
        val muscle = selectedMuscleFilter

        filteredList = fullDataset.filter { ex ->
            val matchEquip = equip.isNullOrBlank() || ex.equipment.equals(equip, ignoreCase = true)
            val matchMuscle = muscle.isNullOrBlank() ||
                ex.bodyPart.equals(muscle, ignoreCase = true) ||
                ex.category.equals(muscle, ignoreCase = true) ||
                ex.targetMuscle.equals(muscle, ignoreCase = true)
            val matchQuery = query.isBlank() ||
                ex.name.contains(query, ignoreCase = true) ||
                ex.targetMuscle?.contains(query, ignoreCase = true) == true ||
                ex.equipment?.contains(query, ignoreCase = true) == true
            matchEquip && matchMuscle && matchQuery
        }

        if (filteredList.isEmpty()) {
            binding.rvExerciseList.visibility = View.GONE
            binding.tvPickerStatus.visibility = View.VISIBLE
            binding.tvPickerStatus.text = "Không tìm thấy bài tập phù hợp trong bộ dữ liệu"
        } else {
            binding.tvPickerStatus.visibility = View.GONE
            binding.rvExerciseList.visibility = View.VISIBLE
        }
        adapter.notifyDataSetChanged()
    }

    private inner class ExercisePickerAdapter : RecyclerView.Adapter<ExercisePickerAdapter.ExViewHolder>() {

        inner class ExViewHolder(
            val row: LinearLayout,
            val thumb: ImageView,
            val tvName: TextView,
            val tvSub: TextView,
            val btnCheck: ImageView
        ) : RecyclerView.ViewHolder(row)

        override fun onCreateViewHolder(parent: ViewGroup, viewType: Int): ExViewHolder {
            val ctx = parent.context
            val row = LinearLayout(ctx).apply {
                layoutParams = RecyclerView.LayoutParams(
                    RecyclerView.LayoutParams.MATCH_PARENT,
                    RecyclerView.LayoutParams.WRAP_CONTENT
                ).apply { bottomMargin = 14 }
                background = ContextCompat.getDrawable(ctx, R.drawable.bg_card_white)
                orientation = LinearLayout.HORIZONTAL
                gravity = Gravity.CENTER_VERTICAL
                setPadding(24, 20, 24, 20)
                isClickable = true
                isFocusable = true
            }

            val thumb = ImageView(ctx).apply {
                layoutParams = LinearLayout.LayoutParams(96, 96).apply { marginEnd = 20 }
                scaleType = ImageView.ScaleType.CENTER_CROP
            }

            val infoCol = LinearLayout(ctx).apply {
                layoutParams = LinearLayout.LayoutParams(0, LinearLayout.LayoutParams.WRAP_CONTENT, 1f).apply {
                    marginEnd = 16
                }
                orientation = LinearLayout.VERTICAL
            }

            val tvName = TextView(ctx).apply {
                setTextColor(ContextCompat.getColor(ctx, R.color.text_dark))
                textSize = 13.5f
                typeface = Typeface.DEFAULT_BOLD
            }

            val tvSub = TextView(ctx).apply {
                setTextColor(ContextCompat.getColor(ctx, R.color.text_slate))
                textSize = 11.5f
            }

            infoCol.addView(tvName)
            infoCol.addView(tvSub)

            val btnCheck = ImageView(ctx).apply {
                layoutParams = LinearLayout.LayoutParams(64, 64)
                background = ContextCompat.getDrawable(ctx, R.drawable.bg_modal_circle_primary)
                setPadding(14, 14, 14, 14)
                setColorFilter(ContextCompat.getColor(ctx, R.color.white))
            }

            row.addView(thumb)
            row.addView(infoCol)
            row.addView(btnCheck)
            return ExViewHolder(row, thumb, tvName, tvSub, btnCheck)
        }

        override fun getItemCount(): Int = filteredList.size

        override fun onBindViewHolder(holder: ExViewHolder, position: Int) {
            val ex = filteredList[position]
            holder.tvName.text = ex.name
            val muscle = ex.targetMuscle ?: ex.bodyPart ?: "Toàn thân"
            val equip = ex.equipment ?: "Tự do"
            holder.tvSub.text = "💪 $muscle • 🏋️ $equip"
            holder.thumb.loadUrl(ex.gifUrl?.takeIf { it.isNotBlank() } ?: ex.thumbnailUrl, R.drawable.ic_dumbbell_solid)

            val isSelected = selectedMap.containsKey(ex.id)
            holder.btnCheck.setImageResource(if (isSelected) R.drawable.ic_check_solid else R.drawable.ic_plus_solid)

            val toggle = {
                if (selectedMap.containsKey(ex.id)) {
                    selectedMap.remove(ex.id)
                } else {
                    selectedMap[ex.id] = ex
                }
                notifyItemChanged(holder.adapterPosition)
                val count = selectedMap.size
                binding.btnAddToWorkout.text = if (count > 0) {
                    "Thêm $count bài tập vào giáo án"
                } else {
                    getString(R.string.modal_picker_btn_add)
                }
            }

            holder.row.setOnClickListener { toggle() }
            holder.btnCheck.setOnClickListener { toggle() }
        }
    }
}
