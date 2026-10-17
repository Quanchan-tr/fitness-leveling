package com.fittrack.app.ui.aipose

import android.content.Intent
import android.os.Bundle
import androidx.appcompat.app.AppCompatActivity
import com.fittrack.app.databinding.ActivityAiPoseCoachBinding
import com.fittrack.app.ui.dashboard.DashboardActivity
import com.fittrack.app.ui.metrics.BodyMetricsActivity
import com.fittrack.app.ui.profile.UserProfileActivity
import com.fittrack.app.ui.workout.WorkoutsActivity

class AiPoseCoachActivity : AppCompatActivity() {

    private lateinit var binding: ActivityAiPoseCoachBinding

    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)
        binding = ActivityAiPoseCoachBinding.inflate(layoutInflater)
        setContentView(binding.root)

        setupInteractions()
        setupBottomNav()
    }

    private fun setupInteractions() {
        binding.btnBack.setOnClickListener {
            finish()
        }

        binding.btnStartAiPoseSession.setOnClickListener {
            startActivity(Intent(this, AiPoseActiveSessionActivity::class.java))
        }
    }

    private fun setupBottomNav() {
        binding.bottomNavigation.navItemDashboard.setOnClickListener {
            startActivity(Intent(this, DashboardActivity::class.java))
            finish()
        }
        binding.bottomNavigation.navItemWorkouts.setOnClickListener {
            startActivity(Intent(this, WorkoutsActivity::class.java))
            finish()
        }
        binding.bottomNavigation.navItemMetrics.setOnClickListener {
            startActivity(Intent(this, BodyMetricsActivity::class.java))
            finish()
        }
        binding.bottomNavigation.navItemProfile.setOnClickListener {
            startActivity(Intent(this, UserProfileActivity::class.java))
            finish()
        }
    }
}
