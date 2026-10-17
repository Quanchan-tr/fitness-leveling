package com.fittrack.app.ui.onboarding

import android.os.Bundle
import androidx.appcompat.app.AppCompatActivity
import com.fittrack.app.databinding.ActivityOnboardingLoadingBinding

class OnboardingLoadingActivity : AppCompatActivity() {

    private lateinit var binding: ActivityOnboardingLoadingBinding

    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)
        binding = ActivityOnboardingLoadingBinding.inflate(layoutInflater)
        setContentView(binding.root)

        binding.root.postDelayed({
            val intent = android.content.Intent(this, com.fittrack.app.ui.dashboard.DashboardActivity::class.java)
            intent.flags = android.content.Intent.FLAG_ACTIVITY_NEW_TASK or android.content.Intent.FLAG_ACTIVITY_CLEAR_TASK
            startActivity(intent)
            finish()
        }, 1500)
    }
}
