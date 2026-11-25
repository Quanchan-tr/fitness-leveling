package com.fittrack.app

import com.fittrack.app.data.models.AdminStatsDto
import com.fittrack.app.data.models.ApiResponse
import com.google.gson.Gson
import com.google.gson.reflect.TypeToken
import org.junit.Assert.assertEquals
import org.junit.Assert.assertNotNull
import org.junit.Test

class AdminModelsSerializationTest {

    private val gson = Gson()

    @Test
    fun `AdminStatsDto deserializes kpis ai telemetry series and top exercises`() {
        val json = """
            {
              "data": {
                "range": "7d",
                "kpis": {
                  "total_users": 42,
                  "new_users": 5,
                  "active_users": 18,
                  "banned_users": 1,
                  "total_workouts": 120,
                  "workouts_in_range": 25,
                  "nutrition_logs_in_range": 64,
                  "total_exercises": 1324,
                  "total_foods": 4422,
                  "pending_exercises_count": 2,
                  "pending_reports_count": 1,
                  "community_posts_in_range": 9
                },
                "ai_exercise_plan": {
                  "total_uses": 15,
                  "all_time_uses": 90,
                  "llm_calls": 12,
                  "fallback_calls": 3,
                  "prompt_tokens": 6000,
                  "completion_tokens": 9000,
                  "total_tokens": 15000,
                  "all_time_tokens": 82000,
                  "avg_latency_ms": 1150,
                  "avg_llm_latency_ms": 1380
                },
                "ai_pose": {
                  "total_uses": 28,
                  "all_time_uses": 140,
                  "video_upload_uses": 10,
                  "realtime_uses": 18,
                  "completed_uses": 26,
                  "failed_uses": 2,
                  "avg_score": 87.5
                },
                "series": [
                  { "label": "25/11", "date": "2026-11-25", "new_users": 2, "workouts": 7, "ai_plan_uses": 4, "ai_pose_uses": 6 }
                ],
                "top_exercises": [
                  { "id": "ex-1", "name": "Barbell Squat", "muscle_group": "legs", "sets_count": 32 }
                ]
              }
            }
        """.trimIndent()

        val type = object : TypeToken<ApiResponse<AdminStatsDto>>() {}.type
        val parsed: ApiResponse<AdminStatsDto> = gson.fromJson(json, type)

        assertNotNull(parsed.data)
        val stats = parsed.data!!
        assertEquals("7d", stats.range)
        assertEquals(42, stats.kpis.totalUsers)
        assertEquals(15000L, stats.aiExercisePlan.totalTokens)
        assertEquals(1380, stats.aiExercisePlan.avgLlmLatencyMs)
        assertEquals(28, stats.aiPose.totalUses)
        assertEquals(10, stats.aiPose.videoUploadUses)
        assertEquals(87.5, stats.aiPose.avgScore, 0.01)
        assertEquals(1, stats.series.size)
        assertEquals("Barbell Squat", stats.topExercises.first().name)
    }
}
