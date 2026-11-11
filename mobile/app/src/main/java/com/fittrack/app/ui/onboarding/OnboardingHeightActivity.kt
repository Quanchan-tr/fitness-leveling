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

        binding.tvHeightSelected.text = currentHeight.toInt().toString()

        binding.btnBack.setOnClickListener {
            finish()
        }

        binding.layoutHeightWheel.setOnClickListener {
            // Quick step increment for intuitive UX
            currentHeight = if (currentHeight >= 210f) 150f else currentHeight + 2f
            binding.tvHeightSelected.text = currentHeight.toInt().toString()
            session.obHeight = currentHeight
        }

        binding.btnContinue.setOnClickListener {
            session.obHeight = currentHeight
            startActivity(Intent(this, OnboardingGoalActivity::class.java))
        }
    }
}
