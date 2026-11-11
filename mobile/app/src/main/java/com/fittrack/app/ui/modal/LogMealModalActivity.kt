package com.fittrack.app.ui.modal

import android.os.Bundle
import android.text.Editable
import android.text.TextWatcher
import android.view.View
import android.widget.TextView
import android.widget.Toast
import androidx.appcompat.app.AppCompatActivity
import androidx.core.content.ContextCompat
import androidx.lifecycle.lifecycleScope
import com.fittrack.app.R
import com.fittrack.app.data.api.ApiClient
import com.fittrack.app.data.models.CreateNutritionLogRequest
import com.fittrack.app.data.models.FoodItemDto
import com.fittrack.app.data.repository.FoodRepository
import com.fittrack.app.data.session.SessionManager
import com.fittrack.app.databinding.ActivityModalLogMealBinding
import com.fittrack.app.databinding.ItemModalFoodRowBinding
import kotlinx.coroutines.Dispatchers
import kotlinx.coroutines.Job
import kotlinx.coroutines.delay
import kotlinx.coroutines.launch
import kotlinx.coroutines.withContext
import java.util.UUID

class LogMealModalActivity : AppCompatActivity() {

    private lateinit var binding: ActivityModalLogMealBinding
    private lateinit var foodRepository: FoodRepository
    private val selectedMeals = mutableListOf<CreateNutritionLogRequest>()
    private val selectedFoodIds = mutableSetOf<String>()

    private var currentCategory = "ALL"
    private var searchJob: Job? = null

    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)
        binding = ActivityModalLogMealBinding.inflate(layoutInflater)
        setContentView(binding.root)

        foodRepository = FoodRepository.getInstance(this)

        setupListeners()
        setupCategoryChips()
        setupSearchInput()

        // Initial load of foods from dataset
        loadFoodResults("", currentCategory)
    }

    private fun setupListeners() {
        binding.btnCloseMeal.setOnClickListener { finish() }
        binding.rootContainer.setOnClickListener { finish() }
        binding.cardModal.setOnClickListener { /* Prevent dismiss */ }

        binding.btnConfirmAddMeal.setOnClickListener {
            handleConfirmAddMeal()
        }
    }

    private fun setupSearchInput() {
        binding.etSearchFood.addTextChangedListener(object : TextWatcher {
            override fun beforeTextChanged(s: CharSequence?, start: Int, count: Int, after: Int) {}
            override fun onTextChanged(s: CharSequence?, start: Int, before: Int, count: Int) {}
            override fun afterTextChanged(s: Editable?) {
                searchJob?.cancel()
                searchJob = lifecycleScope.launch {
                    delay(200) // Debounce typing
                    loadFoodResults(s?.toString().orEmpty(), currentCategory)
                }
            }
        })
    }

    private fun setupCategoryChips() {
        val chips = listOf(
            binding.chipMealAll to "ALL",
            binding.chipMealProtein to "PROTEIN",
            binding.chipMealCarb to "CARB",
            binding.chipMealVeggie to "VEGGIE",
            binding.chipMealWhey to "WHEY"
        )

        chips.forEach { (view, category) ->
            view.setOnClickListener {
                currentCategory = category
                updateChipStyles(view, chips.map { it.first })
                loadFoodResults(binding.etSearchFood.text?.toString().orEmpty(), currentCategory)
            }
        }
    }

    private fun updateChipStyles(activeView: TextView, allViews: List<TextView>) {
        allViews.forEach { view ->
            if (view == activeView) {
                view.background = ContextCompat.getDrawable(this, R.drawable.bg_modal_chip_orange)
                view.setTextColor(ContextCompat.getColor(this, R.color.primary))
            } else {
                view.background = ContextCompat.getDrawable(this, R.drawable.bg_modal_food_item)
                view.setTextColor(ContextCompat.getColor(this, R.color.modal_chip_gray_text))
            }
        }
    }

    private fun loadFoodResults(query: String, category: String) {
        lifecycleScope.launch {
            val results = foodRepository.searchFoods(query, category, limit = 40)
            renderFoodList(results)
        }
    }

    private fun renderFoodList(foods: List<FoodItemDto>) {
        binding.layoutFoodResults.removeAllViews()

        if (foods.isEmpty()) {
            val emptyTv = TextView(this).apply {
                text = "Không tìm thấy món ăn nào phù hợp"
                textSize = 11f
                setTextColor(ContextCompat.getColor(context, R.color.modal_chip_gray_text))
                setPadding(16, 24, 16, 24)
                textAlignment = View.TEXT_ALIGNMENT_CENTER
            }
            binding.layoutFoodResults.addView(emptyTv)
            return
        }

        for (food in foods) {
            val rowBinding = ItemModalFoodRowBinding.inflate(layoutInflater, binding.layoutFoodResults, false)

            val isRaw = food.itemType.equals("RAW", ignoreCase = true)
            val typeTag = if (isRaw) "[RAW]" else "[Món]"
            val serving = food.servingSize ?: food.baseServing ?: "100g"
            rowBinding.tvFoodName.text = "$typeTag ${food.name} ($serving)"

            val macroText = "${food.calories} kcal • P: ${food.protein}g • C: ${food.carbs}g • F: ${food.fat}g"
            rowBinding.tvFoodMacro.text = macroText

            val isSelected = selectedFoodIds.contains(food.id)
            if (isSelected) {
                rowBinding.btnAddFood.text = getString(R.string.modal_meal_btn_added)
                rowBinding.btnAddFood.background = ContextCompat.getDrawable(this, R.drawable.bg_modal_food_item)
                rowBinding.btnAddFood.setTextColor(ContextCompat.getColor(this, R.color.modal_chip_gray_text))
            } else {
                rowBinding.btnAddFood.text = getString(R.string.modal_meal_btn_add_item)
                rowBinding.btnAddFood.background = ContextCompat.getDrawable(this, R.drawable.bg_modal_chip_orange)
                rowBinding.btnAddFood.setTextColor(ContextCompat.getColor(this, R.color.primary))
            }

            rowBinding.btnAddFood.setOnClickListener {
                if (!selectedFoodIds.contains(food.id)) {
                    selectedFoodIds.add(food.id)
                    val todayDate = java.text.SimpleDateFormat("yyyy-MM-dd", java.util.Locale.getDefault()).format(java.util.Date())
                    selectedMeals.add(
                        CreateNutritionLogRequest(
                            logDate = todayDate,
                            mealType = "lunch",
                            foodName = food.name,
                            calories = food.calories,
                            proteinGrams = food.protein,
                            carbsGrams = food.carbs,
                            fatGrams = food.fat
                        )
                    )

                    rowBinding.btnAddFood.text = getString(R.string.modal_meal_btn_added)
                    rowBinding.btnAddFood.background = ContextCompat.getDrawable(this, R.drawable.bg_modal_food_item)
                    rowBinding.btnAddFood.setTextColor(ContextCompat.getColor(this, R.color.modal_chip_gray_text))

                    Toast.makeText(
                        this,
                        getString(R.string.toast_meal_selected, food.name),
                        Toast.LENGTH_SHORT
                    ).show()
                }
            }

            binding.layoutFoodResults.addView(rowBinding.root)
        }
    }

    private fun handleConfirmAddMeal() {
        if (selectedMeals.isEmpty()) {
            Toast.makeText(this, "Vui lòng chọn ít nhất 1 món ăn", Toast.LENGTH_SHORT).show()
            return
        }

        val session = SessionManager.getInstance(this)
        if (session.isLoggedIn) {
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

        Toast.makeText(
            this,
            "✓ Đã ghi nhận ${selectedMeals.size} món ăn vào nhật ký dinh dưỡng!",
            Toast.LENGTH_SHORT
        ).show()
        finish()
    }
}
