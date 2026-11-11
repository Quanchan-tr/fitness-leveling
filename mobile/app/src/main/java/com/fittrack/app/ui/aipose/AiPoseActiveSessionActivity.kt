package com.fittrack.app.ui.aipose

import android.Manifest
import android.content.pm.PackageManager
import android.os.Bundle
import android.os.Handler
import android.os.Looper
import android.widget.Toast
import androidx.activity.result.contract.ActivityResultContracts
import androidx.appcompat.app.AppCompatActivity
import androidx.camera.core.CameraSelector
import androidx.camera.core.Preview
import androidx.camera.lifecycle.ProcessCameraProvider
import androidx.core.content.ContextCompat
import com.fittrack.app.R
import com.fittrack.app.databinding.ActivityAiPoseActiveSessionBinding
import java.util.concurrent.ExecutorService
import java.util.concurrent.Executors

class AiPoseActiveSessionActivity : AppCompatActivity() {

    private lateinit var binding: ActivityAiPoseActiveSessionBinding
    private var isVoiceEnabled = true
    private var lensFacing = CameraSelector.LENS_FACING_FRONT
    private lateinit var cameraExecutor: ExecutorService

    private var repCount = 0
    private val handler = Handler(Looper.getMainLooper())
    private var isSessionActive = true

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

        setupListeners()
        checkAndStartCamera()
        startPoseSessionLoop()
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
            Toast.makeText(this, "✓ Hoàn tất buổi tập với AI Coach! +$repCount Reps hoàn hảo.", Toast.LENGTH_SHORT).show()
            finish()
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

    private fun startPoseSessionLoop() {
        val runnable = object : Runnable {
            override fun run() {
                if (!isSessionActive) return
                repCount++
                val angle = 85 + (repCount % 15)
                val hipAngle = 78 + (repCount % 12)

                binding.tvRepCount.text = "$repCount"
                binding.tvAngleIndicator.text = "Góc đầu gối: $angle°"
                binding.tvHipIndicator.text = "Góc hông: $hipAngle°"

                if (angle in 85..95) {
                    binding.tvFormStatus.text = "✓ FORM CHUẨN (98%)"
                    binding.tvFormStatus.setBackgroundColor(0xFF166534.toInt())
                    binding.tvAngleGuidance.text = "Độ sâu Squat lý tưởng! Tiếp tục duy trì nhịp thở."
                } else {
                    binding.tvFormStatus.text = "HẠ THẤP HÔNG THÊM 5°"
                    binding.tvFormStatus.setBackgroundColor(0xFFB45309.toInt())
                    binding.tvAngleGuidance.text = "Gập gối sâu hơn để kích hoạt toàn bộ cơ đùi trước."
                }

                handler.postDelayed(this, 3000)
            }
        }
        handler.postDelayed(runnable, 2000)
    }

    override fun onDestroy() {
        super.onDestroy()
        isSessionActive = false
        handler.removeCallbacksAndMessages(null)
        cameraExecutor.shutdown()
    }
}
