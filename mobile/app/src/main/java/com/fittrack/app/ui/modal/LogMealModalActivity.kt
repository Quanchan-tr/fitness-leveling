package com.fittrack.app.ui.modal

import android.os.Bundle
import android.text.Editable
import android.text.TextWatcher
import android.view.View
import android.widget.TextView
import android.widget.Toast
import androidx.appcompat.app.AlertDialog
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
import java.util.Calendar
import java.util.UUID

class LogMealModalActivity : AppCompatActivity() {

    private lateinit var binding: ActivityModalLogMealBinding
    private lateinit var foodRepository: FoodRepository
    private val selectedMeals = mutableListOf<CreateNutritionLogRequest>()
    private val selectedFoodIds = mutableSetOf<String>()

    private var currentCategory = "ALL"
    private var currentMealType = "lunch" // breakfast, lunch, dinner, snack
    private var searchJob: Job? = null

    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)
        binding = ActivityModalLogMealBinding.inflate(layoutInflater)
        setContentView(binding.root)

        foodRepository = FoodRepository.getInstance(this)

        initDefaultMealType()
        setupListeners()
        setupMealTypeChips()
        setupCategoryChips()
        setupSearchInput()

        loadFoodResults("", currentCategory)
    }

    private fun initDefaultMealType() {
        val hour = Calendar.getInstance().get(Calendar.HOUR_OF_DAY)
        currentMealType = when (hour) {
            in 5..10 -> "breakfast"
            in 11..14 -> "lunch"
            in 15..17 -> "snack"
            in 18..21 -> "dinner"
            else -> "snack"
        }
        updateMealTypeChipStyles()
    }

    private fun setupMealTypeChips() {
        binding.chipMealBreakfast.setOnClickListener {
            currentMealType = "breakfast"
            updateMealTypeChipStyles()
        }
        binding.chipMealLunch.setOnClickListener {
            currentMealType = "lunch"
            updateMealTypeChipStyles()
        }
        binding.chipMealDinner.setOnClickListener {
            currentMealType = "dinner"
            updateMealTypeChipStyles()
        }
        binding.chipMealSnack.setOnClickListener {
            currentMealType = "snack"
            updateMealTypeChipStyles()
        }
    }

    private fun updateMealTypeChipStyles() {
        val chips = listOf(
            binding.chipMealBreakfast to "breakfast",
            binding.chipMealLunch to "lunch",
            binding.chipMealDinner to "dinner",
            binding.chipMealSnack to "snack"
        )

        chips.forEach { (view, type) ->
            if (type == currentMealType) {
                view.background = ContextCompat.getDrawable(this, R.drawable.bg_modal_chip_orange)
                view.setTextColor(ContextCompat.getColor(this, R.color.primary))
            } else {
                view.background = ContextCompat.getDrawable(this, R.drawable.bg_modal_food_item)
                view.setTextColor(ContextCompat.getColor(this, R.color.modal_chip_gray_text))
            }
        }
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
                    delay(200)
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

            val isRaw = food.itemType.equals("RAW", ignoreCase = true) || food.id.startsWith("raw_")
            val typeTag = if (isRaw) "[RAW]" else "[Món]"
            val serving = food.servingSize ?: food.baseServing ?: if (isRaw) "100g" else "1 suất"
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
                    showPortionDialog(food, isRaw) { multiplier, portionDesc ->
                        selectedFoodIds.add(food.id)
                        val todayDate = java.text.SimpleDateFormat("yyyy-MM-dd", java.util.Locale.getDefault()).format(java.util.Date())
                        val cal = (food.calories * multiplier).toInt()
                        val p = food.protein * multiplier
                        val c = food.carbs * multiplier
                        val f = food.fat * multiplier

                        selectedMeals.add(
                            CreateNutritionLogRequest(
                                logDate = todayDate,
                                mealType = currentMealType,
                                foodName = "${food.name} ($portionDesc)",
                                calories = cal,
                                proteinGrams = p,
                                carbsGrams = c,
                                fatGrams = f
                            )
                        )

                        rowBinding.btnAddFood.text = getString(R.string.modal_meal_btn_added)
                        rowBinding.btnAddFood.background = ContextCompat.getDrawable(this, R.drawable.bg_modal_food_item)
                        rowBinding.btnAddFood.setTextColor(ContextCompat.getColor(this, R.color.modal_chip_gray_text))

                        Toast.makeText(
                            this,
                            "Đã thêm $portionDesc ${food.name} vào bữa $currentMealType!",
                            Toast.LENGTH_SHORT
                        ).show()
                    }
                }
            }

            binding.layoutFoodResults.addView(rowBinding.root)
        }
    }

    private fun showPortionDialog(
        food: FoodItemDto,
        isRaw: Boolean,
        onSelected: (multiplier: Double, portionDesc: String) -> Unit
    ) {
        val mealLabel = when (currentMealType) {
            "breakfast" -> "Bữa sáng"
            "lunch" -> "Bữa trưa"
            "dinner" -> "Bữa tối"
            else -> "Bữa phụ"
        }

        val dialogView = layoutInflater.inflate(R.layout.dialog_meal_portion_edit, null, false)
        val tvName = dialogView.findViewById<TextView>(R.id.tv_edit_food_name)
        val tvMeal = dialogView.findViewById<TextView>(R.id.tv_edit_meal_label)
        val tvMacros = dialogView.findViewById<TextView>(R.id.tv_edit_macros)
        val tvPortionPercent = dialogView.findViewById<TextView>(R.id.tv_edit_portion_percent)
        val slider = dialogView.findViewById<android.widget.SeekBar>(R.id.slider_edit_portion)
        val btnCancel = dialogView.findViewById<com.google.android.material.button.MaterialButton>(R.id.btn_edit_cancel)
        val btnSave = dialogView.findViewById<com.google.android.material.button.MaterialButton>(R.id.btn_edit_save)

        tvName.text = food.name
        tvMeal.text = "Ghi nhận vào: $mealLabel"
        btnSave.text = "Thêm vào nhật ký"

        var currentRatio = 1.0

        fun updateDisplay(ratio: Double) {
            currentRatio = ratio
            val cal = (food.calories * ratio).toInt()
            val p = String.format(java.util.Locale.US, "%.1f", food.protein * ratio)
            val c = String.format(java.util.Locale.US, "%.1f", food.carbs * ratio)
            val f = String.format(java.util.Locale.US, "%.1f", food.fat * ratio)
            val percent = (ratio * 100).toInt()

            val desc = if (isRaw) {
                "${(ratio * 100).toInt()}g"
            } else {
                "$percent%"
            }

            tvPortionPercent.text = "$desc (${if (percent < 100) "Ít hơn" else if (percent == 100) "Tiêu chuẩn" else "Nhiều hơn"})"
            tvMacros.text = "⚡ $cal kcal  •  🍗 ${p}g Đạm  •  🍚 ${c}g Carb  •  🥑 ${f}g Béo"
        }

        slider.max = 200
        slider.progress = 100
        updateDisplay(1.0)

        slider.setOnSeekBarChangeListener(object : android.widget.SeekBar.OnSeekBarChangeListener {
            override fun onProgressChanged(seekBar: android.widget.SeekBar?, progress: Int, fromUser: Boolean) {
                val ratio = progress.coerceAtLeast(40) / 100.0
                updateDisplay(ratio)
            }
            override fun onStartTrackingTouch(seekBar: android.widget.SeekBar?) {}
            override fun onStopTrackingTouch(seekBar: android.widget.SeekBar?) {}
        })

        val dialog = AlertDialog.Builder(this)
            .setView(dialogView)
            .create()

        dialog.window?.setBackgroundDrawableResource(android.R.color.transparent)

        btnCancel.setOnClickListener { dialog.dismiss() }
        btnSave.setOnClickListener {
            val desc = if (isRaw) "${(currentRatio * 100).toInt()}g" else "${(currentRatio * 100).toInt()}%"
            onSelected(currentRatio, desc)
            dialog.dismiss()
        }

        dialog.show()
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
                    // Handled gracefully
                }
            }
        }

        setResult(RESULT_OK)
        Toast.makeText(
            this,
            "✓ Đã ghi nhận ${selectedMeals.size} món ăn vào nhật ký dinh dưỡng!",
            Toast.LENGTH_SHORT
        ).show()
        finish()
    }
}
