package com.fittrack.app.ui.onboarding

import android.content.Intent
import android.os.Bundle
import androidx.appcompat.app.AppCompatActivity
import com.fittrack.app.databinding.ActivityOnboardingEquipmentBinding

class OnboardingEquipmentActivity : AppCompatActivity() {

    private lateinit var binding: ActivityOnboardingEquipmentBinding

    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)
        binding = ActivityOnboardingEquipmentBinding.inflate(layoutInflater)
        setContentView(binding.root)

        binding.btnBack.setOnClickListener {
            finish()
        }

        binding.itemDumbbell.setOnClickListener {
            binding.cbDumbbell.isChecked = !binding.cbDumbbell.isChecked
        }
        binding.itemBarbell.setOnClickListener {
            binding.cbBarbell.isChecked = !binding.cbBarbell.isChecked
        }
        binding.itemKettlebell.setOnClickListener {
            binding.cbKettlebell.isChecked = !binding.cbKettlebell.isChecked
        }
        binding.itemPullUpBar.setOnClickListener {
            binding.cbPullUpBar.isChecked = !binding.cbPullUpBar.isChecked
        }
        binding.itemSquatRack.setOnClickListener {
            binding.cbSquatRack.isChecked = !binding.cbSquatRack.isChecked
        }
        binding.itemFlatBench.setOnClickListener {
            binding.cbFlatBench.isChecked = !binding.cbFlatBench.isChecked
        }

        binding.btnContinue.setOnClickListener {
            val selected = buildList {
                if (binding.cbDumbbell.isChecked) add("dumbbell")
                if (binding.cbBarbell.isChecked) add("barbell")
                if (binding.cbKettlebell.isChecked) add("kettlebell")
                if (binding.cbPullUpBar.isChecked) add("pull_up_bar")
                if (binding.cbSquatRack.isChecked) add("squat_rack")
                if (binding.cbFlatBench.isChecked) add("flat_bench")
            }
            com.fittrack.app.data.session.SessionManager.getInstance(this).obEquipment =
                if (selected.isEmpty()) "bodyweight" else selected.joinToString(",")
            startActivity(Intent(this, OnboardingLoadingActivity::class.java))
        }
    }
}
