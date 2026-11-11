package com.fittrack.app.ui.onboarding

import android.content.Intent
import android.os.Bundle
import androidx.appcompat.app.AppCompatActivity
import androidx.core.content.ContextCompat
import com.fittrack.app.R
import com.fittrack.app.databinding.ActivityOnboardingGuideBinding

class OnboardingGuideActivity : AppCompatActivity() {

    private lateinit var binding: ActivityOnboardingGuideBinding
    private var isGuided = true

    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)
        binding = ActivityOnboardingGuideBinding.inflate(layoutInflater)
        setContentView(binding.root)

        updateSelectionUI()

        binding.btnBack.setOnClickListener {
            finish()
        }

        binding.btnSkip.setOnClickListener {
            startActivity(Intent(this, OnboardingFrequencyActivity::class.java))
        }

        binding.cardBuildOwn.setOnClickListener {
            isGuided = false
            updateSelectionUI()
        }

        binding.cardGuided.setOnClickListener {
            isGuided = true
            updateSelectionUI()
        }

        binding.btnContinue.setOnClickListener {
            startActivity(Intent(this, OnboardingFrequencyActivity::class.java))
        }
    }

    private fun updateSelectionUI() {
        val activeBg = ContextCompat.getDrawable(this, R.drawable.bg_subtab_pill_active)
        val defaultBg = ContextCompat.getDrawable(this, R.drawable.bg_card_selectable)

        binding.cardGuided.background = if (isGuided) activeBg else defaultBg
        binding.cardBuildOwn.background = if (!isGuided) activeBg else defaultBg
    }
}
