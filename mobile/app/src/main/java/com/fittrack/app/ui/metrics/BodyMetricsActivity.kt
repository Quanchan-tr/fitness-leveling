package com.fittrack.app.ui.metrics

import android.content.Intent
import android.os.Bundle
import android.view.LayoutInflater
import android.view.View
import android.widget.LinearLayout
import android.widget.SeekBar
import android.widget.TextView
import android.widget.Toast
import androidx.appcompat.app.AlertDialog
import androidx.appcompat.app.AppCompatActivity
import androidx.core.content.ContextCompat
import androidx.lifecycle.lifecycleScope
import com.fittrack.app.R
import com.fittrack.app.data.api.ApiClient
import com.fittrack.app.data.session.SessionManager
import com.fittrack.app.databinding.ActivityBodyMetricsBinding
import com.fittrack.app.ui.BottomNavTab
import com.fittrack.app.ui.modal.LogMealModalActivity
import com.fittrack.app.ui.modal.LogMetricsModalActivity
import com.fittrack.app.ui.setupBottomNav
import com.fittrack.app.util.WindowInsetsHelper
import kotlinx.coroutines.Dispatchers
import kotlinx.coroutines.launch
import kotlinx.coroutines.withContext
import java.util.Locale

class BodyMetricsActivity : AppCompatActivity() {

    private lateinit var binding: ActivityBodyMetricsBinding
    private lateinit var session: SessionManager
    private var isNutritionTabActive = false

    private var currentTotalCalories = 0
    private var currentProtein = 0
    private var currentCarb = 0
    private var currentFat = 0

    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)
        binding = ActivityBodyMetricsBinding.inflate(layoutInflater)
        setContentView(binding.root)

        WindowInsetsHelper.applySystemInsets(this, binding.root, binding.layoutHeader, binding.bottomNavigation.root)

        session = SessionManager.getInstance(this)

        setupSubTabs()
        setupNutritionActions()
        setupCombos()
        initNutritionData()
        setupBottomNav()

        val initialTab = intent.getStringExtra("INITIAL_TAB")
        if (initialTab == "METRICS") {
            switchToTab(isNutrition = false)
        } else {
            switchToTab(isNutrition = true)
        }

        fetchMetricsFromBackend()
    }

    override fun onResume() {
        super.onResume()
        fetchMetricsFromBackend()
    }

    private fun fetchMetricsFromBackend() {
        if (!session.isLoggedIn) return

        val api = ApiClient.getService(this)
        lifecycleScope.launch {
            // 1. Đồng bộ Body Metrics từ API
            try {
                val res = withContext(Dispatchers.IO) { api.getBodyMetrics() }
                if (res.isSuccessful && res.body()?.data?.isNotEmpty() == true) {
                    val rawList = res.body()!!.data!!
                    val latest = rawList.first()
                    binding.tvMetricWeightVal.text = String.format(Locale.US, "%.1f kg", latest.weightKg)

                    val heightM = (latest.heightCm?.takeIf { it > 50.0 } ?: 175.0) / 100.0
                    val bmi = latest.weightKg / (heightM * heightM)
                    binding.tvMetricBmiVal.text = String.format(Locale.US, "%.1f", bmi)
                    binding.tvMetricBmiDesc.text = when {
                        bmi < 18.5 -> "Gầy"
                        bmi in 18.5..24.9 -> "Chuẩn"
                        else -> "Thừa cân"
                    }

                    latest.bodyFatPct?.let { fat ->
                        binding.tvMetricFatVal.text = String.format(Locale.US, "%.1f%%", fat)
                    }

                    // Feed weight trend points into chart
                    val chartPoints = rawList.reversed().map { item ->
                        val dateLabel = item.logDate?.let { if (it.length >= 10) it.substring(5, 10) else it } ?: "Gần đây"
                        Pair(dateLabel, item.weightKg.toFloat())
                    }
                    binding.chartWeightTrend.setData(chartPoints)
                }
            } catch (_: Exception) {
                // Giữ nguyên giao diện offline
            }

            // 2. Đồng bộ Nutrition Logs từ API
            try {
                val nutRes = withContext(Dispatchers.IO) { api.getNutritionLogs() }
                if (nutRes.isSuccessful && nutRes.body()?.data?.isNotEmpty() == true) {
                    val logs = nutRes.body()!!.data!!
                    val totalCalories = logs.sumOf { it.calories }
                    val totalProtein = logs.sumOf { it.proteinGrams }
                    val totalCarbs = logs.sumOf { it.carbsGrams }
                    val totalFat = logs.sumOf { it.fatGrams }

                    if (totalCalories > 0) {
                        currentTotalCalories = totalCalories
                        currentProtein = totalProtein.toInt()
                        currentCarb = totalCarbs.toInt()
                        currentFat = totalFat.toInt()

                        binding.tvCalorieGoal.text = "$currentTotalCalories kcal"
                        binding.tvProteinMacro.text = String.format(Locale.US, "Đạm: %dg / 160g", currentProtein)
                        binding.pbProtein.progress = minOf(currentProtein, binding.pbProtein.max)

                        binding.tvCarbMacro.text = String.format(Locale.US, "Carb: %dg / 240g", currentCarb)
                        binding.pbCarb.progress = minOf(currentCarb, binding.pbCarb.max)

                        binding.tvFatMacro.text = String.format(Locale.US, "Fat: %dg / 65g", currentFat)
                        binding.pbFat.progress = minOf(currentFat, binding.pbFat.max)
                    }
                }
            } catch (_: Exception) {
                // Giữ nguyên giao diện offline
            }
        }
    }

    private fun setupSubTabs() {
        binding.tabBodyMetrics.setOnClickListener {
            switchToTab(isNutrition = false)
        }

        binding.btnToNutrition.setOnClickListener {
            switchToTab(isNutrition = true)
        }
    }

    private fun switchToTab(isNutrition: Boolean) {
        isNutritionTabActive = isNutrition
        if (isNutrition) {
            binding.scrollBodyMetrics.visibility = View.GONE
            binding.scrollNutrition.visibility = View.VISIBLE

            binding.btnToNutrition.background = ContextCompat.getDrawable(this, R.drawable.bg_subtab_pill_active)
            binding.btnToNutrition.setTextColor(ContextCompat.getColor(this, R.color.white))

            binding.tabBodyMetrics.background = ContextCompat.getDrawable(this, R.drawable.bg_subtab_pill_inactive)
            binding.tabBodyMetrics.setTextColor(ContextCompat.getColor(this, R.color.subtab_pill_inactive_text))
        } else {
            binding.scrollBodyMetrics.visibility = View.VISIBLE
            binding.scrollNutrition.visibility = View.GONE

            binding.tabBodyMetrics.background = ContextCompat.getDrawable(this, R.drawable.bg_subtab_pill_active)
            binding.tabBodyMetrics.setTextColor(ContextCompat.getColor(this, R.color.white))

            binding.btnToNutrition.background = ContextCompat.getDrawable(this, R.drawable.bg_subtab_pill_inactive)
            binding.btnToNutrition.setTextColor(ContextCompat.getColor(this, R.color.subtab_pill_inactive_text))
        }
    }

    private fun setupCombos() {
        binding.btnCombo1.setOnClickListener {
            showComboDetailDialog(
                name = "🍗 Combo Tăng Cơ Chuẩn",
                baseCalories = 520,
                baseProtein = 48,
                baseCarb = 55,
                baseFat = 12,
                items = listOf(
                    "• 200g Ức gà áp chảo (330 kcal, 44g Đạm)",
                    "• 150g Cơm gạo lứt (165 kcal, 35g Carb)",
                    "• 100g Bông cải xanh hấp (25 kcal, 4g Xơ)"
                )
            )
        }

        binding.btnCombo2.setOnClickListener {
            showComboDetailDialog(
                name = "🥩 Combo Tinh Gọn Nạc",
                baseCalories = 450,
                baseProtein = 42,
                baseCarb = 40,
                baseFat = 14,
                items = listOf(
                    "• 180g Thịt bò nạc xào tỏi (310 kcal, 38g Đạm)",
                    "• 120g Khoai lang mật luộc (105 kcal, 24g Carb)",
                    "• 1 đĩa Salad dấm táo sốt mè (35 kcal)"
                )
            )
        }

        binding.btnCombo3.setOnClickListener {
            showComboDetailDialog(
                name = "🐟 Combo Giảm Mỡ Tối Đa",
                baseCalories = 380,
                baseProtein = 36,
                baseCarb = 18,
                baseFat = 16,
                items = listOf(
                    "• 160g Phi lê cá hồi nướng chanh (280 kcal, 34g Đạm, Omega-3)",
                    "• 120g Salad ớt chuông & dưa leo (60 kcal)",
                    "• 1 thìa Dầu Olive nguyên chất (40 kcal)"
                )
            )
        }

        // Setup click listeners for logged meals to edit portion
        setupLoggedMealEditListeners()
    }

    private fun setupLoggedMealEditListeners() {
        binding.itemMealBreakfast1.setOnClickListener {
            showMealPortionEditDialog(
                name = "Trứng luộc 2 quả + Bánh mì đen",
                mealTypeLabel = "Bữa sáng",
                baseCalories = 310,
                baseProtein = 18,
                baseCarb = 35,
                baseFat = 10,
                nameTextView = binding.tvBreakfastName,
                macroTextView = binding.tvBreakfastMacro
            )
        }

        binding.itemMealLunch1.setOnClickListener {
            showMealPortionEditDialog(
                name = "Ức gà 200g + Cơm gạo lứt 150g",
                mealTypeLabel = "Bữa trưa",
                baseCalories = 520,
                baseProtein = 48,
                baseCarb = 55,
                baseFat = 12,
                nameTextView = binding.tvLunchName,
                macroTextView = binding.tvLunchMacro
            )
        }

        binding.itemMealDinner1.setOnClickListener {
            showMealPortionEditDialog(
                name = "Cá hồi áp chảo 150g + Khoai lang luộc",
                mealTypeLabel = "Bữa tối",
                baseCalories = 460,
                baseProtein = 38,
                baseCarb = 35,
                baseFat = 16,
                nameTextView = binding.tvDinnerName,
                macroTextView = binding.tvDinnerMacro
            )
        }
    }

    private fun showMealPortionEditDialog(
        name: String,
        mealTypeLabel: String,
        baseCalories: Int,
        baseProtein: Int,
        baseCarb: Int,
        baseFat: Int,
        nameTextView: TextView,
        macroTextView: TextView
    ) {
        val dialogView = LayoutInflater.from(this).inflate(R.layout.dialog_meal_portion_edit, null, false)
        val tvName = dialogView.findViewById<TextView>(R.id.tv_edit_food_name)
        val tvMeal = dialogView.findViewById<TextView>(R.id.tv_edit_meal_label)
        val tvMacros = dialogView.findViewById<TextView>(R.id.tv_edit_macros)
        val tvPortionPercent = dialogView.findViewById<TextView>(R.id.tv_edit_portion_percent)
        val slider = dialogView.findViewById<SeekBar>(R.id.slider_edit_portion)
        val btnCancel = dialogView.findViewById<com.google.android.material.button.MaterialButton>(R.id.btn_edit_cancel)
        val btnSave = dialogView.findViewById<com.google.android.material.button.MaterialButton>(R.id.btn_edit_save)

        tvName.text = name
        tvMeal.text = "Bữa ăn: $mealTypeLabel"

        var currentRatio = 1.0f

        fun updateDisplay(ratio: Float) {
            currentRatio = ratio
            val cal = (baseCalories * ratio).toInt()
            val p = (baseProtein * ratio).toInt()
            val c = (baseCarb * ratio).toInt()
            val f = (baseFat * ratio).toInt()
            val percent = (ratio * 100).toInt()

            tvPortionPercent.text = "$percent% (${if (percent < 100) "Ít hơn" else if (percent == 100) "Tiêu chuẩn" else "Nhiều hơn"})"
            tvMacros.text = "⚡ $cal kcal  •  🍗 ${p}g Đạm  •  🍚 ${c}g Carb  •  🥑 ${f}g Béo"
        }

        slider.max = 200
        slider.progress = 100
        updateDisplay(1.0f)

        slider.setOnSeekBarChangeListener(object : SeekBar.OnSeekBarChangeListener {
            override fun onProgressChanged(seekBar: SeekBar?, progress: Int, fromUser: Boolean) {
                val ratio = progress.coerceAtLeast(50) / 100f
                updateDisplay(ratio)
            }
            override fun onStartTrackingTouch(seekBar: SeekBar?) {}
            override fun onStopTrackingTouch(seekBar: SeekBar?) {}
        })

        val dialog = AlertDialog.Builder(this)
            .setView(dialogView)
            .create()

        dialog.window?.setBackgroundDrawableResource(android.R.color.transparent)

        btnCancel.setOnClickListener { dialog.dismiss() }
        btnSave.setOnClickListener {
            val updatedCal = (baseCalories * currentRatio).toInt()
            val updatedP = (baseProtein * currentRatio).toInt()
            val updatedC = (baseCarb * currentRatio).toInt()
            val percent = (currentRatio * 100).toInt()

            nameTextView.text = "$name ($percent%)"
            macroTextView.text = "$updatedCal kcal • ${updatedP}g Protein • ${updatedC}g Carb"

            Toast.makeText(this, "✓ Đã cập nhật khẩu phần $percent% cho $name", Toast.LENGTH_SHORT).show()
            dialog.dismiss()
        }

        dialog.show()
    }

    private fun showComboDetailDialog(
        name: String,
        baseCalories: Int,
        baseProtein: Int,
        baseCarb: Int,
        baseFat: Int,
        items: List<String>
    ) {
        val view = LayoutInflater.from(this).inflate(R.layout.dialog_combo_detail, null, false)
        val tvName = view.findViewById<TextView>(R.id.tv_dialog_combo_name)
        val tvItems = view.findViewById<TextView>(R.id.tv_dialog_combo_items)
        val tvMacros = view.findViewById<TextView>(R.id.tv_dialog_macros)

        val chipBreakfast = view.findViewById<TextView>(R.id.chip_combo_breakfast)
        val chipLunch = view.findViewById<TextView>(R.id.chip_combo_lunch)
        val chipDinner = view.findViewById<TextView>(R.id.chip_combo_dinner)

        val btnClose = view.findViewById<com.google.android.material.button.MaterialButton>(R.id.btn_dialog_close)
        val btnAddMeal = view.findViewById<com.google.android.material.button.MaterialButton>(R.id.btn_dialog_add_meal)

        tvName.text = name
        tvItems.text = items.joinToString("\n")
        tvMacros.text = "⚡ $baseCalories kcal  •  🍗 ${baseProtein}g Đạm  •  🍚 ${baseCarb}g Carb  •  🥑 ${baseFat}g Béo"

        var selectedMealType = "lunch" // breakfast, lunch, dinner

        fun updateMealChips(selected: String) {
            selectedMealType = selected
            val chips = listOf(chipBreakfast to "breakfast", chipLunch to "lunch", chipDinner to "dinner")
            chips.forEach { (chip, type) ->
                if (type == selected) {
                    chip.background = ContextCompat.getDrawable(this, R.drawable.bg_subtab_pill_active)
                    chip.setTextColor(ContextCompat.getColor(this, R.color.white))
                } else {
                    chip.background = ContextCompat.getDrawable(this, R.drawable.bg_subtab_pill_inactive)
                    chip.setTextColor(ContextCompat.getColor(this, R.color.subtab_pill_inactive_text))
                }
            }
        }

        chipBreakfast.setOnClickListener { updateMealChips("breakfast") }
        chipLunch.setOnClickListener { updateMealChips("lunch") }
        chipDinner.setOnClickListener { updateMealChips("dinner") }

        val dialog = AlertDialog.Builder(this)
            .setView(view)
            .create()

        dialog.window?.setBackgroundDrawableResource(android.R.color.transparent)

        btnClose.setOnClickListener { dialog.dismiss() }

        btnAddMeal.setOnClickListener {
            currentTotalCalories += baseCalories
            currentProtein += baseProtein
            currentCarb += baseCarb
            currentFat += baseFat
            updateNutritionDisplay()

            // Add dynamic card into corresponding container
            val targetContainer = when (selectedMealType) {
                "breakfast" -> binding.llContainerBreakfast
                "dinner" -> binding.llContainerDinner
                else -> binding.llContainerLunch
            }

            val mealLabel = when (selectedMealType) {
                "breakfast" -> "Bữa sáng"
                "dinner" -> "Bữa tối"
                else -> "Bữa trưa"
            }

            val newMealView = LinearLayout(this).apply {
                layoutParams = LinearLayout.LayoutParams(
                    LinearLayout.LayoutParams.MATCH_PARENT,
                    LinearLayout.LayoutParams.WRAP_CONTENT
                ).apply { topMargin = 8 }
                background = ContextCompat.getDrawable(this@BodyMetricsActivity, R.drawable.bg_tag_chip)
                orientation = LinearLayout.HORIZONTAL
                gravity = android.view.Gravity.CENTER_VERTICAL
                setPadding(24, 20, 24, 20)
                isClickable = true
                isFocusable = true
            }

            val infoLayout = LinearLayout(this).apply {
                layoutParams = LinearLayout.LayoutParams(0, LinearLayout.LayoutParams.WRAP_CONTENT, 1f)
                orientation = LinearLayout.VERTICAL
            }

            val tvTitle = TextView(this).apply {
                text = name
                setTextColor(ContextCompat.getColor(this@BodyMetricsActivity, R.color.text_dark))
                textSize = 12.5f
                typeface = android.graphics.Typeface.DEFAULT_BOLD
            }

            val tvDesc = TextView(this).apply {
                text = "$baseCalories kcal • ${baseProtein}g Protein • ${baseCarb}g Carb"
                setTextColor(ContextCompat.getColor(this@BodyMetricsActivity, R.color.text_slate))
                textSize = 11f
            }

            infoLayout.addView(tvTitle)
            infoLayout.addView(tvDesc)

            val tvEditBadge = TextView(this).apply {
                text = "Chỉnh ⚙️"
                setTextColor(ContextCompat.getColor(this@BodyMetricsActivity, R.color.primary))
                textSize = 10.5f
                typeface = android.graphics.Typeface.DEFAULT_BOLD
                background = ContextCompat.getDrawable(this@BodyMetricsActivity, R.drawable.bg_card_selectable)
                setPadding(16, 8, 16, 8)
            }

            newMealView.addView(infoLayout)
            newMealView.addView(tvEditBadge)

            newMealView.setOnClickListener {
                showMealPortionEditDialog(name, mealLabel, baseCalories, baseProtein, baseCarb, baseFat, tvTitle, tvDesc)
            }

            targetContainer.addView(newMealView)

            Toast.makeText(
                this,
                "✓ Đã thêm $name vào $mealLabel!",
                Toast.LENGTH_SHORT
            ).show()

            dialog.dismiss()
        }

        dialog.show()
    }

    private fun initNutritionData() {
        session.checkAndResetDailyNutrition()
        currentTotalCalories = session.loggedCalories
        currentProtein = session.loggedProtein
        currentCarb = session.loggedCarbs
        currentFat = session.loggedFat
        updateNutritionDisplay()
        renderNutritionHistory()
    }

    private fun updateNutritionDisplay() {
        binding.tvCalorieGoal.text = "$currentTotalCalories kcal"
        binding.tvProteinMacro.text = String.format(Locale.US, "Đạm: %dg / 160g", currentProtein)
        binding.pbProtein.progress = minOf(currentProtein, binding.pbProtein.max)
        binding.tvCarbMacro.text = String.format(Locale.US, "Carb: %dg / 240g", currentCarb)
        binding.pbCarb.progress = minOf(currentCarb, binding.pbCarb.max)
        binding.tvFatMacro.text = String.format(Locale.US, "Fat: %dg / 65g", currentFat)
        binding.pbFat.progress = minOf(currentFat, binding.pbFat.max)

        val mealsVis = if (currentTotalCalories > 0) View.VISIBLE else View.GONE
        binding.itemMealBreakfast1.visibility = mealsVis
        binding.itemMealLunch1.visibility = mealsVis
        binding.itemMealDinner1.visibility = mealsVis

        session.loggedCalories = currentTotalCalories
        session.loggedProtein = currentProtein
        session.loggedCarbs = currentCarb
        session.loggedFat = currentFat
    }

    private fun renderNutritionHistory() {
        binding.llNutritionHistoryList.removeAllViews()
        val raw = session.nutritionHistoryRaw
        if (raw.isBlank()) {
            val emptyTv = TextView(this).apply {
                text = "Chưa có lịch sử các ngày trước"
                setTextColor(ContextCompat.getColor(this@BodyMetricsActivity, R.color.text_slate_light))
                textSize = 11.5f
            }
            binding.llNutritionHistoryList.addView(emptyTv)
            return
        }

        val entries = raw.split(";").filter { it.isNotBlank() }
        entries.forEach { entry ->
            val parts = entry.split("|")
            if (parts.size >= 5) {
                val date = parts[0]
                val cal = parts[1]
                val p = parts[2]
                val c = parts[3]
                val f = parts[4]

                val row = LinearLayout(this).apply {
                    layoutParams = LinearLayout.LayoutParams(
                        LinearLayout.LayoutParams.MATCH_PARENT,
                        LinearLayout.LayoutParams.WRAP_CONTENT
                    ).apply { topMargin = 8 }
                    background = ContextCompat.getDrawable(this@BodyMetricsActivity, R.drawable.bg_tag_chip)
                    orientation = LinearLayout.HORIZONTAL
                    gravity = android.view.Gravity.CENTER_VERTICAL
                    setPadding(20, 14, 20, 14)
                    isClickable = true
                    isFocusable = true
                    setOnClickListener {
                        showDayNutritionDetailDialog(date, cal, p, c, f)
                    }
                }

                val tvDate = TextView(this).apply {
                    text = "📅 Ngày $date"
                    setTextColor(ContextCompat.getColor(this@BodyMetricsActivity, R.color.text_dark))
                    textSize = 12f
                    typeface = android.graphics.Typeface.DEFAULT_BOLD
                    layoutParams = LinearLayout.LayoutParams(0, LinearLayout.LayoutParams.WRAP_CONTENT, 1f)
                }

                val tvCal = TextView(this).apply {
                    text = "$cal kcal  (Xem chi tiết >)"
                    setTextColor(ContextCompat.getColor(this@BodyMetricsActivity, R.color.primary))
                    textSize = 11.5f
                    typeface = android.graphics.Typeface.DEFAULT_BOLD
                }

                row.addView(tvDate)
                row.addView(tvCal)
                binding.llNutritionHistoryList.addView(row)
            }
        }

        binding.btnViewHistoryDetail.setOnClickListener {
            if (entries.isNotEmpty()) {
                val first = entries[0].split("|")
                if (first.size >= 5) {
                    showDayNutritionDetailDialog(first[0], first[1], first[2], first[3], first[4])
                }
            } else {
                Toast.makeText(this, "Chưa có lịch sử ngày trước", Toast.LENGTH_SHORT).show()
            }
        }
    }

    private fun showDayNutritionDetailDialog(date: String, cal: String, p: String, c: String, f: String) {
        AlertDialog.Builder(this)
            .setTitle("Chi tiết dinh dưỡng ngày $date")
            .setMessage("⚡ Tổng năng lượng nạp: $cal kcal\n🍗 Chất đạm (Protein): ${p}g\n🍚 Tinh bột (Carbohydrate): ${c}g\n🥑 Chất béo (Fat): ${f}g")
            .setPositiveButton("Đóng", null)
            .show()
    }

    private fun setupNutritionActions() {
        binding.btnAddMeal.setOnClickListener {
            startActivity(Intent(this, LogMealModalActivity::class.java))
        }

        binding.btnCreateCombo.setOnClickListener {
            showCreateComboDialog()
        }
    }

    private fun showCreateComboDialog() {
        val view = LayoutInflater.from(this).inflate(R.layout.dialog_create_combo, null, false)
        val tabDataset = view.findViewById<TextView>(R.id.tab_mode_dataset)
        val tabManual = view.findViewById<TextView>(R.id.tab_mode_manual)
        val layoutDataset = view.findViewById<View>(R.id.layout_dataset_selection)
        val layoutManual = view.findViewById<View>(R.id.layout_manual_input)

        val etName = view.findViewById<android.widget.EditText>(R.id.et_new_combo_name)
        val etItems = view.findViewById<android.widget.EditText>(R.id.et_new_combo_items)
        val etCal = view.findViewById<android.widget.EditText>(R.id.et_new_combo_cal)
        val etP = view.findViewById<android.widget.EditText>(R.id.et_new_combo_protein)
        val etC = view.findViewById<android.widget.EditText>(R.id.et_new_combo_carb)
        val etF = view.findViewById<android.widget.EditText>(R.id.et_new_combo_fat)
        val tvSummary = view.findViewById<TextView>(R.id.tv_combo_calculated_summary)

        // Checkboxes in Dataset Mode
        val cbChicken = view.findViewById<android.widget.CheckBox>(R.id.cb_item_chicken)
        val cbEgg = view.findViewById<android.widget.CheckBox>(R.id.cb_item_egg)
        val cbBrownRice = view.findViewById<android.widget.CheckBox>(R.id.cb_item_brown_rice)
        val cbBeef = view.findViewById<android.widget.CheckBox>(R.id.cb_item_beef)
        val cbSweetPotato = view.findViewById<android.widget.CheckBox>(R.id.cb_item_sweet_potato)
        val cbAvocado = view.findViewById<android.widget.CheckBox>(R.id.cb_item_avocado)
        val cbBanana = view.findViewById<android.widget.CheckBox>(R.id.cb_item_banana)
        val cbWhey = view.findViewById<android.widget.CheckBox>(R.id.cb_item_whey)
        val cbVeggies = view.findViewById<android.widget.CheckBox>(R.id.cb_item_veggies)

        var isDatasetMode = true

        fun recomputeDatasetCombo(): Triple<Int, Int, Pair<Int, Int>> {
            var cals = 0
            var prot = 0
            var carbs = 0
            var fat = 0

            if (cbChicken.isChecked) { cals += 165; prot += 31; fat += 4 }
            if (cbEgg.isChecked) { cals += 78; prot += 6; fat += 5 }
            if (cbBrownRice.isChecked) { cals += 165; prot += 4; carbs += 35 }
            if (cbBeef.isChecked) { cals += 250; prot += 39; fat += 10 }
            if (cbSweetPotato.isChecked) { cals += 130; prot += 2; carbs += 30 }
            if (cbAvocado.isChecked) { cals += 80; prot += 1; carbs += 4; fat += 7 }
            if (cbBanana.isChecked) { cals += 105; prot += 1; carbs += 27 }
            if (cbWhey.isChecked) { cals += 120; prot += 25; carbs += 3; fat += 1 }
            if (cbVeggies.isChecked) { cals += 50; prot += 3; carbs += 8 }

            tvSummary.text = "⚡ Tổng combo: $cals kcal • ${prot}g Đạm • ${carbs}g Carb • ${fat}g Béo"
            etCal.setText(cals.toString())
            etP.setText(prot.toString())
            etC.setText(carbs.toString())
            etF.setText(fat.toString())

            return Triple(cals, prot, Pair(carbs, fat))
        }

        val checkBoxes = listOf(cbChicken, cbEgg, cbBrownRice, cbBeef, cbSweetPotato, cbAvocado, cbBanana, cbWhey, cbVeggies)
        checkBoxes.forEach { cb ->
            cb.setOnCheckedChangeListener { _, _ -> recomputeDatasetCombo() }
        }
        recomputeDatasetCombo()

        tabDataset.setOnClickListener {
            isDatasetMode = true
            tabDataset.background = ContextCompat.getDrawable(this, R.drawable.bg_subtab_pill_active)
            tabDataset.setTextColor(ContextCompat.getColor(this, R.color.white))
            tabManual.background = ContextCompat.getDrawable(this, R.drawable.bg_subtab_pill_inactive)
            tabManual.setTextColor(ContextCompat.getColor(this, R.color.subtab_pill_inactive_text))

            layoutDataset.visibility = View.VISIBLE
            layoutManual.visibility = View.GONE
            recomputeDatasetCombo()
        }

        tabManual.setOnClickListener {
            isDatasetMode = false
            tabManual.background = ContextCompat.getDrawable(this, R.drawable.bg_subtab_pill_active)
            tabManual.setTextColor(ContextCompat.getColor(this, R.color.white))
            tabDataset.background = ContextCompat.getDrawable(this, R.drawable.bg_subtab_pill_inactive)
            tabDataset.setTextColor(ContextCompat.getColor(this, R.color.subtab_pill_inactive_text))

            layoutDataset.visibility = View.GONE
            layoutManual.visibility = View.VISIBLE
        }

        val btnCancel = view.findViewById<com.google.android.material.button.MaterialButton>(R.id.btn_create_combo_cancel)
        val btnSave = view.findViewById<com.google.android.material.button.MaterialButton>(R.id.btn_create_combo_save)

        val dialog = AlertDialog.Builder(this)
            .setView(view)
            .create()

        dialog.window?.setBackgroundDrawableResource(android.R.color.transparent)

        btnCancel.setOnClickListener { dialog.dismiss() }

        btnSave.setOnClickListener {
            val comboName = etName.text.toString().trim()
            if (comboName.isEmpty()) {
                Toast.makeText(this, "Vui lòng nhập tên combo!", Toast.LENGTH_SHORT).show()
                return@setOnClickListener
            }

            val cal: Int
            val p: Int
            val c: Int
            val f: Int
            val itemsText: String

            if (isDatasetMode) {
                val (computedCal, computedP, carbsAndFat) = recomputeDatasetCombo()
                cal = computedCal
                p = computedP
                c = carbsAndFat.first
                f = carbsAndFat.second

                val selectedNames = mutableListOf<String>()
                if (cbChicken.isChecked) selectedNames.add("Ức gà áp chảo (100g)")
                if (cbEgg.isChecked) selectedNames.add("Trứng gà luộc (1 quả)")
                if (cbBrownRice.isChecked) selectedNames.add("Cơm gạo lứt (150g)")
                if (cbBeef.isChecked) selectedNames.add("Thịt bò nạc xào (150g)")
                if (cbSweetPotato.isChecked) selectedNames.add("Khoai lang luộc (150g)")
                if (cbAvocado.isChecked) selectedNames.add("Bơ sáp (50g)")
                if (cbBanana.isChecked) selectedNames.add("Chuối tiêu (1 quả)")
                if (cbWhey.isChecked) selectedNames.add("Whey Protein (1 muỗng)")
                if (cbVeggies.isChecked) selectedNames.add("Bông cải xanh (150g)")

                itemsText = if (selectedNames.isNotEmpty()) selectedNames.joinToString(" + ") else "Khẩu phần tự chọn"
            } else {
                itemsText = etItems.text.toString().trim().ifEmpty { "Khẩu phần tự chọn" }
                cal = etCal.text.toString().toIntOrNull() ?: 500
                p = etP.text.toString().toIntOrNull() ?: 40
                c = etC.text.toString().toIntOrNull() ?: 50
                f = etF.text.toString().toIntOrNull() ?: 12
            }

            // Add new combo view to card_preset_combos
            val newComboCard = LinearLayout(this).apply {
                layoutParams = LinearLayout.LayoutParams(
                    LinearLayout.LayoutParams.MATCH_PARENT,
                    LinearLayout.LayoutParams.WRAP_CONTENT
                ).apply { topMargin = 8 }
                background = ContextCompat.getDrawable(this@BodyMetricsActivity, R.drawable.bg_tag_chip)
                orientation = LinearLayout.VERTICAL
                setPadding(24, 20, 24, 20)
                isClickable = true
                isFocusable = true
            }

            val tvCardTitle = TextView(this).apply {
                text = "✨ $comboName ($cal kcal • ${p}g Protein)"
                setTextColor(ContextCompat.getColor(this@BodyMetricsActivity, R.color.primary))
                textSize = 12f
                typeface = android.graphics.Typeface.DEFAULT_BOLD
            }

            val tvCardDesc = TextView(this).apply {
                text = itemsText
                setTextColor(ContextCompat.getColor(this@BodyMetricsActivity, R.color.text_dark))
                textSize = 11f
                layoutParams = LinearLayout.LayoutParams(
                    LinearLayout.LayoutParams.WRAP_CONTENT,
                    LinearLayout.LayoutParams.WRAP_CONTENT
                ).apply { topMargin = 4 }
            }

            newComboCard.addView(tvCardTitle)
            newComboCard.addView(tvCardDesc)

            newComboCard.setOnClickListener {
                showComboDetailDialog(
                    name = "✨ $comboName",
                    baseCalories = cal,
                    baseProtein = p,
                    baseCarb = c,
                    baseFat = f,
                    items = listOf(itemsText)
                )
            }

            binding.cardPresetCombos.addView(newComboCard)

            Toast.makeText(this, "✓ Đã tạo thành công combo: $comboName!", Toast.LENGTH_SHORT).show()
            dialog.dismiss()
        }

        dialog.show()
    }

    private fun setupBottomNav() {
        binding.bottomNavigation.setupBottomNav(this, BottomNavTab.METRICS)
    }
}
