package com.fittrack.app.ui.profile

import android.content.Intent
import android.os.Bundle
import android.view.View
import android.widget.Toast
import androidx.appcompat.app.AppCompatActivity
import androidx.core.content.ContextCompat
import androidx.core.widget.NestedScrollView
import androidx.lifecycle.lifecycleScope
import com.fittrack.app.R
import com.fittrack.app.data.api.ApiClient
import com.fittrack.app.data.session.SessionManager
import com.fittrack.app.databinding.ActivityUserProfileBinding
import com.fittrack.app.ui.BottomNavTab
import com.fittrack.app.ui.admin.AdminDashboardActivity
import com.fittrack.app.ui.settings.SettingsActivity
import com.fittrack.app.ui.setupBottomNav
import com.fittrack.app.util.WindowInsetsHelper
import kotlinx.coroutines.Dispatchers
import kotlinx.coroutines.delay
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

    private var isPost3Loaded = false
    private var isPost4Loaded = false
    private var isLoadingMore = false

    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)
        binding = ActivityUserProfileBinding.inflate(layoutInflater)
        setContentView(binding.root)

        WindowInsetsHelper.applySystemInsets(this, binding.root, binding.layoutHeader, binding.bottomNavigation.root)

        session = SessionManager.getInstance(this)

        bindUserData()
        setupInteractions()
        setupChartTabs()
        setupLazyFeedScrolling()
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
        binding.btnBadgesLinkLv.text = "Cấp ${session.userLevel}"
        binding.btnBadgesLinkStreak.text = "🔥 ${session.userStreak} ngày streak"
        binding.tvPostsCounter.text = "2 bài viết"
        binding.tvWorkoutsCount.text = session.userTotalWorkouts.toString()
        binding.tvFollowersCount.text = session.userFollowersCount.toString()
        binding.tvFollowingCount.text = session.userFollowingCount.toString()
        binding.cardAdminConsole.visibility = if (session.isAdmin) View.VISIBLE else View.GONE
    }

    private fun fetchFreshProfile() {
        if (!session.isLoggedIn) {
            android.widget.Toast.makeText(this, "Vui lòng đăng nhập để xem hồ sơ", android.widget.Toast.LENGTH_SHORT).show()
            return
        }

        lifecycleScope.launch {
            try {
                val response = withContext(Dispatchers.IO) {
                    ApiClient.getService(this@UserProfileActivity).getMe()
                }
                if (response.isSuccessful && response.body()?.data != null) {
                    val profile = response.body()!!.data!!
                    val gamification = profile.gamification
                    session.saveUserSession(
                        token = session.authToken.orEmpty(),
                        id = profile.id,
                        name = profile.name,
                        email = profile.email,
                        level = gamification?.level ?: session.userLevel,
                        xp = gamification?.xp ?: session.userXp,
                        streak = gamification?.currentStreak ?: session.userStreak,
                        role = profile.role
                    )
                    bindUserData()
                } else {
                    android.widget.Toast.makeText(this@UserProfileActivity, "Không thể tải hồ sơ (${response.code()})", android.widget.Toast.LENGTH_SHORT).show()
                }
            } catch (e: Exception) {
                android.widget.Toast.makeText(this@UserProfileActivity, "Lỗi kết nối VPS: ${e.localizedMessage}", android.widget.Toast.LENGTH_SHORT).show()
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
                    session.userTotalWorkouts = logs.size
                    binding.tvWorkoutsCount.text = logs.size.toString()
                    val now = System.currentTimeMillis()
                    val sdf = SimpleDateFormat("yyyy-MM-dd", Locale.US)

                    val durBuckets = FloatArray(12) { 0f }
                    val repsBuckets = FloatArray(12) { 0f }
                    val volBuckets = FloatArray(12) { 0f }

                    for (log in logs) {
                        val logDate: Date = try {
                            sdf.parse(log.logDate) ?: Date(now)
                        } catch (_: Exception) {
                            Date(now)
                        }

                        val diffDays = ((now - logDate.time) / (1000 * 60 * 60 * 24)).toInt()
                        val weekIndex = 11 - (diffDays / 7)
                        if (weekIndex in 0..11) {
                            val totalReps = log.sets?.sumOf { it.reps } ?: 0
                            val totalVol = log.sets?.sumOf { (it.weightKg ?: 0.0) * it.reps } ?: 0.0
                            val totalDur = (log.sets?.sumOf { it.durationSec ?: 0 } ?: 0) / 60

                            durBuckets[weekIndex] += (if (totalDur > 0) totalDur else 45).toFloat()
                            repsBuckets[weekIndex] += totalReps.toFloat()
                            volBuckets[weekIndex] += totalVol.toFloat()
                        }
                    }

                    durationBars = (0..11).map { Pair("T${it + 1}", durBuckets[it]) }
                    repsBars = (0..11).map { Pair("T${it + 1}", repsBuckets[it]) }
                    volumeBars = (0..11).map { Pair("T${it + 1}", volBuckets[it]) }

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

        binding.cardAdminConsole.setOnClickListener {
            startActivity(Intent(this, AdminDashboardActivity::class.java))
        }

        binding.btnEditProfile.setOnClickListener {
            startActivity(Intent(this, EditProfileActivity::class.java))
        }

        val openBadges = {
            startActivity(Intent(this, BadgesAchievementsActivity::class.java))
        }
        binding.btnBadgesLinkLv.setOnClickListener { openBadges() }
        binding.btnBadgesLinkStreak.setOnClickListener { openBadges() }

        binding.userPostItem1.setOnClickListener {
            Toast.makeText(this, "Bài viết: Kỷ lục Bench Press 100kg • 48 lượt thích", Toast.LENGTH_SHORT).show()
        }
        binding.userPostItem2.setOnClickListener {
            Toast.makeText(this, "Bài viết: Meal Prep tuần này • 32 lượt thích", Toast.LENGTH_SHORT).show()
        }
    }

    private fun setupLazyFeedScrolling() {
        binding.scrollProfile.setOnScrollChangeListener(
            NestedScrollView.OnScrollChangeListener { v, _, scrollY, _, _ ->
                val childHeight = v.getChildAt(0).measuredHeight
                val viewHeight = v.measuredHeight
                val threshold = childHeight - viewHeight - 350

                if (scrollY >= threshold && !isLoadingMore) {
                    if (!isPost3Loaded) {
                        isLoadingMore = true
                        binding.pbPostsLoading.visibility = View.VISIBLE
                        lifecycleScope.launch {
                            delay(450)
                            binding.pbPostsLoading.visibility = View.GONE
                            binding.userPostItem3.visibility = View.VISIBLE
                            isPost3Loaded = true
                            isLoadingMore = false
                            binding.tvPostsCounter.text = "3 bài viết"
                            Toast.makeText(this@UserProfileActivity, "✓ Đã tải thêm bài viết (Form Check Squat 140kg)", Toast.LENGTH_SHORT).show()
                        }
                    } else if (!isPost4Loaded) {
                        isLoadingMore = true
                        binding.pbPostsLoading.visibility = View.VISIBLE
                        lifecycleScope.launch {
                            delay(450)
                            binding.pbPostsLoading.visibility = View.GONE
                            binding.userPostItem4.visibility = View.VISIBLE
                            isPost4Loaded = true
                            isLoadingMore = false
                            binding.tvPostsCounter.text = "4 bài viết (Đã tải hết)"
                            Toast.makeText(this@UserProfileActivity, "✓ Đã tải thêm bài viết (Cột mốc 30 ngày Streak)", Toast.LENGTH_SHORT).show()
                        }
                    }
                }
            }
        )
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
