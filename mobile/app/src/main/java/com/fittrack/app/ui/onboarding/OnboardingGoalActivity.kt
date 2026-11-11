package com.fittrack.app.ui.onboarding

import android.content.Intent
import android.os.Bundle
import androidx.appcompat.app.AppCompatActivity
import androidx.core.content.ContextCompat
import com.fittrack.app.R
import com.fittrack.app.data.session.SessionManager
import com.fittrack.app.databinding.ActivityOnboardingGoalBinding

class OnboardingGoalActivity : AppCompatActivity() {

    private lateinit var binding: ActivityOnboardingGoalBinding
    private lateinit var session: SessionManager
    private var selectedGoal = "gain_muscle"

    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)
        binding = ActivityOnboardingGoalBinding.inflate(layoutInflater)
        setContentView(binding.root)

        session = SessionManager.getInstance(this)
        selectedGoal = session.obGoal

        updateSelectionUI()

        binding.btnBack.setOnClickListener {
            finish()
        }

        binding.cardBuildMuscle.setOnClickListener {
            selectedGoal = "gain_muscle"
            session.obGoal = "gain_muscle"
            updateSelectionUI()
        }

        binding.cardGainStrength.setOnClickListener {
            selectedGoal = "gain_strength"
            session.obGoal = "gain_strength"
            updateSelectionUI()
        }

        binding.cardFatLoss.setOnClickListener {
            selectedGoal = "lose_weight"
            session.obGoal = "lose_weight"
            updateSelectionUI()
        }

        binding.btnContinue.setOnClickListener {
            session.obGoal = selectedGoal
            startActivity(Intent(this, OnboardingExperienceActivity::class.java))
        }
    }

    private fun updateSelectionUI() {
        val activeBg = ContextCompat.getDrawable(this, R.drawable.bg_subtab_pill_active)
        val defaultBg = ContextCompat.getDrawable(this, R.drawable.bg_card_selectable)

        binding.cardBuildMuscle.background = if (selectedGoal == "gain_muscle") activeBg else defaultBg
        binding.tvGoalBuildMuscle.setTextColor(
            ContextCompat.getColor(this, if (selectedGoal == "gain_muscle") R.color.white else R.color.text_primary)
        )

        binding.cardGainStrength.background = if (selectedGoal == "gain_strength") activeBg else defaultBg
        binding.tvGoalGainStrength.setTextColor(
            ContextCompat.getColor(this, if (selectedGoal == "gain_strength") R.color.white else R.color.text_primary)
        )

        binding.cardFatLoss.background = if (selectedGoal == "lose_weight") activeBg else defaultBg
        binding.tvGoalFatLoss.setTextColor(
            ContextCompat.getColor(this, if (selectedGoal == "lose_weight") R.color.white else R.color.text_primary)
        )
    }
}
