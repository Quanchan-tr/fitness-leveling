package com.fittrack.app.ui.metrics

import android.content.Intent
import android.os.Bundle
import android.view.View
import android.widget.SeekBar
import android.widget.Toast
import androidx.appcompat.app.AppCompatActivity
import androidx.core.content.ContextCompat
import androidx.lifecycle.lifecycleScope
import com.fittrack.app.R
import com.fittrack.app.data.api.ApiClient
import com.fittrack.app.data.session.SessionManager
import com.fittrack.app.databinding.ActivityBodyMetricsBinding
import com.fittrack.app.ui.BottomNavTab
import com.fittrack.app.ui.modal.LogMealModalActivity
import com.fittrack.app.ui.modal.LogMetricsModalActivity
import com.fittrack.app.ui.setupBottomNav
import kotlinx.coroutines.Dispatchers
import kotlinx.coroutines.launch
import kotlinx.coroutines.withContext
import java.util.Locale

class BodyMetricsActivity : AppCompatActivity() {

    private lateinit var binding: ActivityBodyMetricsBinding
    private lateinit var session: SessionManager
    private var isNutritionTabActive = false

    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)
        binding = ActivityBodyMetricsBinding.inflate(layoutInflater)
        setContentView(binding.root)

        session = SessionManager.getInstance(this)

        setupSubTabs()
        setupPortionSlider()
        setupNutritionActions()
        setupBottomNav()

        if (intent.getStringExtra("INITIAL_TAB") == "NUTRITION") {
            switchToTab(isNutrition = true)
        }

        fetchMetricsFromBackend()
    }

    override fun onResume() {
        super.onResume()
        fetchMetricsFromBackend()
    }

    private fun fetchMetricsFromBackend() {
        if (!session.isLoggedIn) return

        val api = ApiClient.getService(this)
        lifecycleScope.launch {
            // 1. Đồng bộ Body Metrics từ API
            try {
                val res = withContext(Dispatchers.IO) { api.getBodyMetrics() }
                if (res.isSuccessful && res.body()?.data?.isNotEmpty() == true) {
                    val latest = res.body()!!.data!!.first()
                    binding.tvMetricWeightVal.text = String.format(Locale.US, "%.1f kg", latest.weightKg)

                    val heightM = (latest.heightCm?.takeIf { it > 50.0 } ?: 175.0) / 100.0
                    val bmi = latest.weightKg / (heightM * heightM)
                    binding.tvMetricBmiVal.text = String.format(Locale.US, "%.1f", bmi)
                    binding.tvMetricBmiDesc.text = when {
                        bmi < 18.5 -> "Gầy"
                        bmi in 18.5..24.9 -> "Chuẩn"
                        else -> "Thừa cân"
                    }

                    latest.bodyFatPct?.let { fat ->
                        binding.tvMetricFatVal.text = String.format(Locale.US, "%.1f%%", fat)
                    }
                }
            } catch (_: Exception) {
                // Giữ nguyên giao diện offline
            }

            // 2. Đồng bộ Nutrition Logs từ API
            try {
                val nutRes = withContext(Dispatchers.IO) { api.getNutritionLogs() }
                if (nutRes.isSuccessful && nutRes.body()?.data?.isNotEmpty() == true) {
                    val logs = nutRes.body()!!.data!!
                    val totalCalories = logs.sumOf { it.calories }
                    val totalProtein = logs.sumOf { it.proteinGrams }
                    val totalCarbs = logs.sumOf { it.carbsGrams }
                    val totalFat = logs.sumOf { it.fatGrams }

                    if (totalCalories > 0) {
                        binding.tvCalorieGoal.text = "$totalCalories kcal"
                        binding.tvProteinMacro.text = String.format(Locale.US, "Đạm: %.0fg", totalProtein)
                        binding.pbProtein.progress = minOf(totalProtein.toInt(), binding.pbProtein.max)

                        binding.tvCarbMacro.text = String.format(Locale.US, "Carb: %.0fg", totalCarbs)
                        binding.pbCarb.progress = minOf(totalCarbs.toInt(), binding.pbCarb.max)

                        binding.tvFatMacro.text = String.format(Locale.US, "Fat: %.0fg", totalFat)
                        binding.pbFat.progress = minOf(totalFat.toInt(), binding.pbFat.max)
                    }
                }
            } catch (_: Exception) {
                // Giữ nguyên giao diện offline
            }
        }
    }

    private fun setupSubTabs() {
        binding.tabBodyMetrics.setOnClickListener {
            switchToTab(isNutrition = false)
        }

        binding.btnToNutrition.setOnClickListener {
            switchToTab(isNutrition = true)
        }

        binding.btnLogMetrics.setOnClickListener {
            if (isNutritionTabActive) {
                startActivity(Intent(this, LogMealModalActivity::class.java))
            } else {
                startActivity(Intent(this, LogMetricsModalActivity::class.java))
            }
        }
    }

    private fun switchToTab(isNutrition: Boolean) {
        isNutritionTabActive = isNutrition
        if (isNutrition) {
            binding.scrollBodyMetrics.visibility = View.GONE
            binding.scrollNutrition.visibility = View.VISIBLE

            binding.btnToNutrition.background = ContextCompat.getDrawable(this, R.drawable.bg_subtab_pill_active)
            binding.btnToNutrition.setTextColor(ContextCompat.getColor(this, R.color.white))

            binding.tabBodyMetrics.background = ContextCompat.getDrawable(this, R.drawable.bg_subtab_pill_inactive)
            binding.tabBodyMetrics.setTextColor(ContextCompat.getColor(this, R.color.text_dark))

            binding.btnLogMetrics.text = getString(R.string.btn_log_nutrition)
        } else {
            binding.scrollBodyMetrics.visibility = View.VISIBLE
            binding.scrollNutrition.visibility = View.GONE

            binding.tabBodyMetrics.background = ContextCompat.getDrawable(this, R.drawable.bg_subtab_pill_active)
            binding.tabBodyMetrics.setTextColor(ContextCompat.getColor(this, R.color.white))

            binding.btnToNutrition.background = ContextCompat.getDrawable(this, R.drawable.bg_subtab_pill_inactive)
            binding.btnToNutrition.setTextColor(ContextCompat.getColor(this, R.color.text_dark))

            binding.btnLogMetrics.text = getString(R.string.btn_log_metrics)
        }
    }

    private fun setupPortionSlider() {
        binding.sliderPortion.setOnSeekBarChangeListener(object : SeekBar.OnSeekBarChangeListener {
            override fun onProgressChanged(seekBar: SeekBar?, progress: Int, fromUser: Boolean) {
                val ratio = progress.toFloat() / 100f
                val statusText = when {
                    progress < 85 -> "Ít calo"
                    progress in 85..115 -> "Khẩu phần chuẩn"
                    else -> "Xả cơ"
                }
                binding.tvPortionPercent.text = "$progress% ($statusText)"

                val cal = (1850 * ratio).toInt()
                binding.tvCalorieGoal.text = "$cal kcal"

                val proteinTarget = (160 * ratio).toInt()
                val proteinCurrent = (135 * ratio).toInt()
                binding.tvProteinMacro.text = "Đạm (Protein): $proteinCurrent / ${proteinTarget}g"
                binding.pbProtein.max = proteinTarget
                binding.pbProtein.progress = proteinCurrent

                val carbTarget = (240 * ratio).toInt()
                val carbCurrent = (180 * ratio).toInt()
                binding.tvCarbMacro.text = "Tinh bột (Carb): $carbCurrent / ${carbTarget}g"
                binding.pbCarb.max = carbTarget
                binding.pbCarb.progress = carbCurrent

                val fatTarget = (65 * ratio).toInt()
                val fatCurrent = (48 * ratio).toInt()
                binding.tvFatMacro.text = "Chất béo (Fat): $fatCurrent / ${fatTarget}g"
                binding.pbFat.max = fatTarget
                binding.pbFat.progress = fatCurrent
            }

            override fun onStartTrackingTouch(seekBar: SeekBar?) {}
            override fun onStopTrackingTouch(seekBar: SeekBar?) {}
        })
    }

    private fun setupNutritionActions() {
        binding.btnAddMeal.setOnClickListener {
            startActivity(Intent(this, LogMealModalActivity::class.java))
        }

        binding.btnCreateCombo.setOnClickListener {
            startActivity(Intent(this, LogMealModalActivity::class.java))
        }
    }

    private fun setupBottomNav() {
        binding.bottomNavigation.setupBottomNav(this, BottomNavTab.METRICS)
    }
}
