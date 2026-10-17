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

        binding.btnBack.setOnClickListener {
            finish()
        }

        binding.btnStartWorkoutNow.setOnClickListener {
            startActivity(Intent(this, ActiveWorkoutActivity::class.java))
        }

        binding.cardExercise1.setOnClickListener {
            startActivity(Intent(this, ActiveWorkoutActivity::class.java))
        }
    }
}
