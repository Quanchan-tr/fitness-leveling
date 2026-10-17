package com.fittrack.app.ui.metrics

import android.content.Intent
import android.os.Bundle
import androidx.appcompat.app.AppCompatActivity
import com.fittrack.app.databinding.ActivityBodyMetricsBinding
import com.fittrack.app.ui.dashboard.DashboardActivity
import com.fittrack.app.ui.profile.UserProfileActivity
import com.fittrack.app.ui.workout.WorkoutsActivity

class BodyMetricsActivity : AppCompatActivity() {

    private lateinit var binding: ActivityBodyMetricsBinding

    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)
        binding = ActivityBodyMetricsBinding.inflate(layoutInflater)
        setContentView(binding.root)

        setupBottomNav()
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
        binding.bottomNavigation.navItemProfile.setOnClickListener {
            startActivity(Intent(this, UserProfileActivity::class.java))
            finish()
        }
    }
}
