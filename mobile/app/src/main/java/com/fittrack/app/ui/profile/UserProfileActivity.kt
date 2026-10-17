package com.fittrack.app.ui.profile

import android.content.Intent
import android.os.Bundle
import androidx.appcompat.app.AppCompatActivity
import com.fittrack.app.databinding.ActivityUserProfileBinding
import com.fittrack.app.ui.dashboard.DashboardActivity
import com.fittrack.app.ui.metrics.BodyMetricsActivity
import com.fittrack.app.ui.settings.SettingsActivity
import com.fittrack.app.ui.workout.WorkoutsActivity

class UserProfileActivity : AppCompatActivity() {

    private lateinit var binding: ActivityUserProfileBinding

    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)
        binding = ActivityUserProfileBinding.inflate(layoutInflater)
        setContentView(binding.root)

        setupInteractions()
        setupBottomNav()
    }

    private fun setupInteractions() {
        binding.btnSettings.setOnClickListener {
            startActivity(Intent(this, SettingsActivity::class.java))
        }

        binding.btnEditProfile.setOnClickListener {
            startActivity(Intent(this, EditProfileActivity::class.java))
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
    }
}
