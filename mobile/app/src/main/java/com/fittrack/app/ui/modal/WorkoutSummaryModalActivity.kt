package com.fittrack.app.ui.modal

import android.content.Intent
import android.os.Bundle
import android.widget.Toast
import androidx.appcompat.app.AppCompatActivity
import com.fittrack.app.databinding.ActivityModalWorkoutSummaryBinding
import com.fittrack.app.ui.community.CommunityActivity

class WorkoutSummaryModalActivity : AppCompatActivity() {

    private lateinit var binding: ActivityModalWorkoutSummaryBinding

    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)
        binding = ActivityModalWorkoutSummaryBinding.inflate(layoutInflater)
        setContentView(binding.root)

        setupListeners()
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
