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

        binding.btnClaimAll.visibility = android.view.View.GONE
    }

    private fun loadQuestsFromBackend() {
        val session = SessionManager.getInstance(this)
        if (!session.isLoggedIn) {
            Toast.makeText(this, "Vui lòng đăng nhập để xem nhiệm vụ hằng ngày", Toast.LENGTH_SHORT).show()
            return
        }

        lifecycleScope.launch {
            try {
                val res = withContext(Dispatchers.IO) {
                    ApiClient.getService(this@DailyQuestsModalActivity).getMe()
                }
                if (res.isSuccessful && res.body()?.data?.gamification?.dailyQuests != null) {
                    val quests = res.body()!!.data!!.gamification!!.dailyQuests
                    if (quests.isEmpty()) {
                        binding.tvQ1Title.text = "Chưa có nhiệm vụ hôm nay"
                        binding.tvQ1Progress.text = ""
                        binding.badgeQ1Xp.text = ""
                        return@launch
                    }

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
                } else {
                    Toast.makeText(this@DailyQuestsModalActivity, "Không thể tải nhiệm vụ (${res.code()})", Toast.LENGTH_SHORT).show()
                }
            } catch (e: Exception) {
                Toast.makeText(this@DailyQuestsModalActivity, "Lỗi kết nối VPS: ${e.localizedMessage}", Toast.LENGTH_SHORT).show()
            }
        }
    }
}
