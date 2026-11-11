package com.fittrack.app.data.models

import com.google.gson.annotations.SerializedName

// ── Exercises ───────────────────────────────────────────────
data class ExerciseDto(
    @SerializedName("id") val id: String,
    @SerializedName("name") val name: String,
    @SerializedName("category") val category: String? = null,
    @SerializedName("body_part") val bodyPart: String? = null,
    @SerializedName("target_muscle") val targetMuscle: String? = null,
    @SerializedName("equipment") val equipment: String? = null,
    @SerializedName("gif_url") val gifUrl: String? = null,
    @SerializedName("thumbnail_url") val thumbnailUrl: String? = null,
    @SerializedName("has_ai_check") val hasAiCheck: Boolean = false,
    @SerializedName("description") val description: String? = null
)

// ── Workout Routines & Logs ─────────────────────────────────
data class WorkoutRoutineDto(
    @SerializedName("id") val id: String,
    @SerializedName("title") val title: String,
    @SerializedName("description") val description: String? = null,
    @SerializedName("target_split") val targetSplit: String? = null,
    @SerializedName("estimated_minutes") val estimatedMinutes: Int = 45,
    @SerializedName("is_active") val isActive: Boolean = false,
    @SerializedName("routine_data") val routineData: Map<String, Any>? = null
)

data class CreateWorkoutLogRequest(
    @SerializedName("log_date") val logDate: String,
    @SerializedName("notes") val notes: String? = null
)

data class WorkoutLogDto(
    @SerializedName("id") val id: String,
    @SerializedName("user_id") val userId: String,
    @SerializedName("log_date") val logDate: String,
    @SerializedName("status") val status: String? = null,
    @SerializedName("total_xp_earned") val totalXpEarned: Int = 0
)

// ── Nutrition Logs ──────────────────────────────────────────
data class NutritionLogDto(
    @SerializedName("id") val id: String,
    @SerializedName("meal_type") val mealType: String,
    @SerializedName("food_name") val foodName: String,
    @SerializedName("calories") val calories: Int,
    @SerializedName("protein_g") val proteinGrams: Double = 0.0,
    @SerializedName("carbs_g") val carbsGrams: Double = 0.0,
    @SerializedName("fat_g") val fatGrams: Double = 0.0,
    @SerializedName("log_date") val logDate: String? = null
)

data class CreateNutritionLogRequest(
    @SerializedName("log_date") val logDate: String,
    @SerializedName("meal_type") val mealType: String,
    @SerializedName("food_name") val foodName: String,
    @SerializedName("calories") val calories: Int,
    @SerializedName("protein_g") val proteinGrams: Double = 0.0,
    @SerializedName("carbs_g") val carbsGrams: Double = 0.0,
    @SerializedName("fat_g") val fatGrams: Double = 0.0
)

// ── Body Metrics ────────────────────────────────────────────
data class BodyMetricDto(
    @SerializedName("id") val id: String,
    @SerializedName("weight_kg") val weightKg: Double,
    @SerializedName("body_fat_pct") val bodyFatPct: Double? = null,
    @SerializedName("height_cm") val heightCm: Double? = null,
    @SerializedName("log_date") val logDate: String? = null
)

data class CreateBodyMetricRequest(
    @SerializedName("log_date") val logDate: String,
    @SerializedName("weight_kg") val weightKg: Double,
    @SerializedName("body_fat_pct") val bodyFatPct: Double? = null,
    @SerializedName("height_cm") val heightCm: Double? = null
)

// ── Community ───────────────────────────────────────────────
data class CommunityPostDto(
    @SerializedName("id") val id: String,
    @SerializedName("user_id") val userId: String,
    @SerializedName("user_name") val userName: String? = null,
    @SerializedName("content") val content: String,
    @SerializedName("media_url") val mediaUrl: String? = null,
    @SerializedName("likes_count") val likesCount: Int = 0,
    @SerializedName("comments_count") val commentsCount: Int = 0,
    @SerializedName("is_liked") val isLiked: Boolean = false,
    @SerializedName("created_at") val createdAt: String? = null
)

data class CreatePostRequest(
    @SerializedName("content") val content: String,
    @SerializedName("media_url") val mediaUrl: String? = null
)

// ── 3D Avatar & Wardrobe ────────────────────────────────────
data class AvatarData(
    @SerializedName("config") val config: AvatarConfigDto? = null,
    @SerializedName("inventory") val inventory: List<AvatarItemDto> = emptyList()
)

data class AvatarConfigDto(
    @SerializedName("gender") val gender: String = "male",
    @SerializedName("skin_tone") val skinTone: String = "#F5D0C5",
    @SerializedName("equipped_shirt") val equippedShirt: String? = "shirt_basic_gray",
    @SerializedName("equipped_pants") val equippedPants: String? = "pants_basic_dark",
    @SerializedName("equipped_head") val equippedHead: String? = "head_none",
    @SerializedName("equipped_shoes") val equippedShoes: String? = "shoes_basic_white",
    @SerializedName("equipped_weapon") val equippedWeapon: String? = "weapon_none",
    @SerializedName("equipped_aura") val equippedAura: String? = "aura_none",
    @SerializedName("equipped_jewelry") val equippedJewelry: String? = "jewelry_none"
)

data class AvatarItemDto(
    @SerializedName("id") val id: String,
    @SerializedName("slot") val slot: String,
    @SerializedName("name") val name: String,
    @SerializedName("rarity") val rarity: String = "common",
    @SerializedName("model_id") val modelId: String
)

data class EquipAvatarRequest(
    @SerializedName("slot") val slot: String,
    @SerializedName("item_id") val itemId: String
)

