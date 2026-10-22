package com.fittrack.app.ui.workout

import android.content.Intent
import android.os.Bundle
import androidx.appcompat.app.AppCompatActivity
import com.fittrack.app.R
import com.fittrack.app.databinding.ActivityActiveWorkoutBinding
import com.fittrack.app.ui.aipose.AiPoseActiveSessionActivity
import com.fittrack.app.ui.modal.AiCalibrationModalActivity
import com.fittrack.app.ui.modal.WorkoutSummaryModalActivity

class ActiveWorkoutActivity : AppCompatActivity() {

    private lateinit var binding: ActivityActiveWorkoutBinding
    private var currentExerciseIndex = 1

    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)
        binding = ActivityActiveWorkoutBinding.inflate(layoutInflater)
        setContentView(binding.root)

        binding.btnBack.setOnClickListener {
            finish()
        }

        binding.btnQuit.setOnClickListener {
            finish()
        }

        binding.btnAiCheckForm.setOnClickListener {
            startActivity(Intent(this, AiCalibrationModalActivity::class.java))
        }

        binding.btnNextExercise.setOnClickListener {
            if (currentExerciseIndex == 1) {
                currentExerciseIndex = 2
                binding.tvExerciseStatus.text = getString(R.string.active_workout_status_2)
                binding.tvCurrentExerciseName.text = getString(R.string.active_workout_ex2_name)
                binding.tvTargetInfo.text = getString(R.string.active_workout_ex2_target)
                binding.btnNextExercise.text = getString(R.string.btn_finish_workout_xp)
            } else {
                startActivity(Intent(this, WorkoutSummaryModalActivity::class.java))
                finish()
            }
        }
    }
}
