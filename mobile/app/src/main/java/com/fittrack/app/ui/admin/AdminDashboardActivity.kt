package com.fittrack.app.ui.admin

import android.content.Intent
import android.os.Bundle
import android.view.Gravity
import android.view.View
import android.widget.LinearLayout
import android.widget.TextView
import android.widget.Toast
import androidx.appcompat.app.AppCompatActivity
import androidx.core.content.ContextCompat
import androidx.lifecycle.lifecycleScope
import com.fittrack.app.R
import com.fittrack.app.data.api.ApiClient
import com.fittrack.app.data.models.AdminSeriesPointDto
import com.fittrack.app.data.models.AdminStatsDto
import com.fittrack.app.data.session.SessionManager
import com.fittrack.app.databinding.ActivityAdminDashboardBinding
import com.fittrack.app.ui.dashboard.DashboardActivity
import com.fittrack.app.util.WindowInsetsHelper
import kotlinx.coroutines.Dispatchers
import kotlinx.coroutines.launch
import kotlinx.coroutines.withContext
import java.text.NumberFormat
import java.util.Locale

class AdminDashboardActivity : AppCompatActivity() {

    private lateinit var binding: ActivityAdminDashboardBinding
    private lateinit var session: SessionManager

    private var currentRange = "30d"
    private var chartMode = 0 // 0: workouts, 1: new_users, 2: ai_plan, 3: ai_pose
    private var latestStats: AdminStatsDto? = null
    private val vnFormat = NumberFormat.getIntegerInstance(Locale("vi", "VN"))

    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)
        session = SessionManager.getInstance(this)
        if (!session.isAdmin) {
            Toast.makeText(this, "Bạn không có quyền truy cập Admin Console.", Toast.LENGTH_SHORT).show()
            finish()
            return
        }

        binding = ActivityAdminDashboardBinding.inflate(layoutInflater)
        setContentView(binding.root)

        WindowInsetsHelper.applySystemInsets(
            this,
            binding.root,
            binding.layoutHeader,
            binding.adminBottomNav.root
        )

        binding.adminBottomNav.setupAdminBottomNav(this, AdminNavTab.STATS)
        setupListeners()
        loadStats()
    }

    private fun setupListeners() {
        binding.btnBackToUser.setOnClickListener {
            val intent = Intent(this, DashboardActivity::class.java).apply {
                flags = Intent.FLAG_ACTIVITY_REORDER_TO_FRONT
            }
            startActivity(intent)
            finish()
        }

        val rangeViews = listOf(
            binding.tabRange7d to "7d",
            binding.tabRange30d to "30d",
            binding.tabRange90d to "90d"
        )
        rangeViews.forEach { (view, rangeVal) ->
            view.setOnClickListener {
                currentRange = rangeVal
                updatePillSelection(rangeViews.map { it.first }, view)
                loadStats()
            }
        }

        val chartPills = listOf(
            binding.pillChartWorkouts,
            binding.pillChartUsers,
            binding.pillChartAi,
            binding.pillChartPose
        )
        chartPills.forEachIndexed { idx, pill ->
            pill.setOnClickListener {
                chartMode = idx
                updatePillSelection(chartPills, pill)
                renderChart()
            }
        }
    }

    private fun updatePillSelection(pills: List<TextView>, selected: TextView) {
        val white = ContextCompat.getColor(this, R.color.white)
        val secondary = ContextCompat.getColor(this, R.color.admin_text_secondary)
        pills.forEach { pill ->
            val isSelected = pill == selected
            pill.background = ContextCompat.getDrawable(
                this,
                if (isSelected) R.drawable.bg_admin_pill_active else R.drawable.bg_admin_pill_inactive
            )
            pill.setTextColor(if (isSelected) white else secondary)
        }
    }

    private fun loadStats() {
        binding.pbLoading.visibility = View.VISIBLE
        lifecycleScope.launch {
            try {
                val res = withContext(Dispatchers.IO) {
                    ApiClient.getService(this@AdminDashboardActivity).getAdminStats(currentRange)
                }
                if (res.isSuccessful && res.body()?.data != null) {
                    latestStats = res.body()!!.data
                    bindStats(latestStats!!)
                } else {
                    Toast.makeText(
                        this@AdminDashboardActivity,
                        "Không thể tải thống kê (${res.code()})",
                        Toast.LENGTH_SHORT
                    ).show()
                }
            } catch (e: Exception) {
                Toast.makeText(
                    this@AdminDashboardActivity,
                    "Lỗi kết nối máy chủ: ${e.localizedMessage}",
                    Toast.LENGTH_SHORT
                ).show()
            } finally {
                binding.pbLoading.visibility = View.GONE
            }
        }
    }

    private fun bindStats(stats: AdminStatsDto) {
        val kpis = stats.kpis
        binding.tvKpiUsers.text = vnFormat.format(kpis.totalUsers)
        binding.tvKpiUsersSub.text = "+${kpis.newUsers} mới • ${kpis.activeUsers} active"

        binding.tvKpiWorkouts.text = vnFormat.format(kpis.workoutsInRange)
        binding.tvKpiWorkoutsSub.text = "Tổng ${vnFormat.format(kpis.totalWorkouts)} • ${kpis.nutritionLogsInRange} bữa"

        binding.tvKpiCatalog.text = vnFormat.format(kpis.totalExercises)
        binding.tvKpiCatalogSub.text = "Bài tập • ${vnFormat.format(kpis.totalFoods)} món ăn"

        val pendingTotal = kpis.pendingExercisesCount + kpis.pendingReportsCount
        binding.tvKpiPending.text = vnFormat.format(pendingTotal)
        binding.tvKpiPendingSub.text = "${kpis.pendingExercisesCount} bài • ${kpis.pendingReportsCount} báo cáo"

        val aiPlan = stats.aiExercisePlan
        binding.tvAiPlanUses.text = vnFormat.format(aiPlan.totalUses)
        binding.tvAiPlanUsesSub.text = "LLM: ${aiPlan.llmCalls} • FB: ${aiPlan.fallbackCalls}"
        binding.tvAiPlanTokens.text = vnFormat.format(aiPlan.totalTokens)
        binding.tvAiPlanTokensSub.text = "Tổng: ${vnFormat.format(aiPlan.allTimeTokens)}"
        binding.tvAiPlanLatency.text = "${vnFormat.format(aiPlan.avgLlmLatencyMs)} ms"
        binding.tvAiPlanLatencySub.text = "Chung: ${vnFormat.format(aiPlan.avgLatencyMs)} ms"

        val aiPose = stats.aiPose
        binding.tvAiPoseUses.text = vnFormat.format(aiPose.totalUses)
        binding.tvAiPoseAllTime.text = "Tổng: ${vnFormat.format(aiPose.allTimeUses)}"
        binding.tvAiPoseSplit.text = "${aiPose.videoUploadUses} / ${aiPose.realtimeUses}"
        binding.tvAiPoseScore.text = "${aiPose.avgScore}/100"

        renderChart()
        renderTopExercises(stats)
    }

    private fun renderChart() {
        val raw = latestStats?.series.orEmpty()
        if (raw.isEmpty()) {
            binding.chartAdminTrends.setData(emptyList(), "")
            return
        }

        // Downsample 30-day series into 10 buckets so axis labels stay legible on phones.
        val bucketed: List<Pair<String, Float>> = if (raw.size > 14) {
            val step = (raw.size + 9) / 10
            raw.chunked(step).map { chunk ->
                val valueSum = chunk.sumOf { extractMetric(it) }.toFloat()
                Pair(chunk.first().label, valueSum)
            }
        } else {
            raw.map { Pair(it.label, extractMetric(it).toFloat()) }
        }

        val unit = when (chartMode) {
            1 -> "users"
            2, 3 -> "lượt"
            else -> "buổi"
        }
        binding.chartAdminTrends.setData(bucketed, unit)
    }

    private fun extractMetric(p: AdminSeriesPointDto): Int = when (chartMode) {
        1 -> p.newUsers
        2 -> p.aiPlanUses
        3 -> p.aiPoseUses
        else -> p.workouts
    }

    private fun renderTopExercises(stats: AdminStatsDto) {
        binding.containerTopExercises.removeAllViews()
        val list = stats.topExercises
        if (list.isEmpty()) {
            val emptyTv = TextView(this).apply {
                text = "Chưa có dữ liệu hiệp tập trong kỳ này."
                setTextColor(ContextCompat.getColor(context, R.color.admin_text_secondary))
                textSize = 12f
            }
            binding.containerTopExercises.addView(emptyTv)
            return
        }

        val primaryText = ContextCompat.getColor(this, R.color.admin_text_primary)
        val secondaryText = ContextCompat.getColor(this, R.color.admin_text_secondary)
        val blue = ContextCompat.getColor(this, R.color.primary_blue)

        list.forEachIndexed { index, item ->
            val row = LinearLayout(this).apply {
                orientation = LinearLayout.HORIZONTAL
                gravity = Gravity.CENTER_VERTICAL
                setPadding(0, 14, 0, 14)
            }
            val rankTv = TextView(this).apply {
                text = "${index + 1}."
                setTextColor(secondaryText)
                textSize = 12.5f
                setPadding(0, 0, 16, 0)
            }
            val nameTv = TextView(this).apply {
                text = item.name
                setTextColor(primaryText)
                textSize = 13f
                layoutParams = LinearLayout.LayoutParams(0, LinearLayout.LayoutParams.WRAP_CONTENT, 1f)
            }
            val countTv = TextView(this).apply {
                text = "${vnFormat.format(item.setsCount)} sets"
                setTextColor(blue)
                textSize = 12.5f
                setTypeface(typeface, android.graphics.Typeface.BOLD)
            }
            row.addView(rankTv)
            row.addView(nameTv)
            row.addView(countTv)
            binding.containerTopExercises.addView(row)
        }
    }
}
