package com.fittrack.app.ui.dashboard

import android.app.Activity
import android.content.Intent
import android.os.Bundle
import android.view.View
import android.webkit.WebViewClient
import android.widget.Toast
import androidx.activity.result.contract.ActivityResultContracts
import androidx.appcompat.app.AppCompatActivity
import androidx.lifecycle.lifecycleScope
import com.fittrack.app.data.api.ApiClient
import com.fittrack.app.data.session.SessionManager
import com.fittrack.app.databinding.ActivityDashboardBinding
import com.fittrack.app.ui.BottomNavTab
import com.fittrack.app.ui.character.CharacterViewerActivity
import com.fittrack.app.ui.modal.DailyQuestsModalActivity
import com.fittrack.app.ui.modal.WardrobeModalActivity
import com.fittrack.app.ui.profile.UserProfileActivity
import com.fittrack.app.ui.routine.RoutineDetailActivity
import com.fittrack.app.ui.setupBottomNav
import com.fittrack.app.ui.workout.ActiveWorkoutActivity
import kotlinx.coroutines.Dispatchers
import kotlinx.coroutines.launch
import kotlinx.coroutines.withContext

class DashboardActivity : AppCompatActivity() {

    private lateinit var binding: ActivityDashboardBinding
    private lateinit var session: SessionManager

    private val wardrobeLauncher = registerForActivityResult(
        ActivityResultContracts.StartActivityForResult()
    ) { result ->
        if (result.resultCode == Activity.RESULT_OK) {
            val shirt = result.data?.getStringExtra("SELECTED_SHIRT_COLOR") ?: "#FF5722"
            val shorts = result.data?.getStringExtra("SELECTED_SHORTS_COLOR") ?: "#1E293B"
            val headband = result.data?.getStringExtra("SELECTED_HEADBAND_COLOR") ?: "none"
            val shoes = result.data?.getStringExtra("SELECTED_SHOE_COLOR") ?: "#FF5722"
            val hair = result.data?.getStringExtra("SELECTED_HAIR_COLOR") ?: "#2D1E18"
            val specialType = result.data?.getStringExtra("SELECTED_SPECIAL_TYPE") ?: "none"
            val specialColor = result.data?.getStringExtra("SELECTED_SPECIAL_COLOR") ?: ""
            binding.webview3dCharacter.evaluateJavascript(
                "setOutfit('$shirt', '$shorts', '$headband', '$shoes', '$hair', '$specialType', '$specialColor')",
                null
            )
        }
    }

    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)
        binding = ActivityDashboardBinding.inflate(layoutInflater)
        setContentView(binding.root)

        session = SessionManager.getInstance(this)

        setup3DCharacter()
        bindCachedUserData()
        setupInteractions()
        setupBottomNav()

        fetchFreshDataFromBackend()
    }

    override fun onResume() {
        super.onResume()
        bindCachedUserData()
        fetchFreshDataFromBackend()
    }

    private var activeRoutineId: String? = null
    private var activeRoutineTitle: String? = null

    private fun bindCachedUserData() {
        binding.tvUserName.text = session.userName
        binding.tvLevelBadge.text = "CẤP ${session.userLevel}"
        binding.tvStreakBadge.text = "🔥 ${session.userStreak} NGÀY"

        val currentXp = session.userXp
        val maxXp = maxOf(200, session.userLevel * 200)
        binding.tvXpProgress.text = "XP: $currentXp / $maxXp"
        binding.progressLevelXp.max = maxXp
        binding.progressLevelXp.progress = currentXp
    }

    private fun fetchFreshDataFromBackend() {
        if (!session.isLoggedIn) {
            Toast.makeText(this, "Vui lòng đăng nhập để đồng bộ dữ liệu", Toast.LENGTH_SHORT).show()
            return
        }

        val apiService = ApiClient.getService(this)

        lifecycleScope.launch {
            // 1. Fetch User Profile and Gamification
            try {
                val profileRes = withContext(Dispatchers.IO) { apiService.getMe() }
                if (profileRes.isSuccessful && profileRes.body()?.data != null) {
                    val profile = profileRes.body()!!.data!!
                    val gamification = profile.gamification

                    val level = gamification?.level ?: session.userLevel
                    val xp = gamification?.xp ?: session.userXp
                    val streak = gamification?.currentStreak ?: session.userStreak

                    session.saveUserSession(
                        token = session.authToken.orEmpty(),
                        id = profile.id,
                        name = profile.name,
                        email = profile.email,
                        level = level,
                        xp = xp,
                        streak = streak
                    )

                    bindCachedUserData()
                } else {
                    Toast.makeText(this@DashboardActivity, "Lỗi tải hồ sơ (${profileRes.code()})", Toast.LENGTH_SHORT).show()
                }
            } catch (e: Exception) {
                Toast.makeText(this@DashboardActivity, "Không thể kết nối máy chủ: ${e.localizedMessage}", Toast.LENGTH_SHORT).show()
            }

            // 2. Fetch Active Workout Routines
            try {
                val routinesRes = withContext(Dispatchers.IO) { apiService.getRoutines() }
                if (routinesRes.isSuccessful) {
                    val routines = routinesRes.body()?.data.orEmpty()
                    if (routines.isNotEmpty()) {
                        val firstRoutine = routines.first()
                        activeRoutineId = firstRoutine.id
                        activeRoutineTitle = firstRoutine.title
                        binding.tvWorkoutName.text = firstRoutine.title
                    } else {
                        activeRoutineId = null
                        activeRoutineTitle = null
                        binding.tvWorkoutName.text = "Chưa có giáo án tập luyện"
                    }
                } else {
                    binding.tvWorkoutName.text = "Không tải được giáo án"
                }
            } catch (_: Exception) {
                binding.tvWorkoutName.text = "Lỗi kết nối giáo án"
            }

            // 3. Sync 3D Avatar Customization
            try {
                val avatarRes = withContext(Dispatchers.IO) { apiService.getAvatarConfig() }
                val data = avatarRes.body()?.data
                if (avatarRes.isSuccessful && data != null) {
                    val equipped = data.equipped
                    val cfg = data.config
                    val shirtColor = equipped["TOP"]?.colorHex ?: mapItemToHex(cfg?.equippedShirt, "#FF5722")
                    val pantsColor = equipped["BOTTOM"]?.colorHex ?: mapItemToHex(cfg?.equippedPants, "#1E293B")
                    val headColor = equipped["HEADWEAR"]?.colorHex
                        ?: if (cfg?.equippedHead == "head_none" || cfg?.equippedHead.isNullOrBlank()) "none" else "#F59E0B"
                    val shoeColor = equipped["SHOES"]?.colorHex ?: mapItemToHex(cfg?.equippedShoes, "#FF5722")
                    val hairColor = equipped["HAIR"]?.colorHex ?: "#2D1E18"
                    val specialItem = equipped["SPECIAL"]
                    val special = if (specialItem != null) {
                        if (specialItem.name.contains("Cánh", ignoreCase = true)) "wings" else "blink"
                    } else if (cfg?.equippedAura != "aura_none" && !cfg?.equippedAura.isNullOrBlank()) {
                        "aura"
                    } else {
                        "none"
                    }
                    val specialColor = specialItem?.colorHex ?: "#3B82F6"

                    binding.webview3dCharacter.evaluateJavascript(
                        "setOutfit('$shirtColor', '$pantsColor', '$headColor', '$shoeColor', '$hairColor', '$special', '$specialColor')",
                        null
                    )
                }
            } catch (_: Exception) {
                // Avatar sync failed; keep default WebView render
            }
        }
    }

    private fun mapItemToHex(itemId: String?, defaultHex: String): String {
        return when (itemId) {
            "shirt_basic_blue", "top-1" -> "#2563EB"
            "shirt_shadow_black", "top-2" -> "#0F172A"
            "shirt_crimson_red", "top-3" -> "#DC2626"
            "shirt_emerald_green", "top-4" -> "#059669"
            "pants_basic_dark", "bot-1" -> "#1E293B"
            "pants_combat_camo", "bot-2" -> "#334155"
            "shoes_basic_white", "shoe-1" -> "#F8FAFC"
            "shoes_speed_runner", "shoe-2" -> "#E11D48"
            else -> defaultHex
        }
    }

    private fun setup3DCharacter() {
        binding.webview3dCharacter.apply {
            setBackgroundColor(0) // Transparent background
            settings.javaScriptEnabled = true
            settings.domStorageEnabled = true
            webViewClient = object : WebViewClient() {
                override fun onPageFinished(view: android.webkit.WebView?, url: String?) {
                    super.onPageFinished(view, url)
                    evaluateJavascript("setSpecialEffect('none', '')", null)
                }
            }
            loadUrl("file:///android_asset/character3d.html")
        }
    }

    private fun setupInteractions() {
        binding.ivHeaderAvatar.setOnClickListener {
            startActivity(Intent(this, UserProfileActivity::class.java))
        }

        binding.btnRotateAvatar.setOnClickListener {
            binding.webview3dCharacter.evaluateJavascript("toggleAutoRotate()", null)
        }

        binding.flCharacterFrame.setOnClickListener {
            startActivity(Intent(this, CharacterViewerActivity::class.java))
        }

        binding.btnExpandCharacter.setOnClickListener {
            startActivity(Intent(this, CharacterViewerActivity::class.java))
        }

        binding.btnOutfitAvatar.setOnClickListener {
            wardrobeLauncher.launch(Intent(this, WardrobeModalActivity::class.java))
        }

        val openTodayRoutine = {
            if (activeRoutineId != null) {
                startActivity(Intent(this, RoutineDetailActivity::class.java).apply {
                    putExtra("ROUTINE_ID", activeRoutineId)
                    putExtra("ROUTINE_TITLE", activeRoutineTitle)
                })
            } else {
                startActivity(Intent(this, com.fittrack.app.ui.workout.WorkoutsActivity::class.java))
            }
        }

        binding.btnEnterWorkoutNow.setOnClickListener { openTodayRoutine() }
        binding.cardTodayWorkout.setOnClickListener { openTodayRoutine() }

        binding.btnOpenDailyQuests.setOnClickListener {
            startActivity(Intent(this, DailyQuestsModalActivity::class.java))
        }

        binding.btnNotification.setOnClickListener {
            startActivity(Intent(this, DailyQuestsModalActivity::class.java))
        }

        binding.layoutFloatingWorkout.setOnClickListener {
            startActivity(Intent(this, ActiveWorkoutActivity::class.java))
        }

        binding.tvFloatingContinue.setOnClickListener {
            startActivity(Intent(this, ActiveWorkoutActivity::class.java))
        }

        // Hydration widget has no backend endpoint yet — hide unbacked local-only buttons
        binding.btnAddWater250.visibility = android.view.View.GONE
        binding.btnAddWater500.visibility = android.view.View.GONE
    }

    private fun setupBottomNav() {
        binding.bottomNavigation.setupBottomNav(this, BottomNavTab.DASHBOARD)
    }
}
