package com.fittrack.app.ui.profile

import android.os.Bundle
import androidx.appcompat.app.AppCompatActivity
import com.fittrack.app.data.session.SessionManager
import com.fittrack.app.databinding.ActivityBadgesAchievementsBinding
import com.fittrack.app.ui.BottomNavTab
import com.fittrack.app.ui.setupBottomNav

class BadgesAchievementsActivity : AppCompatActivity() {

    private lateinit var binding: ActivityBadgesAchievementsBinding
    private lateinit var session: SessionManager

    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)
        binding = ActivityBadgesAchievementsBinding.inflate(layoutInflater)
        setContentView(binding.root)

        session = SessionManager.getInstance(this)

        binding.btnBack.setOnClickListener {
            finish()
        }

        bindGamificationData()
        binding.bottomNavigation.setupBottomNav(this, BottomNavTab.PROFILE)
    }

    private fun bindGamificationData() {
        val maxLevelXp = maxOf(200, session.userLevel * 200)
        binding.tvRankTitle.text = "Thợ Săn Cấp ${session.userLevel}"
        binding.pbXp.max = maxLevelXp
        binding.pbXp.progress = session.userXp
        binding.tvXpStatus.text = "${session.userXp} / $maxLevelXp XP"
    }
}
