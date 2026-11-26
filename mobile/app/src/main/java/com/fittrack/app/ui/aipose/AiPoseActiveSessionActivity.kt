package com.fittrack.app.ui.aipose

import android.Manifest
import android.content.pm.PackageManager
import android.graphics.ImageFormat
import android.graphics.Rect
import android.graphics.YuvImage
import android.os.Bundle
import android.widget.Toast
import androidx.activity.result.contract.ActivityResultContracts
import androidx.appcompat.app.AppCompatActivity
import androidx.camera.core.CameraSelector
import androidx.camera.core.ImageAnalysis
import androidx.camera.core.ImageProxy
import androidx.camera.core.Preview
import androidx.camera.lifecycle.ProcessCameraProvider
import androidx.core.content.ContextCompat
import androidx.lifecycle.lifecycleScope
import com.fittrack.app.BuildConfig
import com.fittrack.app.R
import com.fittrack.app.data.api.ApiClient
import com.fittrack.app.data.models.PoseRealtimeResultRequest
import com.fittrack.app.data.session.SessionManager
import com.fittrack.app.databinding.ActivityAiPoseActiveSessionBinding
import kotlinx.coroutines.Dispatchers
import kotlinx.coroutines.launch
import kotlinx.coroutines.withContext
import okhttp3.OkHttpClient
import okhttp3.Request
import okhttp3.Response
import okhttp3.WebSocket
import okhttp3.WebSocketListener
import okio.ByteString.Companion.toByteString
import org.json.JSONObject
import java.io.ByteArrayOutputStream
import java.util.concurrent.ExecutorService
import java.util.concurrent.Executors
import java.util.concurrent.TimeUnit

class AiPoseActiveSessionActivity : AppCompatActivity() {

    private lateinit var binding: ActivityAiPoseActiveSessionBinding
    private var isVoiceEnabled = true
    private var lensFacing = CameraSelector.LENS_FACING_FRONT
    private lateinit var cameraExecutor: ExecutorService

    private var repCount = 0
    private var goodRepCount = 0
    private var currentScore = 0
    private var exerciseId: String? = null
    private var exerciseType: String = "squat"

    private var webSocket: WebSocket? = null
    private var lastFrameSentMs = 0L

    private val wsClient by lazy {
        OkHttpClient.Builder()
            .connectTimeout(10, TimeUnit.SECONDS)
            .readTimeout(0, TimeUnit.MILLISECONDS)
            .build()
    }

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
        exerciseType = intent.getStringExtra("EXERCISE_TYPE")?.lowercase()?.ifBlank { "squat" } ?: "squat"

        setupListeners()
        connectPoseWebSocket()
        checkAndStartCamera()
        initLivePoseSessionUi()
    }

    private fun connectPoseWebSocket() {
        val wsBase = BuildConfig.POSE_WS_URL.trimEnd('/')
        val request = Request.Builder()
            .url("$wsBase/ws/pose-stream/$exerciseType")
            .build()

        webSocket = wsClient.newWebSocket(request, object : WebSocketListener() {
            override fun onOpen(webSocket: WebSocket, response: Response) {
                runOnUiThread {
                    if (!isFinishing && !isDestroyed) {
                        binding.tvFormStatus.text = "ĐANG KẾT NỐI AI"
                    }
                }
            }

            override fun onMessage(webSocket: WebSocket, text: String) {
                try {
                    val json = JSONObject(text)
                    val detected = json.optBoolean("pose_detected", false)
                    val reps = json.optInt("rep_count", repCount)
                    val goodReps = json.optInt("good_rep_count", goodRepCount)
                    val angle = json.optDouble("angle", 0.0)
                    val state = json.optString("state", "READY")
                    val status = json.optString("status", "")
                    val feedback = json.optString("feedback", "")

                    repCount = reps
                    goodRepCount = goodReps
                    currentScore = when {
                        repCount > 0 -> ((goodRepCount * 100.0) / repCount).toInt().coerceIn(0, 100)
                        detected -> 85
                        else -> currentScore
                    }

                    runOnUiThread {
                        if (isFinishing || isDestroyed) return@runOnUiThread
                        binding.tvRepCount.text = repCount.toString()
                        binding.tvAngleIndicator.text = "${angle.toInt()}°"
                        binding.tvHipIndicator.text = state
                        binding.tvFormStatus.text = when {
                            !detected -> "KHÔNG THẤY NGƯỜI"
                            status == "BAD_FORM" -> "CHỈNH FORM"
                            else -> "ĐANG THEO DÕI"
                        }
                        if (feedback.isNotBlank()) {
                            binding.tvAngleGuidance.text = feedback
                        }
                    }
                } catch (_: Exception) {
                    // Ignore malformed frame payload
                }
            }

            override fun onFailure(webSocket: WebSocket, t: Throwable, response: Response?) {
                runOnUiThread {
                    if (!isFinishing && !isDestroyed) {
                        binding.tvFormStatus.text = "NGOẠI TUYẾN"
                    }
                }
            }
        })
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

                val imageAnalysis = ImageAnalysis.Builder()
                    .setBackpressureStrategy(ImageAnalysis.STRATEGY_KEEP_ONLY_LATEST)
                    .build()
                    .also { analysis ->
                        analysis.setAnalyzer(cameraExecutor) { imageProxy ->
                            streamFrameToPoseWorker(imageProxy)
                        }
                    }

                val cameraSelector = CameraSelector.Builder()
                    .requireLensFacing(lensFacing)
                    .build()

                cameraProvider.unbindAll()
                cameraProvider.bindToLifecycle(this, cameraSelector, preview, imageAnalysis)
            } catch (_: Exception) {
                Toast.makeText(this, "Không thể khởi động Camera.", Toast.LENGTH_SHORT).show()
            }
        }, ContextCompat.getMainExecutor(this))
    }

    private fun streamFrameToPoseWorker(imageProxy: ImageProxy) {
        try {
            val now = System.currentTimeMillis()
            val ws = webSocket
            if (ws == null || now - lastFrameSentMs < 200L) {
                return
            }
            val jpegBytes = yuvImageToJpeg(imageProxy) ?: return
            lastFrameSentMs = now
            ws.send(jpegBytes.toByteString())
        } finally {
            imageProxy.close()
        }
    }

    private fun yuvImageToJpeg(image: ImageProxy): ByteArray? {
        if (image.format != ImageFormat.YUV_420_888 || image.planes.size < 3) return null
        val yBuffer = image.planes[0].buffer
        val uBuffer = image.planes[1].buffer
        val vBuffer = image.planes[2].buffer

        val ySize = yBuffer.remaining()
        val uSize = uBuffer.remaining()
        val vSize = vBuffer.remaining()

        val nv21 = ByteArray(ySize + uSize + vSize)
        yBuffer.get(nv21, 0, ySize)
        vBuffer.get(nv21, ySize, vSize)
        uBuffer.get(nv21, ySize + vSize, uSize)

        val yuvImage = YuvImage(nv21, ImageFormat.NV21, image.width, image.height, null)
        val out = ByteArrayOutputStream()
        yuvImage.compressToJpeg(Rect(0, 0, image.width, image.height), 55, out)
        return out.toByteArray()
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
        binding.tvAngleGuidance.text = "Giữ toàn thân trong khung hình. Bấm Hoàn tất để lưu kết quả."

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
            Toast.makeText(this, "Cần đăng nhập và chọn bài tập để lưu kết quả", Toast.LENGTH_SHORT).show()
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
                            score = currentScore,
                            feedbackJson = mapOf(
                                "source" to "android_camera_ws",
                                "exercise_type" to exerciseType,
                                "good_rep_count" to goodRepCount
                            )
                        )
                    )
                }
                if (res.isSuccessful) {
                    Toast.makeText(this@AiPoseActiveSessionActivity, "✓ Đã lưu phiên AI Pose Check!", Toast.LENGTH_SHORT).show()
                    finish()
                } else {
                    binding.btnFinishAiPose.isEnabled = true
                    Toast.makeText(this@AiPoseActiveSessionActivity, "Lỗi lưu kết quả (${res.code()})", Toast.LENGTH_SHORT).show()
                }
            } catch (_: Exception) {
                binding.btnFinishAiPose.isEnabled = true
                Toast.makeText(this@AiPoseActiveSessionActivity, "Lỗi kết nối máy chủ. Vui lòng thử lại.", Toast.LENGTH_SHORT).show()
            }
        }
    }

    override fun onDestroy() {
        super.onDestroy()
        webSocket?.close(1000, "Session finished")
        webSocket = null
        cameraExecutor.shutdown()
    }
}
