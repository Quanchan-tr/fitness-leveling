package com.fittrack.app.ui.modal

import android.content.Intent
import android.os.Bundle
import android.widget.Toast
import androidx.appcompat.app.AppCompatActivity
import androidx.lifecycle.lifecycleScope
import com.fittrack.app.data.api.ApiClient
import com.fittrack.app.data.models.CreateWorkoutLogRequest
import com.fittrack.app.data.session.SessionManager
import com.fittrack.app.databinding.ActivityModalWorkoutSummaryBinding
import com.fittrack.app.ui.community.CommunityActivity
import kotlinx.coroutines.Dispatchers
import kotlinx.coroutines.launch
import kotlinx.coroutines.withContext
import java.text.SimpleDateFormat
import java.util.Date
import java.util.Locale
import java.util.UUID

class WorkoutSummaryModalActivity : AppCompatActivity() {

    private lateinit var binding: ActivityModalWorkoutSummaryBinding

    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)
        binding = ActivityModalWorkoutSummaryBinding.inflate(layoutInflater)
        setContentView(binding.root)

        setupListeners()
        bindSummaryData()
        syncWorkoutCompletion()
    }

    private fun bindSummaryData() {
        val totalTime = intent.getStringExtra("TOTAL_TIME") ?: "0 phút"
        val totalVolume = intent.getStringExtra("TOTAL_VOLUME") ?: "0 kg"
        val totalSets = intent.getStringExtra("TOTAL_SETS") ?: "0 hiệp"

        binding.tvSummaryTime.text = totalTime
        binding.tvSummaryVolume.text = totalVolume
        binding.tvSummaryForm.text = totalSets
    }

    private fun syncWorkoutCompletion() {
        val session = SessionManager.getInstance(this)
        if (!session.isLoggedIn) {
            Toast.makeText(this, "Vui lòng đăng nhập để lưu kết quả tập luyện", Toast.LENGTH_SHORT).show()
            return
        }

        val existingLogId = intent.getStringExtra("WORKOUT_LOG_ID")

        lifecycleScope.launch {
            try {
                val completedLog = withContext(Dispatchers.IO) {
                    val api = ApiClient.getService(this@WorkoutSummaryModalActivity)
                    val logId = if (!existingLogId.isNullOrBlank()) {
                        existingLogId
                    } else {
                        val today = SimpleDateFormat("yyyy-MM-dd", Locale.getDefault()).format(Date())
                        val createRes = api.createWorkoutLog(
                            idempotencyKey = UUID.randomUUID().toString(),
                            request = CreateWorkoutLogRequest(
                                logDate = today,
                                notes = "Hoàn thành buổi tập luyện trên Mobile App"
                            )
                        )
                        if (createRes.isSuccessful) createRes.body()?.data?.id else null
                    }

                    if (!logId.isNullOrBlank()) {
                        val compRes = api.completeWorkoutLog(logId)
                        if (compRes.isSuccessful) compRes.body()?.data else null
                    } else {
                        null
                    }
                }

                if (completedLog != null) {
                    Toast.makeText(
                        this@WorkoutSummaryModalActivity,
                        "✓ Đã lưu buổi tập! +${completedLog.totalXpEarned} XP",
                        Toast.LENGTH_SHORT
                    ).show()
                } else {
                    Toast.makeText(
                        this@WorkoutSummaryModalActivity,
                        "Không thể xác nhận hoàn tất buổi tập với máy chủ",
                        Toast.LENGTH_SHORT
                    ).show()
                }
            } catch (_: Exception) {
                Toast.makeText(
                    this@WorkoutSummaryModalActivity,
                    "Lỗi đồng bộ buổi tập. Vui lòng kiểm tra kết nối mạng.",
                    Toast.LENGTH_SHORT
                ).show()
            }
        }
    }

    private fun setupListeners() {
        binding.btnClose.setOnClickListener {
            finish()
        }

        binding.btnCloseModal.setOnClickListener {
            finish()
        }

        binding.rootContainer.setOnClickListener {
            finish()
        }

        binding.cardModal.setOnClickListener {
            // Prevent dismiss when tapping inside
        }

        binding.btnShareCommunity.setOnClickListener {
            Toast.makeText(this, getString(com.fittrack.app.R.string.toast_open_community), Toast.LENGTH_SHORT).show()
            startActivity(Intent(this, CommunityActivity::class.java))
            finish()
        }
    }
}
