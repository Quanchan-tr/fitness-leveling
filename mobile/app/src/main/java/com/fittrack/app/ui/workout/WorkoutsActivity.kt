package com.fittrack.app.ui.workout

import android.content.Intent
import android.os.Bundle
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
import com.fittrack.app.data.models.WorkoutRoutineDto
import com.fittrack.app.data.session.SessionManager
import com.fittrack.app.databinding.ActivityWorkoutsBinding
import com.fittrack.app.ui.BottomNavTab
import com.fittrack.app.ui.aipose.AiPoseCoachActivity
import com.fittrack.app.ui.routine.CreateRoutineActivity
import com.fittrack.app.ui.routine.RoutineDetailActivity
import com.fittrack.app.ui.setupBottomNav
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
        }
    }

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
                    ApiClient.getService(this@WorkoutsActivity).getExercises(perPage = 10, search = query)
                }
                if (response.isSuccessful && response.body()?.data != null) {
                    val list = response.body()!!.data!!
                    if (list.isNotEmpty()) {
                        val names = list.take(3).joinToString("\n• ") { it.name }
                        Toast.makeText(
                            this@WorkoutsActivity,
                            "🔍 Tìm thấy ${list.size} bài tập phù hợp trên VPS:\n• $names",
                            Toast.LENGTH_LONG
                        ).show()
                    } else {
                        Toast.makeText(
                            this@WorkoutsActivity,
                            "Không tìm thấy bài tập nào khớp với \"$query\"",
                            Toast.LENGTH_SHORT
                        ).show()
                    }
                }
            } catch (e: Exception) {
                Toast.makeText(
                    this@WorkoutsActivity,
                    "Lỗi tra cứu bài tập: ${e.localizedMessage}",
                    Toast.LENGTH_SHORT
                ).show()
            }
        }
    }

    private fun fetchRoutinesFromBackend() {
        if (!session.isLoggedIn) {
            binding.cardRoutinePush.visibility = View.GONE
            binding.cardRoutinePull.visibility = View.GONE
            binding.tvScheduleTitle.text = "Đăng nhập để xem lịch tập của bạn"
            return
        }

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
                    } else {
                        binding.cardRoutinePush.visibility = View.GONE
                        binding.cardRoutinePull.visibility = View.GONE
                        binding.tvScheduleTitle.text = "Chưa có giáo án nào. Hãy tạo giáo án mới!"
                    }
                } else {
                    Toast.makeText(this@WorkoutsActivity, "Không thể tải giáo án (${response.code()})", Toast.LENGTH_SHORT).show()
                }
            } catch (e: Exception) {
                Toast.makeText(this@WorkoutsActivity, "Lỗi kết nối máy chủ: ${e.localizedMessage}", Toast.LENGTH_SHORT).show()
            }
        }
    }

    private fun setupInteractions() {
        binding.btnCreateRoutine.setOnClickListener {
            startActivity(Intent(this, CreateRoutineActivity::class.java))
        }

        val openRoutine: (Int) -> Unit = { idx ->
            val routine = loadedRoutines.getOrNull(idx)
            if (routine != null) {
                val intent = Intent(this, RoutineDetailActivity::class.java).apply {
                    putExtra("ROUTINE_TITLE", routine.title)
                    putExtra("ROUTINE_ID", routine.id)
                }
                startActivity(intent)
            } else {
                Toast.makeText(this, "Chưa có giáo án để mở", Toast.LENGTH_SHORT).show()
            }
        }

        binding.cardRoutinePush.setOnClickListener { openRoutine(0) }
        binding.btnStartPushRoutine.setOnClickListener { openRoutine(0) }
        binding.cardRoutinePull.setOnClickListener { openRoutine(1) }
        binding.btnStartPullRoutine.setOnClickListener { openRoutine(1) }
        binding.btnCalendarRoutineDetail.setOnClickListener { openRoutine(0) }
        binding.cardTodayScheduledRoutine.setOnClickListener { openRoutine(0) }

        binding.cardAiPoseCoachEntry.setOnClickListener {
            startActivity(Intent(this, AiPoseCoachActivity::class.java))
        }

        // 3-dots Action Menus on Routine cards
        binding.btnRoutinePushMore.setOnClickListener { anchor ->
            val routine = loadedRoutines.getOrNull(0) ?: return@setOnClickListener
            showRoutineActionMenu(anchor, routine.title, binding.cardRoutinePush, routine.id)
        }

        binding.btnRoutinePullMore.setOnClickListener { anchor ->
            val routine = loadedRoutines.getOrNull(1) ?: return@setOnClickListener
            showRoutineActionMenu(anchor, routine.title, binding.cardRoutinePull, routine.id)
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
                1 -> showAddToScheduleDialog(routineName, routineId)
                2 -> startActivity(Intent(this, CreateRoutineActivity::class.java))
                3 -> showDeleteConfirmDialog(routineName, cardView, routineId)
            }
            true
        }
        popup.show()
    }

    private fun showAddToScheduleDialog(routineName: String, routineId: String?) {
        val days = arrayOf("Thứ 2", "Thứ 3", "Thứ 4", "Thứ 5", "Thứ 6", "Thứ 7", "Chủ Nhật")
        val dayKeys = arrayOf("monday", "tuesday", "wednesday", "thursday", "friday", "saturday", "sunday")
        val checkedItems = booleanArrayOf(false, false, false, false, false, false, false)
        val selectedDayKeys = mutableListOf<String>()

        AlertDialog.Builder(this)
            .setTitle("Chọn ngày xếp vào lịch tập")
            .setMultiChoiceItems(days, checkedItems) { _, which, isChecked ->
                val key = dayKeys[which]
                if (isChecked) {
                    if (!selectedDayKeys.contains(key)) selectedDayKeys.add(key)
                } else {
                    selectedDayKeys.remove(key)
                }
            }
            .setPositiveButton("Xếp vào lịch") { _, _ ->
                if (selectedDayKeys.isEmpty() || routineId.isNullOrBlank()) {
                    Toast.makeText(this, "Vui lòng chọn ít nhất một ngày tập", Toast.LENGTH_SHORT).show()
                } else {
                    lifecycleScope.launch {
                        try {
                            val res = withContext(Dispatchers.IO) {
                                ApiClient.getService(this@WorkoutsActivity).updateRoutine(
                                    routineId,
                                    com.fittrack.app.data.models.UpdateRoutineRequest(scheduleDays = selectedDayKeys)
                                )
                            }
                            if (res.isSuccessful) {
                                Toast.makeText(this@WorkoutsActivity, "✓ Đã cập nhật lịch cho \"$routineName\" trên VPS!", Toast.LENGTH_LONG).show()
                                fetchRoutinesFromBackend()
                            } else {
                                Toast.makeText(this@WorkoutsActivity, "Lỗi cập nhật lịch (${res.code()})", Toast.LENGTH_SHORT).show()
                            }
                        } catch (e: Exception) {
                            Toast.makeText(this@WorkoutsActivity, "Lỗi kết nối: ${e.localizedMessage}", Toast.LENGTH_SHORT).show()
                        }
                    }
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
                if (routineId.isNullOrBlank()) {
                    Toast.makeText(this, "Không xác định được ID giáo án", Toast.LENGTH_SHORT).show()
                    return@setPositiveButton
                }
                lifecycleScope.launch {
                    try {
                        val res = withContext(Dispatchers.IO) {
                            ApiClient.getService(this@WorkoutsActivity).deleteRoutine(routineId)
                        }
                        if (res.isSuccessful) {
                            cardView.visibility = View.GONE
                            Toast.makeText(this@WorkoutsActivity, "✓ Đã xóa routine \"$routineName\" trên VPS", Toast.LENGTH_SHORT).show()
                            fetchRoutinesFromBackend()
                        } else {
                            Toast.makeText(this@WorkoutsActivity, "Không thể xóa (${res.code()})", Toast.LENGTH_SHORT).show()
                        }
                    } catch (e: Exception) {
                        Toast.makeText(this@WorkoutsActivity, "Lỗi kết nối: ${e.localizedMessage}", Toast.LENGTH_SHORT).show()
                    }
                }
            }
            .setNegativeButton("Hủy", null)
            .show()
    }

    private fun setupBottomNav() {
        binding.bottomNavigation.setupBottomNav(this, BottomNavTab.WORKOUTS)
    }
}
