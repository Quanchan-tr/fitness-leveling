package com.fittrack.app.ui.workout

import android.content.Intent
import android.graphics.Color
import android.graphics.Typeface
import android.os.Bundle
import android.view.Gravity
import android.widget.LinearLayout
import android.widget.TextView
import androidx.appcompat.app.AlertDialog
import androidx.appcompat.app.AppCompatActivity
import androidx.core.content.ContextCompat
import com.fittrack.app.R
import com.fittrack.app.data.session.SessionManager
import com.fittrack.app.databinding.ActivityActiveWorkoutBinding
import com.fittrack.app.ui.modal.AiCalibrationModalActivity
import com.fittrack.app.ui.modal.WorkoutSummaryModalActivity
import com.fittrack.app.util.loadUrl

class ActiveWorkoutActivity : AppCompatActivity() {

    private lateinit var binding: ActivityActiveWorkoutBinding
    private lateinit var session: SessionManager

    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)
        binding = ActivityActiveWorkoutBinding.inflate(layoutInflater)
        setContentView(binding.root)

        session = SessionManager(this)

        val exerciseName = intent.getStringExtra("EXERCISE_NAME")
            ?: intent.getStringExtra("ROUTINE_TITLE")
            ?: getString(R.string.active_workout_ex1_name)

        val exerciseTarget = intent.getStringExtra("EXERCISE_TARGET")
            ?: getString(R.string.active_workout_ex1_target)

        val exerciseImage = intent.getStringExtra("EXERCISE_IMAGE")
            ?: "https://raw.githubusercontent.com/Quanchan-tr/fitness-leveling/dev/media/exercises/0025-EIeI8Vf.webp"

        val steps = intent.getStringArrayListExtra("EXERCISE_STEPS") ?: arrayListOf(
            "Chuẩn bị tư thế: Giữ vững trọng tâm cơ thể, siết chặt cơ bụng và hít một hơi thật sâu.",
            "Thực hiện chuyển động: Kiểm soát tạ/cơ thể theo đúng biên độ chuyển động, không để rung lắc hoặc sai khớp.",
            "Hoàn tất hiệp: Thở ra đều đặn khi đưa cơ thể/tạ về vị trí ban đầu và lặp lại theo mục tiêu."
        )

        // Mark active workout session
        session.isWorkoutActive = true
        session.activeWorkoutName = exerciseName

        // Bind basic UI
        binding.tvTitle.text = exerciseName
        binding.tvCurrentExerciseName.text = exerciseName
        binding.tvTargetInfo.text = exerciseTarget

        // Bind exercise illustration image
        binding.ivActiveExerciseImage.loadUrl(exerciseImage, R.drawable.ic_dumbbell_solid)

        // Render instruction steps
        renderSteps(steps)

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
            finishWorkout()
        }
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
                session.isWorkoutActive = false
                finish()
            }
            .setNegativeButton("Tiếp tục tập", null)
            .show()
    }

    private fun finishWorkout() {
        session.isWorkoutActive = false
        startActivity(Intent(this, WorkoutSummaryModalActivity::class.java))
        finish()
    }

    @Deprecated("Deprecated in Java")
    override fun onBackPressed() {
        confirmExit()
    }
}
