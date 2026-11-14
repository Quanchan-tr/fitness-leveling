package com.fittrack.app.ui.workout

import android.content.Intent
import android.os.Bundle
import android.widget.Toast
import androidx.appcompat.app.AppCompatActivity
import androidx.lifecycle.lifecycleScope
import com.fittrack.app.R
import com.fittrack.app.data.api.ApiClient
import com.fittrack.app.data.models.AddWorkoutSetRequest
import com.fittrack.app.data.models.CreateWorkoutLogRequest
import com.fittrack.app.data.models.ExerciseDto
import com.fittrack.app.data.session.SessionManager
import com.fittrack.app.databinding.ActivityActiveWorkoutBinding
import com.fittrack.app.ui.modal.AiCalibrationModalActivity
import com.fittrack.app.ui.modal.WorkoutSummaryModalActivity
import kotlinx.coroutines.Dispatchers
import kotlinx.coroutines.launch
import kotlinx.coroutines.withContext
import java.text.SimpleDateFormat
import java.util.Date
import java.util.Locale
import java.util.UUID

class ActiveWorkoutActivity : AppCompatActivity() {

    private lateinit var binding: ActivityActiveWorkoutBinding
    private var exercises: List<ExerciseDto> = emptyList()
    private var currentExerciseIndex = 0
    private var workoutLogId: String? = null
    private var completedSets = 0
    private var totalVolumeKg = 0.0
    private val startedAtMs = System.currentTimeMillis()

    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)
        binding = ActivityActiveWorkoutBinding.inflate(layoutInflater)
        setContentView(binding.root)

        binding.btnBack.setOnClickListener { finish() }
        binding.btnQuit.setOnClickListener { finish() }

        binding.btnAiCheckForm.setOnClickListener {
            startActivity(Intent(this, AiCalibrationModalActivity::class.java))
        }

        binding.btnNextExercise.setOnClickListener {
            handleNextOrFinish()
        }

        binding.btnAddSet.setOnClickListener {
            logOneSet()
        }

        binding.btnTriggerRest.setOnClickListener {
            startRestTimer()
        }

        initWorkoutSession()
    }

    private var restTimer: android.os.CountDownTimer? = null

    private fun startRestTimer() {
        restTimer?.cancel()
        restTimer = object : android.os.CountDownTimer(60_000L, 1_000L) {
            override fun onTick(millisUntilFinished: Long) {
                val sec = millisUntilFinished / 1000L
                binding.btnTriggerRest.text = "⏳ Nghỉ: ${sec}s"
            }

            override fun onFinish() {
                binding.btnTriggerRest.text = "⏱️ Nghỉ 60s"
                Toast.makeText(this@ActiveWorkoutActivity, "Hết giờ nghỉ! Tiếp tục hiệp tiếp theo.", Toast.LENGTH_SHORT).show()
            }
        }.start()
    }

    private fun logOneSet() {
        val currentEx = exercises.getOrNull(currentExerciseIndex)
        val logId = workoutLogId
        if (currentEx == null || logId.isNullOrBlank()) {
            Toast.makeText(this, "Đang khởi tạo phiên tập trên VPS...", Toast.LENGTH_SHORT).show()
            return
        }
        binding.btnAddSet.isEnabled = false
        lifecycleScope.launch {
            try {
                val res = withContext(Dispatchers.IO) {
                    ApiClient.getService(this@ActiveWorkoutActivity).addWorkoutSet(
                        id = logId,
                        idempotencyKey = UUID.randomUUID().toString(),
                        request = AddWorkoutSetRequest(
                            exerciseId = currentEx.id,
                            setNumber = completedSets + 1,
                            reps = 10,
                            weightKg = 20.0
                        )
                    )
                }
                binding.btnAddSet.isEnabled = true
                if (res.isSuccessful) {
                    completedSets++
                    totalVolumeKg += 10 * 20.0
                    Toast.makeText(this@ActiveWorkoutActivity, "✓ Đã ghi nhận Set #$completedSets!", Toast.LENGTH_SHORT).show()
                } else {
                    Toast.makeText(this@ActiveWorkoutActivity, "Lỗi ghi set (${res.code()})", Toast.LENGTH_SHORT).show()
                }
            } catch (e: Exception) {
                binding.btnAddSet.isEnabled = true
                Toast.makeText(this@ActiveWorkoutActivity, "Lỗi kết nối: ${e.localizedMessage}", Toast.LENGTH_SHORT).show()
            }
        }
    }

    override fun onDestroy() {
        super.onDestroy()
        restTimer?.cancel()
    }

    private fun initWorkoutSession() {
        val routineTitle = intent.getStringExtra("ROUTINE_TITLE") ?: "Buổi tập"
        val session = SessionManager.getInstance(this)
        if (!session.isLoggedIn) {
            Toast.makeText(this, "Vui lòng đăng nhập để ghi nhận buổi tập", Toast.LENGTH_SHORT).show()
            return
        }

        lifecycleScope.launch {
            val api = ApiClient.getService(this@ActiveWorkoutActivity)
            try {
                val exRes = withContext(Dispatchers.IO) { api.getExercises(perPage = 5) }
                if (exRes.isSuccessful && !exRes.body()?.data.isNullOrEmpty()) {
                    exercises = exRes.body()!!.data!!
                    bindCurrentExercise()
                }
            } catch (e: Exception) {
                Toast.makeText(this@ActiveWorkoutActivity, "Lỗi tải bài tập: ${e.localizedMessage}", Toast.LENGTH_SHORT).show()
            }

            try {
                val today = SimpleDateFormat("yyyy-MM-dd", Locale.getDefault()).format(Date())
                val logRes = withContext(Dispatchers.IO) {
                    api.createWorkoutLog(
                        idempotencyKey = UUID.randomUUID().toString(),
                        request = CreateWorkoutLogRequest(
                            logDate = today,
                            notes = "Buổi tập: $routineTitle"
                        )
                    )
                }
                if (logRes.isSuccessful && logRes.body()?.data != null) {
                    workoutLogId = logRes.body()!!.data!!.id
                }
            } catch (e: Exception) {
                Toast.makeText(this@ActiveWorkoutActivity, "Không thể tạo phiên tập trên VPS: ${e.localizedMessage}", Toast.LENGTH_SHORT).show()
            }
        }
    }

    private fun bindCurrentExercise() {
        val ex = exercises.getOrNull(currentExerciseIndex) ?: return
        binding.tvExerciseStatus.text = "BÀI TẬP ${currentExerciseIndex + 1} / ${exercises.size}"
        binding.tvCurrentExerciseName.text = ex.name
        binding.tvTargetInfo.text = listOfNotNull(ex.targetMuscle, ex.equipment).joinToString(" • ")
            .ifBlank { "3 hiệp × 12 lần" }
        binding.btnNextExercise.text = if (currentExerciseIndex >= exercises.size - 1) {
            getString(R.string.btn_finish_workout_xp)
        } else {
            "Bài tiếp theo →"
        }
    }

    private fun handleNextOrFinish() {
        val currentEx = exercises.getOrNull(currentExerciseIndex)
        val logId = workoutLogId

        if (currentEx != null && !logId.isNullOrBlank()) {
            lifecycleScope.launch {
                try {
                    withContext(Dispatchers.IO) {
                        ApiClient.getService(this@ActiveWorkoutActivity).addWorkoutSet(
                            id = logId,
                            idempotencyKey = UUID.randomUUID().toString(),
                            request = AddWorkoutSetRequest(
                                exerciseId = currentEx.id,
                                setNumber = completedSets + 1,
                                reps = 10,
                                weightKg = 20.0
                            )
                        )
                    }
                    completedSets++
                    totalVolumeKg += 10 * 20.0
                } catch (_: Exception) {
                    // Proceed to next/summary; summary will handle completion
                }
                advanceOrComplete()
            }
        } else {
            advanceOrComplete()
        }
    }

    private fun advanceOrComplete() {
        if (currentExerciseIndex < exercises.size - 1) {
            currentExerciseIndex++
            bindCurrentExercise()
        } else {
            val elapsedSec = ((System.currentTimeMillis() - startedAtMs) / 1000L).coerceAtLeast(1L)
            startActivity(Intent(this, WorkoutSummaryModalActivity::class.java).apply {
                putExtra("WORKOUT_LOG_ID", workoutLogId)
                putExtra("ELAPSED_SECONDS", elapsedSec)
                putExtra("TOTAL_SETS", completedSets)
                putExtra("TOTAL_VOLUME", totalVolumeKg)
            })
            finish()
        }
    }
}
