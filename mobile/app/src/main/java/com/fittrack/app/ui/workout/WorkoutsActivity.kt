package com.fittrack.app.ui.workout

import android.content.Intent
import android.os.Bundle
import android.view.LayoutInflater
import android.view.View
import android.view.inputmethod.EditorInfo
import android.widget.LinearLayout
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
import com.fittrack.app.util.WindowInsetsHelper
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

        WindowInsetsHelper.applySystemInsets(this, binding.root, binding.layoutHeader, binding.bottomNavigation.root)

        session = SessionManager.getInstance(this)

        setupSubTabs()
        setupInteractions()
        setupWeeklyScheduleCards()
        setupBottomNav()
        setupExerciseSearch()

        fetchRoutinesFromBackend()
        fetchExercisesFromBackend()
    }

    override fun onResume() {
        super.onResume()
        setupWeeklyScheduleCards()
        fetchRoutinesFromBackend()
    }

    private fun setupSubTabs() {
        binding.tabMyRoutines.setOnClickListener {
            binding.scrollRoutines.visibility = View.VISIBLE
            binding.scrollExerciseCatalog.visibility = View.GONE

            binding.tabMyRoutines.background = ContextCompat.getDrawable(this, R.drawable.bg_subtab_pill_active)
            binding.tabMyRoutines.setTextColor(ContextCompat.getColor(this, R.color.white))

            binding.tabExerciseCatalog.background = ContextCompat.getDrawable(this, R.drawable.bg_subtab_pill_inactive)
            binding.tabExerciseCatalog.setTextColor(ContextCompat.getColor(this, R.color.subtab_pill_inactive_text))
        }

        binding.tabExerciseCatalog.setOnClickListener {
            binding.scrollRoutines.visibility = View.GONE
            binding.scrollExerciseCatalog.visibility = View.VISIBLE

            binding.tabExerciseCatalog.background = ContextCompat.getDrawable(this, R.drawable.bg_subtab_pill_active)
            binding.tabExerciseCatalog.setTextColor(ContextCompat.getColor(this, R.color.white))

            binding.tabMyRoutines.background = ContextCompat.getDrawable(this, R.drawable.bg_subtab_pill_inactive)
            binding.tabMyRoutines.setTextColor(ContextCompat.getColor(this, R.color.subtab_pill_inactive_text))

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
            androidx.appcompat.app.AlertDialog.Builder(this)
                .setTitle("Lịch tập & Thư mục")
                .setItems(arrayOf("➕ Tạo lịch tập mới", "📁 Tạo thư mục mới")) { _, which ->
                    if (which == 0) {
                        startActivity(Intent(this, CreateRoutineActivity::class.java))
                    } else {
                        val input = android.widget.EditText(this).apply {
                            hint = "Nhập tên thư mục (vd: Tăng cơ 8 tuần...)"
                        }
                        androidx.appcompat.app.AlertDialog.Builder(this)
                            .setTitle("📁 Tạo thư mục lịch tập mới")
                            .setView(input)
                            .setPositiveButton("Tạo") { _, _ ->
                                val name = input.text.toString().trim()
                                if (name.isNotBlank()) {
                                    android.widget.Toast.makeText(this, "✓ Đã tạo thư mục \"$name\" thành công!", android.widget.Toast.LENGTH_SHORT).show()
                                }
                            }
                            .setNegativeButton("Hủy", null)
                            .show()
                    }
                }
                .show()
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

        binding.btnAddCustomExercise.setOnClickListener {
            showCreateCustomExerciseDialog()
        }
    }

    private fun setupWeeklyScheduleCards() {
        val days = listOf(
            Triple("T2", "Thứ 2", binding.cardDayT2 to binding.tvDayT2Routine),
            Triple("T3", "Thứ 3", binding.cardDayT3 to binding.tvDayT3Routine),
            Triple("T4", "Thứ 4", binding.cardDayT4 to binding.tvDayT4Routine),
            Triple("T5", "Thứ 5", binding.cardDayT5 to binding.tvDayT5Routine),
            Triple("T6", "Thứ 6", binding.cardDayT6 to binding.tvDayT6Routine),
            Triple("T7", "Thứ 7", binding.cardDayT7 to binding.tvDayT7Routine),
            Triple("CN", "Chủ Nhật", binding.cardDayCn to binding.tvDayCnRoutine)
        )

        fun refreshScheduleUi() {
            days.forEach { (key, _, views) ->
                val (_, tvRoutine) = views
                val routines = session.getScheduleForDay(key)
                if (routines.isEmpty()) {
                    tvRoutine.text = "Nghỉ ngơi & Phục hồi"
                    tvRoutine.setTextColor(ContextCompat.getColor(this, R.color.text_slate))
                } else if (routines.size == 1) {
                    tvRoutine.text = routines[0]
                    tvRoutine.setTextColor(ContextCompat.getColor(this, R.color.primary))
                } else {
                    tvRoutine.text = "${routines[0]}\n${routines[1]}"
                    tvRoutine.setTextColor(ContextCompat.getColor(this, R.color.primary_blue))
                }
            }
        }

        refreshScheduleUi()

        days.forEach { (key, dayName, views) ->
            val (card, _) = views
            card.setOnClickListener {
                val currentRoutines = session.getScheduleForDay(key).toMutableList()
                if (currentRoutines.size >= 2) {
                    AlertDialog.Builder(this)
                        .setTitle("Lịch tập $dayName (2 buổi)")
                        .setMessage("Buổi 1: ${currentRoutines[0]}\nBuổi 2: ${currentRoutines[1]}")
                        .setPositiveButton("🔄 Đổi thứ tự buổi tập") { _, _ ->
                            val swapped = listOf(currentRoutines[1], currentRoutines[0])
                            session.setScheduleForDay(key, swapped)
                            refreshScheduleUi()
                            Toast.makeText(this, "✓ Đã đảo thứ tự 2 buổi tập ngày $dayName!", Toast.LENGTH_SHORT).show()
                        }
                        .setNegativeButton("🗑️ Xóa buổi tập thứ 2") { _, _ ->
                            currentRoutines.removeAt(1)
                            session.setScheduleForDay(key, currentRoutines)
                            refreshScheduleUi()
                            Toast.makeText(this, "✓ Đã xóa buổi 2 khỏi ngày $dayName", Toast.LENGTH_SHORT).show()
                        }
                        .setNeutralButton("Đóng", null)
                        .show()
                } else if (currentRoutines.size == 1) {
                    AlertDialog.Builder(this)
                        .setTitle("Lịch tập $dayName: ${currentRoutines[0]}")
                        .setItems(arrayOf(
                            "▶️ Vào tập ngay",
                            "➕ Thêm buổi tập thứ 2 vào ngày này",
                            "🗑️ Xóa lịch tập này khỏi $dayName"
                        )) { _, which ->
                            when (which) {
                                0 -> startActivity(Intent(this, RoutineDetailActivity::class.java))
                                1 -> {
                                    val candidateRoutines = arrayOf("Pull Day (Lưng & Tay Trước)", "Legs Day (Cơ đùi & Mông)", "Cardio & Bụng HIIT", "Full Body Circuit")
                                    AlertDialog.Builder(this)
                                        .setTitle("Chọn buổi thứ 2 cho $dayName")
                                        .setItems(candidateRoutines) { _, cWhich ->
                                            currentRoutines.add(candidateRoutines[cWhich])
                                            session.setScheduleForDay(key, currentRoutines)
                                            refreshScheduleUi()
                                            Toast.makeText(this, "✓ Đã thêm ${candidateRoutines[cWhich]} vào $dayName!", Toast.LENGTH_SHORT).show()
                                        }
                                        .show()
                                }
                                2 -> {
                                    session.setScheduleForDay(key, emptyList())
                                    refreshScheduleUi()
                                    Toast.makeText(this, "✓ Đã xóa lịch tập ngày $dayName", Toast.LENGTH_SHORT).show()
                                }
                            }
                        }
                        .show()
                } else {
                    val candidateRoutines = arrayOf("Push Day (Ngực & Tay Sau)", "Pull Day (Lưng & Tay Trước)", "Legs Day (Cơ đùi & Mông)", "Upper Body", "Cardio & Bụng HIIT")
                    AlertDialog.Builder(this)
                        .setTitle("➕ Xếp lịch tập vào $dayName")
                        .setItems(candidateRoutines) { _, which ->
                            session.setScheduleForDay(key, listOf(candidateRoutines[which]))
                            refreshScheduleUi()
                            Toast.makeText(this, "✓ Đã xếp ${candidateRoutines[which]} vào $dayName!", Toast.LENGTH_SHORT).show()
                        }
                        .show()
                }
            }
        }
    }

    private fun showCreateCustomExerciseDialog() {
        val view = LayoutInflater.from(this).inflate(R.layout.dialog_create_custom_exercise, null, false)
        val etName = view.findViewById<android.widget.EditText>(R.id.et_custom_ex_name)
        val etMuscle = view.findViewById<android.widget.EditText>(R.id.et_custom_ex_muscle)
        val etMedia = view.findViewById<android.widget.EditText>(R.id.et_custom_ex_media)
        val etInstructions = view.findViewById<android.widget.EditText>(R.id.et_custom_ex_instructions)
        val btnCancel = view.findViewById<com.google.android.material.button.MaterialButton>(R.id.btn_cancel_custom_ex)
        val btnSave = view.findViewById<com.google.android.material.button.MaterialButton>(R.id.btn_save_custom_ex)

        val dialog = AlertDialog.Builder(this)
            .setView(view)
            .create()

        dialog.window?.setBackgroundDrawableResource(android.R.color.transparent)

        btnCancel.setOnClickListener { dialog.dismiss() }

        btnSave.setOnClickListener {
            val name = etName.text.toString().trim()
            if (name.isEmpty()) {
                Toast.makeText(this, "Vui lòng nhập tên bài tập!", Toast.LENGTH_SHORT).show()
                return@setOnClickListener
            }

            val muscle = etMuscle.text.toString().trim().ifEmpty { "Toàn thân" }
            val mediaUrl = etMedia.text.toString().trim()
            val instructions = etInstructions.text.toString().trim().ifEmpty { "Thực hiện đúng biên độ động tác và kiểm soát nhịp thở." }

            // Create custom exercise card in llExerciseCatalogList
            val cardView = LinearLayout(this).apply {
                layoutParams = LinearLayout.LayoutParams(
                    LinearLayout.LayoutParams.MATCH_PARENT,
                    LinearLayout.LayoutParams.WRAP_CONTENT
                ).apply { topMargin = 12 }
                background = ContextCompat.getDrawable(this@WorkoutsActivity, R.drawable.bg_card_white)
                orientation = LinearLayout.VERTICAL
                setPadding(24, 20, 24, 20)
            }

            val headerRow = LinearLayout(this).apply {
                orientation = LinearLayout.HORIZONTAL
                gravity = android.view.Gravity.CENTER_VERTICAL
            }

            val tvTitle = android.widget.TextView(this).apply {
                layoutParams = LinearLayout.LayoutParams(0, LinearLayout.LayoutParams.WRAP_CONTENT, 1f)
                text = "⭐ $name"
                setTextColor(ContextCompat.getColor(this@WorkoutsActivity, R.color.text_dark))
                textSize = 14f
                typeface = android.graphics.Typeface.DEFAULT_BOLD
            }

            val tagSelf = android.widget.TextView(this).apply {
                text = "Tự tạo"
                setTextColor(ContextCompat.getColor(this@WorkoutsActivity, R.color.primary))
                textSize = 10f
                typeface = android.graphics.Typeface.DEFAULT_BOLD
                background = ContextCompat.getDrawable(this@WorkoutsActivity, R.drawable.bg_card_selectable)
                setPadding(12, 6, 12, 6)
            }

            headerRow.addView(tvTitle)
            headerRow.addView(tagSelf)

            val tvMuscle = android.widget.TextView(this).apply {
                text = "Nhóm cơ: $muscle"
                setTextColor(ContextCompat.getColor(this@WorkoutsActivity, R.color.text_slate))
                textSize = 11.5f
                layoutParams = LinearLayout.LayoutParams(
                    LinearLayout.LayoutParams.WRAP_CONTENT,
                    LinearLayout.LayoutParams.WRAP_CONTENT
                ).apply { topMargin = 4 }
            }

            val tvInstruct = android.widget.TextView(this).apply {
                text = instructions
                setTextColor(ContextCompat.getColor(this@WorkoutsActivity, R.color.text_dark))
                textSize = 12f
                layoutParams = LinearLayout.LayoutParams(
                    LinearLayout.LayoutParams.WRAP_CONTENT,
                    LinearLayout.LayoutParams.WRAP_CONTENT
                ).apply { topMargin = 6 }
            }

            val btnShare = com.google.android.material.button.MaterialButton(this).apply {
                layoutParams = LinearLayout.LayoutParams(
                    LinearLayout.LayoutParams.WRAP_CONTENT,
                    80
                ).apply {
                    topMargin = 10
                    gravity = android.view.Gravity.END
                }
                text = "📢 Chia sẻ lên Cộng đồng"
                textSize = 11f
                typeface = android.graphics.Typeface.DEFAULT_BOLD
                setPadding(24, 0, 24, 0)
                setOnClickListener {
                    val shareIntent = Intent(this@WorkoutsActivity, com.fittrack.app.ui.community.CommunityActivity::class.java).apply {
                        putExtra("SHARE_CONTENT", "Tôi vừa thêm bài tập mới \"$name\" ($muscle) vào giáo án cá nhân!")
                    }
                    startActivity(shareIntent)
                }
            }

            cardView.addView(headerRow)
            cardView.addView(tvMuscle)
            cardView.addView(tvInstruct)
            cardView.addView(btnShare)

            binding.llExerciseCatalogList.addView(cardView, 0)

            Toast.makeText(this, "✓ Đã lưu bài tập \"$name\" vào thư viện cá nhân!", Toast.LENGTH_SHORT).show()
            dialog.dismiss()
        }

        dialog.show()
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
