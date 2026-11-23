package com.fittrack.app.ui.onboarding

import android.content.Intent
import android.os.Bundle
import androidx.appcompat.app.AppCompatActivity
import androidx.lifecycle.lifecycleScope
import com.fittrack.app.data.api.ApiClient
import com.fittrack.app.data.models.GenerateAiPlanRequest
import com.fittrack.app.data.models.UpdateProfileRequest
import com.fittrack.app.data.session.SessionManager
import com.fittrack.app.databinding.ActivityOnboardingLoadingBinding
import com.fittrack.app.ui.dashboard.DashboardActivity
import kotlinx.coroutines.Dispatchers
import kotlinx.coroutines.launch
import kotlinx.coroutines.withContext
import java.util.UUID

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
                    val workoutPreferences = mapOf(
                        "experience" to session.obExperience,
                        "days_per_week" to session.obFrequency,
                        "duration_minutes" to session.obWorkoutTime,
                        "equipment" to session.obEquipment,
                        "focus_muscles" to listOf(session.obFocusMuscle)
                    )
                    val res = withContext(Dispatchers.IO) {
                        ApiClient.getService(this@OnboardingLoadingActivity).updateProfile(
                            UpdateProfileRequest(
                                name = session.userName,
                                weightKg = session.obWeight.toDouble(),
                                heightCm = session.obHeight.toDouble(),
                                goal = session.obGoal,
                                gender = session.obGender,
                                birthDate = session.obBirthDate,
                                workoutPreferences = workoutPreferences
                            )
                        )
                    }
                    if (!res.isSuccessful) {
                        android.widget.Toast.makeText(
                            this@OnboardingLoadingActivity,
                            "Không thể đồng bộ hồ sơ lên máy chủ (${res.code()})",
                            android.widget.Toast.LENGTH_SHORT
                        ).show()
                    } else {
                        try {
                            withContext(Dispatchers.IO) {
                                ApiClient.getService(this@OnboardingLoadingActivity).generateExercisePlan(
                                    idempotencyKey = UUID.randomUUID().toString(),
                                    request = GenerateAiPlanRequest(
                                        goal = session.obGoal,
                                        splitType = "auto",
                                        daysPerWeek = session.obFrequency,
                                        durationMinutes = session.obWorkoutTime,
                                        equipment = session.obEquipment,
                                        experience = session.obExperience,
                                        focusMuscles = listOf(session.obFocusMuscle),
                                        autoSave = true
                                    )
                                )
                            }
                        } catch (_: Exception) {
                            // Non-blocking: user can still regenerate plan inside AI Coach
                        }
                    }
                } catch (e: Exception) {
                    android.widget.Toast.makeText(
                        this@OnboardingLoadingActivity,
                        "Lỗi kết nối máy chủ: ${e.localizedMessage}",
                        android.widget.Toast.LENGTH_SHORT
                    ).show()
                }
                navigateToDashboard()
            }
        } else {
            binding.root.postDelayed({ navigateToDashboard() }, 800)
        }
    }

    private fun navigateToDashboard() {
        val intent = Intent(this, DashboardActivity::class.java)
        intent.flags = Intent.FLAG_ACTIVITY_NEW_TASK or Intent.FLAG_ACTIVITY_CLEAR_TASK
        startActivity(intent)
        finish()
    }
}
