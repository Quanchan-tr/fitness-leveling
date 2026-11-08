package com.fittrack.app.ui.modal

import android.os.Bundle
import android.widget.Toast
import androidx.appcompat.app.AppCompatActivity
import androidx.lifecycle.lifecycleScope
import com.fittrack.app.R
import com.fittrack.app.data.api.ApiClient
import com.fittrack.app.data.models.CreateNutritionLogRequest
import com.fittrack.app.data.session.SessionManager
import com.fittrack.app.databinding.ActivityModalLogMealBinding
import kotlinx.coroutines.Dispatchers
import kotlinx.coroutines.launch
import kotlinx.coroutines.withContext
import java.util.UUID

class LogMealModalActivity : AppCompatActivity() {

    private lateinit var binding: ActivityModalLogMealBinding
    private var addedItemsCount = 0
    private val selectedMeals = mutableListOf<CreateNutritionLogRequest>()

    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)
        binding = ActivityModalLogMealBinding.inflate(layoutInflater)
        setContentView(binding.root)

        setupListeners()
    }

    private fun setupListeners() {
        binding.btnCloseMeal.setOnClickListener {
            finish()
        }

        binding.rootContainer.setOnClickListener {
            finish()
        }

        binding.cardModal.setOnClickListener {
            // Prevent dismiss when tapping inside
        }

        binding.btnAddFood1.setOnClickListener {
            addedItemsCount++
            selectedMeals.add(
                CreateNutritionLogRequest(
                    mealType = "lunch",
                    foodName = getString(R.string.modal_meal_food1_name),
                    calories = 380,
                    proteinGrams = 42.0,
                    carbsGrams = 8.0,
                    fatGrams = 6.0
                )
            )
            binding.btnAddFood1.text = getString(R.string.modal_meal_btn_added)
            Toast.makeText(this, getString(R.string.toast_meal_selected, getString(R.string.modal_meal_food1_name)), Toast.LENGTH_SHORT).show()
        }

        binding.btnAddFood2.setOnClickListener {
            addedItemsCount++
            selectedMeals.add(
                CreateNutritionLogRequest(
                    mealType = "lunch",
                    foodName = getString(R.string.modal_meal_food2_name),
                    calories = 220,
                    proteinGrams = 5.0,
                    carbsGrams = 48.0,
                    fatGrams = 1.0
                )
            )
            binding.btnAddFood2.text = getString(R.string.modal_meal_btn_added)
            Toast.makeText(this, getString(R.string.toast_meal_selected, getString(R.string.modal_meal_food2_name)), Toast.LENGTH_SHORT).show()
        }

        binding.btnAddFood3.setOnClickListener {
            addedItemsCount++
            selectedMeals.add(
                CreateNutritionLogRequest(
                    mealType = "lunch",
                    foodName = getString(R.string.modal_meal_food3_name),
                    calories = 140,
                    proteinGrams = 12.0,
                    carbsGrams = 1.0,
                    fatGrams = 10.0
                )
            )
            binding.btnAddFood3.text = getString(R.string.modal_meal_btn_added)
            Toast.makeText(this, getString(R.string.toast_meal_selected, getString(R.string.modal_meal_food3_name)), Toast.LENGTH_SHORT).show()
        }

        binding.btnConfirmAddMeal.setOnClickListener {
            handleConfirmAddMeal()
        }
    }

    private fun handleConfirmAddMeal() {
        val session = SessionManager.getInstance(this)
        if (session.isLoggedIn && selectedMeals.isNotEmpty()) {
            val api = ApiClient.getService(this)
            lifecycleScope.launch {
                try {
                    withContext(Dispatchers.IO) {
                        for (meal in selectedMeals) {
                            api.createNutritionLog(
                                idempotencyKey = UUID.randomUUID().toString(),
                                request = meal
                            )
                        }
                    }
                } catch (_: Exception) {
                    // Non-blocking sync
                }
            }
        }

        val total = if (addedItemsCount == 0) 1 else addedItemsCount
        Toast.makeText(this, "✓ Đã ghi nhận $total món ăn vào nhật ký dinh dưỡng!", Toast.LENGTH_SHORT).show()
        finish()
    }
}
