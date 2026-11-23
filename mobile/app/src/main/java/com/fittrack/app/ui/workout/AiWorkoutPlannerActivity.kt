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
    private var selectedSplit = "PPL"
    private var selectedDays = 4
    private var selectedDuration = 60
    private val selectedInjuries = mutableSetOf<String>()
    private var lastGeneratedPlan: Map<String, Any>? = null

    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)
        binding = ActivityAiWorkoutPlannerBinding.inflate(layoutInflater)
        setContentView(binding.root)

        session = SessionManager.getInstance(this)

        setupListeners()
    }

    private fun setupListeners() {
        binding.btnBack.setOnClickListener { finish() }

        // Split strategy selection
        binding.optSplitPpl.setOnClickListener {
            selectedSplit = "PPL"
            highlightSplit(binding.optSplitPpl, binding.tvSplitPplTitle, binding.tvSplitPplDesc)
            resetSplit(binding.optSplitUpperLower, binding.tvSplitUlTitle, binding.tvSplitUlDesc)
            resetSplit(binding.optSplitFullbody, binding.tvSplitFbTitle, binding.tvSplitFbDesc)
        }

        binding.optSplitUpperLower.setOnClickListener {
            selectedSplit = "UL"
            highlightSplit(binding.optSplitUpperLower, binding.tvSplitUlTitle, binding.tvSplitUlDesc)
            resetSplit(binding.optSplitPpl, binding.tvSplitPplTitle, binding.tvSplitPplDesc)
            resetSplit(binding.optSplitFullbody, binding.tvSplitFbTitle, binding.tvSplitFbDesc)
        }

        binding.optSplitFullbody.setOnClickListener {
            selectedSplit = "FB"
            highlightSplit(binding.optSplitFullbody, binding.tvSplitFbTitle, binding.tvSplitFbDesc)
            resetSplit(binding.optSplitPpl, binding.tvSplitPplTitle, binding.tvSplitPplDesc)
            resetSplit(binding.optSplitUpperLower, binding.tvSplitUlTitle, binding.tvSplitUlDesc)
        }

        // Days per week
        val dayChips = listOf(binding.chipDays3 to 3, binding.chipDays4 to 4, binding.chipDays5 to 5, binding.chipDays6 to 6)
        dayChips.forEach { (chip, days) ->
            chip.setOnClickListener {
                selectedDays = days
                dayChips.forEach { (c, d) ->
                    if (d == selectedDays) {
                        c.background = ContextCompat.getDrawable(this, R.drawable.bg_subtab_pill_active)
                        c.setTextColor(ContextCompat.getColor(this, R.color.white))
                    } else {
                        c.background = ContextCompat.getDrawable(this, R.drawable.bg_subtab_pill_inactive)
                        c.setTextColor(ContextCompat.getColor(this, R.color.text_dark))
                    }
                }
            }
        }

        // Duration chips
        binding.chipDur45.setOnClickListener {
            selectedDuration = 45
            binding.chipDur45.background = ContextCompat.getDrawable(this, R.drawable.bg_subtab_pill_active)
            binding.chipDur45.setTextColor(ContextCompat.getColor(this, R.color.white))
            binding.chipDur60.background = ContextCompat.getDrawable(this, R.drawable.bg_subtab_pill_inactive)
            binding.chipDur60.setTextColor(ContextCompat.getColor(this, R.color.text_dark))
        }

        binding.chipDur60.setOnClickListener {
            selectedDuration = 60
            binding.chipDur60.background = ContextCompat.getDrawable(this, R.drawable.bg_subtab_pill_active)
            binding.chipDur60.setTextColor(ContextCompat.getColor(this, R.color.white))
            binding.chipDur45.background = ContextCompat.getDrawable(this, R.drawable.bg_subtab_pill_inactive)
            binding.chipDur45.setTextColor(ContextCompat.getColor(this, R.color.text_dark))
        }

        // Injury exclusion toggles
        setupInjuryToggle(binding.chipInjKnee, "knee")
        setupInjuryToggle(binding.chipInjShoulder, "shoulder")
        setupInjuryToggle(binding.chipInjBack, "back")

        // Generate Plan CTA via Real VPS AI API
        binding.btnGeneratePlan.setOnClickListener {
            binding.layoutAiLoading.visibility = View.VISIBLE
            binding.layoutPlanResult.visibility = View.GONE
            binding.btnGeneratePlan.isEnabled = false

            lifecycleScope.launch {
                try {
                    val api = ApiClient.getService(this@AiWorkoutPlannerActivity)
                    val resolvedGoal = if (session.userGoal in listOf("gain_muscle", "lose_weight", "maintain")) {
                        session.userGoal
                    } else {
                        session.obGoal
                    }
                    val response = withContext(Dispatchers.IO) {
                        api.generateExercisePlan(
                            idempotencyKey = UUID.randomUUID().toString(),
                            request = GenerateAiPlanRequest(
                                goal = resolvedGoal,
                                splitType = mappedSplitType(),
                                daysPerWeek = selectedDays,
                                durationMinutes = selectedDuration,
                                equipment = session.obEquipment,
                                injuries = selectedInjuries.toList(),
                                experience = session.obExperience
                            )
                        )
                    }

                    binding.layoutAiLoading.visibility = View.GONE
                    binding.btnGeneratePlan.isEnabled = true

                    if (response.isSuccessful && response.body()?.data != null) {
                        @Suppress("UNCHECKED_CAST")
                        lastGeneratedPlan = response.body()?.data as? Map<String, Any>
                        val planTitle = lastGeneratedPlan?.get("plan_name")?.toString()
                            ?: "Giáo án $selectedSplit ($selectedDays buổi/tuần, $selectedDuration phút)"
                        val rationale = lastGeneratedPlan?.get("rationale")?.toString()
                        binding.layoutPlanResult.visibility = View.VISIBLE
                        binding.tvResultSummary.text = if (!rationale.isNullOrBlank()) {
                            "✓ $planTitle\n$rationale"
                        } else {
                            "✓ $planTitle đã được AI sinh thành công!"
                        }
                        Toast.makeText(this@AiWorkoutPlannerActivity, "AI Cloud đã sinh giáo án luyện tập!", Toast.LENGTH_SHORT).show()
                    } else {
                        lastGeneratedPlan = null
                        binding.layoutPlanResult.visibility = View.GONE
                        Toast.makeText(this@AiWorkoutPlannerActivity, "AI không thể sinh giáo án (${response.code()}). Vui lòng thử lại.", Toast.LENGTH_LONG).show()
                    }
                } catch (e: Exception) {
                    lastGeneratedPlan = null
                    binding.layoutAiLoading.visibility = View.GONE
                    binding.layoutPlanResult.visibility = View.GONE
                    binding.btnGeneratePlan.isEnabled = true
                    Toast.makeText(this@AiWorkoutPlannerActivity, "Lỗi kết nối AI VPS: ${e.localizedMessage}", Toast.LENGTH_LONG).show()
                }
            }
        }

        // Apply Schedule & Save to VPS Routines
        binding.btnApplySchedule.setOnClickListener {
            binding.btnApplySchedule.isEnabled = false
            lifecycleScope.launch {
                try {
                    val daysList = extractScheduleDays(lastGeneratedPlan)
                    val title = lastGeneratedPlan?.get("plan_name")?.toString()
                        ?: "Giáo án AI ($selectedSplit - $selectedDays buổi)"
                    val description = lastGeneratedPlan?.get("rationale")?.toString()
                        ?: "Giáo án tạo bởi FitTrack AI Planner ($selectedDuration phút)"
                    val res = withContext(Dispatchers.IO) {
                        ApiClient.getService(this@AiWorkoutPlannerActivity).createRoutine(
                            idempotencyKey = UUID.randomUUID().toString(),
                            request = CreateRoutineRequest(
                                title = title,
                                description = description,
                                targetSplit = mappedSplitType(),
                                scheduleDays = daysList,
                                routineData = lastGeneratedPlan,
                                isActive = true
                            )
                        )
                    }
                    if (res.isSuccessful) {
                        Toast.makeText(this@AiWorkoutPlannerActivity, "✓ Đã lưu giáo án $selectedSplit vào lịch tập trên VPS!", Toast.LENGTH_LONG).show()
                        finish()
                    } else {
                        binding.btnApplySchedule.isEnabled = true
                        Toast.makeText(this@AiWorkoutPlannerActivity, "Lỗi lưu giáo án (${res.code()})", Toast.LENGTH_SHORT).show()
                    }
                } catch (e: Exception) {
                    binding.btnApplySchedule.isEnabled = true
                    Toast.makeText(this@AiWorkoutPlannerActivity, "Lỗi kết nối máy chủ: ${e.localizedMessage}", Toast.LENGTH_SHORT).show()
                }
            }
        }
    }

    private fun mappedSplitType(): String = when (selectedSplit) {
        "PPL" -> "ppl"
        "UL" -> "upper_lower"
        "FB" -> "full_body"
        else -> "auto"
    }

    private fun extractScheduleDays(plan: Map<String, Any>?): List<String> {
        val dayMap = mapOf(
            "thứ 2" to "monday", "monday" to "monday",
            "thứ 3" to "tuesday", "tuesday" to "tuesday",
            "thứ 4" to "wednesday", "wednesday" to "wednesday",
            "thứ 5" to "thursday", "thursday" to "thursday",
            "thứ 6" to "friday", "friday" to "friday",
            "thứ 7" to "saturday", "saturday" to "saturday",
            "chủ nhật" to "sunday", "sunday" to "sunday"
        )
        val sessions = plan?.get("sessions") as? List<*>
        val parsedDays = sessions?.mapNotNull { entry ->
            val sessionMap = entry as? Map<*, *> ?: return@mapNotNull null
            if (sessionMap["is_rest"] == true) return@mapNotNull null
            dayMap[sessionMap["day_of_week"]?.toString()?.trim()?.lowercase()]
        }?.distinct().orEmpty()

        return parsedDays.ifEmpty {
            listOf("monday", "wednesday", "friday", "saturday", "sunday", "tuesday").take(selectedDays)
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
}
