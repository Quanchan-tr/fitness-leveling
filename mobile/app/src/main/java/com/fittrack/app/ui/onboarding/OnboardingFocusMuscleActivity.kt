package com.fittrack.app.ui.onboarding

import android.os.Bundle
import androidx.appcompat.app.AppCompatActivity
import com.fittrack.app.databinding.ActivityOnboardingFocusMuscleBinding

class OnboardingFocusMuscleActivity : AppCompatActivity() {

    private lateinit var binding: ActivityOnboardingFocusMuscleBinding

    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)
        binding = ActivityOnboardingFocusMuscleBinding.inflate(layoutInflater)
        setContentView(binding.root)

        binding.btnBack.setOnClickListener {
            finish()
        }
    }
}
