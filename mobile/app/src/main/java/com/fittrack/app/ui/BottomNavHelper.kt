package com.fittrack.app.ui

import android.content.Intent
import android.graphics.Typeface
import androidx.appcompat.app.AppCompatActivity
import androidx.core.content.ContextCompat
import com.fittrack.app.R
import com.fittrack.app.databinding.LayoutBottomNavBinding
import com.fittrack.app.ui.community.CommunityActivity
import com.fittrack.app.ui.dashboard.DashboardActivity
import com.fittrack.app.ui.metrics.BodyMetricsActivity
import com.fittrack.app.ui.profile.UserProfileActivity
import com.fittrack.app.ui.workout.WorkoutsActivity

enum class BottomNavTab {
    DASHBOARD,
    WORKOUTS,
    METRICS,
    COMMUNITY,
    PROFILE
}

fun LayoutBottomNavBinding.setupBottomNav(
    activity: AppCompatActivity,
    activeTab: BottomNavTab
) {
    val activeColor = ContextCompat.getColor(activity, R.color.nav_active)
    val inactiveColor = ContextCompat.getColor(activity, R.color.nav_inactive)

    fun applyTabStyle(
        icon: android.widget.ImageView,
        label: android.widget.TextView,
        isActive: Boolean
    ) {
        val color = if (isActive) activeColor else inactiveColor
        icon.setColorFilter(color)
        label.setTextColor(color)
        label.typeface = if (isActive) Typeface.DEFAULT_BOLD else Typeface.DEFAULT
    }

    applyTabStyle(ivNavIconDashboard, tvNavLabelDashboard, activeTab == BottomNavTab.DASHBOARD)
    applyTabStyle(ivNavIconWorkouts, tvNavLabelWorkouts, activeTab == BottomNavTab.WORKOUTS)
    applyTabStyle(ivNavIconMetrics, tvNavLabelMetrics, activeTab == BottomNavTab.METRICS)
    applyTabStyle(ivNavIconCommunity, tvNavLabelCommunity, activeTab == BottomNavTab.COMMUNITY)
    applyTabStyle(ivNavIconProfile, tvNavLabelProfile, activeTab == BottomNavTab.PROFILE)

    fun navigateTo(targetClass: Class<*>, targetTab: BottomNavTab) {
        if (activeTab == targetTab) return
        val intent = Intent(activity, targetClass).apply {
            flags = Intent.FLAG_ACTIVITY_REORDER_TO_FRONT
        }
        activity.startActivity(intent)
        activity.overridePendingTransition(0, 0)
        activity.finish()
    }

    navItemDashboard.setOnClickListener {
        navigateTo(DashboardActivity::class.java, BottomNavTab.DASHBOARD)
    }
    navItemWorkouts.setOnClickListener {
        navigateTo(WorkoutsActivity::class.java, BottomNavTab.WORKOUTS)
    }
    navItemMetrics.setOnClickListener {
        navigateTo(BodyMetricsActivity::class.java, BottomNavTab.METRICS)
    }
    navItemCommunity.setOnClickListener {
        navigateTo(CommunityActivity::class.java, BottomNavTab.COMMUNITY)
    }
    navItemProfile.setOnClickListener {
        navigateTo(UserProfileActivity::class.java, BottomNavTab.PROFILE)
    }
}
