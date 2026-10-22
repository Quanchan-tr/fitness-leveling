package com.fittrack.app.ui.modal

import android.os.Bundle
import android.widget.Toast
import androidx.appcompat.app.AppCompatActivity
import com.fittrack.app.databinding.ActivityModalDailyQuestsBinding

class DailyQuestsModalActivity : AppCompatActivity() {

    private lateinit var binding: ActivityModalDailyQuestsBinding

    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)
        binding = ActivityModalDailyQuestsBinding.inflate(layoutInflater)
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
            // Prevent dismiss when tapping inside modal content
        }

        binding.btnClaimAll.setOnClickListener {
            Toast.makeText(this, getString(com.fittrack.app.R.string.toast_quests_claimed), Toast.LENGTH_SHORT).show()
            finish()
        }
    }
}
