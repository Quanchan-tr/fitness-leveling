package com.fittrack.app.ui.onboarding

import android.content.Intent
import android.os.Bundle
import androidx.appcompat.app.AppCompatActivity
import androidx.lifecycle.lifecycleScope
import com.fittrack.app.data.api.ApiClient
import com.fittrack.app.data.models.UpdateProfileRequest
import com.fittrack.app.data.session.SessionManager
import com.fittrack.app.databinding.ActivityOnboardingLoadingBinding
import com.fittrack.app.ui.dashboard.DashboardActivity
import kotlinx.coroutines.Dispatchers
import kotlinx.coroutines.launch
import kotlinx.coroutines.withContext

class OnboardingLoadingActivity : AppCompatActivity() {

    private lateinit var binding: ActivityOnboardingLoadingBinding

    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)
        binding = ActivityOnboardingLoadingBinding.inflate(layoutInflater)
        setContentView(binding.root)

        val session = SessionManager.getInstance(this)

        // Persist onboarding metrics locally
        session.userGender = session.obGender
        session.userBirthDate = session.obBirthDate
        session.userWeight = session.obWeight
        session.userHeight = session.obHeight
        session.userGoal = session.obGoal

        // Sync with VPS Backend
        if (session.isLoggedIn) {
            lifecycleScope.launch {
                try {
                    withContext(Dispatchers.IO) {
                        ApiClient.getService(this@OnboardingLoadingActivity).updateProfile(
                            UpdateProfileRequest(
                                name = session.userName,
                                weightKg = session.obWeight.toDouble(),
                                heightCm = session.obHeight.toDouble(),
                                goal = session.obGoal,
                                gender = session.obGender,
                                birthDate = session.obBirthDate
                            )
                        )
                    }
                } catch (_: Exception) {
                    // Best effort sync
                }
            }
        }

        binding.root.postDelayed({
            val intent = Intent(this, DashboardActivity::class.java)
            intent.flags = Intent.FLAG_ACTIVITY_NEW_TASK or Intent.FLAG_ACTIVITY_CLEAR_TASK
            startActivity(intent)
            finish()
        }, 1500)
    }
}
