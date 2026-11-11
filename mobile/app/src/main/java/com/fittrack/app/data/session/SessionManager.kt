package com.fittrack.app.data.session

import android.content.Context
import android.content.SharedPreferences

class SessionManager(context: Context) {

    private val prefs: SharedPreferences = context.getSharedPreferences(PREF_NAME, Context.MODE_PRIVATE)

    companion object {
        private const val PREF_NAME = "fittrack_session_prefs"
        private const val KEY_AUTH_TOKEN = "auth_token"
        private const val KEY_USER_ID = "user_id"
        private const val KEY_USER_NAME = "user_name"
        private const val KEY_USER_EMAIL = "user_email"
        private const val KEY_USER_LEVEL = "user_level"
        private const val KEY_USER_XP = "user_xp"
        private const val KEY_USER_STREAK = "user_streak"
        private const val KEY_BASE_URL = "base_url"

        // User Physical Metrics
        private const val KEY_USER_WEIGHT = "user_weight"
        private const val KEY_USER_HEIGHT = "user_height"
        private const val KEY_USER_GOAL = "user_goal"
        private const val KEY_USER_GENDER = "user_gender"
        private const val KEY_USER_BIRTH_DATE = "user_birth_date"
        private const val KEY_WATER_ML = "water_logged_ml"

        // Onboarding Temp Survey State
        private const val KEY_OB_GENDER = "ob_gender"
        private const val KEY_OB_BIRTH_DATE = "ob_birth_date"
        private const val KEY_OB_WEIGHT = "ob_weight"
        private const val KEY_OB_HEIGHT = "ob_height"
        private const val KEY_OB_GOAL = "ob_goal"
        private const val KEY_OB_EXPERIENCE = "ob_experience"
        private const val KEY_OB_FREQUENCY = "ob_frequency"
        private const val KEY_OB_FOCUS_MUSCLE = "ob_focus_muscle"
        private const val KEY_OB_EQUIPMENT = "ob_equipment"

        // Production Azure API URL (strictly locked)
        const val DEFAULT_BASE_URL = "https://fittrack.eastasia.cloudapp.azure.com/api/v1/"

        @Volatile
        private var instance: SessionManager? = null

        fun getInstance(context: Context): SessionManager {
            return instance ?: synchronized(this) {
                instance ?: SessionManager(context.applicationContext).also { instance = it }
            }
        }
    }

    var authToken: String?
        get() = prefs.getString(KEY_AUTH_TOKEN, null)
        set(value) = prefs.edit().putString(KEY_AUTH_TOKEN, value).apply()

    val isLoggedIn: Boolean
        get() = !authToken.isNullOrBlank()

    var userId: String?
        get() = prefs.getString(KEY_USER_ID, null)
        set(value) = prefs.edit().putString(KEY_USER_ID, value).apply()

    var userName: String
        get() = prefs.getString(KEY_USER_NAME, "Thợ săn") ?: "Thợ săn"
        set(value) = prefs.edit().putString(KEY_USER_NAME, value).apply()

    var userEmail: String
        get() = prefs.getString(KEY_USER_EMAIL, "") ?: ""
        set(value) = prefs.edit().putString(KEY_USER_EMAIL, value).apply()

    var userLevel: Int
        get() = prefs.getInt(KEY_USER_LEVEL, 1)
        set(value) = prefs.edit().putInt(KEY_USER_LEVEL, value).apply()

    var userXp: Int
        get() = prefs.getInt(KEY_USER_XP, 0)
        set(value) = prefs.edit().putInt(KEY_USER_XP, value).apply()

    var userStreak: Int
        get() = prefs.getInt(KEY_USER_STREAK, 0)
        set(value) = prefs.edit().putInt(KEY_USER_STREAK, value).apply()

    var baseUrl: String
        get() = DEFAULT_BASE_URL
        set(_) = Unit // Locked to production VPS

    var userWeight: Float
        get() = prefs.getFloat(KEY_USER_WEIGHT, 70.0f)
        set(value) = prefs.edit().putFloat(KEY_USER_WEIGHT, value).apply()

    var userHeight: Float
        get() = prefs.getFloat(KEY_USER_HEIGHT, 175.0f)
        set(value) = prefs.edit().putFloat(KEY_USER_HEIGHT, value).apply()

    var userGoal: String
        get() = prefs.getString(KEY_USER_GOAL, "Tăng cơ") ?: "Tăng cơ"
        set(value) = prefs.edit().putString(KEY_USER_GOAL, value).apply()

    var userGender: String
        get() = prefs.getString(KEY_USER_GENDER, "male") ?: "male"
        set(value) = prefs.edit().putString(KEY_USER_GENDER, value).apply()

    var userBirthDate: String
        get() = prefs.getString(KEY_USER_BIRTH_DATE, "1998-01-01") ?: "1998-01-01"
        set(value) = prefs.edit().putString(KEY_USER_BIRTH_DATE, value).apply()

    var waterLoggedMl: Int
        get() = prefs.getInt(KEY_WATER_ML, 1250)
        set(value) = prefs.edit().putInt(KEY_WATER_ML, value).apply()

    fun addWater(ml: Int): Int {
        val total = waterLoggedMl + ml
        waterLoggedMl = total
        return total
    }

    // ── Onboarding Temporary Fields ──────────────────────────
    var obGender: String
        get() = prefs.getString(KEY_OB_GENDER, "male") ?: "male"
        set(value) = prefs.edit().putString(KEY_OB_GENDER, value).apply()

    var obBirthDate: String
        get() = prefs.getString(KEY_OB_BIRTH_DATE, "1998-05-15") ?: "1998-05-15"
        set(value) = prefs.edit().putString(KEY_OB_BIRTH_DATE, value).apply()

    var obWeight: Float
        get() = prefs.getFloat(KEY_OB_WEIGHT, 70.0f)
        set(value) = prefs.edit().putFloat(KEY_OB_WEIGHT, value).apply()

    var obHeight: Float
        get() = prefs.getFloat(KEY_OB_HEIGHT, 175.0f)
        set(value) = prefs.edit().putFloat(KEY_OB_HEIGHT, value).apply()

    var obGoal: String
        get() = prefs.getString(KEY_OB_GOAL, "gain_muscle") ?: "gain_muscle"
        set(value) = prefs.edit().putString(KEY_OB_GOAL, value).apply()

    var obExperience: String
        get() = prefs.getString(KEY_OB_EXPERIENCE, "intermediate") ?: "intermediate"
        set(value) = prefs.edit().putString(KEY_OB_EXPERIENCE, value).apply()

    var obFrequency: Int
        get() = prefs.getInt(KEY_OB_FREQUENCY, 4)
        set(value) = prefs.edit().putInt(KEY_OB_FREQUENCY, value).apply()

    var obFocusMuscle: String
        get() = prefs.getString(KEY_OB_FOCUS_MUSCLE, "chest") ?: "chest"
        set(value) = prefs.edit().putString(KEY_OB_FOCUS_MUSCLE, value).apply()

    var obEquipment: String
        get() = prefs.getString(KEY_OB_EQUIPMENT, "full_gym") ?: "full_gym"
        set(value) = prefs.edit().putString(KEY_OB_EQUIPMENT, value).apply()

    var isWorkoutActive: Boolean
        get() = prefs.getBoolean("is_workout_active", false)
        set(value) = prefs.edit().putBoolean("is_workout_active", value).apply()

    var activeWorkoutName: String
        get() = prefs.getString("active_workout_name", "Buổi tập thể lực") ?: "Buổi tập thể lực"
        set(value) = prefs.edit().putString("active_workout_name", value).apply()

    fun saveUserSession(
        token: String,
        id: String,
        name: String,
        email: String,
        level: Int = 1,
        xp: Int = 0,
        streak: Int = 0
    ) {
        prefs.edit()
            .putString(KEY_AUTH_TOKEN, token)
            .putString(KEY_USER_ID, id)
            .putString(KEY_USER_NAME, name)
            .putString(KEY_USER_EMAIL, email)
            .putInt(KEY_USER_LEVEL, level)
            .putInt(KEY_USER_XP, xp)
            .putInt(KEY_USER_STREAK, streak)
            .apply()
    }

    fun clearSession() {
        prefs.edit()
            .remove(KEY_AUTH_TOKEN)
            .remove(KEY_USER_ID)
            .remove(KEY_USER_NAME)
            .remove(KEY_USER_EMAIL)
            .remove(KEY_USER_LEVEL)
            .remove(KEY_USER_XP)
            .remove(KEY_USER_STREAK)
            .apply()
    }
}
