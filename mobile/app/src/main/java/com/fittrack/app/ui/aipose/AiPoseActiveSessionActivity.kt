package com.fittrack.app.ui.aipose

import android.os.Bundle
import androidx.appcompat.app.AppCompatActivity
import com.fittrack.app.databinding.ActivityAiPoseActiveSessionBinding

class AiPoseActiveSessionActivity : AppCompatActivity() {

    private lateinit var binding: ActivityAiPoseActiveSessionBinding
    private var isVoiceEnabled = true

    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)
        binding = ActivityAiPoseActiveSessionBinding.inflate(layoutInflater)
        setContentView(binding.root)

        binding.btnClose.setOnClickListener {
            finish()
        }

        binding.btnFinishAiPose.setOnClickListener {
            finish()
        }

        binding.btnVoiceFeedback.setOnClickListener {
            isVoiceEnabled = !isVoiceEnabled
            binding.btnVoiceFeedback.text = if (isVoiceEnabled) "🔊 Giọng nói: BẬT" else "🔇 Giọng nói: TẮT"
        }
    }
}
