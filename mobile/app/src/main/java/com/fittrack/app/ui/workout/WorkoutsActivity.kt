package com.fittrack.app.ui.workout

import android.content.Intent
import android.os.Bundle
import androidx.appcompat.app.AppCompatActivity
import com.fittrack.app.databinding.ActivityWorkoutsBinding
import com.fittrack.app.ui.aipose.AiPoseCoachActivity
import com.fittrack.app.ui.dashboard.DashboardActivity
import com.fittrack.app.ui.metrics.BodyMetricsActivity
import com.fittrack.app.ui.profile.UserProfileActivity
import com.fittrack.app.ui.BottomNavTab
import com.fittrack.app.ui.routine.CreateRoutineActivity
import com.fittrack.app.ui.routine.RoutineDetailActivity
import com.fittrack.app.ui.setupBottomNav

class WorkoutsActivity : AppCompatActivity() {

    private lateinit var binding: ActivityWorkoutsBinding

    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)
        binding = ActivityWorkoutsBinding.inflate(layoutInflater)
        setContentView(binding.root)

        setupInteractions()
        setupBottomNav()
    }

    private fun setupInteractions() {
        binding.btnCreateRoutine.setOnClickListener {
            startActivity(Intent(this, CreateRoutineActivity::class.java))
        }

        binding.cardRoutinePush.setOnClickListener {
            startActivity(Intent(this, RoutineDetailActivity::class.java))
        }

        binding.btnStartPushRoutine.setOnClickListener {
            startActivity(Intent(this, RoutineDetailActivity::class.java))
        }
    }

    private fun setupBottomNav() {
        binding.bottomNavigation.setupBottomNav(this, BottomNavTab.WORKOUTS)
    }
}
