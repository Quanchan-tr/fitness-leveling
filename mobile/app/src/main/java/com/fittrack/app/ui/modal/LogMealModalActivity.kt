package com.fittrack.app.ui.modal

import android.os.Bundle
import android.widget.Toast
import androidx.appcompat.app.AppCompatActivity
import com.fittrack.app.R
import com.fittrack.app.databinding.ActivityModalLogMealBinding

class LogMealModalActivity : AppCompatActivity() {

    private lateinit var binding: ActivityModalLogMealBinding
    private var addedItemsCount = 0

    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)
        binding = ActivityModalLogMealBinding.inflate(layoutInflater)
        setContentView(binding.root)

        setupListeners()
    }

    private fun setupListeners() {
        binding.btnCloseMeal.setOnClickListener {
            finish()
        }

        binding.rootContainer.setOnClickListener {
            finish()
        }

        binding.cardModal.setOnClickListener {
            // Prevent dismiss when tapping inside
        }

        binding.btnAddFood1.setOnClickListener {
            addedItemsCount++
            binding.btnAddFood1.text = getString(R.string.modal_meal_btn_added)
            Toast.makeText(this, getString(R.string.toast_meal_selected, getString(R.string.modal_meal_food1_name)), Toast.LENGTH_SHORT).show()
        }

        binding.btnAddFood2.setOnClickListener {
            addedItemsCount++
            binding.btnAddFood2.text = getString(R.string.modal_meal_btn_added)
            Toast.makeText(this, getString(R.string.toast_meal_selected, getString(R.string.modal_meal_food2_name)), Toast.LENGTH_SHORT).show()
        }

        binding.btnAddFood3.setOnClickListener {
            addedItemsCount++
            binding.btnAddFood3.text = getString(R.string.modal_meal_btn_added)
            Toast.makeText(this, getString(R.string.toast_meal_selected, getString(R.string.modal_meal_food3_name)), Toast.LENGTH_SHORT).show()
        }

        binding.btnConfirmAddMeal.setOnClickListener {
            val total = if (addedItemsCount == 0) 1 else addedItemsCount
            Toast.makeText(this, getString(R.string.toast_meals_saved, total), Toast.LENGTH_SHORT).show()
            finish()
        }
    }
}
