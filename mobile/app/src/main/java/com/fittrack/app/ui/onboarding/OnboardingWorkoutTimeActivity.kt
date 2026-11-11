package com.fittrack.app.ui.onboarding

import android.content.Intent
import android.os.Bundle
import androidx.appcompat.app.AppCompatActivity
import androidx.core.content.ContextCompat
import com.fittrack.app.R
import com.fittrack.app.databinding.ActivityOnboardingWorkoutTimeBinding

class OnboardingWorkoutTimeActivity : AppCompatActivity() {

    private lateinit var binding: ActivityOnboardingWorkoutTimeBinding
    private var selectedMinutes = 60

    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)
        binding = ActivityOnboardingWorkoutTimeBinding.inflate(layoutInflater)
        setContentView(binding.root)

        val timeOptions = listOf(
            binding.cardTime40m to 40,
            binding.cardTime60m to 60,
            binding.cardTime80m to 80
        )

        fun updateUI() {
            val activeBg = ContextCompat.getDrawable(this, R.drawable.bg_subtab_pill_active)
            val defaultBg = ContextCompat.getDrawable(this, R.drawable.bg_card_selectable)

            timeOptions.forEach { (view, mins) ->
                view.background = if (mins == selectedMinutes) activeBg else defaultBg
                view.setTextColor(
                    ContextCompat.getColor(this, if (mins == selectedMinutes) R.color.white else R.color.text_primary)
                )
            }
        }

        updateUI()

        binding.btnBack.setOnClickListener {
            finish()
        }

        timeOptions.forEach { (view, mins) ->
            view.setOnClickListener {
                selectedMinutes = mins
                updateUI()
            }
        }

        binding.btnContinue.setOnClickListener {
            startActivity(Intent(this, OnboardingFocusMuscleActivity::class.java))
        }
    }
}
