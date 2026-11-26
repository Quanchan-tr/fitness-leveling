package com.fittrack.app.ui.workout

import android.os.Bundle
import android.view.View
import android.widget.TextView
import android.widget.Toast
import androidx.appcompat.app.AppCompatActivity
import androidx.core.content.ContextCompat
import androidx.lifecycle.lifecycleScope
import com.fittrack.app.R
import com.fittrack.app.data.api.ApiClient
import com.fittrack.app.data.models.CreateRoutineRequest
import com.fittrack.app.data.models.GenerateAiPlanRequest
import com.fittrack.app.data.session.SessionManager
import com.fittrack.app.databinding.ActivityAiWorkoutPlannerBinding
import kotlinx.coroutines.Dispatchers
import kotlinx.coroutines.launch
import kotlinx.coroutines.withContext
import java.util.UUID

class AiWorkoutPlannerActivity : AppCompatActivity() {

    private lateinit var binding: ActivityAiWorkoutPlannerBinding
    private lateinit var session: SessionManager

    // Split state: "PPL", "UL", "FB"
    private var selectedSplit = "PPL"
    // PPL sessions: 3 or 6
    private var selectedPplSessions = 3
    private var selectedDuration = 60
    private val selectedInjuries = mutableSetOf<String>()

    // Calendar Days
    private val allDays = listOf("T2", "T3", "T4", "T5", "T6", "T7", "CN")
    private val dayNames = mapOf(
        "T2" to "Thứ 2",
        "T3" to "Thứ 3",
        "T4" to "Thứ 4",
        "T5" to "Thứ 5",
        "T6" to "Thứ 6",
        "T7" to "Thứ 7",
        "CN" to "Chủ Nhật"
    )

    // User's selected days of the week (e.g. T2, T4, T6)
    private val selectedDays = sortedSetOf<String>(Comparator { a, b ->
        allDays.indexOf(a).compareTo(allDays.indexOf(b))
    })

    // Generated schedule map: DayKey -> Pair<RoutineName, List<ExerciseString>>
    private val generatedScheduleMap = mutableMapOf<String, Pair<String, List<String>>>()

    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)
        binding = ActivityAiWorkoutPlannerBinding.inflate(layoutInflater)
        setContentView(binding.root)

        session = SessionManager.getInstance(this)

        setDefaultDaysForSplit()
        setupListeners()
        updateDayChipsUi()
    }

    private fun getRequiredDaysCount(): Int {
        return when (selectedSplit) {
            "PPL" -> selectedPplSessions // 3 or 6
            "UL" -> 4                    // Fixed 4
            "FB" -> 3                    // Fixed 3
            else -> 3
        }
    }

    private fun setDefaultDaysForSplit() {
        selectedDays.clear()
        when (selectedSplit) {
            "PPL" -> {
                if (selectedPplSessions == 6) {
                    selectedDays.addAll(listOf("T2", "T3", "T4", "T5", "T6", "T7"))
                } else {
                    selectedDays.addAll(listOf("T2", "T4", "T6"))
                }
            }
            "UL" -> {
                selectedDays.addAll(listOf("T2", "T3", "T5", "T6"))
            }
            "FB" -> {
                selectedDays.addAll(listOf("T2", "T4", "T6"))
            }
        }
    }

    private fun getDayChipViews(): Map<String, TextView> {
        return mapOf(
            "T2" to binding.chipDayMon,
            "T3" to binding.chipDayTue,
            "T4" to binding.chipDayWed,
            "T5" to binding.chipDayThu,
            "T6" to binding.chipDayFri,
            "T7" to binding.chipDaySat,
            "CN" to binding.chipDaySun
        )
    }

    private fun updateDayChipsUi() {
        val chipViews = getDayChipViews()
        val target = getRequiredDaysCount()

        chipViews.forEach { (key, chip) ->
            if (selectedDays.contains(key)) {
                chip.background = ContextCompat.getDrawable(this, R.drawable.bg_subtab_pill_active)
                chip.setTextColor(ContextCompat.getColor(this, R.color.white))
            } else {
                chip.background = ContextCompat.getDrawable(this, R.drawable.bg_subtab_pill_inactive)
                chip.setTextColor(ContextCompat.getColor(this, R.color.text_dark))
            }
        }

        if (selectedDays.size == target) {
            binding.tvSelectedDaysBadge.text = "Đã chọn: $target / $target ngày"
            binding.tvSelectedDaysBadge.background = ContextCompat.getDrawable(this, R.drawable.bg_badge_streak)
            binding.tvSelectedDaysBadge.setTextColor(ContextCompat.getColor(this, R.color.badge_streak_text))
        } else {
            val diff = target - selectedDays.size
            val hint = if (diff > 0) "Thiếu $diff ngày" else "Thừa ${-diff} ngày"
            binding.tvSelectedDaysBadge.text = "Cần $target ngày • $hint (${selectedDays.size}/$target)"
            binding.tvSelectedDaysBadge.background = ContextCompat.getDrawable(this, R.drawable.bg_card_selectable)
            binding.tvSelectedDaysBadge.setTextColor(ContextCompat.getColor(this, R.color.primary))
        }
    }

    private fun setupListeners() {
        binding.btnBack.setOnClickListener { finish() }

        // Split strategy selection
        binding.optSplitPpl.setOnClickListener {
            selectedSplit = "PPL"
            binding.layoutPplFreqToggle.visibility = View.VISIBLE
            highlightSplit(binding.optSplitPpl, binding.tvSplitPplTitle, binding.tvSplitPplDesc)
            resetSplit(binding.optSplitUpperLower, binding.tvSplitUlTitle, binding.tvSplitUlDesc)
            resetSplit(binding.optSplitFullbody, binding.tvSplitFbTitle, binding.tvSplitFbDesc)
            setDefaultDaysForSplit()
            updateDayChipsUi()
        }

        binding.optSplitUpperLower.setOnClickListener {
            selectedSplit = "UL"
            binding.layoutPplFreqToggle.visibility = View.GONE
            highlightSplit(binding.optSplitUpperLower, binding.tvSplitUlTitle, binding.tvSplitUlDesc)
            resetSplit(binding.optSplitPpl, binding.tvSplitPplTitle, binding.tvSplitPplDesc)
            resetSplit(binding.optSplitFullbody, binding.tvSplitFbTitle, binding.tvSplitFbDesc)
            setDefaultDaysForSplit()
            updateDayChipsUi()
        }

        binding.optSplitFullbody.setOnClickListener {
            selectedSplit = "FB"
            binding.layoutPplFreqToggle.visibility = View.GONE
            highlightSplit(binding.optSplitFullbody, binding.tvSplitFbTitle, binding.tvSplitFbDesc)
            resetSplit(binding.optSplitPpl, binding.tvSplitPplTitle, binding.tvSplitPplDesc)
            resetSplit(binding.optSplitUpperLower, binding.tvSplitUlTitle, binding.tvSplitUlDesc)
            setDefaultDaysForSplit()
            updateDayChipsUi()
        }

        // PPL 3 vs 6 sessions sub-toggle
        binding.chipPpl3Sessions.setOnClickListener {
            selectedPplSessions = 3
            binding.chipPpl3Sessions.background = ContextCompat.getDrawable(this, R.drawable.bg_subtab_pill_active)
            binding.chipPpl3Sessions.setTextColor(ContextCompat.getColor(this, R.color.white))
            binding.chipPpl6Sessions.background = ContextCompat.getDrawable(this, R.drawable.bg_subtab_pill_inactive)
            binding.chipPpl6Sessions.setTextColor(ContextCompat.getColor(this, R.color.text_dark))
            setDefaultDaysForSplit()
            updateDayChipsUi()
        }

        binding.chipPpl6Sessions.setOnClickListener {
            selectedPplSessions = 6
            binding.chipPpl6Sessions.background = ContextCompat.getDrawable(this, R.drawable.bg_subtab_pill_active)
            binding.chipPpl6Sessions.setTextColor(ContextCompat.getColor(this, R.color.white))
            binding.chipPpl3Sessions.background = ContextCompat.getDrawable(this, R.drawable.bg_subtab_pill_inactive)
            binding.chipPpl3Sessions.setTextColor(ContextCompat.getColor(this, R.color.text_dark))
            setDefaultDaysForSplit()
            updateDayChipsUi()
        }

        // 7 Day of Week selection chips
        val chipViews = getDayChipViews()
        chipViews.forEach { (dayKey, chip) ->
            chip.setOnClickListener {
                val target = getRequiredDaysCount()
                if (selectedDays.contains(dayKey)) {
                    selectedDays.remove(dayKey)
                    updateDayChipsUi()
                } else {
                    if (selectedDays.size < target) {
                        selectedDays.add(dayKey)
                        updateDayChipsUi()
                    } else {
                        val name = dayNames[dayKey] ?: dayKey
                        Toast.makeText(this, "Đã chọn đủ $target ngày! Bỏ chọn một thứ khác để đổi sang $name.", Toast.LENGTH_SHORT).show()
                    }
                }
            }
        }

        // Duration chips (30, 45, 60, 75, 90 mins)
        val durChips = listOf(
            binding.chipDur30 to 30,
            binding.chipDur45 to 45,
            binding.chipDur60 to 60,
            binding.chipDur75 to 75,
            binding.chipDur90 to 90
        )
        durChips.forEach { (chip, dur) ->
            chip.setOnClickListener {
                selectedDuration = dur
                durChips.forEach { (c, d) ->
                    if (d == selectedDuration) {
                        c.background = ContextCompat.getDrawable(this, R.drawable.bg_subtab_pill_active)
                        c.setTextColor(ContextCompat.getColor(this, R.color.white))
                    } else {
                        c.background = ContextCompat.getDrawable(this, R.drawable.bg_subtab_pill_inactive)
                        c.setTextColor(ContextCompat.getColor(this, R.color.text_dark))
                    }
                }
            }
        }

        // Injury exclusion toggles
        setupInjuryToggle(binding.chipInjKnee, "knee")
        setupInjuryToggle(binding.chipInjShoulder, "shoulder")
        setupInjuryToggle(binding.chipInjBack, "back")

        // Generate Plan CTA via Real AI API
        binding.btnGeneratePlan.setOnClickListener {
            val target = getRequiredDaysCount()
            if (selectedDays.size != target) {
                Toast.makeText(this, "Vui lòng chọn đúng $target thứ trong tuần để tập (hiện có ${selectedDays.size} ngày)!", Toast.LENGTH_SHORT).show()
                return@setOnClickListener
            }

            binding.layoutAiLoading.visibility = View.VISIBLE
            binding.layoutPlanResult.visibility = View.GONE
            binding.btnGeneratePlan.isEnabled = false

            lifecycleScope.launch {
                try {
                    val api = ApiClient.getService(this@AiWorkoutPlannerActivity)
                    val response = withContext(Dispatchers.IO) {
                        api.generateExercisePlan(
                            idempotencyKey = UUID.randomUUID().toString(),
                            request = GenerateAiPlanRequest(
                                goal = session.userGoal,
                                splitType = when (selectedSplit) {
                                    "UL" -> "upper_lower"
                                    "FB" -> "full_body"
                                    else -> "ppl"
                                },
                                daysPerWeek = target,
                                durationMinutes = selectedDuration,
                                equipment = "all",
                                injuries = selectedInjuries.toList()
                            )
                        )
                    }

                    binding.layoutAiLoading.visibility = View.GONE
                    binding.btnGeneratePlan.isEnabled = true

                    if (response.isSuccessful && response.body()?.data != null) {
                        binding.layoutPlanResult.visibility = View.VISIBLE
                        renderPlanResults(response.body()!!.data)
                        Toast.makeText(this@AiWorkoutPlannerActivity, "Đã sinh giáo án luyện tập từ AI!", Toast.LENGTH_SHORT).show()
                    } else {
                        Toast.makeText(this@AiWorkoutPlannerActivity, "Không thể tạo giáo án (${response.code()}). Vui lòng thử lại.", Toast.LENGTH_SHORT).show()
                    }
                } catch (_: Exception) {
                    binding.layoutAiLoading.visibility = View.GONE
                    binding.btnGeneratePlan.isEnabled = true
                    Toast.makeText(this@AiWorkoutPlannerActivity, "Không thể kết nối máy chủ AI. Vui lòng thử lại sau.", Toast.LENGTH_SHORT).show()
                }
            }
        }

        // Apply Schedule & Save to Weekly Calendar
        binding.btnApplySchedule.setOnClickListener {
            val target = getRequiredDaysCount()
            if (selectedDays.size != target) {
                Toast.makeText(this, "Vui lòng chọn đúng $target ngày trước khi áp dụng!", Toast.LENGTH_SHORT).show()
                return@setOnClickListener
            }

            binding.btnApplySchedule.isEnabled = false
            lifecycleScope.launch {
                try {
                    // Update SessionManager weekly schedule for each of the 7 days
                    allDays.forEach { dayKey ->
                        val routine = generatedScheduleMap[dayKey]
                        if (routine != null) {
                            session.setScheduleForDay(dayKey, listOf(routine.first))
                        } else {
                            session.setScheduleForDay(dayKey, emptyList())
                        }
                    }

                    // Sync to VPS backend routines if connected
                    val daysList = selectedDays.map { dayKey ->
                        when (dayKey) {
                            "T2" -> "monday"
                            "T3" -> "tuesday"
                            "T4" -> "wednesday"
                            "T5" -> "thursday"
                            "T6" -> "friday"
                            "T7" -> "saturday"
                            "CN" -> "sunday"
                            else -> "monday"
                        }
                    }

                    val splitName = when (selectedSplit) {
                        "PPL" -> "PPL $selectedPplSessions buổi"
                        "UL" -> "Upper/Lower 4 buổi"
                        else -> "Full Body 3 buổi"
                    }

                    withContext(Dispatchers.IO) {
                        try {
                            ApiClient.getService(this@AiWorkoutPlannerActivity).createRoutine(
                                idempotencyKey = UUID.randomUUID().toString(),
                                request = CreateRoutineRequest(
                                    title = "Giáo án AI ($splitName)",
                                    description = "Giáo án tự động tạo bởi FitTrack AI cho thời lượng $selectedDuration phút",
                                    targetSplit = selectedSplit.lowercase(),
                                    scheduleDays = daysList,
                                    isActive = true
                                )
                            )
                        } catch (_: Exception) {
                            // Offline or network error handled gracefully
                        }
                    }

                    val chosenDayLabels = selectedDays.map { dayNames[it] ?: it }.joinToString(", ")
                    Toast.makeText(this@AiWorkoutPlannerActivity, "✓ Đã áp dụng giáo án $splitName vào $chosenDayLabels!", Toast.LENGTH_LONG).show()
                } catch (_: Exception) {
                    Toast.makeText(this@AiWorkoutPlannerActivity, "✓ Đã áp dụng giáo án vào lịch tuần!", Toast.LENGTH_SHORT).show()
                } finally {
                    finish()
                }
            }
        }
    }

    private fun highlightSplit(layout: View, title: TextView, desc: TextView) {
        layout.background = ContextCompat.getDrawable(this, R.drawable.bg_subtab_pill_active)
        title.setTextColor(ContextCompat.getColor(this, R.color.white))
        desc.setTextColor(ContextCompat.getColor(this, R.color.slate_200))
    }

    private fun resetSplit(layout: View, title: TextView, desc: TextView) {
        layout.background = ContextCompat.getDrawable(this, R.drawable.bg_card_selectable)
        title.setTextColor(ContextCompat.getColor(this, R.color.text_dark))
        desc.setTextColor(ContextCompat.getColor(this, R.color.text_slate))
    }

    private fun setupInjuryToggle(chip: TextView, key: String) {
        chip.setOnClickListener {
            if (selectedInjuries.contains(key)) {
                selectedInjuries.remove(key)
                chip.background = ContextCompat.getDrawable(this, R.drawable.bg_card_selectable)
                chip.setTextColor(ContextCompat.getColor(this, R.color.text_dark))
            } else {
                selectedInjuries.add(key)
                chip.background = ContextCompat.getDrawable(this, R.drawable.bg_badge_streak)
                chip.setTextColor(ContextCompat.getColor(this, R.color.badge_streak_text))
            }
        }
    }

    private fun renderPlanResults(data: Any?) {
        binding.llGeneratedSessionsContainer.removeAllViews()

        val gson = com.google.gson.Gson()
        val jsonObj = try {
            com.google.gson.JsonParser.parseString(gson.toJson(data)).asJsonObject
        } catch (_: Exception) {
            null
        }

        val planName = jsonObj?.get("plan_name")?.takeIf { !it.isJsonNull }?.asString
        val splitName = planName ?: when (selectedSplit) {
            "PPL" -> "Push / Pull / Legs ($selectedPplSessions buổi/tuần)"
            "UL" -> "Upper / Lower (4 buổi/tuần)"
            else -> "Full Body Toàn thân (3 buổi/tuần)"
        }
        binding.tvResultSummary.text = "$splitName • $selectedDuration phút/buổi"

        val apiSessions = mutableListOf<Pair<String, List<String>>>()
        val sessionsJson = jsonObj?.getAsJsonArray("sessions")
        sessionsJson?.forEach { elem ->
            val obj = elem.asJsonObject
            val isRest = obj.get("is_rest")?.takeIf { !it.isJsonNull }?.asBoolean ?: false
            if (!isRest) {
                val title = obj.get("session_title")?.takeIf { !it.isJsonNull }?.asString ?: "Buổi tập"
                val exList = mutableListOf<String>()
                obj.getAsJsonArray("exercises")?.forEach { exElem ->
                    val exObj = exElem.asJsonObject
                    val exName = exObj.get("name")?.takeIf { !it.isJsonNull }?.asString
                        ?: exObj.get("exercise_name")?.takeIf { !it.isJsonNull }?.asString
                        ?: "Bài tập"
                    val sets = exObj.get("sets")?.takeIf { !it.isJsonNull }?.asInt ?: 3
                    val reps = exObj.get("reps")?.takeIf { !it.isJsonNull }?.asString ?: "10-12"
                    val restSec = exObj.get("rest_seconds")?.takeIf { !it.isJsonNull }?.asInt ?: 60
                    exList.add("$exName ($sets hiệp x $reps reps • Nghỉ ${restSec}s)")
                }
                apiSessions.add(Pair(title, exList))
            }
        }

        // Map parsed AI sessions directly to chosen days in chronological order
        val sortedDays = allDays.filter { selectedDays.contains(it) }
        generatedScheduleMap.clear()
        for (i in sortedDays.indices) {
            if (i < apiSessions.size) {
                generatedScheduleMap[sortedDays[i]] = apiSessions[i]
            }
        }

        // Render cards for all 7 days of the week
        allDays.forEach { dayKey ->
            val dayName = dayNames[dayKey] ?: dayKey
            val routine = generatedScheduleMap[dayKey]
            val isRest = routine == null

            val card = android.widget.LinearLayout(this).apply {
                layoutParams = android.widget.LinearLayout.LayoutParams(
                    android.widget.LinearLayout.LayoutParams.MATCH_PARENT,
                    android.widget.LinearLayout.LayoutParams.WRAP_CONTENT
                ).apply { topMargin = 8 }
                orientation = android.widget.LinearLayout.VERTICAL
                background = ContextCompat.getDrawable(this@AiWorkoutPlannerActivity, R.drawable.bg_tag_chip)
                setPadding(20, 16, 20, 16)
            }

            val tvDayHeader = TextView(this).apply {
                text = if (isRest) "🛌 $dayName: Nghỉ ngơi & Phục hồi" else "🏋️ $dayName: ${routine!!.first} ($selectedDuration phút)"
                setTextColor(ContextCompat.getColor(this@AiWorkoutPlannerActivity, if (isRest) R.color.text_slate else R.color.text_dark))
                textSize = 12.5f
                typeface = android.graphics.Typeface.DEFAULT_BOLD
            }
            card.addView(tvDayHeader)

            if (!isRest) {
                routine!!.second.forEach { exText ->
                    val tvEx = TextView(this).apply {
                        text = "• $exText"
                        setTextColor(ContextCompat.getColor(this@AiWorkoutPlannerActivity, R.color.text_dark))
                        textSize = 11.5f
                        layoutParams = android.widget.LinearLayout.LayoutParams(
                            android.widget.LinearLayout.LayoutParams.WRAP_CONTENT,
                            android.widget.LinearLayout.LayoutParams.WRAP_CONTENT
                        ).apply { topMargin = 4 }
                    }
                    card.addView(tvEx)
                }
            }

            binding.llGeneratedSessionsContainer.addView(card)
        }
    }
}
