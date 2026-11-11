package com.fittrack.app.ui.profile

import android.content.Intent
import android.os.Bundle
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
import java.text.SimpleDateFormat
import java.util.Date
import java.util.Locale

class UserProfileActivity : AppCompatActivity() {

    private lateinit var binding: ActivityUserProfileBinding
    private lateinit var session: SessionManager

    private var durationBars: List<Pair<String, Float>> = (1..12).map { Pair("T$it", 0f) }
    private var repsBars: List<Pair<String, Float>> = (1..12).map { Pair("T$it", 0f) }
    private var volumeBars: List<Pair<String, Float>> = (1..12).map { Pair("T$it", 0f) }
    private var selectedChartMode = 0 // 0: Duration, 1: Reps, 2: Volume

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
        fetchWorkoutStats()
    }

    override fun onResume() {
        super.onResume()
        bindUserData()
        fetchWorkoutStats()
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

    private fun fetchWorkoutStats() {
        if (!session.isLoggedIn) return

        lifecycleScope.launch {
            try {
                val res = withContext(Dispatchers.IO) {
                    ApiClient.getService(this@UserProfileActivity).getWorkoutLogs(100)
                }

                if (res.isSuccessful && res.body()?.data != null) {
                    val logs = res.body()!!.data!!
                    val now = System.currentTimeMillis()
                    val sdf = SimpleDateFormat("yyyy-MM-dd", Locale.US)

                    val durBuckets = FloatArray(12) { 0f }
                    val repsBuckets = FloatArray(12) { 0f }
                    val volBuckets = FloatArray(12) { 0f }

                    for (log in logs) {
                        val logDate: Date = try {
                            sdf.parse(log.logDate) ?: Date()
                        } catch (_: Exception) {
                            Date()
                        }
                        val diffDays = ((now - logDate.time) / (1000L * 60 * 60 * 24)).toInt()
                        val weekOffset = diffDays / 7
                        if (weekOffset in 0..11) {
                            val bucketIdx = 11 - weekOffset
                            log.sets?.forEach { s ->
                                durBuckets[bucketIdx] += (s.durationSec ?: 60) / 60f
                                repsBuckets[bucketIdx] += s.reps.toFloat()
                                volBuckets[bucketIdx] += ((s.weightKg ?: 0.0) * s.reps).toFloat()
                            }
                        }
                    }

                    durationBars = (1..12).map { Pair("T$it", durBuckets[it - 1]) }
                    repsBars = (1..12).map { Pair("T$it", repsBuckets[it - 1]) }
                    volumeBars = (1..12).map { Pair("T$it", volBuckets[it - 1]) }

                    refreshChartDisplay()
                }
            } catch (_: Exception) {
                // Keep default
            }
        }
    }

    private fun refreshChartDisplay() {
        when (selectedChartMode) {
            0 -> binding.chartWorkoutStats.setData(durationBars, "phút")
            1 -> binding.chartWorkoutStats.setData(repsBars, "reps")
            2 -> binding.chartWorkoutStats.setData(volumeBars, "kg")
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

        tabs.forEachIndexed { index, (tab, _, title) ->
            tab.setOnClickListener {
                selectedChartMode = index
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
                refreshChartDisplay()
            }
        }

        // Initialize default tab (Duration)
        refreshChartDisplay()
    }

    private fun setupBottomNav() {
        binding.bottomNavigation.setupBottomNav(this, BottomNavTab.PROFILE)
    }
}
