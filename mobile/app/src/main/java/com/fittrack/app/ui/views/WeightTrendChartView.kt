package com.fittrack.app.ui.views

import android.content.Context
import android.graphics.*
import android.util.AttributeSet
import android.view.View
import java.util.Locale

class WeightTrendChartView @JvmOverloads constructor(
    context: Context,
    attrs: AttributeSet? = null,
    defStyleAttr: Int = 0
) : View(context, attrs, defStyleAttr) {

    private val dataPoints = mutableListOf<Pair<String, Float>>()

    private val linePaint = Paint(Paint.ANTI_ALIAS_FLAG).apply {
        style = Paint.Style.STROKE
        strokeWidth = 6f
        color = Color.parseColor("#0284C7")
        strokeCap = Paint.Cap.ROUND
        strokeJoin = Paint.Join.ROUND
    }

    private val fillPaint = Paint(Paint.ANTI_ALIAS_FLAG).apply {
        style = Paint.Style.FILL
    }

    private val pointPaint = Paint(Paint.ANTI_ALIAS_FLAG).apply {
        style = Paint.Style.FILL
        color = Color.WHITE
    }

    private val pointBorderPaint = Paint(Paint.ANTI_ALIAS_FLAG).apply {
        style = Paint.Style.STROKE
        strokeWidth = 4f
        color = Color.parseColor("#0284C7")
    }

    private val textPaint = Paint(Paint.ANTI_ALIAS_FLAG).apply {
        color = Color.parseColor("#64748B")
        textSize = 28f
        textAlign = Paint.Align.CENTER
    }

    private val gridPaint = Paint(Paint.ANTI_ALIAS_FLAG).apply {
        color = Color.parseColor("#E2E8F0")
        strokeWidth = 2f
        pathEffect = DashPathEffect(floatArrayOf(10f, 10f), 0f)
    }

    private val emptyStatePaint = Paint(Paint.ANTI_ALIAS_FLAG).apply {
        color = Color.parseColor("#94A3B8")
        textSize = 30f
        textAlign = Paint.Align.CENTER
        typeface = Typeface.create(Typeface.DEFAULT, Typeface.BOLD)
    }

    fun setData(points: List<Pair<String, Float>>) {
        dataPoints.clear()
        dataPoints.addAll(points)
        invalidate()
    }

    override fun onDraw(canvas: Canvas) {
        super.onDraw(canvas)

        val w = width.toFloat()
        val h = height.toFloat()

        if (dataPoints.size < 2) {
            canvas.drawText(
                "Chưa đủ dữ liệu (Cần ít nhất 2 lần ghi nhận cân nặng)",
                w / 2f,
                h / 2f + 10f,
                emptyStatePaint
            )
            return
        }

        val paddingLeft = 60f
        val paddingRight = 60f
        val paddingTop = 40f
        val paddingBottom = 60f

        val plotW = w - paddingLeft - paddingRight
        val plotH = h - paddingTop - paddingBottom

        val minVal = dataPoints.minOf { it.second } - 0.5f
        val maxVal = dataPoints.maxOf { it.second } + 0.5f
        val valRange = if (maxVal == minVal) 1f else (maxVal - minVal)

        // Draw horizontal grid lines
        val gridY1 = paddingTop
        val gridY2 = paddingTop + plotH / 2f
        val gridY3 = paddingTop + plotH

        canvas.drawLine(paddingLeft, gridY1, w - paddingRight, gridY1, gridPaint)
        canvas.drawLine(paddingLeft, gridY2, w - paddingRight, gridY2, gridPaint)
        canvas.drawLine(paddingLeft, gridY3, w - paddingRight, gridY3, gridPaint)

        val pointsX = FloatArray(dataPoints.size)
        val pointsY = FloatArray(dataPoints.size)

        val stepX = plotW / (dataPoints.size - 1)

        for (i in dataPoints.indices) {
            pointsX[i] = paddingLeft + i * stepX
            val normalizedY = (dataPoints[i].second - minVal) / valRange
            pointsY[i] = paddingTop + plotH * (1f - normalizedY)
        }

        // Draw gradient area fill
        val fillPath = Path().apply {
            moveTo(pointsX[0], pointsY[0])
            for (i in 1 until dataPoints.size) {
                val midX = (pointsX[i - 1] + pointsX[i]) / 2f
                cubicTo(midX, pointsY[i - 1], midX, pointsY[i], pointsX[i], pointsY[i])
            }
            lineTo(pointsX.last(), paddingTop + plotH)
            lineTo(pointsX.first(), paddingTop + plotH)
            close()
        }

        fillPaint.shader = LinearGradient(
            0f, paddingTop, 0f, paddingTop + plotH,
            Color.parseColor("#4438BDF8"),
            Color.parseColor("#0538BDF8"),
            Shader.TileMode.CLAMP
        )
        canvas.drawPath(fillPath, fillPaint)

        // Draw smooth line
        val linePath = Path().apply {
            moveTo(pointsX[0], pointsY[0])
            for (i in 1 until dataPoints.size) {
                val midX = (pointsX[i - 1] + pointsX[i]) / 2f
                cubicTo(midX, pointsY[i - 1], midX, pointsY[i], pointsX[i], pointsY[i])
            }
        }
        canvas.drawPath(linePath, linePaint)

        // Draw points and labels
        for (i in dataPoints.indices) {
            val px = pointsX[i]
            val py = pointsY[i]

            // Circle point
            canvas.drawCircle(px, py, 10f, pointPaint)
            canvas.drawCircle(px, py, 10f, pointBorderPaint)

            // Weight text above point
            val weightStr = String.format(Locale.US, "%.1fkg", dataPoints[i].second)
            canvas.drawText(weightStr, px, py - 18f, textPaint)

            // Date label below
            val dateLabel = dataPoints[i].first
            canvas.drawText(dateLabel, px, h - 16f, textPaint)
        }
    }
}

