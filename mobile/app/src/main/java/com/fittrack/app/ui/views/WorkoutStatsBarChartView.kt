package com.fittrack.app.ui.views

import android.content.Context
import android.graphics.*
import android.util.AttributeSet
import android.view.View
import java.util.Locale

class WorkoutStatsBarChartView @JvmOverloads constructor(
    context: Context,
    attrs: AttributeSet? = null,
    defStyleAttr: Int = 0
) : View(context, attrs, defStyleAttr) {

    private val barData = mutableListOf<Pair<String, Float>>()
    private var metricUnit = "phút"

    private val barPaint = Paint(Paint.ANTI_ALIAS_FLAG).apply {
        style = Paint.Style.FILL
    }

    private val labelPaint = Paint(Paint.ANTI_ALIAS_FLAG).apply {
        color = Color.parseColor("#64748B")
        textSize = 24f
        textAlign = Paint.Align.CENTER
    }

    private val valTextPaint = Paint(Paint.ANTI_ALIAS_FLAG).apply {
        color = Color.parseColor("#0F172A")
        textSize = 22f
        textAlign = Paint.Align.CENTER
        typeface = Typeface.create(Typeface.DEFAULT, Typeface.BOLD)
    }

    private val emptyStatePaint = Paint(Paint.ANTI_ALIAS_FLAG).apply {
        color = Color.parseColor("#94A3B8")
        textSize = 30f
        textAlign = Paint.Align.CENTER
        typeface = Typeface.create(Typeface.DEFAULT, Typeface.BOLD)
    }

    fun setData(bars: List<Pair<String, Float>>, unit: String = "phút") {
        barData.clear()
        barData.addAll(bars)
        metricUnit = unit
        invalidate()
    }

    override fun onDraw(canvas: Canvas) {
        super.onDraw(canvas)

        val w = width.toFloat()
        val h = height.toFloat()

        val hasData = barData.any { it.second > 0f }
        if (!hasData || barData.isEmpty()) {
            canvas.drawText(
                "Chưa có dữ liệu buổi tập trong 12 tuần qua",
                w / 2f,
                h / 2f + 10f,
                emptyStatePaint
            )
            return
        }

        val paddingLeft = 30f
        val paddingRight = 30f
        val paddingTop = 40f
        val paddingBottom = 45f

        val plotW = w - paddingLeft - paddingRight
        val plotH = h - paddingTop - paddingBottom

        val maxVal = maxOf(1f, barData.maxOf { it.second })
        val count = barData.size
        val slotW = plotW / count
        val barW = maxOf(8f, slotW * 0.45f)

        for (i in barData.indices) {
            val (label, value) = barData[i]
            val centerX = paddingLeft + i * slotW + slotW / 2f

            val normalizedH = (value / maxVal) * plotH
            val barTop = paddingTop + (plotH - normalizedH)
            val barBottom = paddingTop + plotH

            // Bar Shader: Cyan to Primary Blue
            barPaint.shader = LinearGradient(
                centerX, barTop, centerX, barBottom,
                if (value == maxVal) Color.parseColor("#38BDF8") else Color.parseColor("#2563EB"),
                Color.parseColor("#1D4ED8"),
                Shader.TileMode.CLAMP
            )

            val rect = RectF(
                centerX - barW / 2f,
                barTop,
                centerX + barW / 2f,
                barBottom
            )
            canvas.drawRoundRect(rect, 6f, 6f, barPaint)

            // Value text above bar if value > 0
            if (value > 0f) {
                val formattedVal = if (value >= 1000f) {
                    String.format(Locale.US, "%.1fk", value / 1000f)
                } else if (value >= 100f) {
                    value.toInt().toString()
                } else {
                    String.format(Locale.US, "%.0f", value)
                }
                canvas.drawText(formattedVal, centerX, barTop - 10f, valTextPaint)
            }

            // Week label below bar
            canvas.drawText(label, centerX, h - 10f, labelPaint)
        }
    }
}

