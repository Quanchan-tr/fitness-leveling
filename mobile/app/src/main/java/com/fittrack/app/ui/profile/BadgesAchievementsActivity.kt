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
                val api = ApiClient.getService(this@BadgesAchievementsActivity)
                val res = withContext(Dispatchers.IO) { api.getMe() }
                if (res.isSuccessful && res.body()?.data?.gamification != null) {
                    val g = res.body()!!.data!!.gamification!!
                    session.userLevel = g.level
                    session.userXp = g.xp
                    session.userStreak = g.currentStreak
                }
                val logsRes = withContext(Dispatchers.IO) { api.getWorkoutLogs(50) }
                if (logsRes.isSuccessful && logsRes.body()?.data != null) {
                    session.userTotalWorkouts = logsRes.body()!!.data!!.size
                }
                bindGamificationData()
            } catch (_: Exception) {
                Toast.makeText(
                    this@BadgesAchievementsActivity,
                    "Không thể đồng bộ huy hiệu lúc này. Vui lòng thử lại.",
                    Toast.LENGTH_SHORT
                ).show()
            }
        }
    }

    private fun bindGamificationData() {
        val maxLevelXp = maxOf(200, session.userLevel * 200)
        binding.tvRankTitle.text = "Thợ Săn Cấp ${session.userLevel}"
        binding.pbXp.max = maxLevelXp
        binding.pbXp.progress = session.userXp
        binding.tvXpStatus.text = "${session.userXp} / $maxLevelXp XP"

        val unlockedStates = listOf(
            session.userTotalWorkouts >= 1,
            session.userStreak >= 3,
            session.userTotalWorkouts >= 5,
            session.userLevel >= 5,
            session.userStreak >= 7,
            session.userLevel >= 10
        )
        val badgeCards = listOf(
            binding.cardBadge0,
            binding.cardBadge1,
            binding.cardBadge2,
            binding.cardBadge3,
            binding.cardBadge4,
            binding.cardBadge5
        )
        var unlockedCount = 0
        badgeCards.forEachIndexed { idx, card ->
            val unlocked = unlockedStates[idx]
            if (unlocked) unlockedCount++
            card.alpha = if (unlocked) 1.0f else 0.42f
        }
        binding.tvBadgesSectionHeader.text = "HUY HIỆU DANH DỰ ($unlockedCount/${badgeCards.size} ĐÃ MỞ)"
    }
}
