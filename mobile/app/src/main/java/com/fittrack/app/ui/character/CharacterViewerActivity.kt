package com.fittrack.app.ui.character

import android.os.Bundle
import android.webkit.WebViewClient
import androidx.appcompat.app.AppCompatActivity
import com.fittrack.app.databinding.ActivityCharacterViewerBinding

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
            webViewClient = WebViewClient()
            loadUrl("file:///android_asset/character3d.html")
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

