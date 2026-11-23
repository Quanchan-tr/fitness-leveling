package com.fittrack.app.util

import android.app.Activity
import android.view.View
import androidx.core.view.ViewCompat
import androidx.core.view.WindowCompat
import androidx.core.view.WindowInsetsCompat
import androidx.core.view.updatePadding

/**
 * Standardized system insets handler for Modern Android.
 * Prevents Bottom Navigation from being obscured by gesture navigation bars
 * and ensures Headers avoid camera cutouts and status bars.
 */
object WindowInsetsHelper {

    fun applySystemInsets(
        activity: Activity,
        rootView: View,
        headerView: View? = null,
        bottomNavView: View? = null
    ) {
        WindowCompat.setDecorFitsSystemWindows(activity.window, false)

        val initialHeaderTop = headerView?.paddingTop ?: 0
        val initialNavBottom = bottomNavView?.paddingBottom ?: 0

        ViewCompat.setOnApplyWindowInsetsListener(rootView) { _, insets ->
            val statusBarInsets = insets.getInsets(WindowInsetsCompat.Type.statusBars())
            val navBarInsets = insets.getInsets(WindowInsetsCompat.Type.navigationBars())

            headerView?.updatePadding(
                top = (initialHeaderTop + statusBarInsets.top).coerceAtLeast(statusBarInsets.top)
            )

            bottomNavView?.updatePadding(
                bottom = initialNavBottom + navBarInsets.bottom
            )

            insets
        }
    }
}
