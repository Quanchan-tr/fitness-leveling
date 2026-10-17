package com.fittrack.app.ui.modal

import android.os.Bundle
import android.widget.Toast
import androidx.appcompat.app.AppCompatActivity
import com.fittrack.app.R
import com.fittrack.app.databinding.ActivityModalExercisePickerBinding

class ExercisePickerModalActivity : AppCompatActivity() {

    private lateinit var binding: ActivityModalExercisePickerBinding
    private val selectedExercises = mutableSetOf<Int>()

    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)
        binding = ActivityModalExercisePickerBinding.inflate(layoutInflater)
        setContentView(binding.root)

        setupListeners()
    }

    private fun setupListeners() {
        binding.btnClosePicker.setOnClickListener {
            finish()
        }

        binding.rootContainer.setOnClickListener {
            finish()
        }

        binding.cardModal.setOnClickListener {
            // Prevent dismiss when clicking inside
        }

        binding.btnSelectEx1.setOnClickListener { toggleSelect(1) }
        binding.itemExercise1.setOnClickListener { toggleSelect(1) }

        binding.btnSelectEx2.setOnClickListener { toggleSelect(2) }
        binding.itemExercise2.setOnClickListener { toggleSelect(2) }

        binding.btnSelectEx3.setOnClickListener { toggleSelect(3) }
        binding.itemExercise3.setOnClickListener { toggleSelect(3) }

        binding.btnSelectEx4.setOnClickListener { toggleSelect(4) }
        binding.itemExercise4.setOnClickListener { toggleSelect(4) }

        binding.btnAddToWorkout.setOnClickListener {
            val count = if (selectedExercises.isEmpty()) 1 else selectedExercises.size
            Toast.makeText(this, "Đã thêm $count bài tập vào buổi tập thành công!", Toast.LENGTH_SHORT).show()
            finish()
        }
    }

    private fun toggleSelect(id: Int) {
        val btn = when (id) {
            1 -> binding.btnSelectEx1
            2 -> binding.btnSelectEx2
            3 -> binding.btnSelectEx3
            4 -> binding.btnSelectEx4
            else -> return
        }

        if (selectedExercises.contains(id)) {
            selectedExercises.remove(id)
            btn.text = "+"
            btn.setBackgroundResource(R.drawable.bg_modal_circle_primary)
        } else {
            selectedExercises.add(id)
            btn.text = "✓"
            btn.setBackgroundResource(R.drawable.bg_modal_circle_primary)
        }
    }
}
