package com.fittrack.app.ui.onboarding

import android.content.Intent
import android.os.Bundle
import androidx.appcompat.app.AppCompatActivity
import androidx.core.content.ContextCompat
import com.fittrack.app.R
import com.fittrack.app.data.session.SessionManager
import com.fittrack.app.databinding.ActivityOnboardingExperienceBinding

class OnboardingExperienceActivity : AppCompatActivity() {

    private lateinit var binding: ActivityOnboardingExperienceBinding
    private lateinit var session: SessionManager
    private var selectedExperience = "intermediate"

    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)
        binding = ActivityOnboardingExperienceBinding.inflate(layoutInflater)
        setContentView(binding.root)

        session = SessionManager.getInstance(this)
        selectedExperience = session.obExperience

        updateSelectionUI()

        binding.btnBack.setOnClickListener {
            finish()
        }

        binding.cardBeginner.setOnClickListener {
            selectedExperience = "beginner"
            session.obExperience = "beginner"
            updateSelectionUI()
        }

        binding.cardIntermediate.setOnClickListener {
            selectedExperience = "intermediate"
            session.obExperience = "intermediate"
            updateSelectionUI()
        }

        binding.cardAdvanced.setOnClickListener {
            selectedExperience = "advanced"
            session.obExperience = "advanced"
            updateSelectionUI()
        }

        binding.btnContinue.setOnClickListener {
            session.obExperience = selectedExperience
            startActivity(Intent(this, OnboardingGuideActivity::class.java))
        }
    }

    private fun updateSelectionUI() {
        val activeBg = ContextCompat.getDrawable(this, R.drawable.bg_subtab_pill_active)
        val defaultBg = ContextCompat.getDrawable(this, R.drawable.bg_card_selectable)

        binding.cardBeginner.background = if (selectedExperience == "beginner") activeBg else defaultBg
        binding.cardIntermediate.background = if (selectedExperience == "intermediate") activeBg else defaultBg
        binding.cardAdvanced.background = if (selectedExperience == "advanced") activeBg else defaultBg
    }
}
