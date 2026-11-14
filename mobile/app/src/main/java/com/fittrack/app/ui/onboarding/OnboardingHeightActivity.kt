package com.fittrack.app.ui.onboarding

import android.content.Intent
import android.os.Bundle
import androidx.appcompat.app.AppCompatActivity
import com.fittrack.app.data.session.SessionManager
import com.fittrack.app.databinding.ActivityOnboardingHeightBinding

class OnboardingHeightActivity : AppCompatActivity() {

    private lateinit var binding: ActivityOnboardingHeightBinding
    private lateinit var session: SessionManager
    private var currentHeight = 175.0f

    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)
        binding = ActivityOnboardingHeightBinding.inflate(layoutInflater)
        setContentView(binding.root)

        session = SessionManager.getInstance(this)
        currentHeight = session.obHeight

        var useFt = false
        val updateDisplay = {
            binding.tvHeightSelected.text = if (useFt) {
                String.format(java.util.Locale.US, "%.1f", currentHeight / 30.48f)
            } else {
                currentHeight.toInt().toString()
            }
        }
        updateDisplay()

        binding.btnUnitCm.setOnClickListener {
            useFt = false
            updateDisplay()
        }
        binding.btnUnitFt.setOnClickListener {
            useFt = true
            updateDisplay()
        }

        binding.btnBack.setOnClickListener {
            finish()
        }

        binding.layoutHeightWheel.setOnClickListener {
            currentHeight = if (currentHeight >= 210f) 150f else currentHeight + 2f
            updateDisplay()
            session.obHeight = currentHeight
        }

        binding.btnContinue.setOnClickListener {
            session.obHeight = currentHeight
            startActivity(Intent(this, OnboardingGoalActivity::class.java))
        }
    }
}
