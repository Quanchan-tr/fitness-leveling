package com.fittrack.app.ui.aipose

import android.os.Bundle
import androidx.appcompat.app.AppCompatActivity
import com.fittrack.app.R
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
            binding.btnVoiceFeedback.text = getString(
                if (isVoiceEnabled) R.string.voice_feedback_on else R.string.voice_feedback_off
            )
            binding.btnVoiceFeedback.setIconResource(
                if (isVoiceEnabled) R.drawable.ic_volume_up_solid else R.drawable.ic_volume_off_solid
            )
        }
    }
}
