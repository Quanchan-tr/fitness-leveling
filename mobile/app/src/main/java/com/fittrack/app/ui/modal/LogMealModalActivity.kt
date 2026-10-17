package com.fittrack.app.ui.modal

import android.os.Bundle
import android.widget.Toast
import androidx.appcompat.app.AppCompatActivity
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
            binding.btnAddFood1.text = "✓"
            Toast.makeText(this, "Đã chọn: Ức gà áp chảo (100g)", Toast.LENGTH_SHORT).show()
        }

        binding.btnAddFood2.setOnClickListener {
            addedItemsCount++
            binding.btnAddFood2.text = "✓"
            Toast.makeText(this, "Đã chọn: Cơm gạo lứt (150g)", Toast.LENGTH_SHORT).show()
        }

        binding.btnAddFood3.setOnClickListener {
            addedItemsCount++
            binding.btnAddFood3.text = "✓"
            Toast.makeText(this, "Đã chọn: Trứng gà luộc (2 quả)", Toast.LENGTH_SHORT).show()
        }

        binding.btnConfirmAddMeal.setOnClickListener {
            val total = if (addedItemsCount == 0) 1 else addedItemsCount
            Toast.makeText(this, "Đã lưu $total món vào thực đơn hôm nay thành công!", Toast.LENGTH_SHORT).show()
            finish()
        }
    }
}
