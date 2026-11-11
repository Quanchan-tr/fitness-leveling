package com.fittrack.app

import com.fittrack.app.data.models.ApiResponse
import com.fittrack.app.data.models.AuthData
import com.fittrack.app.data.models.LoginRequest
import com.fittrack.app.data.models.UserProfileDto
import com.fittrack.app.data.session.SessionManager
import com.google.gson.Gson
import com.google.gson.reflect.TypeToken
import org.junit.Assert.assertEquals
import org.junit.Assert.assertNotNull
import org.junit.Assert.assertTrue
import org.junit.Test

class NetworkSerializationTest {

    private val gson = Gson()

    @Test
    fun testLoginRequestSerialization() {
        val req = LoginRequest(email = "demo@fitnessleveling.test", password = "password123")
        val json = gson.toJson(req)
        assertTrue(json.contains("\"email\":\"demo@fitnessleveling.test\""))
        assertTrue(json.contains("\"password\":\"password123\""))
    }

    @Test
    fun testAuthApiResponseDeserialization() {
        val rawJson = """
            {
                "data": {
                    "user": {
                        "id": "11111111-1111-1111-1111-111111111111",
                        "name": "Demo Athlete (Lv.50)",
                        "email": "demo@fitnessleveling.test",
                        "level": 50,
                        "xp": 450,
                        "current_streak": 17
                    },
                    "token": "1|sanctum_token_sample"
                }
            }
        """.trimIndent()

        val type = object : TypeToken<ApiResponse<AuthData>>() {}.type
        val response: ApiResponse<AuthData> = gson.fromJson(rawJson, type)

        assertNotNull(response.data)
        assertEquals("1|sanctum_token_sample", response.data!!.token)
        assertEquals("Demo Athlete (Lv.50)", response.data!!.user.name)
        assertEquals(50, response.data!!.user.level)
        assertEquals(17, response.data!!.user.currentStreak)
    }

    @Test
    fun testUserProfileGamificationDeserialization() {
        val rawJson = """
            {
                "data": {
                    "id": "11111111-1111-1111-1111-111111111111",
                    "name": "Hunter Jin-Woo",
                    "email": "jinwoo@fitapp.test",
                    "gamification": {
                        "level": 18,
                        "xp": 350,
                        "current_streak": 14,
                        "stats": {
                            "strength": 45,
                            "stamina": 38,
                            "agility": 42
                        },
                        "daily_quests": [
                            {
                                "id": "q-1",
                                "title": "Hoàn thành 1 buổi tập",
                                "xp_reward": 100,
                                "completed": true
                            }
                        ]
                    }
                }
            }
        """.trimIndent()

        val type = object : TypeToken<ApiResponse<UserProfileDto>>() {}.type
        val response: ApiResponse<UserProfileDto> = gson.fromJson(rawJson, type)

        assertNotNull(response.data)
        val profile = response.data!!
        assertEquals("Hunter Jin-Woo", profile.name)
        assertNotNull(profile.gamification)
        assertEquals(18, profile.gamification!!.level)
        assertEquals(45, profile.gamification!!.stats?.strength)
        assertEquals(1, profile.gamification!!.dailyQuests.size)
        assertEquals("Hoàn thành 1 buổi tập", profile.gamification!!.dailyQuests[0].title)
    }

    @Test
    fun testDefaultBaseUrlFormat() {
        assertEquals("https://fittrack.eastasia.cloudapp.azure.com/api/v1/", SessionManager.DEFAULT_BASE_URL)
    }
}

