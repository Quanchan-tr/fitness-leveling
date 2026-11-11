package com.fittrack.app.ui.onboarding

import android.content.Intent
import android.os.Bundle
import androidx.appcompat.app.AppCompatActivity
import androidx.core.content.ContextCompat
import com.fittrack.app.R
import com.fittrack.app.databinding.ActivityOnboardingDestinationBinding

class OnboardingDestinationActivity : AppCompatActivity() {

    private lateinit var binding: ActivityOnboardingDestinationBinding
    private var selectedDest = "large_gym"

    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)
        binding = ActivityOnboardingDestinationBinding.inflate(layoutInflater)
        setContentView(binding.root)

        val destinationCards = listOf(
            binding.cardLargeGym to "large_gym",
            binding.cardCommercialGym to "commercial_gym",
            binding.cardGarageGym to "garage_gym",
            binding.cardAtHome to "at_home"
        )

        fun updateUI() {
            val activeBg = ContextCompat.getDrawable(this, R.drawable.bg_subtab_pill_active)
            val defaultBg = ContextCompat.getDrawable(this, R.drawable.bg_card_selectable)

            destinationCards.forEach { (view, key) ->
                view.background = if (key == selectedDest) activeBg else defaultBg
            }
        }

        updateUI()

        binding.btnBack.setOnClickListener {
            finish()
        }

        destinationCards.forEach { (view, key) ->
            view.setOnClickListener {
                selectedDest = key
                updateUI()
            }
        }

        binding.btnContinue.setOnClickListener {
            startActivity(Intent(this, OnboardingEquipmentActivity::class.java))
        }
    }
}
