package com.fittrack.app.ui.dashboard

import android.content.Intent
import android.os.Bundle
import androidx.appcompat.app.AppCompatActivity
import com.fittrack.app.databinding.ActivityDashboardBinding
import com.fittrack.app.ui.aipose.AiPoseCoachActivity
import com.fittrack.app.ui.metrics.BodyMetricsActivity
import com.fittrack.app.ui.profile.UserProfileActivity
import com.fittrack.app.ui.BottomNavTab
import com.fittrack.app.ui.routine.RoutineDetailActivity
import com.fittrack.app.ui.setupBottomNav

class DashboardActivity : AppCompatActivity() {

    private lateinit var binding: ActivityDashboardBinding

    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)
        binding = ActivityDashboardBinding.inflate(layoutInflater)
        setContentView(binding.root)

        setupInteractions()
        setupBottomNav()
    }

    private fun setupInteractions() {
        binding.btnEnterWorkoutNow.setOnClickListener {
            startActivity(Intent(this, RoutineDetailActivity::class.java))
        }

        binding.cardTodayWorkout.setOnClickListener {
            startActivity(Intent(this, RoutineDetailActivity::class.java))
        }

        binding.cardAvatarRpg.setOnClickListener {
            startActivity(Intent(this, com.fittrack.app.ui.modal.DailyQuestsModalActivity::class.java))
        }

        binding.btnOpenDailyQuests.setOnClickListener {
            startActivity(Intent(this, com.fittrack.app.ui.modal.DailyQuestsModalActivity::class.java))
        }
    }

    private fun setupBottomNav() {
        binding.bottomNavigation.setupBottomNav(this, BottomNavTab.DASHBOARD)
    }
}
