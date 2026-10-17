package com.fittrack.app.ui.modal

import android.content.Intent
import android.os.Bundle
import androidx.appcompat.app.AppCompatActivity
import com.fittrack.app.databinding.ActivityModalAiCalibrationBinding
import com.fittrack.app.ui.aipose.AiPoseActiveSessionActivity

class AiCalibrationModalActivity : AppCompatActivity() {

    private lateinit var binding: ActivityModalAiCalibrationBinding

    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)
        binding = ActivityModalAiCalibrationBinding.inflate(layoutInflater)
        setContentView(binding.root)

        setupListeners()
    }

    private fun setupListeners() {
        binding.btnClose.setOnClickListener {
            finish()
        }

        binding.rootContainer.setOnClickListener {
            finish()
        }

        binding.cardModal.setOnClickListener {
            // Prevent dismiss when tapping inside
        }

        binding.btnStartAi.setOnClickListener {
            startActivity(Intent(this, AiPoseActiveSessionActivity::class.java))
            finish()
        }
    }
}
