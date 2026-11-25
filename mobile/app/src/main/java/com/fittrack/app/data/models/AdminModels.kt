package com.fittrack.app.data.models

import com.google.gson.annotations.SerializedName

data class AdminStatsDto(
    @SerializedName("range") val range: String = "30d",
    @SerializedName("kpis") val kpis: AdminKpisDto = AdminKpisDto(),
    @SerializedName("ai_exercise_plan") val aiExercisePlan: AdminAiExercisePlanDto = AdminAiExercisePlanDto(),
    @SerializedName("ai_pose") val aiPose: AdminAiPoseDto = AdminAiPoseDto(),
    @SerializedName("series") val series: List<AdminSeriesPointDto> = emptyList(),
    @SerializedName("top_exercises") val topExercises: List<AdminTopExerciseDto> = emptyList()
)

data class AdminKpisDto(
    @SerializedName("total_users") val totalUsers: Int = 0,
    @SerializedName("new_users") val newUsers: Int = 0,
    @SerializedName("active_users") val activeUsers: Int = 0,
    @SerializedName("banned_users") val bannedUsers: Int = 0,
    @SerializedName("total_workouts") val totalWorkouts: Int = 0,
    @SerializedName("workouts_in_range") val workoutsInRange: Int = 0,
    @SerializedName("nutrition_logs_in_range") val nutritionLogsInRange: Int = 0,
    @SerializedName("total_exercises") val totalExercises: Int = 0,
    @SerializedName("total_foods") val totalFoods: Int = 0,
    @SerializedName("pending_exercises_count") val pendingExercisesCount: Int = 0,
    @SerializedName("pending_reports_count") val pendingReportsCount: Int = 0,
    @SerializedName("community_posts_in_range") val communityPostsInRange: Int = 0
)

data class AdminAiExercisePlanDto(
    @SerializedName("total_uses") val totalUses: Int = 0,
    @SerializedName("all_time_uses") val allTimeUses: Int = 0,
    @SerializedName("llm_calls") val llmCalls: Int = 0,
    @SerializedName("fallback_calls") val fallbackCalls: Int = 0,
    @SerializedName("prompt_tokens") val promptTokens: Long = 0,
    @SerializedName("completion_tokens") val completionTokens: Long = 0,
    @SerializedName("total_tokens") val totalTokens: Long = 0,
    @SerializedName("all_time_tokens") val allTimeTokens: Long = 0,
    @SerializedName("avg_latency_ms") val avgLatencyMs: Int = 0,
    @SerializedName("avg_llm_latency_ms") val avgLlmLatencyMs: Int = 0
)

data class AdminAiPoseDto(
    @SerializedName("total_uses") val totalUses: Int = 0,
    @SerializedName("all_time_uses") val allTimeUses: Int = 0,
    @SerializedName("video_upload_uses") val videoUploadUses: Int = 0,
    @SerializedName("realtime_uses") val realtimeUses: Int = 0,
    @SerializedName("completed_uses") val completedUses: Int = 0,
    @SerializedName("failed_uses") val failedUses: Int = 0,
    @SerializedName("avg_score") val avgScore: Double = 0.0
)

data class AdminSeriesPointDto(
    @SerializedName("label") val label: String = "",
    @SerializedName("date") val date: String = "",
    @SerializedName("new_users") val newUsers: Int = 0,
    @SerializedName("workouts") val workouts: Int = 0,
    @SerializedName("ai_plan_uses") val aiPlanUses: Int = 0,
    @SerializedName("ai_pose_uses") val aiPoseUses: Int = 0
)

data class AdminTopExerciseDto(
    @SerializedName("id") val id: String = "",
    @SerializedName("name") val name: String = "",
    @SerializedName("muscle_group") val muscleGroup: String? = null,
    @SerializedName("sets_count") val setsCount: Int = 0
)

data class AdminUserDto(
    @SerializedName("id") val id: String,
    @SerializedName("name") val name: String,
    @SerializedName("email") val email: String,
    @SerializedName("role") val role: String = "user",
    @SerializedName("goal") val goal: String? = null,
    @SerializedName("gender") val gender: String? = null,
    @SerializedName("weight_kg") val weightKg: Double? = null,
    @SerializedName("height_cm") val heightCm: Double? = null,
    @SerializedName("level") val level: Int = 1,
    @SerializedName("banned_at") val bannedAt: String? = null,
    @SerializedName("deleted_at") val deletedAt: String? = null,
    @SerializedName("workout_logs_count") val workoutLogsCount: Int = 0,
    @SerializedName("nutrition_logs_count") val nutritionLogsCount: Int = 0,
    @SerializedName("pose_check_sessions_count") val poseCheckSessionsCount: Int = 0
)

data class AdminCreateUserRequest(
    @SerializedName("name") val name: String,
    @SerializedName("email") val email: String,
    @SerializedName("password") val password: String,
    @SerializedName("role") val role: String = "user"
)

data class AdminUpdateUserRequest(
    @SerializedName("name") val name: String? = null,
    @SerializedName("email") val email: String? = null,
    @SerializedName("password") val password: String? = null,
    @SerializedName("role") val role: String? = null
)

data class AdminExerciseDto(
    @SerializedName("id") val id: String,
    @SerializedName("name") val name: String,
    @SerializedName("description") val description: String? = null,
    @SerializedName("muscle_group") val muscleGroup: String? = null,
    @SerializedName("equipment") val equipment: String? = null,
    @SerializedName("difficulty") val difficulty: String = "beginner",
    @SerializedName("thumbnail_url") val thumbnailUrl: String? = null,
    @SerializedName("gif_url") val gifUrl: String? = null,
    @SerializedName("video_url") val videoUrl: String? = null,
    @SerializedName("has_pose_check") val hasPoseCheck: Boolean = false,
    @SerializedName("verified") val verified: Boolean = false,
    @SerializedName("status") val status: String = "active",
    @SerializedName("deleted_at") val deletedAt: String? = null
)

data class AdminUpsertExerciseRequest(
    @SerializedName("name") val name: String? = null,
    @SerializedName("muscle_group") val muscleGroup: String? = null,
    @SerializedName("equipment") val equipment: String? = null,
    @SerializedName("difficulty") val difficulty: String? = null,
    @SerializedName("status") val status: String? = null,
    @SerializedName("verified") val verified: Boolean? = null,
    @SerializedName("thumbnail_url") val thumbnailUrl: String? = null,
    @SerializedName("gif_url") val gifUrl: String? = null,
    @SerializedName("description") val description: String? = null
)

data class AdminExerciseReportDto(
    @SerializedName("id") val id: String,
    @SerializedName("exercise_id") val exerciseId: String,
    @SerializedName("reason") val reason: String,
    @SerializedName("detail") val detail: String? = null,
    @SerializedName("status") val status: String = "pending",
    @SerializedName("exercise") val exercise: AdminReportExerciseRef? = null,
    @SerializedName("reporter") val reporter: AdminActorRef? = null
)

data class AdminReportExerciseRef(
    @SerializedName("id") val id: String,
    @SerializedName("name") val name: String,
    @SerializedName("muscle_group") val muscleGroup: String? = null,
    @SerializedName("status") val status: String? = null
)

data class AdminActorRef(
    @SerializedName("id") val id: String,
    @SerializedName("name") val name: String,
    @SerializedName("email") val email: String? = null
)

data class AdminResolveReportRequest(
    @SerializedName("action") val action: String
)

data class AdminFoodDto(
    @SerializedName("id") val id: String,
    @SerializedName("name") val name: String,
    @SerializedName("name_en") val nameEn: String? = null,
    @SerializedName("category") val category: String,
    @SerializedName("item_type") val itemType: String = "DISH",
    @SerializedName("serving_size") val servingSize: String = "1 phần",
    @SerializedName("calories") val calories: Int = 0,
    @SerializedName("protein") val protein: Double = 0.0,
    @SerializedName("carbs") val carbs: Double = 0.0,
    @SerializedName("fat") val fat: Double = 0.0,
    @SerializedName("image_url") val imageUrl: String? = null,
    @SerializedName("description") val description: String? = null,
    @SerializedName("deleted_at") val deletedAt: String? = null
)

data class AdminUpsertFoodRequest(
    @SerializedName("name") val name: String,
    @SerializedName("category") val category: String,
    @SerializedName("item_type") val itemType: String = "DISH",
    @SerializedName("serving_size") val servingSize: String = "1 phần",
    @SerializedName("calories") val calories: Int,
    @SerializedName("protein") val protein: Double,
    @SerializedName("carbs") val carbs: Double,
    @SerializedName("fat") val fat: Double,
    @SerializedName("image_url") val imageUrl: String? = null,
    @SerializedName("description") val description: String? = null
)

data class AdminCommunityPostDto(
    @SerializedName("id") val id: String,
    @SerializedName("content") val content: String,
    @SerializedName("likes_count") val likesCount: Int = 0,
    @SerializedName("comments_count") val commentsCount: Int = 0,
    @SerializedName("created_at") val createdAt: String? = null,
    @SerializedName("deleted_at") val deletedAt: String? = null,
    @SerializedName("user") val user: AdminActorRef? = null
)

data class AdminCommunityCommentDto(
    @SerializedName("id") val id: String,
    @SerializedName("post_id") val postId: String,
    @SerializedName("content") val content: String,
    @SerializedName("created_at") val createdAt: String? = null,
    @SerializedName("deleted_at") val deletedAt: String? = null,
    @SerializedName("user") val user: AdminActorRef? = null,
    @SerializedName("post") val post: AdminPostSnippetRef? = null
)

data class AdminPostSnippetRef(
    @SerializedName("id") val id: String,
    @SerializedName("content") val content: String
)

data class AdminDeleteResultDto(
    @SerializedName("id") val id: String,
    @SerializedName("deleted") val deleted: Boolean = true
)
