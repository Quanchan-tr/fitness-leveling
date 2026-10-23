package com.fittrack.app.ui.metrics

import android.content.Intent
import android.os.Bundle
import androidx.appcompat.app.AppCompatActivity
import com.fittrack.app.databinding.ActivityBodyMetricsBinding
import com.fittrack.app.ui.dashboard.DashboardActivity
import com.fittrack.app.ui.profile.UserProfileActivity
import com.fittrack.app.ui.workout.WorkoutsActivity

import com.fittrack.app.ui.BottomNavTab
import com.fittrack.app.ui.setupBottomNav

class BodyMetricsActivity : AppCompatActivity() {

    private lateinit var binding: ActivityBodyMetricsBinding

    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)
        binding = ActivityBodyMetricsBinding.inflate(layoutInflater)
        setContentView(binding.root)

        setupInteractions()
        setupBottomNav()
    }

    private fun setupInteractions() {
        binding.btnToNutrition.setOnClickListener {
            startActivity(Intent(this, com.fittrack.app.ui.nutrition.NutritionTrackerActivity::class.java))
        }
    }

    private fun setupBottomNav() {
        binding.bottomNavigation.setupBottomNav(this, BottomNavTab.METRICS)
    }
}
