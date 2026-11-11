package com.fittrack.app.ui.modal

import android.app.Activity
import android.content.Intent
import android.os.Bundle
import android.text.Editable
import android.text.TextWatcher
import android.widget.Toast
import androidx.appcompat.app.AppCompatActivity
import androidx.lifecycle.lifecycleScope
import com.fittrack.app.data.api.ApiClient
import com.fittrack.app.data.models.CreateBodyMetricRequest
import com.fittrack.app.data.session.SessionManager
import com.fittrack.app.databinding.ActivityModalLogMetricsBinding
import kotlinx.coroutines.Dispatchers
import kotlinx.coroutines.launch
import kotlinx.coroutines.withContext

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
            handleSaveMetrics()
        }
    }

    private fun handleSaveMetrics() {
        val weightStr = binding.etWeight.text.toString().trim()
        val heightStr = binding.etHeight.text.toString().trim()
        val fatStr = binding.etBodyFat.text.toString().trim()

        val weightKg = weightStr.toDoubleOrNull()
        if (weightKg == null || weightKg <= 0.0) {
            Toast.makeText(this, "Vui lòng nhập cân nặng hợp lệ (kg)", Toast.LENGTH_SHORT).show()
            return
        }

        val fatPct = fatStr.toDoubleOrNull()
        val heightCm = heightStr.toDoubleOrNull()
        val todayStr = java.text.SimpleDateFormat("yyyy-MM-dd", java.util.Locale.US).format(java.util.Date())

        val session = SessionManager.getInstance(this)
        if (session.isLoggedIn) {
            lifecycleScope.launch {
                try {
                    withContext(Dispatchers.IO) {
                        ApiClient.getService(this@LogMetricsModalActivity).createBodyMetric(
                            CreateBodyMetricRequest(
                                logDate = todayStr,
                                weightKg = weightKg,
                                bodyFatPct = fatPct,
                                heightCm = heightCm
                            )
                        )
                    }
                } catch (_: Exception) {
                    // Non-blocking sync
                }
            }
        }

        val resultIntent = Intent().apply {
            putExtra("SAVED_WEIGHT", weightStr)
            if (heightStr.isNotEmpty()) putExtra("SAVED_HEIGHT", heightStr)
            if (fatStr.isNotEmpty()) putExtra("SAVED_FAT", fatStr)
        }
        setResult(Activity.RESULT_OK, resultIntent)
        Toast.makeText(this, "✓ Đã lưu số đo thể chất thành công!", Toast.LENGTH_SHORT).show()
        finish()
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
