package com.fittrack.app.ui.dashboard

import android.app.Activity
import android.content.Intent
import android.os.Bundle
import android.webkit.WebViewClient
import androidx.activity.result.contract.ActivityResultContracts
import androidx.appcompat.app.AppCompatActivity
import com.fittrack.app.databinding.ActivityDashboardBinding
import com.fittrack.app.ui.BottomNavTab
import com.fittrack.app.ui.character.CharacterViewerActivity
import com.fittrack.app.ui.modal.DailyQuestsModalActivity
import com.fittrack.app.ui.modal.WardrobeModalActivity
import com.fittrack.app.ui.profile.UserProfileActivity
import com.fittrack.app.ui.routine.RoutineDetailActivity
import com.fittrack.app.ui.setupBottomNav
import com.fittrack.app.ui.workout.ActiveWorkoutActivity

class DashboardActivity : AppCompatActivity() {

    private lateinit var binding: ActivityDashboardBinding

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

        setup3DCharacter()
        setupInteractions()
        setupBottomNav()
    }

    private fun setup3DCharacter() {
        binding.webview3dCharacter.apply {
            setBackgroundColor(0) // Transparent background
            settings.javaScriptEnabled = true
            settings.domStorageEnabled = true
            webViewClient = object : WebViewClient() {
                override fun onPageFinished(view: android.webkit.WebView?, url: String?) {
                    super.onPageFinished(view, url)
                    // Ensure special effects (wings, blink, particles) ONLY show when equipped
                    evaluateJavascript("setSpecialEffect('none', '')", null)
                }
            }
            loadUrl("file:///android_asset/character3d.html")
        }
    }

    private fun setupInteractions() {
        // Top-left Avatar opens Profile
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

        binding.btnEnterWorkoutNow.setOnClickListener {
            startActivity(Intent(this, RoutineDetailActivity::class.java))
        }

        binding.cardTodayWorkout.setOnClickListener {
            startActivity(Intent(this, RoutineDetailActivity::class.java))
        }

        binding.btnOpenDailyQuests.setOnClickListener {
            startActivity(Intent(this, DailyQuestsModalActivity::class.java))
        }

        binding.layoutFloatingWorkout.setOnClickListener {
            startActivity(Intent(this, ActiveWorkoutActivity::class.java))
        }

        binding.tvFloatingContinue.setOnClickListener {
            startActivity(Intent(this, ActiveWorkoutActivity::class.java))
        }
    }

    private fun setupBottomNav() {
        binding.bottomNavigation.setupBottomNav(this, BottomNavTab.DASHBOARD)
    }
}
