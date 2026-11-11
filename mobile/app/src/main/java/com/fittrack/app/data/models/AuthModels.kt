package com.fittrack.app.data.models

import com.google.gson.annotations.SerializedName

data class LoginRequest(
    @SerializedName("email") val email: String,
    @SerializedName("password") val password: String
)

data class RegisterRequest(
    @SerializedName("name") val name: String,
    @SerializedName("email") val email: String,
    @SerializedName("password") val password: String,
    @SerializedName("gender") val gender: String = "male",
    @SerializedName("weight_kg") val weightKg: Double = 70.0,
    @SerializedName("height_cm") val heightCm: Double = 175.0,
    @SerializedName("birth_date") val birthDate: String = "1998-01-01"
)

data class AuthData(
    @SerializedName("user") val user: UserDto,
    @SerializedName("token") val token: String
)

data class UserDto(
    @SerializedName("id") val id: String,
    @SerializedName("name") val name: String,
    @SerializedName("email") val email: String,
    @SerializedName("role") val role: String? = null,
    @SerializedName("gender") val gender: String? = null,
    @SerializedName("weight_kg") val weightKg: Double? = null,
    @SerializedName("height_cm") val heightCm: Double? = null,
    @SerializedName("level") val level: Int = 1,
    @SerializedName("xp") val xp: Int = 0,
    @SerializedName("current_streak") val currentStreak: Int = 0
)

data class UserProfileDto(
    @SerializedName("id") val id: String,
    @SerializedName("name") val name: String,
    @SerializedName("email") val email: String,
    @SerializedName("role") val role: String? = null,
    @SerializedName("gender") val gender: String? = null,
    @SerializedName("weight_kg") val weightKg: Double? = null,
    @SerializedName("height_cm") val heightCm: Double? = null,
    @SerializedName("birth_date") val birthDate: String? = null,
    @SerializedName("activity_level") val activityLevel: String? = null,
    @SerializedName("goal") val goal: String? = null,
    @SerializedName("gamification") val gamification: GamificationDto? = null
)

data class GamificationDto(
    @SerializedName("level") val level: Int = 1,
    @SerializedName("xp") val xp: Int = 0,
    @SerializedName("current_streak") val currentStreak: Int = 0,
    @SerializedName("stats") val stats: HunterStatsDto? = null,
    @SerializedName("daily_quests") val dailyQuests: List<DailyQuestDto> = emptyList()
)

data class HunterStatsDto(
    @SerializedName("strength") val strength: Int = 10,
    @SerializedName("stamina") val stamina: Int = 10,
    @SerializedName("agility") val agility: Int = 10
)

data class DailyQuestDto(
    @SerializedName("id") val id: String,
    @SerializedName("title") val title: String,
    @SerializedName("xp_reward") val xpReward: Int = 50,
    @SerializedName("completed") val completed: Boolean = false
)

data class UpdateProfileRequest(
    @SerializedName("name") val name: String? = null,
    @SerializedName("weight_kg") val weightKg: Double? = null,
    @SerializedName("height_cm") val heightCm: Double? = null,
    @SerializedName("goal") val goal: String? = null,
    @SerializedName("gender") val gender: String? = null,
    @SerializedName("birth_date") val birthDate: String? = null
)

