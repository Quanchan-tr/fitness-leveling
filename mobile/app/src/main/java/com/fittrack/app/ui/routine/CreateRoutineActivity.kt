package com.fittrack.app.ui.routine

import android.app.Activity
import android.content.Intent
import android.graphics.Typeface
import android.os.Bundle
import android.text.Editable
import android.text.InputType
import android.text.TextWatcher
import android.view.Gravity
import android.view.View
import android.widget.EditText
import android.widget.ImageView
import android.widget.LinearLayout
import android.widget.TextView
import android.widget.Toast
import androidx.activity.result.contract.ActivityResultContracts
import androidx.appcompat.app.AlertDialog
import androidx.appcompat.app.AppCompatActivity
import androidx.core.content.ContextCompat
import androidx.lifecycle.lifecycleScope
import com.fittrack.app.R
import com.fittrack.app.data.api.ApiClient
import com.fittrack.app.data.models.CreateRoutineRequest
import com.fittrack.app.data.models.RoutineExerciseLocal
import com.fittrack.app.data.models.RoutineFolderLocal
import com.fittrack.app.data.models.RoutineSetLocal
import com.fittrack.app.data.session.SessionManager
import com.fittrack.app.databinding.ActivityCreateRoutineBinding
import com.fittrack.app.ui.modal.ExercisePickerModalActivity
import com.fittrack.app.util.WindowInsetsHelper
import com.google.gson.Gson
import com.google.gson.reflect.TypeToken
import kotlinx.coroutines.Dispatchers
import kotlinx.coroutines.launch
import kotlinx.coroutines.withContext
import java.util.UUID

class CreateRoutineActivity : AppCompatActivity() {

    private lateinit var binding: ActivityCreateRoutineBinding
    private lateinit var session: SessionManager
    private val gson = Gson()

    private var editingRoutineId: String? = null
    private val selectedExercises = mutableListOf<RoutineExerciseLocal>()

    private val restOptions = listOf(15, 30, 45, 60, 90, 120, 150, 180, 240, 300)

    private val exercisePickerLauncher = registerForActivityResult(
        ActivityResultContracts.StartActivityForResult()
    ) { result ->
        if (result.resultCode == Activity.RESULT_OK) {
            val json = result.data?.getStringExtra("SELECTED_EXERCISES_JSON") ?: return@registerForActivityResult
            val type = object : TypeToken<List<RoutineExerciseLocal>>() {}.type
            val picked: List<RoutineExerciseLocal> = gson.fromJson(json, type) ?: emptyList()
            picked.forEach { newEx ->
                if (selectedExercises.none { it.exerciseId == newEx.exerciseId }) {
                    ensureSetsInitialized(newEx)
                    selectedExercises.add(newEx)
                }
            }
            renderExercisesList()
        }
    }

    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)
        binding = ActivityCreateRoutineBinding.inflate(layoutInflater)
        setContentView(binding.root)

        WindowInsetsHelper.applySystemInsets(
            this, binding.root, binding.layoutHeader, binding.layoutBottomCta
        )

        session = SessionManager.getInstance(this)

        editingRoutineId = intent.getStringExtra("ROUTINE_ID")?.takeIf { it.isNotBlank() }
        val initialTitle = intent.getStringExtra("ROUTINE_TITLE")

        if (editingRoutineId != null) {
            binding.tvTitle.text = "Chỉnh sửa giáo án"
            binding.btnSaveRoutine.text = "Cập nhật giáo án"
            if (!initialTitle.isNullOrBlank()) {
                binding.etRoutineName.setText(initialTitle)
            }
            val saved = session.getRoutineExercises(editingRoutineId!!)
            saved.forEach { ensureSetsInitialized(it) }
            selectedExercises.addAll(saved)
        }

        renderExercisesList()

        binding.btnBack.setOnClickListener { finish() }

        val openPicker = {
            exercisePickerLauncher.launch(Intent(this, ExercisePickerModalActivity::class.java))
        }
        binding.btnAddExercise.setOnClickListener { openPicker() }
        binding.btnCenterAddExercise.setOnClickListener { openPicker() }
        binding.btnAddExerciseBottom.setOnClickListener { openPicker() }

        binding.btnSaveRoutine.setOnClickListener { handleSaveRoutine() }
    }

    private fun ensureSetsInitialized(ex: RoutineExerciseLocal) {
        if (ex.sets.isEmpty()) {
            val count = ex.setsCount.coerceAtLeast(1)
            for (i in 1..count) {
                ex.sets.add(RoutineSetLocal(i, ex.weightKg, ex.reps))
            }
        }
        syncLegacySetSummary(ex)
    }

    private fun syncLegacySetSummary(ex: RoutineExerciseLocal) {
        ex.sets.forEachIndexed { idx, s -> s.setNumber = idx + 1 }
        ex.setsCount = ex.sets.size
        ex.weightKg = ex.sets.firstOrNull()?.weightKg ?: 20f
        ex.reps = ex.sets.firstOrNull()?.reps ?: 10
    }

    private fun renderExercisesList() {
        binding.llRoutineExercises.removeAllViews()
        val isEmpty = selectedExercises.isEmpty()
        binding.layoutEmptyAddExercise.visibility = if (isEmpty) View.VISIBLE else View.GONE
        binding.btnAddExerciseBottom.visibility = if (isEmpty) View.GONE else View.VISIBLE

        if (isEmpty) return

        selectedExercises.forEachIndexed { index, ex ->
            ensureSetsInitialized(ex)

            val card = LinearLayout(this).apply {
                layoutParams = LinearLayout.LayoutParams(
                    LinearLayout.LayoutParams.MATCH_PARENT,
                    LinearLayout.LayoutParams.WRAP_CONTENT
                ).apply { topMargin = 20 }
                background = ContextCompat.getDrawable(this@CreateRoutineActivity, R.drawable.bg_card_white)
                orientation = LinearLayout.VERTICAL
                setPadding(28, 24, 28, 24)
            }

            // 1. Header Row: Name + Move Up/Down + Delete
            val headerRow = LinearLayout(this).apply {
                orientation = LinearLayout.HORIZONTAL
                gravity = Gravity.CENTER_VERTICAL
            }

            val tvName = TextView(this).apply {
                layoutParams = LinearLayout.LayoutParams(0, LinearLayout.LayoutParams.WRAP_CONTENT, 1f)
                text = "${index + 1}. ${ex.name}"
                setTextColor(ContextCompat.getColor(this@CreateRoutineActivity, R.color.text_dark))
                textSize = 14.5f
                typeface = Typeface.DEFAULT_BOLD
            }

            val btnUp = TextView(this).apply {
                text = "▲"
                textSize = 13f
                setTextColor(
                    ContextCompat.getColor(
                        this@CreateRoutineActivity,
                        if (index > 0) R.color.primary_blue else R.color.text_slate_light
                    )
                )
                setPadding(14, 8, 14, 8)
                isEnabled = index > 0
                setOnClickListener {
                    if (index > 0) {
                        val item = selectedExercises.removeAt(index)
                        selectedExercises.add(index - 1, item)
                        renderExercisesList()
                    }
                }
            }

            val btnDown = TextView(this).apply {
                text = "▼"
                textSize = 13f
                setTextColor(
                    ContextCompat.getColor(
                        this@CreateRoutineActivity,
                        if (index < selectedExercises.lastIndex) R.color.primary_blue else R.color.text_slate_light
                    )
                )
                setPadding(14, 8, 14, 8)
                isEnabled = index < selectedExercises.lastIndex
                setOnClickListener {
                    if (index < selectedExercises.lastIndex) {
                        val item = selectedExercises.removeAt(index)
                        selectedExercises.add(index + 1, item)
                        renderExercisesList()
                    }
                }
            }

            val btnDelete = ImageView(this).apply {
                layoutParams = LinearLayout.LayoutParams(52, 52)
                setPadding(10, 10, 10, 10)
                setImageResource(R.drawable.ic_trash_solid)
                setColorFilter(ContextCompat.getColor(this@CreateRoutineActivity, R.color.text_muted))
                setOnClickListener {
                    selectedExercises.removeAt(index)
                    renderExercisesList()
                }
            }

            headerRow.addView(tvName)
            headerRow.addView(btnUp)
            headerRow.addView(btnDown)
            headerRow.addView(btnDelete)
            card.addView(headerRow)

            // 2. Rest Timer + Add Note Row
            val metaRow = LinearLayout(this).apply {
                layoutParams = LinearLayout.LayoutParams(
                    LinearLayout.LayoutParams.MATCH_PARENT,
                    LinearLayout.LayoutParams.WRAP_CONTENT
                ).apply { topMargin = 14 }
                orientation = LinearLayout.HORIZONTAL
                gravity = Gravity.CENTER_VERTICAL
            }

            val btnRest = TextView(this).apply {
                layoutParams = LinearLayout.LayoutParams(0, LinearLayout.LayoutParams.WRAP_CONTENT, 1f).apply {
                    marginEnd = 12
                }
                background = ContextCompat.getDrawable(this@CreateRoutineActivity, R.drawable.bg_tag_chip)
                text = "⏱ Nghỉ: ${ex.restSeconds}s ▾"
                setTextColor(ContextCompat.getColor(this@CreateRoutineActivity, R.color.text_dark))
                textSize = 12f
                typeface = Typeface.DEFAULT_BOLD
                gravity = Gravity.CENTER
                setPadding(16, 14, 16, 14)
                setOnClickListener { showRestTimerDialog(ex) }
            }

            val btnNote = TextView(this).apply {
                layoutParams = LinearLayout.LayoutParams(0, LinearLayout.LayoutParams.WRAP_CONTENT, 1f)
                background = ContextCompat.getDrawable(this@CreateRoutineActivity, R.drawable.bg_tag_chip)
                text = if (ex.note.isBlank()) "📝 Thêm ghi chú" else "📝 Sửa ghi chú"
                setTextColor(ContextCompat.getColor(this@CreateRoutineActivity, R.color.primary_blue))
                textSize = 12f
                typeface = Typeface.DEFAULT_BOLD
                gravity = Gravity.CENTER
                setPadding(16, 14, 16, 14)
                setOnClickListener { showNoteDialog(ex) }
            }

            metaRow.addView(btnRest)
            metaRow.addView(btnNote)
            card.addView(metaRow)

            // Note preview (below Rest & Note row)
            if (ex.note.isNotBlank()) {
                val tvNotePreview = TextView(this).apply {
                    layoutParams = LinearLayout.LayoutParams(
                        LinearLayout.LayoutParams.MATCH_PARENT,
                        LinearLayout.LayoutParams.WRAP_CONTENT
                    ).apply { topMargin = 10 }
                    background = ContextCompat.getDrawable(this@CreateRoutineActivity, R.drawable.bg_tag_chip)
                    text = "📌 Ghi chú: ${ex.note}"
                    setTextColor(ContextCompat.getColor(this@CreateRoutineActivity, R.color.text_slate))
                    textSize = 11.5f
                    setPadding(18, 12, 18, 12)
                }
                card.addView(tvNotePreview)
            }

            // 3. Sets Table Header
            val tableHeader = LinearLayout(this).apply {
                layoutParams = LinearLayout.LayoutParams(
                    LinearLayout.LayoutParams.MATCH_PARENT,
                    LinearLayout.LayoutParams.WRAP_CONTENT
                ).apply { topMargin = 16 }
                orientation = LinearLayout.HORIZONTAL
                gravity = Gravity.CENTER_VERTICAL
            }
            val headerLabels = listOf("HIỆP" to 0.7f, "KG" to 1f, "REPS" to 1f, "" to 0.5f)
            headerLabels.forEach { (label, weight) ->
                val tv = TextView(this).apply {
                    layoutParams = LinearLayout.LayoutParams(0, LinearLayout.LayoutParams.WRAP_CONTENT, weight)
                    text = label
                    setTextColor(ContextCompat.getColor(this@CreateRoutineActivity, R.color.text_muted))
                    textSize = 10.5f
                    typeface = Typeface.DEFAULT_BOLD
                    gravity = Gravity.CENTER
                }
                tableHeader.addView(tv)
            }
            card.addView(tableHeader)

            // 4. Individual Set Rows
            ex.sets.forEachIndexed { setIndex, setItem ->
                val setRow = LinearLayout(this).apply {
                    layoutParams = LinearLayout.LayoutParams(
                        LinearLayout.LayoutParams.MATCH_PARENT,
                        LinearLayout.LayoutParams.WRAP_CONTENT
                    ).apply { topMargin = 10 }
                    orientation = LinearLayout.HORIZONTAL
                    gravity = Gravity.CENTER_VERTICAL
                }

                val tvSetNum = TextView(this).apply {
                    layoutParams = LinearLayout.LayoutParams(0, LinearLayout.LayoutParams.WRAP_CONTENT, 0.7f)
                    text = "${setIndex + 1}"
                    setTextColor(ContextCompat.getColor(this@CreateRoutineActivity, R.color.text_dark))
                    textSize = 13f
                    typeface = Typeface.DEFAULT_BOLD
                    gravity = Gravity.CENTER
                }

                val etKg = EditText(this).apply {
                    layoutParams = LinearLayout.LayoutParams(0, 88, 1f).apply {
                        marginStart = 8
                        marginEnd = 8
                    }
                    background = ContextCompat.getDrawable(this@CreateRoutineActivity, R.drawable.bg_tag_chip)
                    inputType = InputType.TYPE_CLASS_NUMBER or InputType.TYPE_NUMBER_FLAG_DECIMAL
                    gravity = Gravity.CENTER
                    setTextColor(ContextCompat.getColor(this@CreateRoutineActivity, R.color.text_dark))
                    textSize = 13f
                    val displayKg = if (setItem.weightKg % 1f == 0f) setItem.weightKg.toInt().toString() else setItem.weightKg.toString()
                    setText(displayKg)
                    addTextChangedListener(object : TextWatcher {
                        override fun beforeTextChanged(s: CharSequence?, start: Int, count: Int, after: Int) {}
                        override fun onTextChanged(s: CharSequence?, start: Int, before: Int, count: Int) {}
                        override fun afterTextChanged(s: Editable?) {
                            setItem.weightKg = s?.toString()?.toFloatOrNull()?.coerceAtLeast(0f) ?: 0f
                            syncLegacySetSummary(ex)
                        }
                    })
                }

                val etReps = EditText(this).apply {
                    layoutParams = LinearLayout.LayoutParams(0, 88, 1f).apply {
                        marginStart = 8
                        marginEnd = 8
                    }
                    background = ContextCompat.getDrawable(this@CreateRoutineActivity, R.drawable.bg_tag_chip)
                    inputType = InputType.TYPE_CLASS_NUMBER
                    gravity = Gravity.CENTER
                    setTextColor(ContextCompat.getColor(this@CreateRoutineActivity, R.color.text_dark))
                    textSize = 13f
                    setText(setItem.reps.toString())
                    addTextChangedListener(object : TextWatcher {
                        override fun beforeTextChanged(s: CharSequence?, start: Int, count: Int, after: Int) {}
                        override fun onTextChanged(s: CharSequence?, start: Int, before: Int, count: Int) {}
                        override fun afterTextChanged(s: Editable?) {
                            setItem.reps = s?.toString()?.toIntOrNull()?.coerceAtLeast(1) ?: 1
                            syncLegacySetSummary(ex)
                        }
                    })
                }

                val btnRemoveSet = TextView(this).apply {
                    layoutParams = LinearLayout.LayoutParams(0, LinearLayout.LayoutParams.WRAP_CONTENT, 0.5f)
                    text = "✕"
                    textSize = 14f
                    gravity = Gravity.CENTER
                    setTextColor(
                        ContextCompat.getColor(
                            this@CreateRoutineActivity,
                            if (ex.sets.size > 1) R.color.text_muted else R.color.text_slate_light
                        )
                    )
                    setOnClickListener {
                        if (ex.sets.size > 1) {
                            ex.sets.removeAt(setIndex)
                            syncLegacySetSummary(ex)
                            renderExercisesList()
                        } else {
                            Toast.makeText(this@CreateRoutineActivity, "Cần ít nhất 1 hiệp tập", Toast.LENGTH_SHORT).show()
                        }
                    }
                }

                setRow.addView(tvSetNum)
                setRow.addView(etKg)
                setRow.addView(etReps)
                setRow.addView(btnRemoveSet)
                card.addView(setRow)
            }

            // 5. Add Set Button
            val btnAddSet = TextView(this).apply {
                layoutParams = LinearLayout.LayoutParams(
                    LinearLayout.LayoutParams.MATCH_PARENT,
                    LinearLayout.LayoutParams.WRAP_CONTENT
                ).apply { topMargin = 14 }
                background = ContextCompat.getDrawable(this@CreateRoutineActivity, R.drawable.bg_tag_chip)
                text = "+ Thêm hiệp tập"
                setTextColor(ContextCompat.getColor(this@CreateRoutineActivity, R.color.primary))
                textSize = 12.5f
                typeface = Typeface.DEFAULT_BOLD
                gravity = Gravity.CENTER
                setPadding(16, 16, 16, 16)
                setOnClickListener {
                    val last = ex.sets.lastOrNull()
                    ex.sets.add(
                        RoutineSetLocal(
                            setNumber = ex.sets.size + 1,
                            weightKg = last?.weightKg ?: 20f,
                            reps = last?.reps ?: 10
                        )
                    )
                    syncLegacySetSummary(ex)
                    renderExercisesList()
                }
            }
            card.addView(btnAddSet)

            binding.llRoutineExercises.addView(card)
        }
    }

    private fun showRestTimerDialog(ex: RoutineExerciseLocal) {
        val labels = restOptions.map { "${it} giây" }.toTypedArray()
        val checked = restOptions.indexOf(ex.restSeconds).let { if (it >= 0) it else 3 }
        AlertDialog.Builder(this)
            .setTitle("⏱ Thời gian nghỉ giữa hiệp")
            .setSingleChoiceItems(labels, checked) { dialog, which ->
                ex.restSeconds = restOptions[which]
                renderExercisesList()
                dialog.dismiss()
            }
            .setNegativeButton("Đóng", null)
            .show()
    }

    private fun showNoteDialog(ex: RoutineExerciseLocal) {
        val input = EditText(this).apply {
            hint = "Nhập ghi chú cho bài tập (vd: Hạ chậm 3 giây...)"
            setText(ex.note)
            setPadding(40, 24, 40, 24)
        }
        AlertDialog.Builder(this)
            .setTitle("📝 Ghi chú: ${ex.name}")
            .setView(input)
            .setPositiveButton("Lưu") { _, _ ->
                ex.note = input.text.toString().trim()
                renderExercisesList()
            }
            .setNegativeButton("Hủy", null)
            .show()
    }

    private fun handleSaveRoutine() {
        val title = binding.etRoutineName.text.toString().trim()
        if (title.isBlank()) {
            Toast.makeText(this, "Vui lòng nhập tên routine / giáo án", Toast.LENGTH_SHORT).show()
            return
        }

        selectedExercises.forEach { syncLegacySetSummary(it) }

        binding.btnSaveRoutine.isEnabled = false
        val originalText = binding.btnSaveRoutine.text
        binding.btnSaveRoutine.text = "Đang lưu lên Cloud..."

        val desc = if (selectedExercises.isNotEmpty()) {
            "${selectedExercises.size} bài tập • ${selectedExercises.sumOf { it.setsCount }} hiệp"
        } else {
            "Giáo án luyện tập tùy biến trên FitTrack Mobile"
        }
        val request = CreateRoutineRequest(
            title = title,
            description = desc,
            targetSplit = "custom",
            scheduleDays = listOf("monday", "wednesday", "friday"),
            isActive = true
        )

        lifecycleScope.launch {
            try {
                val api = ApiClient.getService(this@CreateRoutineActivity)
                val response = withContext(Dispatchers.IO) {
                    if (editingRoutineId != null) {
                        api.updateRoutine(editingRoutineId!!, request)
                    } else {
                        api.createRoutine(UUID.randomUUID().toString(), request)
                    }
                }

                if (response.isSuccessful && response.body()?.data != null) {
                    val savedId = response.body()!!.data!!.id
                    session.saveRoutineExercises(savedId, selectedExercises)

                    Toast.makeText(
                        this@CreateRoutineActivity,
                        if (editingRoutineId != null) "✓ Đã cập nhật giáo án \"$title\"!" else "✓ Đã tạo giáo án \"$title\"!",
                        Toast.LENGTH_SHORT
                    ).show()
                    finish()
                } else {
                    val errMsg = response.body()?.error?.message ?: "Không thể lưu giáo án (${response.code()})"
                    Toast.makeText(this@CreateRoutineActivity, errMsg, Toast.LENGTH_LONG).show()
                    binding.btnSaveRoutine.isEnabled = true
                    binding.btnSaveRoutine.text = originalText
                }
            } catch (_: Exception) {
                Toast.makeText(this@CreateRoutineActivity, "Lỗi kết nối máy chủ. Vui lòng thử lại.", Toast.LENGTH_LONG).show()
                binding.btnSaveRoutine.isEnabled = true
                binding.btnSaveRoutine.text = originalText
            }
        }
    }
}
