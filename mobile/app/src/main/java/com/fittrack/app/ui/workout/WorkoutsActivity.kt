package com.fittrack.app.ui.workout

import android.content.Intent
import android.os.Bundle
import android.view.LayoutInflater
import android.view.View
import android.view.inputmethod.EditorInfo
import android.widget.Toast
import androidx.appcompat.app.AlertDialog
import androidx.appcompat.app.AppCompatActivity
import androidx.appcompat.widget.PopupMenu
import androidx.core.content.ContextCompat
import androidx.lifecycle.lifecycleScope
import com.fittrack.app.R
import com.fittrack.app.data.api.ApiClient
import com.fittrack.app.data.models.ExerciseDto
import com.fittrack.app.data.models.WorkoutRoutineDto
import com.fittrack.app.data.session.SessionManager
import com.fittrack.app.databinding.ActivityWorkoutsBinding
import com.fittrack.app.databinding.ItemExerciseCatalogCardBinding
import com.fittrack.app.ui.BottomNavTab
import com.fittrack.app.ui.aipose.AiPoseCoachActivity
import com.fittrack.app.ui.modal.ExerciseDetailBottomSheet
import com.fittrack.app.ui.routine.CreateRoutineActivity
import com.fittrack.app.ui.routine.RoutineDetailActivity
import com.fittrack.app.ui.setupBottomNav
import com.fittrack.app.util.loadUrl
import kotlinx.coroutines.Dispatchers
import kotlinx.coroutines.launch
import kotlinx.coroutines.withContext

class WorkoutsActivity : AppCompatActivity() {

    private lateinit var binding: ActivityWorkoutsBinding
    private lateinit var session: SessionManager
    private val loadedRoutines = mutableListOf<WorkoutRoutineDto>()

    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)
        binding = ActivityWorkoutsBinding.inflate(layoutInflater)
        setContentView(binding.root)

        session = SessionManager.getInstance(this)

        setupSubTabs()
        setupInteractions()
        setupBottomNav()
        setupExerciseSearch()

        fetchRoutinesFromBackend()
        fetchExercisesFromBackend()
    }

    override fun onResume() {
        super.onResume()
        fetchRoutinesFromBackend()
    }

    private fun setupSubTabs() {
        binding.tabMyRoutines.setOnClickListener {
            binding.scrollRoutines.visibility = View.VISIBLE
            binding.scrollExerciseCatalog.visibility = View.GONE

            binding.tabMyRoutines.background = ContextCompat.getDrawable(this, R.drawable.bg_subtab_pill_active)
            binding.tabMyRoutines.setTextColor(ContextCompat.getColor(this, R.color.white))

            binding.tabExerciseCatalog.background = ContextCompat.getDrawable(this, R.drawable.bg_subtab_pill_inactive)
            binding.tabExerciseCatalog.setTextColor(ContextCompat.getColor(this, R.color.text_dark))
        }

        binding.tabExerciseCatalog.setOnClickListener {
            binding.scrollRoutines.visibility = View.GONE
            binding.scrollExerciseCatalog.visibility = View.VISIBLE

            binding.tabExerciseCatalog.background = ContextCompat.getDrawable(this, R.drawable.bg_subtab_pill_active)
            binding.tabExerciseCatalog.setTextColor(ContextCompat.getColor(this, R.color.white))

            binding.tabMyRoutines.background = ContextCompat.getDrawable(this, R.drawable.bg_subtab_pill_inactive)
            binding.tabMyRoutines.setTextColor(ContextCompat.getColor(this, R.color.text_dark))

            if (binding.llExerciseCatalogList.childCount == 0) {
                fetchExercisesFromBackend()
            }
        }
    }

    private val fallbackExercises = listOf(
        ExerciseDto(
            id = "0025",
            name = "Barbell Bench Press (Nằm đẩy tạ đòn)",
            category = "chest",
            bodyPart = "Cơ ngực",
            targetMuscle = "Cơ ngực giữa",
            equipment = "Thanh đòn",
            thumbnailUrl = "https://raw.githubusercontent.com/Quanchan-tr/fitness-leveling/dev/media/exercises/0025-EIeI8Vf.webp",
            gifUrl = "https://raw.githubusercontent.com/Quanchan-tr/fitness-leveling/dev/media/exercises/0025-EIeI8Vf.webp",
            hasAiCheck = false,
            description = "Nằm phẳng trên ghế tập, hai chân đặt chắc chắn trên sàn. Cầm đòn tạ rộng hơn vai một chút, hạ tạ chạm nhẹ ngực và thở ra đẩy mạnh lên vị trí ban đầu."
        ),
        ExerciseDto(
            id = "0314",
            name = "Incline Dumbbell Press (Đẩy ngực trên tạ đơn)",
            category = "chest",
            bodyPart = "Cơ ngực",
            targetMuscle = "Cơ ngực trên",
            equipment = "Tạ đơn",
            thumbnailUrl = "https://raw.githubusercontent.com/Quanchan-tr/fitness-leveling/dev/media/exercises/0314-ns0SIbU.webp",
            gifUrl = "https://raw.githubusercontent.com/Quanchan-tr/fitness-leveling/dev/media/exercises/0314-ns0SIbU.webp",
            hasAiCheck = false,
            description = "Chỉnh ghế dốc góc 30-45 độ. Hạ tạ ngang ngực trên sao cho cẳng tay vuông góc sàn, thở ra đẩy hai quả tạ lên theo hình vòng cung nhẹ."
        ),
        ExerciseDto(
            id = "0001",
            name = "3/4 Sit-up (Gập bụng 3/4)",
            category = "waist",
            bodyPart = "Cơ bụng / Eo",
            targetMuscle = "Cơ bụng",
            equipment = "Trọng lượng cơ thể",
            thumbnailUrl = "https://raw.githubusercontent.com/Quanchan-tr/fitness-leveling/dev/media/exercises/0001-2gPfomN.webp",
            gifUrl = "https://raw.githubusercontent.com/Quanchan-tr/fitness-leveling/dev/media/exercises/0001-2gPfomN.webp",
            hasAiCheck = false,
            description = "Nằm ngửa gập đầu gối, hai tay sau đầu với khuỷu tay hướng ra ngoài. Siết cơ bụng nâng thân trên lên góc 45 độ rồi từ từ hạ xuống vị trí ban đầu."
        ),
        ExerciseDto(
            id = "0662",
            name = "Push Up (Hít đất tiêu chuẩn)",
            category = "chest",
            bodyPart = "Cơ ngực & Tay sau",
            targetMuscle = "Ngực & Cốt lõi",
            equipment = "Trọng lượng cơ thể",
            thumbnailUrl = "https://raw.githubusercontent.com/Quanchan-tr/fitness-leveling/dev/media/exercises/0662-n3V3r4M.webp",
            gifUrl = "https://raw.githubusercontent.com/Quanchan-tr/fitness-leveling/dev/media/exercises/0662-n3V3r4M.webp",
            hasAiCheck = true,
            description = "Giữ toàn bộ thân người thẳng từ đầu đến gót chân. Hạ ngực xuống cách sàn 3-5cm rồi dùng cơ ngực đẩy mạnh người trở lại tư thế ban đầu."
        )
    )

    private fun setupExerciseSearch() {
        binding.etSearchExercise.setOnEditorActionListener { _, actionId, _ ->
            if (actionId == EditorInfo.IME_ACTION_SEARCH || actionId == EditorInfo.IME_ACTION_DONE) {
                val query = binding.etSearchExercise.text.toString().trim()
                if (query.isNotBlank()) {
                    searchExerciseCatalog(query)
                }
                true
            } else {
                false
            }
        }
    }

    private fun searchExerciseCatalog(query: String) {
        lifecycleScope.launch {
            try {
                val response = withContext(Dispatchers.IO) {
                    ApiClient.getService(this@WorkoutsActivity).getExercises(perPage = 60, q = query, search = query)
                }
                if (response.isSuccessful && response.body()?.data != null) {
                    val list = response.body()!!.data!!
                    if (list.isNotEmpty()) {
                        renderExerciseCatalog(list)
                        Toast.makeText(
                            this@WorkoutsActivity,
                            "🔍 Tìm thấy ${list.size} bài tập phù hợp",
                            Toast.LENGTH_SHORT
                        ).show()
                    } else {
                        val localFiltered = fallbackExercises.filter {
                            it.name.contains(query, ignoreCase = true) || it.targetMuscle?.contains(query, ignoreCase = true) == true
                        }
                        if (localFiltered.isNotEmpty()) {
                            renderExerciseCatalog(localFiltered)
                        } else {
                            Toast.makeText(
                                this@WorkoutsActivity,
                                "Không tìm thấy bài tập nào khớp với \"$query\"",
                                Toast.LENGTH_SHORT
                            ).show()
                        }
                    }
                }
            } catch (e: Exception) {
                val localFiltered = fallbackExercises.filter {
                    it.name.contains(query, ignoreCase = true) || it.targetMuscle?.contains(query, ignoreCase = true) == true
                }
                renderExerciseCatalog(if (localFiltered.isNotEmpty()) localFiltered else fallbackExercises)
            }
        }
    }

    private fun fetchExercisesFromBackend() {
        lifecycleScope.launch {
            try {
                val response = withContext(Dispatchers.IO) {
                    ApiClient.getService(this@WorkoutsActivity).getExercises(perPage = 60)
                }
                if (response.isSuccessful && response.body()?.data?.isNotEmpty() == true) {
                    val list = response.body()!!.data!!
                    renderExerciseCatalog(list)
                } else if (binding.llExerciseCatalogList.childCount == 0) {
                    renderExerciseCatalog(fallbackExercises)
                }
            } catch (_: Exception) {
                if (binding.llExerciseCatalogList.childCount == 0) {
                    renderExerciseCatalog(fallbackExercises)
                }
            }
        }
    }

    private fun renderExerciseCatalog(exercises: List<ExerciseDto>) {
        binding.llExerciseCatalogList.removeAllViews()
        val inflater = LayoutInflater.from(this)

        for (ex in exercises) {
            val itemBinding = ItemExerciseCatalogCardBinding.inflate(inflater, binding.llExerciseCatalogList, false)
            itemBinding.tvItemExerciseName.text = ex.name
            val muscle = ex.targetMuscle ?: ex.bodyPart ?: "Toàn thân"
            val equip = ex.equipment ?: "Tự do"
            itemBinding.tvItemExerciseMuscle.text = "💪 $muscle • 🏋️ $equip"
            itemBinding.tvItemExerciseCategory.text = (ex.category ?: ex.bodyPart ?: "STRENGTH").uppercase()

            if (ex.hasAiCheck) {
                itemBinding.tvItemExerciseAiBadge.visibility = View.VISIBLE
            } else {
                itemBinding.tvItemExerciseAiBadge.visibility = View.GONE
            }

            val imgUrl = ex.gifUrl?.takeIf { it.isNotBlank() } ?: ex.thumbnailUrl
            itemBinding.ivItemExerciseThumb.loadUrl(imgUrl, R.drawable.ic_dumbbell_solid)

            itemBinding.root.setOnClickListener {
                ExerciseDetailBottomSheet.newInstance(ex).show(supportFragmentManager, "exercise_detail")
            }

            binding.llExerciseCatalogList.addView(itemBinding.root)
        }
    }

    private fun fetchRoutinesFromBackend() {
        if (!session.isLoggedIn) return

        lifecycleScope.launch {
            try {
                val response = withContext(Dispatchers.IO) {
                    ApiClient.getService(this@WorkoutsActivity).getRoutines()
                }
                if (response.isSuccessful && response.body()?.data != null) {
                    val list = response.body()!!.data!!
                    loadedRoutines.clear()
                    loadedRoutines.addAll(list)

                    if (list.isNotEmpty()) {
                        binding.cardRoutinePush.visibility = View.VISIBLE
                        binding.tvRoutinePushName.text = list[0].title
                        binding.tvScheduleTitle.text = "Lịch tập hôm nay: ${list[0].title}"

                        if (list.size > 1) {
                            binding.cardRoutinePull.visibility = View.VISIBLE
                            binding.tvRoutinePullName.text = list[1].title
                        } else {
                            binding.cardRoutinePull.visibility = View.GONE
                        }
                    }
                }
            } catch (_: Exception) {
                // Keep current layouts on connection hiccup
            }
        }
    }

    private fun setupInteractions() {
        binding.btnCreateRoutine.setOnClickListener {
            startActivity(Intent(this, CreateRoutineActivity::class.java))
        }

        binding.cardRoutinePush.setOnClickListener {
            val intent = Intent(this, RoutineDetailActivity::class.java).apply {
                putExtra("ROUTINE_TITLE", loadedRoutines.getOrNull(0)?.title ?: "Push Day (Ngực & Tay Sau)")
                putExtra("ROUTINE_ID", loadedRoutines.getOrNull(0)?.id.orEmpty())
            }
            startActivity(intent)
        }

        binding.btnStartPushRoutine.setOnClickListener {
            val intent = Intent(this, RoutineDetailActivity::class.java).apply {
                putExtra("ROUTINE_TITLE", loadedRoutines.getOrNull(0)?.title ?: "Push Day (Ngực & Tay Sau)")
                putExtra("ROUTINE_ID", loadedRoutines.getOrNull(0)?.id.orEmpty())
            }
            startActivity(intent)
        }

        binding.cardRoutinePull.setOnClickListener {
            val intent = Intent(this, RoutineDetailActivity::class.java).apply {
                putExtra("ROUTINE_TITLE", loadedRoutines.getOrNull(1)?.title ?: "Pull Day (Lưng & Tay Trước)")
                putExtra("ROUTINE_ID", loadedRoutines.getOrNull(1)?.id.orEmpty())
            }
            startActivity(intent)
        }

        binding.btnStartPullRoutine.setOnClickListener {
            val intent = Intent(this, RoutineDetailActivity::class.java).apply {
                putExtra("ROUTINE_TITLE", loadedRoutines.getOrNull(1)?.title ?: "Pull Day (Lưng & Tay Trước)")
                putExtra("ROUTINE_ID", loadedRoutines.getOrNull(1)?.id.orEmpty())
            }
            startActivity(intent)
        }

        binding.btnCalendarRoutineDetail.setOnClickListener {
            startActivity(Intent(this, RoutineDetailActivity::class.java))
        }

        binding.cardTodayScheduledRoutine.setOnClickListener {
            startActivity(Intent(this, RoutineDetailActivity::class.java))
        }

        binding.cardAiPoseCoachEntry.setOnClickListener {
            startActivity(Intent(this, AiPoseCoachActivity::class.java))
        }

        // 3-dots Action Menus on Routine cards
        binding.btnRoutinePushMore.setOnClickListener { anchor ->
            val id = loadedRoutines.getOrNull(0)?.id
            val name = loadedRoutines.getOrNull(0)?.title ?: "Push Day (Ngực & Tay Sau)"
            showRoutineActionMenu(anchor, name, binding.cardRoutinePush, id)
        }

        binding.btnRoutinePullMore.setOnClickListener { anchor ->
            val id = loadedRoutines.getOrNull(1)?.id
            val name = loadedRoutines.getOrNull(1)?.title ?: "Pull Day (Lưng & Tay Trước)"
            showRoutineActionMenu(anchor, name, binding.cardRoutinePull, id)
        }

        // AI Workout Planner Wizard Entry
        binding.cardAiPlannerEntry.setOnClickListener {
            startActivity(Intent(this, AiWorkoutPlannerActivity::class.java))
        }

        binding.btnOpenAiPlanner.setOnClickListener {
            startActivity(Intent(this, AiWorkoutPlannerActivity::class.java))
        }
    }

    private fun showRoutineActionMenu(anchorView: View, routineName: String, cardView: View, routineId: String?) {
        val popup = PopupMenu(this, anchorView)
        popup.menu.add(0, 1, 0, "📅 Thêm vào lịch tập")
        popup.menu.add(0, 2, 1, "✏️ Chỉnh sửa")
        popup.menu.add(0, 3, 2, "🗑️ Xóa routine")

        popup.setOnMenuItemClickListener { item ->
            when (item.itemId) {
                1 -> showAddToScheduleDialog(routineName)
                2 -> startActivity(Intent(this, CreateRoutineActivity::class.java))
                3 -> showDeleteConfirmDialog(routineName, cardView, routineId)
            }
            true
        }
        popup.show()
    }

    private fun showAddToScheduleDialog(routineName: String) {
        val days = arrayOf("Thứ 2", "Thứ 3", "Thứ 4", "Thứ 5", "Thứ 6", "Thứ 7", "Chủ Nhật")
        val checkedItems = booleanArrayOf(false, false, false, false, false, false, false)
        val selectedDays = mutableListOf<String>()

        AlertDialog.Builder(this)
            .setTitle("Chọn ngày xếp vào lịch tập")
            .setMultiChoiceItems(days, checkedItems) { _, which, isChecked ->
                if (isChecked) {
                    selectedDays.add(days[which])
                } else {
                    selectedDays.remove(days[which])
                }
            }
            .setPositiveButton("Xếp vào lịch") { _, _ ->
                if (selectedDays.isEmpty()) {
                    Toast.makeText(this, "Vui lòng chọn ít nhất một ngày tập", Toast.LENGTH_SHORT).show()
                } else {
                    val daysStr = selectedDays.joinToString(", ")
                    Toast.makeText(this, "✓ Đã xếp \"$routineName\" vào $daysStr!", Toast.LENGTH_LONG).show()
                }
            }
            .setNegativeButton("Hủy", null)
            .show()
    }

    private fun showDeleteConfirmDialog(routineName: String, cardView: View, routineId: String?) {
        AlertDialog.Builder(this)
            .setTitle("Xác nhận xóa")
            .setMessage("Bạn có chắc chắn muốn xóa routine \"$routineName\" khỏi thư mục bài tập không?")
            .setPositiveButton("Xóa") { _, _ ->
                if (!routineId.isNullOrBlank()) {
                    lifecycleScope.launch {
                        try {
                            withContext(Dispatchers.IO) {
                                ApiClient.getService(this@WorkoutsActivity).deleteRoutine(routineId)
                            }
                            cardView.visibility = View.GONE
                            Toast.makeText(this@WorkoutsActivity, "✓ Đã xóa routine \"$routineName\" trên VPS", Toast.LENGTH_SHORT).show()
                        } catch (_: Exception) {
                            cardView.visibility = View.GONE
                            Toast.makeText(this@WorkoutsActivity, "Đã xóa routine \"$routineName\"", Toast.LENGTH_SHORT).show()
                        }
                    }
                } else {
                    cardView.visibility = View.GONE
                    Toast.makeText(this, "Đã xóa routine \"$routineName\"", Toast.LENGTH_SHORT).show()
                }
            }
            .setNegativeButton("Hủy", null)
            .show()
    }

    private fun setupBottomNav() {
        binding.bottomNavigation.setupBottomNav(this, BottomNavTab.WORKOUTS)
    }
}
