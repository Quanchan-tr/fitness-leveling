package com.fittrack.app.ui.aipose

import android.content.Intent
import android.os.Bundle
import androidx.appcompat.app.AppCompatActivity
import com.fittrack.app.databinding.ActivityAiPoseCoachBinding
import com.fittrack.app.ui.BottomNavTab
import com.fittrack.app.ui.setupBottomNav

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
        binding.bottomNavigation.setupBottomNav(this, BottomNavTab.WORKOUTS)
    }
}
