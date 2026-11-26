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
    private var isBodyFatChart = false
    private var loadedMetricsList: List<com.fittrack.app.data.models.BodyMetricDto> = emptyList()

    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)
        binding = ActivityBodyMetricsBinding.inflate(layoutInflater)
        setContentView(binding.root)

        WindowInsetsHelper.applySystemInsets(this, binding.root, binding.layoutHeader, binding.bottomNavigation.root)

        session = SessionManager.getInstance(this)

        setupSubTabs()
        setupMetricsActions()
        setupNutritionActions()
        setupCombos()
        renderSavedCombos()
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
                    val hiddenIds = session.getHiddenMetricIds()
                    val rawList = res.body()!!.data!!.filter { it.id !in hiddenIds }
                    loadedMetricsList = rawList
                    if (rawList.isNotEmpty()) {
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

                        val displayFat = latest.bodyFatPct ?: estimateBodyFat(bmi)
                        binding.tvMetricFatVal.text = String.format(Locale.US, "%.1f%%", displayFat)
                        updateMetricsChart()
                        renderMetricHistory()
                    }
                }
            } catch (_: Exception) {
                // Giữ nguyên giao diện offline
            }

            // 2. Đồng bộ Nutrition Logs từ API
            try {
                val nutRes = withContext(Dispatchers.IO) { api.getNutritionLogs() }
                if (nutRes.isSuccessful && nutRes.body()?.data != null) {
                    val allLogs = nutRes.body()!!.data!!
                    val todayStr = java.text.SimpleDateFormat("yyyy-MM-dd", Locale.US).format(java.util.Date())
                    val todayLogs = allLogs.filter { it.logDate.isNullOrBlank() || it.logDate.startsWith(todayStr) }
                    renderNutritionLogsFromApi(todayLogs)
                }
            } catch (_: Exception) {
                // Giữ nguyên giao diện offline
            }
        }
    }

    private fun estimateBodyFat(bmi: Double): Double {
        val isMale = session.userGender.equals("male", ignoreCase = true)
        val sexFactor = if (isMale) 1 else 0
        return (1.20 * bmi + 0.23 * 22 - 10.8 * sexFactor - 5.4).coerceIn(5.0, 50.0)
    }

    private fun setupMetricsActions() {
        binding.btnLogMetrics.setOnClickListener {
            startActivity(Intent(this, LogMetricsModalActivity::class.java))
        }

        binding.btnToggleChartView.setOnClickListener {
            isBodyFatChart = !isBodyFatChart
            if (isBodyFatChart) {
                binding.tvChartTitle.text = "Xu hướng % Mỡ cơ thể"
                binding.btnToggleChartView.text = "🔄 Xem Cân nặng"
            } else {
                binding.tvChartTitle.text = getString(R.string.metric_trend_chart_title)
                binding.btnToggleChartView.text = "🔄 Xem % Mỡ"
            }
            updateMetricsChart()
        }
    }

    private fun updateMetricsChart() {
        if (loadedMetricsList.isEmpty()) return
        val chartPoints = loadedMetricsList.reversed().map { item ->
            val dateLabel = item.logDate?.let { if (it.length >= 10) it.substring(5, 10) else it } ?: "Gần đây"
            val value = if (isBodyFatChart) {
                val hM = (item.heightCm?.takeIf { it > 50.0 } ?: 175.0) / 100.0
                val bmi = item.weightKg / (hM * hM)
                (item.bodyFatPct ?: estimateBodyFat(bmi)).toFloat()
            } else {
                item.weightKg.toFloat()
            }
            Pair(dateLabel, value)
        }
        binding.chartWeightTrend.setData(chartPoints)
    }

    private fun renderMetricHistory() {
        val container = binding.llMetricHistoryContainer
        container.removeAllViews()
        binding.itemMetricHistory1.visibility = View.GONE
        binding.itemMetricHistory2.visibility = View.GONE
        if (loadedMetricsList.isEmpty()) {
            val tvEmpty = TextView(this).apply {
                text = "Chưa có lịch sử chỉ số cơ thể. Nhấn \"+ Ghi chỉ số\" để thêm bản ghi đầu tiên."
                setTextColor(ContextCompat.getColor(this@BodyMetricsActivity, R.color.text_slate))
                textSize = 12f
                setPadding(8, 20, 8, 8)
            }
            container.addView(tvEmpty)
            return
        }

        loadedMetricsList.forEach { item ->
            val hM = (item.heightCm?.takeIf { it > 50.0 } ?: 175.0) / 100.0
            val bmi = item.weightKg / (hM * hM)
            val fat = item.bodyFatPct ?: estimateBodyFat(bmi)
            val dateText = item.logDate?.take(10) ?: "Hôm nay"

            val row = LinearLayout(this).apply {
                layoutParams = LinearLayout.LayoutParams(
                    LinearLayout.LayoutParams.MATCH_PARENT,
                    LinearLayout.LayoutParams.WRAP_CONTENT
                ).apply { topMargin = 12 }
                background = ContextCompat.getDrawable(this@BodyMetricsActivity, R.drawable.bg_tag_chip)
                orientation = LinearLayout.HORIZONTAL
                gravity = android.view.Gravity.CENTER_VERTICAL
                setPadding(24, 18, 24, 18)
            }

            val infoCol = LinearLayout(this).apply {
                layoutParams = LinearLayout.LayoutParams(0, LinearLayout.LayoutParams.WRAP_CONTENT, 1f)
                orientation = LinearLayout.VERTICAL
            }

            val tvDate = TextView(this).apply {
                text = "📅 $dateText"
                setTextColor(ContextCompat.getColor(this@BodyMetricsActivity, R.color.text_dark))
                textSize = 12f
                typeface = android.graphics.Typeface.DEFAULT_BOLD
            }

            val tvVal = TextView(this).apply {
                text = String.format(Locale.US, "%.1f kg  •  BMI %.1f  •  %.1f%% mỡ", item.weightKg, bmi, fat)
                setTextColor(ContextCompat.getColor(this@BodyMetricsActivity, R.color.text_slate))
                textSize = 11.5f
            }

            infoCol.addView(tvDate)
            infoCol.addView(tvVal)

            val btnDel = TextView(this).apply {
                text = "🗑️"
                textSize = 15f
                setPadding(16, 8, 8, 8)
                setOnClickListener {
                    AlertDialog.Builder(this@BodyMetricsActivity)
                        .setTitle("Ẩn bản ghi $dateText?")
                        .setMessage("Xóa bản ghi ${item.weightKg} kg khỏi lịch sử trên thiết bị?")
                        .setPositiveButton("Xóa") { _, _ ->
                            session.hideMetricId(item.id)
                            loadedMetricsList = loadedMetricsList.filter { it.id != item.id }
                            updateMetricsChart()
                            renderMetricHistory()
                        }
                        .setNegativeButton("Hủy", null)
                        .show()
                }
            }

            row.addView(infoCol)
            row.addView(btnDel)
            container.addView(row)
        }
    }

    private fun renderNutritionLogsFromApi(logs: List<com.fittrack.app.data.models.NutritionLogDto>) {
        currentTotalCalories = logs.sumOf { it.calories }
        currentProtein = logs.sumOf { it.proteinGrams }.toInt()
        currentCarb = logs.sumOf { it.carbsGrams }.toInt()
        currentFat = logs.sumOf { it.fatGrams }.toInt()
        updateNutritionDisplay()

        val containers = listOf(
            binding.llContainerBreakfast,
            binding.llContainerLunch,
            binding.llContainerDinner,
            binding.llContainerSnack
        )
        containers.forEach { it.removeAllViews() }

        if (logs.isEmpty()) {
            binding.itemMealBreakfast1.visibility = View.GONE
            binding.itemMealLunch1.visibility = View.GONE
            binding.itemMealDinner1.visibility = View.GONE
            return
        }

        logs.forEach { log ->
            val targetContainer = when (log.mealType.lowercase(Locale.US)) {
                "breakfast" -> binding.llContainerBreakfast
                "lunch" -> binding.llContainerLunch
                "dinner" -> binding.llContainerDinner
                else -> binding.llContainerSnack
            }

            val row = LinearLayout(this).apply {
                layoutParams = LinearLayout.LayoutParams(
                    LinearLayout.LayoutParams.MATCH_PARENT,
                    LinearLayout.LayoutParams.WRAP_CONTENT
                ).apply { topMargin = 10 }
                background = ContextCompat.getDrawable(this@BodyMetricsActivity, R.drawable.bg_tag_chip)
                orientation = LinearLayout.HORIZONTAL
                gravity = android.view.Gravity.CENTER_VERTICAL
                setPadding(24, 18, 24, 18)
            }

            val infoCol = LinearLayout(this).apply {
                layoutParams = LinearLayout.LayoutParams(0, LinearLayout.LayoutParams.WRAP_CONTENT, 1f)
                orientation = LinearLayout.VERTICAL
            }

            val tvName = TextView(this).apply {
                text = log.foodName
                setTextColor(ContextCompat.getColor(this@BodyMetricsActivity, R.color.text_dark))
                textSize = 12.5f
                typeface = android.graphics.Typeface.DEFAULT_BOLD
            }

            val tvMacro = TextView(this).apply {
                text = "${log.calories} kcal • ${log.proteinGrams.toInt()}g P • ${log.carbsGrams.toInt()}g C • ${log.fatGrams.toInt()}g F"
                setTextColor(ContextCompat.getColor(this@BodyMetricsActivity, R.color.primary))
                textSize = 11f
            }

            infoCol.addView(tvName)
            infoCol.addView(tvMacro)

            val btnDelete = TextView(this).apply {
                text = "🗑️"
                textSize = 15f
                setPadding(16, 8, 8, 8)
                setOnClickListener {
                    lifecycleScope.launch {
                        try {
                            withContext(Dispatchers.IO) {
                                ApiClient.getService(this@BodyMetricsActivity).deleteNutritionLog(log.id)
                            }
                            Toast.makeText(this@BodyMetricsActivity, "✓ Đã xóa ${log.foodName}", Toast.LENGTH_SHORT).show()
                            fetchMetricsFromBackend()
                        } catch (_: Exception) {
                            Toast.makeText(this@BodyMetricsActivity, "Không thể xóa lúc này", Toast.LENGTH_SHORT).show()
                        }
                    }
                }
            }

            row.addView(infoCol)
            row.addView(btnDelete)
            targetContainer.addView(row)
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
            binding.tvTitle.text = "Dinh dưỡng"
            binding.btnLogMetrics.visibility = View.GONE
            binding.scrollBodyMetrics.visibility = View.GONE
            binding.scrollNutrition.visibility = View.VISIBLE

            binding.btnToNutrition.background = ContextCompat.getDrawable(this, R.drawable.bg_subtab_pill_active)
            binding.btnToNutrition.setTextColor(ContextCompat.getColor(this, R.color.white))

            binding.tabBodyMetrics.background = ContextCompat.getDrawable(this, R.drawable.bg_subtab_pill_inactive)
            binding.tabBodyMetrics.setTextColor(ContextCompat.getColor(this, R.color.subtab_pill_inactive_text))
        } else {
            binding.tvTitle.text = getString(R.string.metrics_title)
            binding.btnLogMetrics.visibility = View.VISIBLE
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

        binding.itemMealBreakfast1.visibility = View.GONE
        binding.itemMealLunch1.visibility = View.GONE
        binding.itemMealDinner1.visibility = View.GONE
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

            val mealLabel = when (selectedMealType) {
                "breakfast" -> "Bữa sáng"
                "dinner" -> "Bữa tối"
                else -> "Bữa trưa"
            }

            if (session.isLoggedIn) {
                val todayStr = java.text.SimpleDateFormat("yyyy-MM-dd", Locale.US).format(java.util.Date())
                lifecycleScope.launch {
                    try {
                        withContext(Dispatchers.IO) {
                            ApiClient.getService(this@BodyMetricsActivity).createNutritionLog(
                                idempotencyKey = java.util.UUID.randomUUID().toString(),
                                request = com.fittrack.app.data.models.CreateNutritionLogRequest(
                                    logDate = todayStr,
                                    mealType = selectedMealType,
                                    foodName = name,
                                    calories = baseCalories,
                                    proteinGrams = baseProtein.toDouble(),
                                    carbsGrams = baseCarb.toDouble(),
                                    fatGrams = baseFat.toDouble()
                                )
                            )
                        }
                        fetchMetricsFromBackend()
                    } catch (_: Exception) {
                        // Offline fallback already updated local totals
                    }
                }
            }

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

            val savedCombos = session.getSavedCombos()
            savedCombos.add(
                0,
                com.fittrack.app.data.models.SavedComboLocal(
                    id = "combo-${System.currentTimeMillis()}",
                    name = comboName,
                    calories = cal,
                    protein = p,
                    carbs = c,
                    fat = f,
                    itemsText = itemsText
                )
            )
            session.saveSavedCombos(savedCombos)
            renderSavedCombos()

            Toast.makeText(this, "✓ Đã lưu combo: $comboName!", Toast.LENGTH_SHORT).show()
            dialog.dismiss()
        }

        dialog.show()
    }

    private fun renderSavedCombos() {
        val container = binding.llSavedCombosContainer
        container.removeAllViews()
        val combos = session.getSavedCombos()
        combos.forEach { combo ->
            val card = LinearLayout(this).apply {
                layoutParams = LinearLayout.LayoutParams(
                    LinearLayout.LayoutParams.MATCH_PARENT,
                    LinearLayout.LayoutParams.WRAP_CONTENT
                ).apply { topMargin = 8 }
                background = ContextCompat.getDrawable(this@BodyMetricsActivity, R.drawable.bg_tag_chip)
                orientation = LinearLayout.HORIZONTAL
                gravity = android.view.Gravity.CENTER_VERTICAL
                setPadding(24, 18, 24, 18)
                isClickable = true
                isFocusable = true
            }

            val infoCol = LinearLayout(this).apply {
                layoutParams = LinearLayout.LayoutParams(0, LinearLayout.LayoutParams.WRAP_CONTENT, 1f)
                orientation = LinearLayout.VERTICAL
            }

            val tvTitle = TextView(this).apply {
                text = "✨ ${combo.name} (${combo.calories} kcal • ${combo.protein}g Protein)"
                setTextColor(ContextCompat.getColor(this@BodyMetricsActivity, R.color.primary))
                textSize = 12f
                typeface = android.graphics.Typeface.DEFAULT_BOLD
            }

            val tvDesc = TextView(this).apply {
                text = combo.itemsText
                setTextColor(ContextCompat.getColor(this@BodyMetricsActivity, R.color.text_dark))
                textSize = 11f
            }

            infoCol.addView(tvTitle)
            infoCol.addView(tvDesc)

            val btnDelete = TextView(this).apply {
                text = "🗑️"
                textSize = 15f
                setPadding(16, 8, 8, 8)
                setOnClickListener {
                    val updated = session.getSavedCombos().filter { it.id != combo.id }
                    session.saveSavedCombos(updated)
                    renderSavedCombos()
                    Toast.makeText(this@BodyMetricsActivity, "✓ Đã xóa combo ${combo.name}", Toast.LENGTH_SHORT).show()
                }
            }

            card.setOnClickListener {
                showComboDetailDialog(
                    name = "✨ ${combo.name}",
                    baseCalories = combo.calories,
                    baseProtein = combo.protein,
                    baseCarb = combo.carbs,
                    baseFat = combo.fat,
                    items = listOf(combo.itemsText)
                )
            }

            card.addView(infoCol)
            card.addView(btnDelete)
            container.addView(card)
        }
    }

    private fun setupBottomNav() {
        binding.bottomNavigation.setupBottomNav(this, BottomNavTab.METRICS)
    }
}
