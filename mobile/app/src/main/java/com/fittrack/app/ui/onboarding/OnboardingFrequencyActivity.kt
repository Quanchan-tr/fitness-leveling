package com.fittrack.app.ui.onboarding

import android.content.Intent
import android.os.Bundle
import android.widget.TextView
import androidx.appcompat.app.AppCompatActivity
import androidx.core.content.ContextCompat
import com.fittrack.app.R
import com.fittrack.app.data.session.SessionManager
import com.fittrack.app.databinding.ActivityOnboardingFrequencyBinding

class OnboardingFrequencyActivity : AppCompatActivity() {

    private lateinit var binding: ActivityOnboardingFrequencyBinding
    private lateinit var session: SessionManager
    private var selectedFreq = 4

    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)
        binding = ActivityOnboardingFrequencyBinding.inflate(layoutInflater)
        setContentView(binding.root)

        session = SessionManager.getInstance(this)
        selectedFreq = session.obFrequency

        val freqCards = listOf(
            binding.cardFreq1 to 1,
            binding.cardFreq2 to 2,
            binding.cardFreq3 to 3,
            binding.cardFreq4 to 4,
            binding.cardFreq5 to 5,
            binding.cardFreq6 to 6
        )

        fun updateUI() {
            val activeBg = ContextCompat.getDrawable(this, R.drawable.bg_subtab_pill_active)
            val defaultBg = ContextCompat.getDrawable(this, R.drawable.bg_card_selectable)

            freqCards.forEach { (view, freq) ->
                view.background = if (freq == selectedFreq) activeBg else defaultBg
                view.setTextColor(
                    ContextCompat.getColor(this, if (freq == selectedFreq) R.color.white else R.color.text_primary)
                )
            }
        }

        updateUI()

        binding.btnBack.setOnClickListener {
            finish()
        }

        freqCards.forEach { (view, freq) ->
            view.setOnClickListener {
                selectedFreq = freq
                session.obFrequency = freq
                updateUI()
            }
        }

        binding.btnContinue.setOnClickListener {
            session.obFrequency = selectedFreq
            startActivity(Intent(this, OnboardingWorkoutTimeActivity::class.java))
        }
    }
}
