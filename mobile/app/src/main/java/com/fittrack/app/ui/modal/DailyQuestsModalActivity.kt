package com.fittrack.app.ui.modal

import android.os.Bundle
import android.widget.Toast
import androidx.appcompat.app.AppCompatActivity
import androidx.lifecycle.lifecycleScope
import com.fittrack.app.R
import com.fittrack.app.data.api.ApiClient
import com.fittrack.app.data.session.SessionManager
import com.fittrack.app.databinding.ActivityModalDailyQuestsBinding
import kotlinx.coroutines.Dispatchers
import kotlinx.coroutines.launch
import kotlinx.coroutines.withContext
import java.text.SimpleDateFormat
import java.util.Date
import java.util.Locale

class DailyQuestsModalActivity : AppCompatActivity() {

    private lateinit var binding: ActivityModalDailyQuestsBinding
    private val todayKey: String
        get() = SimpleDateFormat("yyyy-MM-dd", Locale.US).format(Date())

    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)
        binding = ActivityModalDailyQuestsBinding.inflate(layoutInflater)
        setContentView(binding.root)

        setupListeners()
        bindQuests()
        loadQuestsFromBackend()
    }

    private fun setupListeners() {
        binding.btnClose.setOnClickListener {
            finish()
        }

        binding.rootContainer.setOnClickListener {
            finish()
        }

        binding.cardModal.setOnClickListener {
            // Prevent dismiss when tapping inside modal content
        }

        binding.btnClaimAll.setOnClickListener {
            finish()
        }
    }

    private fun isQuestClaimed(questId: String): Boolean {
        val sp = getSharedPreferences("fittrack_quest_prefs", MODE_PRIVATE)
        return sp.getBoolean("claimed_${todayKey}_$questId", false)
    }

    private fun markQuestClaimed(questId: String) {
        val sp = getSharedPreferences("fittrack_quest_prefs", MODE_PRIVATE)
        sp.edit().putBoolean("claimed_${todayKey}_$questId", true).apply()
    }

    private fun claimQuest(questId: String, xp: Int) {
        if (isQuestClaimed(questId)) {
            Toast.makeText(this, "Nhiệm vụ này đã nhận thưởng hôm nay rồi!", Toast.LENGTH_SHORT).show()
            return
        }
        val session = SessionManager.getInstance(this)
        markQuestClaimed(questId)
        session.userXp += xp
        val neededXp = maxOf(200, session.userLevel * 200)
        if (session.userXp >= neededXp) {
            session.userLevel += 1
            session.userXp -= neededXp
            Toast.makeText(this, "🎉 LÊN CẤP ${session.userLevel}! Nhận +$xp XP.", Toast.LENGTH_SHORT).show()
        } else {
            Toast.makeText(this, "✓ Đã nhận thưởng +$xp XP!", Toast.LENGTH_SHORT).show()
        }
        bindQuests()
    }

    private fun bindQuests() {
        val session = SessionManager.getInstance(this)

        // Quest 1: Workout routine completed
        val q1Completed = session.userStreak > 0 || session.isWorkoutActive
        val q1Claimed = isQuestClaimed("q1")
        binding.tvQ1Title.text = "Hoàn thành 1 buổi tập hôm nay"
        binding.tvQ1Progress.text = if (q1Completed) "1/1 • Đã hoàn thành" else "0/1 • Chưa hoàn thành"
        if (q1Claimed) {
            binding.badgeQ1Xp.text = "✓ Đã nhận"
            binding.badgeQ1Xp.isEnabled = false
            binding.badgeQ1Xp.alpha = 0.6f
        } else if (q1Completed) {
            binding.badgeQ1Xp.text = "Nhận +50 XP"
            binding.badgeQ1Xp.isEnabled = true
            binding.badgeQ1Xp.alpha = 1.0f
            binding.badgeQ1Xp.setOnClickListener { claimQuest("q1", 50) }
        } else {
            binding.badgeQ1Xp.text = "+50 XP (Chưa xong)"
            binding.badgeQ1Xp.isEnabled = false
            binding.badgeQ1Xp.alpha = 0.5f
        }

        // Quest 2: Drink water (target >= 1000ml)
        val q2Completed = session.waterLoggedMl >= 1000
        val q2Claimed = isQuestClaimed("q2")
        binding.tvQ2Title.text = "Uống đủ tối thiểu 1.0L nước"
        binding.tvQ2Progress.text = "${session.waterLoggedMl}ml / 1000ml" + if (q2Completed) " • Đạt chuẩn" else ""
        if (q2Claimed) {
            binding.badgeQ2Xp.text = "✓ Đã nhận"
            binding.badgeQ2Xp.isEnabled = false
            binding.badgeQ2Xp.alpha = 0.6f
        } else if (q2Completed) {
            binding.badgeQ2Xp.text = "Nhận +50 XP"
            binding.badgeQ2Xp.isEnabled = true
            binding.badgeQ2Xp.alpha = 1.0f
            binding.badgeQ2Xp.setOnClickListener { claimQuest("q2", 50) }
        } else {
            binding.badgeQ2Xp.text = "+50 XP (Chưa đủ)"
            binding.badgeQ2Xp.isEnabled = false
            binding.badgeQ2Xp.alpha = 0.5f
        }

        // Quest 3: Check-in / Login Streak
        val q3Completed = true // Logged in
        val q3Claimed = isQuestClaimed("q3")
        binding.tvQ3Title.text = "Điểm danh mở ứng dụng hàng ngày"
        binding.tvQ3Progress.text = "1/1 • Đã điểm danh"
        if (q3Claimed) {
            binding.badgeQ3Xp.text = "✓ Đã nhận"
            binding.badgeQ3Xp.isEnabled = false
            binding.badgeQ3Xp.alpha = 0.6f
        } else {
            binding.badgeQ3Xp.text = "Nhận +50 XP"
            binding.badgeQ3Xp.isEnabled = true
            binding.badgeQ3Xp.alpha = 1.0f
            binding.badgeQ3Xp.setOnClickListener { claimQuest("q3", 50) }
        }

        binding.btnClaimAll.text = "Đóng"
    }

    private fun loadQuestsFromBackend() {
        val session = SessionManager.getInstance(this)
        if (!session.isLoggedIn) return

        lifecycleScope.launch {
            try {
                val res = withContext(Dispatchers.IO) {
                    ApiClient.getService(this@DailyQuestsModalActivity).getMe()
                }
                if (res.isSuccessful && res.body()?.data?.gamification?.dailyQuests != null) {
                    val quests = res.body()!!.data!!.gamification!!.dailyQuests
                    if (quests.isNotEmpty()) {
                        bindQuests()
                    }
                }
            } catch (_: Exception) {
                // Keep offline logic
            }
        }
    }
}
