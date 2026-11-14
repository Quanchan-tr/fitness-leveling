package com.fittrack.app.ui.aipose

import android.content.Intent
import android.os.Bundle
import android.widget.Toast
import androidx.appcompat.app.AppCompatActivity
import androidx.lifecycle.lifecycleScope
import com.fittrack.app.data.api.ApiClient
import com.fittrack.app.data.session.SessionManager
import com.fittrack.app.databinding.ActivityAiPoseCoachBinding
import com.fittrack.app.ui.BottomNavTab
import com.fittrack.app.ui.setupBottomNav
import kotlinx.coroutines.Dispatchers
import kotlinx.coroutines.launch
import kotlinx.coroutines.withContext

class AiPoseCoachActivity : AppCompatActivity() {

    private lateinit var binding: ActivityAiPoseCoachBinding

    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)
        binding = ActivityAiPoseCoachBinding.inflate(layoutInflater)
        setContentView(binding.root)

        setupInteractions()
        setupBottomNav()
        fetchPoseSessions()
    }

    private fun fetchPoseSessions() {
        val session = SessionManager.getInstance(this)
        if (!session.isLoggedIn) return

        lifecycleScope.launch {
            try {
                val res = withContext(Dispatchers.IO) {
                    ApiClient.getService(this@AiPoseCoachActivity).getPoseSessions()
                }
                if (res.isSuccessful) {
                    val count = res.body()?.data?.size ?: 0
                    Toast.makeText(
                        this@AiPoseCoachActivity,
                        "Đã đồng bộ $count phiên AI Pose Check từ VPS",
                        Toast.LENGTH_SHORT
                    ).show()
                }
            } catch (e: Exception) {
                Toast.makeText(
                    this@AiPoseCoachActivity,
                    "Không thể tải lịch sử AI Pose: ${e.localizedMessage}",
                    Toast.LENGTH_SHORT
                ).show()
            }
        }
    }

    private fun setupInteractions() {
        binding.btnBack.setOnClickListener {
            finish()
        }

        binding.btnStartAiPoseSession.setOnClickListener {
            startActivity(Intent(this, AiPoseActiveSessionActivity::class.java))
        }
    }

    private fun setupBottomNav() {
        binding.bottomNavigation.setupBottomNav(this, BottomNavTab.WORKOUTS)
    }
}
