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

    @Test
    fun testWorkoutLogDtoWithSetsDeserialization() {
        val rawJson = """
            {
                "data": [
                    {
                        "id": "log-1",
                        "user_id": "u-1",
                        "log_date": "2026-11-12",
                        "sets": [
                            {
                                "id": "s-1",
                                "exercise_id": "ex-1",
                                "set_number": 1,
                                "reps": 10,
                                "weight_kg": 75.0,
                                "duration_sec": 60
                            },
                            {
                                "id": "s-2",
                                "exercise_id": "ex-1",
                                "set_number": 2,
                                "reps": 8,
                                "weight_kg": 80.0,
                                "duration_sec": 75
                            }
                        ]
                    }
                ]
            }
        """.trimIndent()

        val type = object : TypeToken<ApiResponse<List<com.fittrack.app.data.models.WorkoutLogDto>>>() {}.type
        val res: ApiResponse<List<com.fittrack.app.data.models.WorkoutLogDto>> = gson.fromJson(rawJson, type)

        assertNotNull(res.data)
        assertEquals(1, res.data!!.size)
        val sets = res.data!![0].sets
        assertNotNull(sets)
        assertEquals(2, sets!!.size)
        assertEquals(10, sets[0].reps)
        assertEquals(75.0, sets[0].weightKg ?: 0.0, 0.01)
        assertEquals(1390.0, (sets[0].weightKg!! * sets[0].reps) + (sets[1].weightKg!! * sets[1].reps), 0.01)
    }

    @Test
    fun testExerciseDtoWithInstructionsDeserialization() {
        val rawJson = """
            {
                "data": {
                    "id": "0025",
                    "name": "Barbell Bench Press",
                    "target_muscle": "Chest",
                    "instructions": [
                        "Nằm thẳng lưng trên ghế phẳng",
                        "Hạ đòn tạ xuống ngực giữa",
                        "Đẩy thanh đòn lên dứt khoát"
                    ]
                }
            }
        """.trimIndent()

        val type = object : TypeToken<ApiResponse<com.fittrack.app.data.models.ExerciseDto>>() {}.type
        val res: ApiResponse<com.fittrack.app.data.models.ExerciseDto> = gson.fromJson(rawJson, type)

        assertNotNull(res.data)
        val ex = res.data!!
        assertEquals("Barbell Bench Press", ex.name)
        assertEquals(3, ex.instructions?.size)
        assertEquals("Nằm thẳng lưng trên ghế phẳng", ex.instructions?.get(0))
    }
}

