package com.fittrack.app.ui.onboarding

import android.content.Intent
import android.os.Bundle
import android.view.View
import androidx.appcompat.app.AppCompatActivity
import androidx.core.content.ContextCompat
import com.fittrack.app.R
import com.fittrack.app.data.session.SessionManager
import com.fittrack.app.databinding.ActivityOnboardingFocusMuscleBinding

class OnboardingFocusMuscleActivity : AppCompatActivity() {

    private lateinit var binding: ActivityOnboardingFocusMuscleBinding
    private lateinit var session: SessionManager
    private var selectedMuscle = "chest"

    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)
        binding = ActivityOnboardingFocusMuscleBinding.inflate(layoutInflater)
        setContentView(binding.root)

        session = SessionManager.getInstance(this)
        selectedMuscle = session.obFocusMuscle

        val muscleCards = listOf(
            binding.cardMuscleBalanced to "balanced",
            binding.cardMuscleCore to "core",
            binding.cardMuscleChest to "chest",
            binding.cardMuscleArms to "arms",
            binding.cardMuscleLegs to "legs",
            binding.cardMuscleShoulders to "shoulders"
        )

        fun updateUI() {
            val activeBg = ContextCompat.getDrawable(this, R.drawable.bg_subtab_pill_active)
            val defaultBg = ContextCompat.getDrawable(this, R.drawable.bg_card_selectable)

            muscleCards.forEach { (view, key) ->
                view.background = if (key == selectedMuscle) activeBg else defaultBg
            }
        }

        updateUI()

        binding.btnBack.setOnClickListener {
            finish()
        }

        muscleCards.forEach { (view, key) ->
            view.setOnClickListener {
                selectedMuscle = key
                session.obFocusMuscle = key
                updateUI()
            }
        }

        binding.btnContinue.setOnClickListener {
            session.obFocusMuscle = selectedMuscle
            startActivity(Intent(this, OnboardingDestinationActivity::class.java))
        }
    }
}
