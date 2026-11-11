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

        binding.tvWeightValue.text = currentWeight.toInt().toString()

        binding.btnBack.setOnClickListener {
            finish()
        }

        binding.layoutWeightDisplay.setOnClickListener {
            // Quick step increment for intuitive UX
            currentWeight = if (currentWeight >= 120f) 50f else currentWeight + 2f
            binding.tvWeightValue.text = currentWeight.toInt().toString()
            session.obWeight = currentWeight
        }

        binding.btnContinue.setOnClickListener {
            session.obWeight = currentWeight
            startActivity(Intent(this, OnboardingHeightActivity::class.java))
        }
    }
}
