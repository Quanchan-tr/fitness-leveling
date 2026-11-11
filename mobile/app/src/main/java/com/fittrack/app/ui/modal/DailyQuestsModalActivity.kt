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

class DailyQuestsModalActivity : AppCompatActivity() {

    private lateinit var binding: ActivityModalDailyQuestsBinding

    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)
        binding = ActivityModalDailyQuestsBinding.inflate(layoutInflater)
        setContentView(binding.root)

        setupListeners()
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
            val session = SessionManager.getInstance(this)
            session.userXp += 150
            val neededXp = maxOf(200, session.userLevel * 200)
            if (session.userXp >= neededXp) {
                session.userLevel += 1
                session.userXp -= neededXp
                Toast.makeText(this, "🎉 LÊN CẤP ${session.userLevel}! Nhận +150 XP.", Toast.LENGTH_SHORT).show()
            } else {
                Toast.makeText(this, "✓ Đã nhận thưởng +150 XP Nhiệm vụ Hàng ngày!", Toast.LENGTH_SHORT).show()
            }
            finish()
        }
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
                        val q1 = quests.getOrNull(0)
                        val q2 = quests.getOrNull(1)
                        val q3 = quests.getOrNull(2)

                        q1?.let {
                            binding.tvQ1Title.text = it.title
                            binding.tvQ1Progress.text = "${it.current}/${it.target}" + if (it.completed) " • Hoàn thành" else ""
                            binding.badgeQ1Xp.text = "+${it.xpReward} XP"
                        }

                        q2?.let {
                            binding.tvQ2Title.text = it.title
                            binding.tvQ2Progress.text = "${it.current}/${it.target}" + if (it.completed) " • Hoàn thành" else ""
                            binding.badgeQ2Xp.text = "+${it.xpReward} XP"
                        }

                        q3?.let {
                            binding.tvQ3Title.text = it.title
                            binding.tvQ3Progress.text = "${it.current}/${it.target}" + if (it.completed) " • Hoàn thành" else ""
                            binding.badgeQ3Xp.text = "+${it.xpReward} XP"
                        }
                    }
                }
            } catch (_: Exception) {
                // Keep default offline UI
            }
        }
    }
}
