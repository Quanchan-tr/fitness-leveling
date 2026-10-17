package com.fittrack.app.ui.onboarding

import android.os.Bundle
import androidx.appcompat.app.AppCompatActivity
import com.fittrack.app.databinding.ActivityOnboardingGoalBinding

class OnboardingGoalActivity : AppCompatActivity() {

    private lateinit var binding: ActivityOnboardingGoalBinding

    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)
        binding = ActivityOnboardingGoalBinding.inflate(layoutInflater)
        setContentView(binding.root)

        binding.btnBack.setOnClickListener {
            finish()
        }
    }
}
