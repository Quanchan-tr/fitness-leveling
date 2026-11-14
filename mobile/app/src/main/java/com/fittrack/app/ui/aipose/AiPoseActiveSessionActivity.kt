package com.fittrack.app.ui.aipose

import android.Manifest
import android.content.pm.PackageManager
import android.os.Bundle
import android.widget.Toast
import androidx.activity.result.contract.ActivityResultContracts
import androidx.appcompat.app.AppCompatActivity
import androidx.camera.core.CameraSelector
import androidx.camera.core.Preview
import androidx.camera.lifecycle.ProcessCameraProvider
import androidx.core.content.ContextCompat
import androidx.lifecycle.lifecycleScope
import com.fittrack.app.R
import com.fittrack.app.data.api.ApiClient
import com.fittrack.app.data.models.PoseRealtimeResultRequest
import com.fittrack.app.data.session.SessionManager
import com.fittrack.app.databinding.ActivityAiPoseActiveSessionBinding
import kotlinx.coroutines.Dispatchers
import kotlinx.coroutines.launch
import kotlinx.coroutines.withContext
import java.util.concurrent.ExecutorService
import java.util.concurrent.Executors

class AiPoseActiveSessionActivity : AppCompatActivity() {

    private lateinit var binding: ActivityAiPoseActiveSessionBinding
    private var isVoiceEnabled = true
    private var lensFacing = CameraSelector.LENS_FACING_FRONT
    private lateinit var cameraExecutor: ExecutorService

    private var repCount = 0
    private var exerciseId: String? = null

    private val requestCameraPermissionLauncher = registerForActivityResult(
        ActivityResultContracts.RequestPermission()
    ) { isGranted: Boolean ->
        if (isGranted) {
            startCamera()
        } else {
            Toast.makeText(
                this,
                "Cần quyền Camera để xem trước tư thế và kiểm tra form trực tiếp",
                Toast.LENGTH_LONG
            ).show()
        }
    }

    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)
        binding = ActivityAiPoseActiveSessionBinding.inflate(layoutInflater)
        setContentView(binding.root)

        cameraExecutor = Executors.newSingleThreadExecutor()
        exerciseId = intent.getStringExtra("EXERCISE_ID")

        setupListeners()
        checkAndStartCamera()
        initLivePoseSessionUi()
    }

    private fun checkAndStartCamera() {
        if (ContextCompat.checkSelfPermission(this, Manifest.permission.CAMERA) == PackageManager.PERMISSION_GRANTED) {
            startCamera()
        } else {
            requestCameraPermissionLauncher.launch(Manifest.permission.CAMERA)
        }
    }

    private fun startCamera() {
        val cameraProviderFuture = ProcessCameraProvider.getInstance(this)
        cameraProviderFuture.addListener({
            try {
                val cameraProvider = cameraProviderFuture.get()
                val preview = Preview.Builder().build().also {
                    it.surfaceProvider = binding.previewViewCamera.surfaceProvider
                }

                val cameraSelector = CameraSelector.Builder()
                    .requireLensFacing(lensFacing)
                    .build()

                cameraProvider.unbindAll()
                cameraProvider.bindToLifecycle(this, cameraSelector, preview)
            } catch (exc: Exception) {
                Toast.makeText(this, "Không thể khởi động Camera: ${exc.localizedMessage}", Toast.LENGTH_SHORT).show()
            }
        }, ContextCompat.getMainExecutor(this))
    }

    private fun setupListeners() {
        binding.btnClose.setOnClickListener {
            finish()
        }

        binding.btnFinishAiPose.setOnClickListener {
            submitPoseSessionResult()
        }

        binding.btnFlipCamera.setOnClickListener {
            lensFacing = if (lensFacing == CameraSelector.LENS_FACING_FRONT) {
                CameraSelector.LENS_FACING_BACK
            } else {
                CameraSelector.LENS_FACING_FRONT
            }
            startCamera()
        }

        binding.btnVoiceFeedback.setOnClickListener {
            isVoiceEnabled = !isVoiceEnabled
            binding.btnVoiceFeedback.text = getString(
                if (isVoiceEnabled) R.string.voice_feedback_on else R.string.voice_feedback_off
            )
            binding.btnVoiceFeedback.setIconResource(
                if (isVoiceEnabled) R.drawable.ic_volume_up_solid else R.drawable.ic_volume_off_solid
            )
        }
    }

    private fun initLivePoseSessionUi() {
        binding.tvRepCount.text = "0"
        binding.tvAngleIndicator.text = "Camera trực tiếp"
        binding.tvHipIndicator.text = "Sẵn sàng ghi nhận"
        binding.tvFormStatus.text = "ĐANG THEO DÕI"
        binding.tvAngleGuidance.text = "Giữ toàn thân trong khung hình. Bấm Hoàn tất để lưu kết quả lên VPS."

        val session = SessionManager.getInstance(this)
        if (exerciseId.isNullOrBlank() && session.isLoggedIn) {
            lifecycleScope.launch {
                try {
                    val res = withContext(Dispatchers.IO) {
                        ApiClient.getService(this@AiPoseActiveSessionActivity).getExercises(perPage = 1)
                    }
                    if (res.isSuccessful) {
                        exerciseId = res.body()?.data?.firstOrNull()?.id
                    }
                } catch (_: Exception) { }
            }
        }
    }

    private fun submitPoseSessionResult() {
        val session = SessionManager.getInstance(this)
        val exId = exerciseId
        if (!session.isLoggedIn || exId.isNullOrBlank()) {
            Toast.makeText(this, "Cần đăng nhập và chọn bài tập để lưu kết quả lên VPS", Toast.LENGTH_SHORT).show()
            finish()
            return
        }

        binding.btnFinishAiPose.isEnabled = false
        lifecycleScope.launch {
            try {
                val res = withContext(Dispatchers.IO) {
                    ApiClient.getService(this@AiPoseActiveSessionActivity).submitPoseRealtimeResult(
                        PoseRealtimeResultRequest(
                            exerciseId = exId,
                            repCount = repCount,
                            score = 0,
                            feedbackJson = mapOf("source" to "android_camera_preview")
                        )
                    )
                }
                if (res.isSuccessful) {
                    Toast.makeText(this@AiPoseActiveSessionActivity, "✓ Đã lưu phiên AI Pose Check lên VPS!", Toast.LENGTH_SHORT).show()
                    finish()
                } else {
                    binding.btnFinishAiPose.isEnabled = true
                    Toast.makeText(this@AiPoseActiveSessionActivity, "Lỗi lưu kết quả (${res.code()})", Toast.LENGTH_SHORT).show()
                }
            } catch (e: Exception) {
                binding.btnFinishAiPose.isEnabled = true
                Toast.makeText(this@AiPoseActiveSessionActivity, "Lỗi kết nối VPS: ${e.localizedMessage}", Toast.LENGTH_SHORT).show()
            }
        }
    }

    override fun onDestroy() {
        super.onDestroy()
        cameraExecutor.shutdown()
    }
}
