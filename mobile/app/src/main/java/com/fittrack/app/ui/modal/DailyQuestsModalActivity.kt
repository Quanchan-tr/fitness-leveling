package com.fittrack.app.ui.modal

import android.os.Bundle
import android.view.View
import android.widget.TextView
import androidx.appcompat.app.AppCompatActivity
import androidx.lifecycle.lifecycleScope
import com.fittrack.app.data.api.ApiClient
import com.fittrack.app.data.models.DailyQuestDto
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
        bindEmptyOrLoadingState()
        loadQuestsFromBackend()
    }

    private fun setupListeners() {
        binding.btnClose.setOnClickListener { finish() }
        binding.rootContainer.setOnClickListener { finish() }
        binding.cardModal.setOnClickListener { /* Keep modal open */ }
        binding.btnClaimAll.text = "Đóng"
        binding.btnClaimAll.setOnClickListener { finish() }
    }

    private fun bindEmptyOrLoadingState() {
        val slots = listOf(binding.itemQuest1, binding.itemQuest2, binding.itemQuest3, binding.itemQuest4)
        slots.forEach { it.visibility = View.GONE }
    }

    private fun bindQuestsFromBackend(quests: List<DailyQuestDto>) {
        val rows: List<Quadruple<View, TextView, TextView, TextView>> = listOf(
            Quadruple(binding.itemQuest1, binding.tvQ1Title, binding.tvQ1Progress, binding.badgeQ1Xp),
            Quadruple(binding.itemQuest2, binding.tvQ2Title, binding.tvQ2Progress, binding.badgeQ2Xp),
            Quadruple(binding.itemQuest3, binding.tvQ3Title, binding.tvQ3Progress, binding.badgeQ3Xp),
            Quadruple(binding.itemQuest4, binding.tvQ4Title, binding.tvQ4Progress, binding.badgeQ4Xp)
        )

        rows.forEachIndexed { idx, (container, tvTitle, tvProgress, tvBadge) ->
            val q = quests.getOrNull(idx)
            if (q == null) {
                container.visibility = View.GONE
            } else {
                container.visibility = View.VISIBLE
                tvTitle.text = q.title
                val statusLabel = if (q.completed) "Đã hoàn thành" else "Đang thực hiện"
                tvProgress.text = "${q.current}/${q.target} • $statusLabel"
                tvBadge.text = if (q.completed) "✓ +${q.xpReward} XP" else "+${q.xpReward} XP"
                tvBadge.alpha = if (q.completed) 1.0f else 0.7f
            }
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
                val gamification = res.body()?.data?.gamification
                if (res.isSuccessful && gamification != null) {
                    session.userLevel = gamification.level
                    session.userXp = gamification.xp
                    session.userStreak = gamification.currentStreak
                    bindQuestsFromBackend(gamification.dailyQuests)
                }
            } catch (_: Exception) {
                // Keep empty/offline state cleanly without fabricating XP
            }
        }
    }

    private data class Quadruple<A, B, C, D>(val first: A, val second: B, val third: C, val fourth: D)
}
