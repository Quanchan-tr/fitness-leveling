package com.fittrack.app.ui.profile

import android.content.Intent
import android.os.Bundle
import android.widget.TextView
import androidx.appcompat.app.AppCompatActivity
import androidx.core.content.ContextCompat
import androidx.lifecycle.lifecycleScope
import com.fittrack.app.R
import com.fittrack.app.data.api.ApiClient
import com.fittrack.app.data.session.SessionManager
import com.fittrack.app.databinding.ActivityUserProfileBinding
import com.fittrack.app.ui.BottomNavTab
import com.fittrack.app.ui.settings.SettingsActivity
import com.fittrack.app.ui.setupBottomNav
import kotlinx.coroutines.Dispatchers
import kotlinx.coroutines.launch
import kotlinx.coroutines.withContext

class UserProfileActivity : AppCompatActivity() {

    private lateinit var binding: ActivityUserProfileBinding
    private lateinit var session: SessionManager

    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)
        binding = ActivityUserProfileBinding.inflate(layoutInflater)
        setContentView(binding.root)

        session = SessionManager.getInstance(this)

        bindUserData()
        setupInteractions()
        setupChartTabs()
        setupBottomNav()

        fetchFreshProfile()
    }

    override fun onResume() {
        super.onResume()
        bindUserData()
    }

    private fun bindUserData() {
        binding.tvProfileName.text = session.userName
        binding.btnBadgesLinkStreak.text = "🔥 ${session.userStreak} ngày streak"
    }

    private fun fetchFreshProfile() {
        if (!session.isLoggedIn) return

        lifecycleScope.launch {
            try {
                val response = withContext(Dispatchers.IO) {
                    ApiClient.getService(this@UserProfileActivity).getMe()
                }
                if (response.isSuccessful && response.body()?.data != null) {
                    val profile = response.body()!!.data!!
                    session.userName = profile.name
                    bindUserData()
                }
            } catch (_: Exception) {
                // Offline fallback
            }
        }
    }

    private fun setupInteractions() {
        binding.btnSettings.setOnClickListener {
            startActivity(Intent(this, SettingsActivity::class.java))
        }

        binding.btnEditProfile.setOnClickListener {
            startActivity(Intent(this, EditProfileActivity::class.java))
        }

        val openBadges = {
            startActivity(Intent(this, BadgesAchievementsActivity::class.java))
        }
        binding.btnBadgesLinkLv.setOnClickListener { openBadges() }
        binding.btnBadgesLinkStreak.setOnClickListener { openBadges() }
    }

    private fun setupChartTabs() {
        val tabs = listOf(
            Triple(binding.tabChartDuration, "Thời lượng (phút)", "📈 Thống kê thời lượng tập (12 tuần)"),
            Triple(binding.tabChartReps, "Số Reps", "📈 Thống kê tổng số Reps (12 tuần)"),
            Triple(binding.tabChartVolume, "Tải trọng (kg)", "📈 Thống kê tải trọng Volume (12 tuần)")
        )

        tabs.forEach { (tab, _, title) ->
            tab.setOnClickListener {
                binding.tvChartTitle.text = title
                tabs.forEach { (t, _, _) ->
                    if (t == tab) {
                        t.background = ContextCompat.getDrawable(this, R.drawable.bg_subtab_pill_active)
                        t.setTextColor(ContextCompat.getColor(this, R.color.white))
                    } else {
                        t.background = ContextCompat.getDrawable(this, R.drawable.bg_subtab_pill_inactive)
                        t.setTextColor(ContextCompat.getColor(this, R.color.text_dark))
                    }
                }
            }
        }
    }

    private fun setupBottomNav() {
        binding.bottomNavigation.setupBottomNav(this, BottomNavTab.PROFILE)
    }
}
