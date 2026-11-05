package com.fittrack.app.ui.workout

import android.os.Bundle
import android.os.Handler
import android.os.Looper
import android.view.View
import android.widget.TextView
import android.widget.Toast
import androidx.appcompat.app.AppCompatActivity
import androidx.core.content.ContextCompat
import com.fittrack.app.R
import com.fittrack.app.databinding.ActivityAiWorkoutPlannerBinding

class AiWorkoutPlannerActivity : AppCompatActivity() {

    private lateinit var binding: ActivityAiWorkoutPlannerBinding
    private var selectedSplit = "PPL"
    private var selectedDays = 4
    private var selectedDuration = 60
    private val selectedInjuries = mutableSetOf<String>()

    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)
        binding = ActivityAiWorkoutPlannerBinding.inflate(layoutInflater)
        setContentView(binding.root)

        setupListeners()
    }

    private fun setupListeners() {
        binding.btnBack.setOnClickListener { finish() }

        // Split strategy selection
        binding.optSplitPpl.setOnClickListener {
            selectedSplit = "PPL"
            highlightSplit(binding.optSplitPpl, binding.tvSplitPplTitle, binding.tvSplitPplDesc)
            resetSplit(binding.optSplitUpperLower, binding.tvSplitUlTitle, binding.tvSplitUlDesc)
            resetSplit(binding.optSplitFullbody, binding.tvSplitFbTitle, binding.tvSplitFbDesc)
        }

        binding.optSplitUpperLower.setOnClickListener {
            selectedSplit = "UL"
            highlightSplit(binding.optSplitUpperLower, binding.tvSplitUlTitle, binding.tvSplitUlDesc)
            resetSplit(binding.optSplitPpl, binding.tvSplitPplTitle, binding.tvSplitPplDesc)
            resetSplit(binding.optSplitFullbody, binding.tvSplitFbTitle, binding.tvSplitFbDesc)
        }

        binding.optSplitFullbody.setOnClickListener {
            selectedSplit = "FB"
            highlightSplit(binding.optSplitFullbody, binding.tvSplitFbTitle, binding.tvSplitFbDesc)
            resetSplit(binding.optSplitPpl, binding.tvSplitPplTitle, binding.tvSplitPplDesc)
            resetSplit(binding.optSplitUpperLower, binding.tvSplitUlTitle, binding.tvSplitUlDesc)
        }

        // Days per week
        val dayChips = listOf(binding.chipDays3 to 3, binding.chipDays4 to 4, binding.chipDays5 to 5, binding.chipDays6 to 6)
        dayChips.forEach { (chip, days) ->
            chip.setOnClickListener {
                selectedDays = days
                dayChips.forEach { (c, d) ->
                    if (d == selectedDays) {
                        c.background = ContextCompat.getDrawable(this, R.drawable.bg_subtab_pill_active)
                        c.setTextColor(ContextCompat.getColor(this, R.color.white))
                    } else {
                        c.background = ContextCompat.getDrawable(this, R.drawable.bg_subtab_pill_inactive)
                        c.setTextColor(ContextCompat.getColor(this, R.color.text_dark))
                    }
                }
            }
        }

        // Duration chips
        binding.chipDur45.setOnClickListener {
            selectedDuration = 45
            binding.chipDur45.background = ContextCompat.getDrawable(this, R.drawable.bg_subtab_pill_active)
            binding.chipDur45.setTextColor(ContextCompat.getColor(this, R.color.white))
            binding.chipDur60.background = ContextCompat.getDrawable(this, R.drawable.bg_subtab_pill_inactive)
            binding.chipDur60.setTextColor(ContextCompat.getColor(this, R.color.text_dark))
        }

        binding.chipDur60.setOnClickListener {
            selectedDuration = 60
            binding.chipDur60.background = ContextCompat.getDrawable(this, R.drawable.bg_subtab_pill_active)
            binding.chipDur60.setTextColor(ContextCompat.getColor(this, R.color.white))
            binding.chipDur45.background = ContextCompat.getDrawable(this, R.drawable.bg_subtab_pill_inactive)
            binding.chipDur45.setTextColor(ContextCompat.getColor(this, R.color.text_dark))
        }

        // Injury exclusion toggles
        setupInjuryToggle(binding.chipInjKnee, "knee")
        setupInjuryToggle(binding.chipInjShoulder, "shoulder")
        setupInjuryToggle(binding.chipInjBack, "back")

        // Generate Plan CTA
        binding.btnGeneratePlan.setOnClickListener {
            binding.layoutAiLoading.visibility = View.VISIBLE
            binding.layoutPlanResult.visibility = View.GONE
            binding.btnGeneratePlan.isEnabled = false

            Handler(Looper.getMainLooper()).postDelayed({
                binding.layoutAiLoading.visibility = View.GONE
                binding.layoutPlanResult.visibility = View.VISIBLE
                binding.btnGeneratePlan.isEnabled = true

                binding.tvResultSummary.text = "Lịch tập $selectedSplit $selectedDays buổi/tuần • Thời lượng $selectedDuration phút • Khoa học 100%"
                Toast.makeText(this, "AI đã sinh giáo án luyện tập thành công!", Toast.LENGTH_SHORT).show()
            }, 800)
        }

        // Apply Schedule
        binding.btnApplySchedule.setOnClickListener {
            Toast.makeText(this, "✓ Đã áp dụng giáo án $selectedSplit vào lịch tập tuần này!", Toast.LENGTH_LONG).show()
            finish()
        }
    }

    private fun highlightSplit(layout: View, title: TextView, desc: TextView) {
        layout.background = ContextCompat.getDrawable(this, R.drawable.bg_subtab_pill_active)
        title.setTextColor(ContextCompat.getColor(this, R.color.white))
        desc.setTextColor(ContextCompat.getColor(this, R.color.slate_200))
    }

    private fun resetSplit(layout: View, title: TextView, desc: TextView) {
        layout.background = ContextCompat.getDrawable(this, R.drawable.bg_card_selectable)
        title.setTextColor(ContextCompat.getColor(this, R.color.text_dark))
        desc.setTextColor(ContextCompat.getColor(this, R.color.text_slate))
    }

    private fun setupInjuryToggle(chip: TextView, key: String) {
        chip.setOnClickListener {
            if (selectedInjuries.contains(key)) {
                selectedInjuries.remove(key)
                chip.background = ContextCompat.getDrawable(this, R.drawable.bg_card_selectable)
                chip.setTextColor(ContextCompat.getColor(this, R.color.text_dark))
            } else {
                selectedInjuries.add(key)
                chip.background = ContextCompat.getDrawable(this, R.drawable.bg_badge_streak)
                chip.setTextColor(ContextCompat.getColor(this, R.color.badge_streak_text))
            }
        }
    }
}

