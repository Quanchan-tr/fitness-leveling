package com.fittrack.app.ui.admin

import android.app.Activity
import android.content.Intent
import android.graphics.Typeface
import android.os.Build
import android.view.View
import android.widget.ImageView
import android.widget.TextView
import androidx.appcompat.app.AppCompatActivity
import androidx.core.content.ContextCompat
import androidx.core.view.ViewCompat
import androidx.core.view.WindowInsetsCompat
import androidx.core.view.updatePadding
import com.fittrack.app.R
import com.fittrack.app.databinding.LayoutAdminBottomNavBinding

enum class AdminNavTab {
    STATS,
    USERS,
    EXERCISES,
    FOODS,
    COMMUNITY
}

fun LayoutAdminBottomNavBinding.setupAdminBottomNav(
    activity: AppCompatActivity,
    activeTab: AdminNavTab
) {
    val initialBottomPadding = root.paddingBottom
    ViewCompat.setOnApplyWindowInsetsListener(root) { view, insets ->
        val navInsets = insets.getInsets(WindowInsetsCompat.Type.navigationBars())
        view.updatePadding(bottom = initialBottomPadding + navInsets.bottom)
        insets
    }

    val activeColor = ContextCompat.getColor(activity, R.color.primary_blue)
    val inactiveColor = ContextCompat.getColor(activity, R.color.admin_text_secondary)

    fun applyStyle(dot: View, icon: ImageView, label: TextView, isActive: Boolean) {
        val color = if (isActive) activeColor else inactiveColor
        dot.visibility = if (isActive) View.VISIBLE else View.INVISIBLE
        icon.setColorFilter(color)
        label.setTextColor(color)
        label.typeface = if (isActive) Typeface.DEFAULT_BOLD else Typeface.DEFAULT
    }

    applyStyle(dotAdminStats, ivAdminStats, tvAdminStats, activeTab == AdminNavTab.STATS)
    applyStyle(dotAdminUsers, ivAdminUsers, tvAdminUsers, activeTab == AdminNavTab.USERS)
    applyStyle(dotAdminExercises, ivAdminExercises, tvAdminExercises, activeTab == AdminNavTab.EXERCISES)
    applyStyle(dotAdminFoods, ivAdminFoods, tvAdminFoods, activeTab == AdminNavTab.FOODS)
    applyStyle(dotAdminCommunity, ivAdminCommunity, tvAdminCommunity, activeTab == AdminNavTab.COMMUNITY)

    fun navigateTo(targetClass: Class<*>, targetTab: AdminNavTab) {
        if (activeTab == targetTab) return
        val intent = Intent(activity, targetClass).apply {
            flags = Intent.FLAG_ACTIVITY_REORDER_TO_FRONT
        }
        activity.startActivity(intent)
        if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.UPSIDE_DOWN_CAKE) {
            activity.overrideActivityTransition(Activity.OVERRIDE_TRANSITION_OPEN, 0, 0)
            activity.overrideActivityTransition(Activity.OVERRIDE_TRANSITION_CLOSE, 0, 0)
        } else {
            @Suppress("DEPRECATION")
            activity.overridePendingTransition(0, 0)
        }
        activity.finish()
    }

    navAdminStats.setOnClickListener {
        navigateTo(AdminDashboardActivity::class.java, AdminNavTab.STATS)
    }
    navAdminUsers.setOnClickListener {
        navigateTo(AdminUsersActivity::class.java, AdminNavTab.USERS)
    }
    navAdminExercises.setOnClickListener {
        navigateTo(AdminExercisesActivity::class.java, AdminNavTab.EXERCISES)
    }
    navAdminFoods.setOnClickListener {
        navigateTo(AdminFoodsActivity::class.java, AdminNavTab.FOODS)
    }
    navAdminCommunity.setOnClickListener {
        navigateTo(AdminCommunityActivity::class.java, AdminNavTab.COMMUNITY)
    }
}
