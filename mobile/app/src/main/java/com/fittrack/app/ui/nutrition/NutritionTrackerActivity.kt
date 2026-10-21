package com.fittrack.app.ui.nutrition

import android.content.Intent
import android.os.Bundle
import androidx.appcompat.app.AppCompatActivity
import com.fittrack.app.databinding.ActivityNutritionTrackerBinding
import com.fittrack.app.ui.BottomNavTab
import com.fittrack.app.ui.modal.LogMealModalActivity
import com.fittrack.app.ui.setupBottomNav

class NutritionTrackerActivity : AppCompatActivity() {

    private lateinit var binding: ActivityNutritionTrackerBinding

    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)
        binding = ActivityNutritionTrackerBinding.inflate(layoutInflater)
        setContentView(binding.root)

        binding.btnBack.setOnClickListener {
            finish()
        }

        binding.btnAddMeal.setOnClickListener {
            startActivity(Intent(this, LogMealModalActivity::class.java))
        }

        binding.bottomNavigation.setupBottomNav(this, BottomNavTab.METRICS)
    }
}
