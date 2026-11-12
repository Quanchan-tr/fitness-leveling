package com.fittrack.app.data.api

import com.fittrack.app.data.models.*
import retrofit2.Response
import retrofit2.http.*

interface ApiService {

    // ── Authentication ──────────────────────────────────────────
    @POST("auth/login")
    suspend fun login(
        @Body request: LoginRequest
    ): Response<ApiResponse<AuthData>>

    @POST("auth/register")
    suspend fun register(
        @Body request: RegisterRequest
    ): Response<ApiResponse<AuthData>>

    @POST("auth/verify-email")
    suspend fun verifyEmail(
        @Body request: VerifyEmailRequest
    ): Response<ApiResponse<AuthData>>

    @POST("auth/resend-verification")
    suspend fun resendVerification(
        @Body request: ResendVerificationRequest
    ): Response<ApiResponse<SimpleMessageResponse>>

    @POST("auth/forgot-password")
    suspend fun forgotPassword(
        @Body request: ForgotPasswordRequest
    ): Response<ApiResponse<SimpleMessageResponse>>

    @POST("auth/verify-reset-code")
    suspend fun verifyResetCode(
        @Body request: VerifyResetCodeRequest
    ): Response<ApiResponse<VerifyResetCodeResponse>>

    @POST("auth/reset-password")
    suspend fun resetPassword(
        @Body request: ResetPasswordRequest
    ): Response<ApiResponse<SimpleMessageResponse>>

    @GET("auth/me")
    suspend fun getMe(): Response<ApiResponse<UserProfileDto>>

    @PUT("auth/profile")
    suspend fun updateProfile(
        @Body request: com.fittrack.app.data.models.UpdateProfileRequest
    ): Response<ApiResponse<Any>>

    @POST("auth/logout")
    suspend fun logout(): Response<ApiResponse<Map<String, String>>>

    // ── Exercises Catalog ───────────────────────────────────────
    @GET("exercises")
    suspend fun getExercises(
        @Query("per_page") perPage: Int = 100,
        @Query("category") category: String? = null,
        @Query("q") q: String? = null,
        @Query("search") search: String? = null
    ): Response<ApiResponse<List<ExerciseDto>>>

    @GET("exercises/{id}")
    suspend fun getExerciseDetail(
        @Path("id") id: String
    ): Response<ApiResponse<ExerciseDto>>

    // ── Workout Routines & Logs ─────────────────────────────────
    @GET("routines")
    suspend fun getRoutines(): Response<ApiResponse<List<WorkoutRoutineDto>>>

    @POST("routines")
    suspend fun createRoutine(
        @Header("Idempotency-Key") idempotencyKey: String,
        @Body request: CreateRoutineRequest
    ): Response<ApiResponse<WorkoutRoutineDto>>

    @DELETE("routines/{id}")
    suspend fun deleteRoutine(
        @Path("id") id: String
    ): Response<ApiResponse<Map<String, Any>>>

    @GET("workout-logs")
    suspend fun getWorkoutLogs(
        @Query("per_page") perPage: Int = 100
    ): Response<ApiResponse<List<WorkoutLogDto>>>

    @POST("workout-logs")
    suspend fun createWorkoutLog(
        @Header("Idempotency-Key") idempotencyKey: String,
        @Body request: CreateWorkoutLogRequest
    ): Response<ApiResponse<WorkoutLogDto>>

    @POST("workout-logs/{id}/complete")
    suspend fun completeWorkoutLog(
        @Path("id") id: String
    ): Response<ApiResponse<WorkoutLogDto>>

    // ── Nutrition ───────────────────────────────────────────────
    @GET("foods")
    suspend fun getFoods(
        @Query("per_page") perPage: Int = 50,
        @Query("page") page: Int = 1,
        @Query("category") category: String? = null,
        @Query("item_type") itemType: String? = null,
        @Query("q") query: String? = null
    ): Response<ApiResponse<List<FoodItemDto>>>

    @GET("nutrition-logs")
    suspend fun getNutritionLogs(): Response<ApiResponse<List<NutritionLogDto>>>

    @POST("nutrition-logs")
    suspend fun createNutritionLog(
        @Header("Idempotency-Key") idempotencyKey: String,
        @Body request: CreateNutritionLogRequest
    ): Response<ApiResponse<NutritionLogDto>>

    // ── Body Metrics ────────────────────────────────────────────
    @GET("body-metrics")
    suspend fun getBodyMetrics(): Response<ApiResponse<List<BodyMetricDto>>>

    @POST("body-metrics")
    suspend fun createBodyMetric(
        @Body request: CreateBodyMetricRequest
    ): Response<ApiResponse<BodyMetricDto>>

    // ── Community ───────────────────────────────────────────────
    @GET("community/posts")
    suspend fun getCommunityPosts(): Response<ApiResponse<List<CommunityPostDto>>>

    @POST("community/posts")
    suspend fun createCommunityPost(
        @Header("Idempotency-Key") idempotencyKey: String,
        @Body request: CreatePostRequest
    ): Response<ApiResponse<CommunityPostDto>>

    @POST("community/posts/{id}/like")
    suspend fun togglePostLike(
        @Path("id") id: String
    ): Response<ApiResponse<Map<String, Any>>>

    // ── 3D Avatar & Wardrobe ────────────────────────────────────
    @GET("avatar")
    suspend fun getAvatarConfig(): Response<ApiResponse<AvatarData>>

    @POST("avatar/equip")
    suspend fun equipAvatarItem(
        @Body request: EquipAvatarRequest
    ): Response<ApiResponse<AvatarConfigDto>>

    // ── AI Workout & Meal Planner ──────────────────────────────
    @POST("ai/exercise-plan")
    suspend fun generateExercisePlan(
        @Header("Idempotency-Key") idempotencyKey: String,
        @Body request: com.fittrack.app.data.models.GenerateAiPlanRequest
    ): Response<ApiResponse<Any>>
}

