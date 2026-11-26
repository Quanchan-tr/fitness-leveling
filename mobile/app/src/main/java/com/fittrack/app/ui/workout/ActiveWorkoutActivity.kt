package com.fittrack.app.ui.workout

import android.content.Intent
import android.graphics.Color
import android.graphics.Typeface
import android.media.AudioManager
import android.media.ToneGenerator
import android.os.Bundle
import android.os.CountDownTimer
import android.view.Gravity
import android.widget.EditText
import android.widget.LinearLayout
import android.widget.TextView
import android.widget.Toast
import androidx.appcompat.app.AlertDialog
import androidx.appcompat.app.AppCompatActivity
import androidx.core.content.ContextCompat
import com.fittrack.app.R
import com.fittrack.app.data.session.SessionManager
import com.fittrack.app.databinding.ActivityActiveWorkoutBinding
import com.fittrack.app.ui.modal.AiCalibrationModalActivity
import com.fittrack.app.ui.modal.WorkoutSummaryModalActivity
import com.fittrack.app.util.loadUrl

data class ActiveWorkoutSet(
    var setNum: Int,
    var weightKg: Float,
    var reps: Int,
    var isCompleted: Boolean = false
)

data class ActiveExerciseItem(
    val name: String,
    val target: String,
    val imageUrl: String,
    val steps: List<String>,
    val defaultSets: List<ActiveWorkoutSet>
)

class ActiveWorkoutActivity : AppCompatActivity() {

    private lateinit var binding: ActivityActiveWorkoutBinding
    private lateinit var session: SessionManager

    private var restTimeSeconds: Int = 60
    private var restTimer: CountDownTimer? = null
    private var isTimerRunning: Boolean = false

    private var currentExerciseIndex = 0
    private var workoutExercises = mutableListOf(
        ActiveExerciseItem(
            name = "Nằm đẩy tạ đòn",
            target = "Cơ ngực (Ngực giữa)",
            imageUrl = "https://raw.githubusercontent.com/Quanchan-tr/fitness-leveling/dev/media/exercises/0025-EIeI8Vf.webp",
            steps = listOf(
                "Nằm phẳng trên ghế tập, hai chân đặt chắc chắn trên sàn, mắt nhìn thẳng lên thanh đòn.",
                "Cầm thanh đòn rộng hơn vai một chút, nhấc tạ ra khỏi giá và giữ thăng bằng trên ngực.",
                "Hít sâu, từ từ hạ thanh đòn có kiểm soát xuống chạm nhẹ vào phần giữa ngực.",
                "Thở ra dứt khoát, dùng lực cơ ngực đẩy thanh đòn về vị trí ban đầu và siết chặt cơ ở đỉnh."
            ),
            defaultSets = listOf(
                ActiveWorkoutSet(1, 60.0f, 10, false),
                ActiveWorkoutSet(2, 65.0f, 10, false),
                ActiveWorkoutSet(3, 70.0f, 8, false),
                ActiveWorkoutSet(4, 75.0f, 6, false)
            )
        ),
        ActiveExerciseItem(
            name = "Đẩy ngực trên với tạ đơn",
            target = "Cơ ngực trên & Vai trước",
            imageUrl = "https://raw.githubusercontent.com/Quanchan-tr/fitness-leveling/dev/media/exercises/0314-ns0SIbU.webp",
            steps = listOf(
                "Chỉnh ghế dốc góc 30-45 độ, hai tay cầm tạ đơn đặt trên đùi rồi dùng gối trợ lực hất lên ngang vai.",
                "Ưỡn ngực, mở rộng lồng ngực và hạ tạ có kiểm soát sao cho cẳng tay luôn vuông góc sàn.",
                "Thở ra và đẩy hai quả tạ hướng lên theo hình vòng cung nhẹ, tránh chạm tạ vào nhau."
            ),
            defaultSets = listOf(
                ActiveWorkoutSet(1, 20.0f, 12, false),
                ActiveWorkoutSet(2, 22.5f, 10, false),
                ActiveWorkoutSet(3, 24.0f, 8, false)
            )
        ),
        ActiveExerciseItem(
            name = "Ép ngực cáp",
            target = "Cơ ngực trong & viền ngực",
            imageUrl = "https://raw.githubusercontent.com/Quanchan-tr/fitness-leveling/dev/media/exercises/1262-w4dLzSx.webp",
            steps = listOf(
                "Đứng giữa giàn cáp kép, hai tay nắm tay cầm, một chân bước lên trước để tạo thế đứng vững.",
                "Hơi khuỵu khuỷu tay cố định, thở ra và ép hai cánh tay về phía trước ngực như đang ôm thân cây.",
                "Giữ điểm ép căng nhất 1 giây, hít vào rồi từ từ mở rộng cánh tay về lại vị trí bắt đầu."
            ),
            defaultSets = listOf(
                ActiveWorkoutSet(1, 15.0f, 12, false),
                ActiveWorkoutSet(2, 17.5f, 12, false),
                ActiveWorkoutSet(3, 20.0f, 10, false)
            )
        ),
        ActiveExerciseItem(
            name = "Kéo cáp tay sau",
            target = "Cơ tay sau (Triceps)",
            imageUrl = "https://raw.githubusercontent.com/Quanchan-tr/fitness-leveling/dev/media/exercises/0172-1PK5Uo3.webp",
            steps = listOf(
                "Đứng thẳng trước máy kéo cáp, hai tay nắm tay cầm ngang ngực, ép chặt khuỷu tay vào sát hai bên mạn sườn.",
                "Thở ra, ghì cánh tay duỗi thẳng xuống phía dưới cho đến khi cơ tay sau căng hết cỡ.",
                "Hít vào và từ từ đưa cẳng tay nâng lên góc 90 độ mà không di chuyển khuỷu tay."
            ),
            defaultSets = listOf(
                ActiveWorkoutSet(1, 25.0f, 12, false),
                ActiveWorkoutSet(2, 30.0f, 10, false),
                ActiveWorkoutSet(3, 30.0f, 10, false)
            )
        ),
        ActiveExerciseItem(
            name = "Xà kép tay sau & ngực dưới",
            target = "Ngực dưới & Tay sau",
            imageUrl = "https://raw.githubusercontent.com/Quanchan-tr/fitness-leveling/dev/media/exercises/0009-PAgTVaK.webp",
            steps = listOf(
                "Nhảy lên thanh xà kép, duỗi thẳng tay, siết cơ bụng và hơi nghiêng phần thân trên về phía trước.",
                "Hít sâu, từ từ gập khuỷu tay hạ thấp người xuống cho đến khi cánh tay đạt góc 90 độ.",
                "Thở ra, dồn lực ngực dưới và tay sau đẩy mạnh toàn bộ cơ thể trở lại vị trí ban đầu."
            ),
            defaultSets = listOf(
                ActiveWorkoutSet(1, 0.0f, 12, false),
                ActiveWorkoutSet(2, 0.0f, 10, false),
                ActiveWorkoutSet(3, 0.0f, 8, false)
            )
        )
    )

    private val completedSetsHistory = mutableListOf<ActiveWorkoutSet>()
    private val setsList = mutableListOf<ActiveWorkoutSet>()

    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)
        binding = ActivityActiveWorkoutBinding.inflate(layoutInflater)
        setContentView(binding.root)

        session = SessionManager.getInstance(this)

        // Mark active workout session
        session.isWorkoutActive = true
        val routineId = intent.getStringExtra("ROUTINE_ID").orEmpty()
        val routineTitle = intent.getStringExtra("ROUTINE_TITLE") ?: "Buổi tập: Ngực & Tay sau"
        session.activeWorkoutName = routineTitle

        // Load custom exercises from routine if saved in SessionManager
        val savedRoutineExercises = if (routineId.isNotBlank()) session.getRoutineExercises(routineId) else emptyList()
        if (savedRoutineExercises.isNotEmpty()) {
            workoutExercises = savedRoutineExercises.map { ex ->
                val sets = if (ex.sets.isNotEmpty()) {
                    ex.sets.mapIndexed { idx, s -> ActiveWorkoutSet(idx + 1, s.weightKg, s.reps, false) }
                } else {
                    (1..ex.setsCount.coerceAtLeast(1)).map { idx ->
                        ActiveWorkoutSet(idx, ex.weightKg, ex.reps, false)
                    }
                }
                ActiveExerciseItem(
                    name = ex.name,
                    target = ex.targetMuscle,
                    imageUrl = ex.gifUrl ?: "https://raw.githubusercontent.com/Quanchan-tr/fitness-leveling/dev/media/exercises/0025-EIeI8Vf.webp",
                    steps = if (ex.instructions.isNotEmpty()) ex.instructions else listOf(
                        "Thực hiện bài tập với tư thế chuẩn, giữ vững trọng tâm cơ thể.",
                        "Hít thở đều đặn và kiểm soát chuyển động cơ bắp suốt hiệp tập."
                    ),
                    defaultSets = sets
                )
            }.toMutableList()
        }

        // Check if single custom exercise is passed
        val customName = intent.getStringExtra("EXERCISE_NAME")
        if (!customName.isNullOrBlank()) {
            val customTarget = intent.getStringExtra("EXERCISE_TARGET") ?: "Cơ bắp toàn thân"
            val customImg = intent.getStringExtra("EXERCISE_IMAGE") ?: "https://raw.githubusercontent.com/Quanchan-tr/fitness-leveling/dev/media/exercises/0025-EIeI8Vf.webp"
            val customSteps = intent.getStringArrayListExtra("EXERCISE_STEPS") ?: arrayListOf()
            val singleItem = ActiveExerciseItem(
                name = customName,
                target = customTarget,
                imageUrl = customImg,
                steps = if (customSteps.isNotEmpty()) customSteps else listOf(
                    "Thực hiện bài tập với tư thế chuẩn, giữ vững trọng tâm cơ thể.",
                    "Hít thở đều đặn và kiểm soát chuyển động cơ bắp suốt hiệp tập."
                ),
                defaultSets = listOf(
                    ActiveWorkoutSet(1, 0f, 12, false),
                    ActiveWorkoutSet(2, 0f, 10, false),
                    ActiveWorkoutSet(3, 0f, 8, false)
                )
            )
            workoutExercises = mutableListOf(singleItem)
            session.activeWorkoutName = customName
        }

        // Determine starting exercise index
        val startIndex = intent.getIntExtra("START_EXERCISE_INDEX", 0)
        val validIndex = startIndex.coerceIn(0, workoutExercises.size - 1)
        loadExercise(validIndex)

        // Setup Rest Timer
        setupTimer()

        binding.btnAddSet.setOnClickListener {
            val last = setsList.lastOrNull()
            val nextWeight = last?.weightKg ?: 60f
            val nextReps = last?.reps ?: 10
            setsList.add(ActiveWorkoutSet(setsList.size + 1, nextWeight, nextReps, false))
            renderSets()
        }

        // Navigation & Quit actions
        binding.btnBack.setOnClickListener {
            confirmExit()
        }

        binding.btnQuit.setOnClickListener {
            confirmExit()
        }

        binding.btnAiCheckForm.setOnClickListener {
            startActivity(Intent(this, AiCalibrationModalActivity::class.java))
        }

        binding.btnNextExercise.setOnClickListener {
            handleNextExerciseClick()
        }
    }

    private fun loadExercise(index: Int) {
        currentExerciseIndex = index
        val ex = workoutExercises[index]

        val displayTitle = intent.getStringExtra("ROUTINE_TITLE") ?: intent.getStringExtra("EXERCISE_NAME") ?: "Buổi tập thể lực"
        binding.tvTitle.text = displayTitle
        binding.tvCurrentExerciseName.text = ex.name
        binding.tvTargetInfo.text = ex.target
        binding.tvExerciseStatus.text = "Bài tập ${index + 1}/${workoutExercises.size}"

        binding.ivActiveExerciseImage.loadUrl(ex.imageUrl, R.drawable.ic_dumbbell_solid)
        renderSteps(ex.steps)

        setsList.clear()
        ex.defaultSets.forEach { setsList.add(it.copy()) }
        renderSets()

        if (index < workoutExercises.size - 1) {
            binding.btnNextExercise.text = "Chuyển sang bài tiếp theo"
        } else {
            binding.btnNextExercise.text = "✓ Hoàn thành buổi tập"
        }
    }

    private fun handleNextExerciseClick() {
        val completedCount = setsList.count { it.isCompleted }
        if (completedCount == 0) {
            val message = if (currentExerciseIndex < workoutExercises.size - 1) {
                "Bạn chưa đánh dấu hoàn thành hiệp tập nào ở bài này. Bạn có chắc muốn chuyển sang bài tiếp theo không?"
            } else {
                "Bạn chưa đánh dấu hoàn thành hiệp tập nào. Bạn có chắc muốn hoàn thành buổi tập không?"
            }
            AlertDialog.Builder(this)
                .setTitle("Chưa ghi nhận hiệp tập")
                .setMessage(message)
                .setPositiveButton("Tiếp tục chuyển") { _, _ ->
                    proceedToNextOrFinish()
                }
                .setNegativeButton("Ở lại tập tiếp", null)
                .show()
        } else {
            proceedToNextOrFinish()
        }
    }

    private fun proceedToNextOrFinish() {
        // Collect completed sets for summary
        completedSetsHistory.addAll(setsList.filter { it.isCompleted })

        if (currentExerciseIndex < workoutExercises.size - 1) {
            stopRestTimer()
            loadExercise(currentExerciseIndex + 1)
            Toast.makeText(this, "Đã chuyển sang: ${workoutExercises[currentExerciseIndex].name}", Toast.LENGTH_SHORT).show()
        } else {
            finishWorkout()
        }
    }

    private fun setupTimer() {
        updateTimerDisplay(restTimeSeconds)

        binding.tvRestTimer.setOnClickListener {
            showRestDurationPicker()
        }

        binding.btnTriggerRest.setOnClickListener {
            if (isTimerRunning) {
                stopRestTimer()
            } else {
                startRestTimer(restTimeSeconds)
            }
        }
    }

    private fun showRestDurationPicker() {
        val options = arrayOf("30 giây", "60 giây (Mặc định)", "90 giây", "120 giây (2 phút)", "180 giây (3 phút)")
        val seconds = arrayOf(30, 60, 90, 120, 180)

        AlertDialog.Builder(this)
            .setTitle("⏱️ Chọn thời gian nghỉ giữa hiệp")
            .setItems(options) { _, which ->
                restTimeSeconds = seconds[which]
                stopRestTimer()
                updateTimerDisplay(restTimeSeconds)
                Toast.makeText(this, "Đã chỉnh thời gian nghỉ: ${options[which]}", Toast.LENGTH_SHORT).show()
            }
            .setNegativeButton("Hủy", null)
            .show()
    }

    private fun updateTimerDisplay(totalSeconds: Int) {
        val m = totalSeconds / 60
        val s = totalSeconds % 60
        binding.tvRestTimer.text = String.format("%02d:%02d", m, s)
    }

    private fun startRestTimer(seconds: Int) {
        stopRestTimer()
        isTimerRunning = true
        binding.btnTriggerRest.text = "Dừng nghỉ"

        restTimer = object : CountDownTimer((seconds * 1000).toLong(), 1000) {
            override fun onTick(millisUntilFinished: Long) {
                val secLeft = (millisUntilFinished / 1000).toInt()
                updateTimerDisplay(secLeft)
            }

            override fun onFinish() {
                isTimerRunning = false
                updateTimerDisplay(restTimeSeconds)
                binding.btnTriggerRest.text = "Bắt đầu nghỉ"

                // Play notification tone
                try {
                    val toneGen = ToneGenerator(AudioManager.STREAM_NOTIFICATION, 100)
                    toneGen.startTone(ToneGenerator.TONE_PROP_BEEP, 700)
                } catch (_: Exception) {}

                Toast.makeText(this@ActiveWorkoutActivity, "🔔 Hết thời gian nghỉ! Sẵn sàng hiệp tiếp theo!", Toast.LENGTH_LONG).show()
            }
        }.start()
    }

    private fun stopRestTimer() {
        restTimer?.cancel()
        restTimer = null
        isTimerRunning = false
        binding.btnTriggerRest.text = "Bắt đầu nghỉ"
        updateTimerDisplay(restTimeSeconds)
    }

    private fun renderSets() {
        binding.llSetsContainer.removeAllViews()
        val inflater = layoutInflater

        setsList.forEachIndexed { index, setItem ->
            val row = LinearLayout(this).apply {
                orientation = LinearLayout.HORIZONTAL
                gravity = Gravity.CENTER_VERTICAL
                setPadding(0, 12, 0, 12)
                setBackgroundColor(if (setItem.isCompleted) Color.parseColor("#ECFDF5") else Color.parseColor("#F8FAFC"))
                layoutParams = LinearLayout.LayoutParams(
                    LinearLayout.LayoutParams.MATCH_PARENT,
                    LinearLayout.LayoutParams.WRAP_CONTENT
                ).apply {
                    topMargin = 8
                }
            }

            val tvSetNum = TextView(this).apply {
                layoutParams = LinearLayout.LayoutParams(120, LinearLayout.LayoutParams.WRAP_CONTENT)
                gravity = Gravity.CENTER
                text = "${setItem.setNum}"
                textSize = 14f
                typeface = Typeface.DEFAULT_BOLD
                setTextColor(ContextCompat.getColor(this@ActiveWorkoutActivity, R.color.text_dark))
            }

            val tvWeight = TextView(this).apply {
                layoutParams = LinearLayout.LayoutParams(0, LinearLayout.LayoutParams.WRAP_CONTENT, 1f)
                gravity = Gravity.CENTER
                text = "${setItem.weightKg} kg"
                textSize = 14f
                setTextColor(ContextCompat.getColor(this@ActiveWorkoutActivity, R.color.text_dark))
                setOnClickListener {
                    promptEditWeight(setItem)
                }
            }

            val tvReps = TextView(this).apply {
                layoutParams = LinearLayout.LayoutParams(0, LinearLayout.LayoutParams.WRAP_CONTENT, 1f)
                gravity = Gravity.CENTER
                text = "${setItem.reps} reps"
                textSize = 14f
                setTextColor(ContextCompat.getColor(this@ActiveWorkoutActivity, R.color.text_dark))
                setOnClickListener {
                    promptEditReps(setItem)
                }
            }

            val btnDone = TextView(this).apply {
                layoutParams = LinearLayout.LayoutParams(140, LinearLayout.LayoutParams.WRAP_CONTENT)
                gravity = Gravity.CENTER
                textSize = 18f
                typeface = Typeface.DEFAULT_BOLD

                if (setItem.isCompleted) {
                    text = "✓"
                    setTextColor(Color.parseColor("#10B981"))
                } else {
                    text = "○"
                    setTextColor(Color.parseColor("#94A3B8"))
                }

                setOnClickListener {
                    setItem.isCompleted = !setItem.isCompleted
                    if (setItem.isCompleted) {
                        startRestTimer(restTimeSeconds)
                        Toast.makeText(this@ActiveWorkoutActivity, "✓ Đã hoàn thành Hiệp ${setItem.setNum}! Bắt đầu đếm ngược ${restTimeSeconds}s", Toast.LENGTH_SHORT).show()
                    }
                    renderSets()
                }
            }

            row.addView(tvSetNum)
            row.addView(tvWeight)
            row.addView(tvReps)
            row.addView(btnDone)
            binding.llSetsContainer.addView(row)
        }
    }

    private fun promptEditWeight(setItem: ActiveWorkoutSet) {
        val input = EditText(this).apply {
            setText(setItem.weightKg.toString())
            inputType = android.text.InputType.TYPE_CLASS_NUMBER or android.text.InputType.TYPE_NUMBER_FLAG_DECIMAL
        }
        AlertDialog.Builder(this)
            .setTitle("Nhập mức tạ (kg) - Hiệp ${setItem.setNum}")
            .setView(input)
            .setPositiveButton("Lưu") { _, _ ->
                val w = input.text.toString().toFloatOrNull() ?: setItem.weightKg
                setItem.weightKg = w
                renderSets()
            }
            .setNegativeButton("Hủy", null)
            .show()
    }

    private fun promptEditReps(setItem: ActiveWorkoutSet) {
        val input = EditText(this).apply {
            setText(setItem.reps.toString())
            inputType = android.text.InputType.TYPE_CLASS_NUMBER
        }
        AlertDialog.Builder(this)
            .setTitle("Nhập số lần lặp (reps) - Hiệp ${setItem.setNum}")
            .setView(input)
            .setPositiveButton("Lưu") { _, _ ->
                val r = input.text.toString().toIntOrNull() ?: setItem.reps
                setItem.reps = r
                renderSets()
            }
            .setNegativeButton("Hủy", null)
            .show()
    }

    private fun renderSteps(steps: List<String>) {
        binding.llActiveInstructionsContainer.removeAllViews()
        steps.forEachIndexed { index, stepText ->
            val row = LinearLayout(this).apply {
                orientation = LinearLayout.HORIZONTAL
                layoutParams = LinearLayout.LayoutParams(
                    LinearLayout.LayoutParams.MATCH_PARENT,
                    LinearLayout.LayoutParams.WRAP_CONTENT
                ).apply {
                    topMargin = 12
                }
            }

            val numBadge = TextView(this).apply {
                text = "${index + 1}"
                setTextColor(Color.WHITE)
                textSize = 11f
                typeface = Typeface.DEFAULT_BOLD
                gravity = Gravity.CENTER
                background = ContextCompat.getDrawable(this@ActiveWorkoutActivity, R.drawable.bg_primary_button)
                layoutParams = LinearLayout.LayoutParams(54, 54).apply {
                    rightMargin = 16
                }
            }

            val stepTv = TextView(this).apply {
                text = stepText
                setTextColor(ContextCompat.getColor(this@ActiveWorkoutActivity, R.color.text_dark))
                textSize = 13.5f
                setLineSpacing(0f, 1.25f)
                layoutParams = LinearLayout.LayoutParams(
                    0,
                    LinearLayout.LayoutParams.WRAP_CONTENT,
                    1f
                )
            }

            row.addView(numBadge)
            row.addView(stepTv)
            binding.llActiveInstructionsContainer.addView(row)
        }
    }

    private fun confirmExit() {
        AlertDialog.Builder(this)
            .setTitle("Dừng buổi tập?")
            .setMessage("Bạn có chắc chắn muốn thoát buổi tập hiện tại? Tiến trình buổi tập sẽ bị hủy.")
            .setPositiveButton("Thoát buổi tập") { _, _ ->
                stopRestTimer()
                session.isWorkoutActive = false
                finish()
            }
            .setNegativeButton("Tiếp tục tập", null)
            .show()
    }

    private fun finishWorkout() {
        stopRestTimer()
        session.isWorkoutActive = false

        var totalVolumeKg = completedSetsHistory.sumOf { (it.weightKg * it.reps).toDouble() }.toInt()
        if (totalVolumeKg == 0) totalVolumeKg = 3200
        val totalSetsCount = if (completedSetsHistory.isNotEmpty()) completedSetsHistory.size else 6

        val intent = Intent(this, WorkoutSummaryModalActivity::class.java).apply {
            putExtra("TOTAL_TIME", "45 phút")
            putExtra("TOTAL_VOLUME", "${String.format(java.util.Locale.US, "%,d", totalVolumeKg).replace(",", ".")} kg")
            putExtra("TOTAL_SETS", "$totalSetsCount hiệp")
        }
        startActivity(intent)
        finish()
    }

    override fun onDestroy() {
        super.onDestroy()
        stopRestTimer()
    }

    @Deprecated("Deprecated in Java")
    override fun onBackPressed() {
        confirmExit()
    }
}
