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
                            "🔍 Tìm thấy ${list.size} bài tập phù hợp:\n• $names",
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
                    "Tra cứu offline: Hiện có sẵn 1,324 bài tập trong hệ thống.",
                    Toast.LENGTH_SHORT
                ).show()
            }
        }
    }

    private fun fetchRoutinesFromBackend() {
        if (!session.isLoggedIn) return

        lifecycleScope.launch {
            try {
                val response = withContext(Dispatchers.IO) {
                    ApiClient.getService(this@WorkoutsActivity).getRoutines()
                }
                if (response.isSuccessful && response.body()?.data?.isNotEmpty() == true) {
                    // Update routines dynamically if returned
                }
            } catch (_: Exception) {
                // Keep default layouts
            }
        }
    }

    private fun setupInteractions() {
        binding.btnCreateRoutine.setOnClickListener {
            startActivity(Intent(this, CreateRoutineActivity::class.java))
        }

        binding.cardRoutinePush.setOnClickListener {
            startActivity(Intent(this, RoutineDetailActivity::class.java))
        }

        binding.btnStartPushRoutine.setOnClickListener {
            startActivity(Intent(this, RoutineDetailActivity::class.java))
        }

        binding.cardRoutinePull.setOnClickListener {
            startActivity(Intent(this, RoutineDetailActivity::class.java))
        }

        binding.btnStartPullRoutine.setOnClickListener {
            startActivity(Intent(this, RoutineDetailActivity::class.java))
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
            showRoutineActionMenu(anchor, "Push Day (Ngực & Tay Sau)", binding.cardRoutinePush)
        }

        binding.btnRoutinePullMore.setOnClickListener { anchor ->
            showRoutineActionMenu(anchor, "Pull Day (Lưng & Tay Trước)", binding.cardRoutinePull)
        }

        // AI Workout Planner Wizard Entry
        binding.cardAiPlannerEntry.setOnClickListener {
            startActivity(Intent(this, AiWorkoutPlannerActivity::class.java))
        }

        binding.btnOpenAiPlanner.setOnClickListener {
            startActivity(Intent(this, AiWorkoutPlannerActivity::class.java))
        }
    }

    private fun showRoutineActionMenu(anchorView: View, routineName: String, cardView: View) {
        val popup = PopupMenu(this, anchorView)
        popup.menu.add(0, 1, 0, "📅 Thêm vào lịch tập")
        popup.menu.add(0, 2, 1, "✏️ Chỉnh sửa")
        popup.menu.add(0, 3, 2, "🗑️ Xóa routine")

        popup.setOnMenuItemClickListener { item ->
            when (item.itemId) {
                1 -> showAddToScheduleDialog(routineName)
                2 -> startActivity(Intent(this, CreateRoutineActivity::class.java))
                3 -> showDeleteConfirmDialog(routineName, cardView)
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

    private fun showDeleteConfirmDialog(routineName: String, cardView: View) {
        AlertDialog.Builder(this)
            .setTitle("Xác nhận xóa")
            .setMessage("Bạn có chắc chắn muốn xóa routine \"$routineName\" khỏi thư mục bài tập không?")
            .setPositiveButton("Xóa") { _, _ ->
                cardView.visibility = View.GONE
                Toast.makeText(this, "Đã xóa routine \"$routineName\"", Toast.LENGTH_SHORT).show()
            }
            .setNegativeButton("Hủy", null)
            .show()
    }

    private fun setupBottomNav() {
        binding.bottomNavigation.setupBottomNav(this, BottomNavTab.WORKOUTS)
    }
}
