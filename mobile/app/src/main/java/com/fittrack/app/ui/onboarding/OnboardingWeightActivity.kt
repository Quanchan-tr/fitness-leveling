package com.fittrack.app.ui.onboarding

import android.content.Intent
import android.os.Bundle
import androidx.appcompat.app.AppCompatActivity
import com.fittrack.app.data.session.SessionManager
import com.fittrack.app.databinding.ActivityOnboardingWeightBinding

class OnboardingWeightActivity : AppCompatActivity() {

    private lateinit var binding: ActivityOnboardingWeightBinding
    private lateinit var session: SessionManager
    private var currentWeight = 72.0f

    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)
        binding = ActivityOnboardingWeightBinding.inflate(layoutInflater)
        setContentView(binding.root)

        session = SessionManager.getInstance(this)
        currentWeight = session.obWeight

        var useLbs = false
        val updateDisplay = {
            binding.tvWeightValue.text = if (useLbs) {
                (currentWeight * 2.20462f).toInt().toString()
            } else {
                currentWeight.toInt().toString()
            }
        }
        updateDisplay()

        binding.btnUnitKg.setOnClickListener {
            useLbs = false
            updateDisplay()
        }
        binding.btnUnitLbs.setOnClickListener {
            useLbs = true
            updateDisplay()
        }

        binding.btnBack.setOnClickListener {
            finish()
        }

        binding.layoutWeightDisplay.setOnClickListener {
            currentWeight = if (currentWeight >= 120f) 50f else currentWeight + 2f
            updateDisplay()
            session.obWeight = currentWeight
        }

        binding.btnContinue.setOnClickListener {
            session.obWeight = currentWeight
            startActivity(Intent(this, OnboardingHeightActivity::class.java))
        }
    }
}
