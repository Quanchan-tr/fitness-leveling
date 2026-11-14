package com.fittrack.app.ui.character

import android.os.Bundle
import android.webkit.WebView
import android.webkit.WebViewClient
import androidx.appcompat.app.AppCompatActivity
import androidx.lifecycle.lifecycleScope
import com.fittrack.app.data.api.ApiClient
import com.fittrack.app.data.session.SessionManager
import com.fittrack.app.databinding.ActivityCharacterViewerBinding
import kotlinx.coroutines.Dispatchers
import kotlinx.coroutines.launch
import kotlinx.coroutines.withContext

class CharacterViewerActivity : AppCompatActivity() {

    private lateinit var binding: ActivityCharacterViewerBinding
    private var zoomIndex = 0
    private val zoomSlots = listOf("full", "top", "bottom", "head")

    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)
        binding = ActivityCharacterViewerBinding.inflate(layoutInflater)
        setContentView(binding.root)

        setupWebView()
        setupListeners()
    }

    private fun setupWebView() {
        binding.webviewFullscreenCharacter.apply {
            setBackgroundColor(0)
            settings.javaScriptEnabled = true
            settings.domStorageEnabled = true
            webViewClient = object : WebViewClient() {
                override fun onPageFinished(view: WebView?, url: String?) {
                    super.onPageFinished(view, url)
                    syncAvatarFromBackend()
                }
            }
            loadUrl("file:///android_asset/character3d.html")
        }
    }

    private fun syncAvatarFromBackend() {
        if (!SessionManager.getInstance(this).isLoggedIn) return
        lifecycleScope.launch {
            try {
                val res = withContext(Dispatchers.IO) {
                    ApiClient.getService(this@CharacterViewerActivity).getAvatarConfig()
                }
                val data = res.body()?.data
                if (res.isSuccessful && data != null) {
                    val eq = data.equipped
                    val shirt = eq["TOP"]?.colorHex ?: "#FF5722"
                    val pants = eq["BOTTOM"]?.colorHex ?: "#1E293B"
                    val head = eq["HEADWEAR"]?.colorHex ?: "none"
                    val shoes = eq["SHOES"]?.colorHex ?: "#FF5722"
                    val hair = eq["HAIR"]?.colorHex ?: "#2D1E18"
                    val specialItem = eq["SPECIAL"]
                    val special = if (specialItem != null) {
                        if (specialItem.name.contains("Cánh", ignoreCase = true)) "wings" else "blink"
                    } else "none"
                    val specialColor = specialItem?.colorHex ?: ""
                    binding.webviewFullscreenCharacter.evaluateJavascript(
                        "setOutfit('$shirt', '$pants', '$head', '$shoes', '$hair', '$special', '$specialColor')",
                        null
                    )
                }
            } catch (_: Exception) { }
        }
    }

    private fun setupListeners() {
        binding.btnBack.setOnClickListener { finish() }

        binding.btnToggleRotate.setOnClickListener {
            binding.webviewFullscreenCharacter.evaluateJavascript("toggleAutoRotate()", null)
        }

        binding.btnZoomToggle.setOnClickListener {
            zoomIndex = (zoomIndex + 1) % zoomSlots.size
            val slot = zoomSlots[zoomIndex]
            binding.webviewFullscreenCharacter.evaluateJavascript("zoomSlot('$slot')", null)

            val label = when (slot) {
                "top" -> "🔍 Xem Thân Trên"
                "bottom" -> "🔍 Xem Thân Dưới"
                "head" -> "🔍 Xem Nón/Tóc"
                else -> "🔍 Toàn Thân"
            }
            binding.btnZoomToggle.text = label
        }
    }
}

