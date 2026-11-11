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

        // Default Production Azure API URL
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
        get() = prefs.getString(KEY_BASE_URL, DEFAULT_BASE_URL) ?: DEFAULT_BASE_URL
        set(value) = prefs.edit().putString(KEY_BASE_URL, value).apply()

    fun saveUserSession(token: String, id: String, name: String, email: String, level: Int, xp: Int, streak: Int) {
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

