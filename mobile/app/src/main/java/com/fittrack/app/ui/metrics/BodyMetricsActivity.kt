package com.fittrack.app.ui.metrics

import android.content.Intent
import android.os.Bundle
import android.view.View
import android.widget.SeekBar
import android.widget.Toast
import androidx.appcompat.app.AppCompatActivity
import androidx.core.content.ContextCompat
import com.fittrack.app.R
import com.fittrack.app.databinding.ActivityBodyMetricsBinding
import com.fittrack.app.ui.BottomNavTab
import com.fittrack.app.ui.modal.LogMealModalActivity
import com.fittrack.app.ui.setupBottomNav

class BodyMetricsActivity : AppCompatActivity() {

    private lateinit var binding: ActivityBodyMetricsBinding
    private var isNutritionTabActive = false

    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)
        binding = ActivityBodyMetricsBinding.inflate(layoutInflater)
        setContentView(binding.root)

        setupSubTabs()
        setupPortionSlider()
        setupNutritionActions()
        setupBottomNav()

        if (intent.getStringExtra("INITIAL_TAB") == "NUTRITION") {
            switchToTab(isNutrition = true)
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
                startActivity(Intent(this, com.fittrack.app.ui.modal.LogMetricsModalActivity::class.java))
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
