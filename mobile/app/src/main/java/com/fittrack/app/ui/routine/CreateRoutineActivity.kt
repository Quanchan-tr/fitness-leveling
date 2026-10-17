package com.fittrack.app.ui.routine

import android.os.Bundle
import androidx.appcompat.app.AppCompatActivity
import com.fittrack.app.databinding.ActivityCreateRoutineBinding

class CreateRoutineActivity : AppCompatActivity() {

    private lateinit var binding: ActivityCreateRoutineBinding

    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)
        binding = ActivityCreateRoutineBinding.inflate(layoutInflater)
        setContentView(binding.root)

        binding.btnBack.setOnClickListener {
            finish()
        }

        binding.btnAddExercise.setOnClickListener {
            startActivity(android.content.Intent(this, com.fittrack.app.ui.modal.ExercisePickerModalActivity::class.java))
        }

        binding.btnSaveRoutine.setOnClickListener {
            finish()
        }
    }
}
