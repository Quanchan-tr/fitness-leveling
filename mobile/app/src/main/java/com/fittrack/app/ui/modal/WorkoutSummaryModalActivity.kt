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
        syncWorkoutCompletion()
    }

    private fun syncWorkoutCompletion() {
        val session = SessionManager.getInstance(this)
        if (!session.isLoggedIn) return

        lifecycleScope.launch {
            try {
                withContext(Dispatchers.IO) {
                    val api = ApiClient.getService(this@WorkoutSummaryModalActivity)
                    val today = SimpleDateFormat("yyyy-MM-dd", Locale.getDefault()).format(Date())
                    val createRes = api.createWorkoutLog(
                        idempotencyKey = UUID.randomUUID().toString(),
                        request = CreateWorkoutLogRequest(
                            logDate = today,
                            notes = "Hoàn thành buổi tập luyện trên Mobile App"
                        )
                    )
                    if (createRes.isSuccessful && createRes.body()?.data != null) {
                        val logId = createRes.body()!!.data!!.id
                        api.completeWorkoutLog(logId)
                    }
                }
            } catch (_: Exception) {
                // Non-blocking sync
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
