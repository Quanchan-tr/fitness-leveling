package com.fittrack.app.ui.profile

import android.os.Bundle
import androidx.appcompat.app.AppCompatActivity
import com.fittrack.app.databinding.ActivityBadgesAchievementsBinding
import com.fittrack.app.ui.BottomNavTab
import com.fittrack.app.ui.setupBottomNav

class BadgesAchievementsActivity : AppCompatActivity() {

    private lateinit var binding: ActivityBadgesAchievementsBinding

    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)
        binding = ActivityBadgesAchievementsBinding.inflate(layoutInflater)
        setContentView(binding.root)

        binding.btnBack.setOnClickListener {
            finish()
        }

        binding.bottomNavigation.setupBottomNav(this, BottomNavTab.PROFILE)
    }
}
