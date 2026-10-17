package com.fittrack.app.ui.onboarding

import android.os.Bundle
import androidx.appcompat.app.AppCompatActivity
import com.fittrack.app.databinding.ActivityOnboardingFrequencyBinding

class OnboardingFrequencyActivity : AppCompatActivity() {

    private lateinit var binding: ActivityOnboardingFrequencyBinding

    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)
        binding = ActivityOnboardingFrequencyBinding.inflate(layoutInflater)
        setContentView(binding.root)

        binding.btnBack.setOnClickListener {
            finish()
        }
    }
}
