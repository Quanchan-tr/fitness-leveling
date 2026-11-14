package com.fittrack.app.ui.profile

import android.os.Bundle
import android.widget.Toast
import androidx.appcompat.app.AppCompatActivity
import androidx.lifecycle.lifecycleScope
import com.fittrack.app.data.api.ApiClient
import com.fittrack.app.data.session.SessionManager
import com.fittrack.app.databinding.ActivityBadgesAchievementsBinding
import com.fittrack.app.ui.BottomNavTab
import com.fittrack.app.ui.setupBottomNav
import kotlinx.coroutines.Dispatchers
import kotlinx.coroutines.launch
import kotlinx.coroutines.withContext

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
        fetchGamificationFromBackend()
        binding.bottomNavigation.setupBottomNav(this, BottomNavTab.PROFILE)
    }

    private fun fetchGamificationFromBackend() {
        if (!session.isLoggedIn) return
        lifecycleScope.launch {
            try {
                val res = withContext(Dispatchers.IO) {
                    ApiClient.getService(this@BadgesAchievementsActivity).getMe()
                }
                if (res.isSuccessful && res.body()?.data?.gamification != null) {
                    val g = res.body()!!.data!!.gamification!!
                    session.userLevel = g.level
                    session.userXp = g.xp
                    session.userStreak = g.currentStreak
                    bindGamificationData()
                }
            } catch (e: Exception) {
                Toast.makeText(this@BadgesAchievementsActivity, "Không thể đồng bộ XP từ VPS: ${e.localizedMessage}", Toast.LENGTH_SHORT).show()
            }
        }
    }

    private fun bindGamificationData() {
        val maxLevelXp = maxOf(200, session.userLevel * 200)
        binding.tvRankTitle.text = "Thợ Săn Cấp ${session.userLevel}"
        binding.pbXp.max = maxLevelXp
        binding.pbXp.progress = session.userXp
        binding.tvXpStatus.text = "${session.userXp} / $maxLevelXp XP"
    }
}
