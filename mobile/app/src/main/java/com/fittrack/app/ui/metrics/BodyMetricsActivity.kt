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

    private var loadedCalories: Int = 0
    private var loadedProtein: Double = 0.0
    private var loadedCarbs: Double = 0.0
    private var loadedFat: Double = 0.0

    private fun fetchMetricsFromBackend() {
        if (!session.isLoggedIn) {
            Toast.makeText(this, "Vui lòng đăng nhập để xem chỉ số cơ thể", Toast.LENGTH_SHORT).show()
            return
        }

        val api = ApiClient.getService(this)
        lifecycleScope.launch {
            // 1. Đồng bộ Body Metrics từ API
            try {
                val res = withContext(Dispatchers.IO) { api.getBodyMetrics() }
                if (res.isSuccessful) {
                    val list = res.body()?.data.orEmpty()
                    if (list.isNotEmpty()) {
                        val latest = list.first()
                        binding.tvMetricWeightVal.text = String.format(Locale.US, "%.1f kg", latest.weightKg)

                        val heightM = (latest.heightCm?.takeIf { it > 50.0 } ?: session.userHeight.toDouble()) / 100.0
                        val bmi = latest.weightKg / (heightM * heightM)
                        binding.tvMetricBmiVal.text = String.format(Locale.US, "%.1f", bmi)
                        binding.tvMetricBmiDesc.text = when {
                            bmi < 18.5 -> "Gầy"
                            bmi in 18.5..24.9 -> "Chuẩn"
                            else -> "Thừa cân"
                        }

                        binding.tvMetricFatVal.text = latest.bodyFatPct?.let {
                            String.format(Locale.US, "%.1f%%", it)
                        } ?: "--"
                    } else {
                        binding.tvMetricWeightVal.text = "-- kg"
                        binding.tvMetricBmiVal.text = "--"
                        binding.tvMetricBmiDesc.text = "Chưa có"
                        binding.tvMetricFatVal.text = "--"
                    }
                } else {
                    Toast.makeText(this@BodyMetricsActivity, "Lỗi tải chỉ số (${res.code()})", Toast.LENGTH_SHORT).show()
                }
            } catch (e: Exception) {
                Toast.makeText(this@BodyMetricsActivity, "Lỗi kết nối chỉ số: ${e.localizedMessage}", Toast.LENGTH_SHORT).show()
            }

            // 2. Đồng bộ Nutrition Logs từ API
            try {
                val nutRes = withContext(Dispatchers.IO) { api.getNutritionLogs() }
                if (nutRes.isSuccessful) {
                    val logs = nutRes.body()?.data.orEmpty()
                    loadedCalories = logs.sumOf { it.calories }
                    loadedProtein = logs.sumOf { it.proteinGrams }
                    loadedCarbs = logs.sumOf { it.carbsGrams }
                    loadedFat = logs.sumOf { it.fatGrams }

                    binding.tvCalorieGoal.text = "$loadedCalories kcal"
                    binding.tvProteinMacro.text = String.format(Locale.US, "Đạm: %.0fg", loadedProtein)
                    binding.pbProtein.progress = minOf(loadedProtein.toInt(), binding.pbProtein.max)

                    binding.tvCarbMacro.text = String.format(Locale.US, "Carb: %.0fg", loadedCarbs)
                    binding.pbCarb.progress = minOf(loadedCarbs.toInt(), binding.pbCarb.max)

                    binding.tvFatMacro.text = String.format(Locale.US, "Fat: %.0fg", loadedFat)
                    binding.pbFat.progress = minOf(loadedFat.toInt(), binding.pbFat.max)
                } else {
                    Toast.makeText(this@BodyMetricsActivity, "Lỗi tải dinh dưỡng (${nutRes.code()})", Toast.LENGTH_SHORT).show()
                }
            } catch (e: Exception) {
                Toast.makeText(this@BodyMetricsActivity, "Lỗi kết nối dinh dưỡng: ${e.localizedMessage}", Toast.LENGTH_SHORT).show()
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

                val cal = (loadedCalories * ratio).toInt()
                binding.tvCalorieGoal.text = "$cal kcal"

                val proteinScaled = (loadedProtein * ratio).toInt()
                binding.tvProteinMacro.text = "Đạm (Protein): ${proteinScaled}g"
                binding.pbProtein.progress = minOf(proteinScaled, binding.pbProtein.max)

                val carbScaled = (loadedCarbs * ratio).toInt()
                binding.tvCarbMacro.text = "Tinh bột (Carb): ${carbScaled}g"
                binding.pbCarb.progress = minOf(carbScaled, binding.pbCarb.max)

                val fatScaled = (loadedFat * ratio).toInt()
                binding.tvFatMacro.text = "Chất béo (Fat): ${fatScaled}g"
                binding.pbFat.progress = minOf(fatScaled, binding.pbFat.max)
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
