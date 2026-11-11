package com.fittrack.app.ui.onboarding

import android.content.Intent
import android.os.Bundle
import androidx.appcompat.app.AppCompatActivity
import androidx.core.content.ContextCompat
import com.fittrack.app.R
import com.fittrack.app.data.session.SessionManager
import com.fittrack.app.databinding.ActivityOnboardingGenderBinding

class OnboardingGenderActivity : AppCompatActivity() {

    private lateinit var binding: ActivityOnboardingGenderBinding
    private lateinit var session: SessionManager
    private var selectedGender = "male"

    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)
        binding = ActivityOnboardingGenderBinding.inflate(layoutInflater)
        setContentView(binding.root)

        session = SessionManager.getInstance(this)
        selectedGender = session.obGender

        updateSelectionUI()

        binding.btnBack.setOnClickListener {
            finish()
        }

        binding.cardMale.setOnClickListener {
            selectedGender = "male"
            session.obGender = "male"
            updateSelectionUI()
        }

        binding.cardFemale.setOnClickListener {
            selectedGender = "female"
            session.obGender = "female"
            updateSelectionUI()
        }

        binding.cardOther.setOnClickListener {
            selectedGender = "other"
            session.obGender = "other"
            updateSelectionUI()
        }

        binding.btnContinue.setOnClickListener {
            session.obGender = selectedGender
            startActivity(Intent(this, OnboardingBirthdayActivity::class.java))
        }
    }

    private fun updateSelectionUI() {
        val activeBg = ContextCompat.getDrawable(this, R.drawable.bg_subtab_pill_active)
        val defaultBg = ContextCompat.getDrawable(this, R.drawable.bg_card_selectable)

        binding.cardMale.background = if (selectedGender == "male") activeBg else defaultBg
        binding.tvLabelMale.setTextColor(
            ContextCompat.getColor(this, if (selectedGender == "male") R.color.white else R.color.text_primary)
        )

        binding.cardFemale.background = if (selectedGender == "female") activeBg else defaultBg
        binding.tvLabelFemale.setTextColor(
            ContextCompat.getColor(this, if (selectedGender == "female") R.color.white else R.color.text_primary)
        )

        binding.cardOther.background = if (selectedGender == "other") activeBg else defaultBg
        binding.tvLabelOther.setTextColor(
            ContextCompat.getColor(this, if (selectedGender == "other") R.color.white else R.color.text_primary)
        )
    }
}
