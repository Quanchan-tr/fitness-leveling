package com.fittrack.app.ui.modal

import android.app.Activity
import android.content.Intent
import android.os.Bundle
import android.text.Editable
import android.text.TextWatcher
import android.widget.Toast
import androidx.appcompat.app.AppCompatActivity
import com.fittrack.app.databinding.ActivityModalLogMetricsBinding

class LogMetricsModalActivity : AppCompatActivity() {

    private lateinit var binding: ActivityModalLogMetricsBinding

    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)
        binding = ActivityModalLogMetricsBinding.inflate(layoutInflater)
        setContentView(binding.root)

        binding.btnCloseMetrics.setOnClickListener { finish() }
        binding.rootContainer.setOnClickListener { finish() }
        binding.cardModal.setOnClickListener { /* prevent dismiss */ }

        val bmiWatcher = object : TextWatcher {
            override fun beforeTextChanged(s: CharSequence?, start: Int, count: Int, after: Int) {}
            override fun onTextChanged(s: CharSequence?, start: Int, before: Int, count: Int) {
                calculateBmi()
            }
            override fun afterTextChanged(s: Editable?) {}
        }

        binding.etWeight.addTextChangedListener(bmiWatcher)
        binding.etHeight.addTextChangedListener(bmiWatcher)

        binding.btnSaveMetrics.setOnClickListener {
            val weight = binding.etWeight.text.toString().trim()
            val height = binding.etHeight.text.toString().trim()
            val fat = binding.etBodyFat.text.toString().trim()

            val resultIntent = Intent().apply {
                if (weight.isNotEmpty()) putExtra("SAVED_WEIGHT", weight)
                if (height.isNotEmpty()) putExtra("SAVED_HEIGHT", height)
                if (fat.isNotEmpty()) putExtra("SAVED_FAT", fat)
            }
            setResult(Activity.RESULT_OK, resultIntent)
            Toast.makeText(this, "Đã lưu số đo cơ thể thành công!", Toast.LENGTH_SHORT).show()
            finish()
        }
    }

    private fun calculateBmi() {
        val w = binding.etWeight.text.toString().toFloatOrNull()
        val h = binding.etHeight.text.toString().toFloatOrNull()
        if (w != null && h != null && h > 0) {
            val heightM = h / 100f
            val bmi = w / (heightM * heightM)
            val rounded = String.format("%.1f", bmi)
            val desc = when {
                bmi < 18.5 -> "Gầy"
                bmi in 18.5..24.9 -> "Bình thường"
                bmi in 25.0..29.9 -> "Thừa cân"
                else -> "Béo phì"
            }
            binding.tvBmiResult.text = "$rounded ($desc)"
        }
    }
}

