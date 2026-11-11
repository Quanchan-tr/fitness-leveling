package com.fittrack.app.ui.routine

import android.content.Intent
import android.os.Bundle
import androidx.appcompat.app.AppCompatActivity
import com.fittrack.app.databinding.ActivityRoutineDetailBinding
import com.fittrack.app.ui.workout.ActiveWorkoutActivity

class RoutineDetailActivity : AppCompatActivity() {

    private lateinit var binding: ActivityRoutineDetailBinding

    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)
        binding = ActivityRoutineDetailBinding.inflate(layoutInflater)
        setContentView(binding.root)

        val routineTitle = intent.getStringExtra("ROUTINE_TITLE")
        if (!routineTitle.isNullOrBlank()) {
            binding.tvRoutineName.text = routineTitle
        }

        binding.btnBack.setOnClickListener {
            finish()
        }

        val startWorkoutAction = {
            val intent = Intent(this, ActiveWorkoutActivity::class.java).apply {
                putExtra("ROUTINE_TITLE", binding.tvRoutineName.text.toString())
            }
            startActivity(intent)
        }

        binding.btnStartWorkoutNow.setOnClickListener {
            startWorkoutAction()
        }

        binding.cardExercise1.setOnClickListener { startWorkoutAction() }
        binding.cardExercise2.setOnClickListener { startWorkoutAction() }
        binding.cardExercise3.setOnClickListener { startWorkoutAction() }
        binding.cardExercise4.setOnClickListener { startWorkoutAction() }
        binding.cardExercise5.setOnClickListener { startWorkoutAction() }
    }
}
