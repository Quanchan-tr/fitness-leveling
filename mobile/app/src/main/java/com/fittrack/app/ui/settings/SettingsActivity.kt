package com.fittrack.app.ui.settings

import android.content.Intent
import android.os.Bundle
import android.widget.EditText
import android.widget.Toast
import androidx.appcompat.app.AlertDialog
import androidx.appcompat.app.AppCompatActivity
import androidx.lifecycle.lifecycleScope
import com.fittrack.app.MainActivity
import com.fittrack.app.data.api.ApiClient
import com.fittrack.app.data.session.SessionManager
import com.fittrack.app.databinding.ActivitySettingsBinding
import com.fittrack.app.ui.BottomNavTab
import com.fittrack.app.ui.setupBottomNav
import kotlinx.coroutines.Dispatchers
import kotlinx.coroutines.launch
import kotlinx.coroutines.withContext

class SettingsActivity : AppCompatActivity() {

    private lateinit var binding: ActivitySettingsBinding
    private lateinit var session: SessionManager

    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)
        binding = ActivitySettingsBinding.inflate(layoutInflater)
        setContentView(binding.root)

        session = SessionManager.getInstance(this)

        binding.btnBack.setOnClickListener {
            finish()
        }

        binding.btnMore.setOnClickListener {
            showServerConfigDialog()
        }

        binding.rowLanguage.setOnClickListener {
            showServerConfigDialog()
        }

        binding.btnLogout.setOnClickListener {
            handleLogout()
        }

        binding.bottomNavigation.setupBottomNav(this, BottomNavTab.PROFILE)
    }

    private fun showServerConfigDialog() {
        val input = EditText(this).apply {
            setText(session.baseUrl)
            setSelection(text.length)
            hint = "http://10.0.2.2:8000/api/v1/"
            setPadding(48, 32, 48, 32)
        }

        AlertDialog.Builder(this)
            .setTitle("⚙️ Cấu hình Máy chủ Backend")
            .setMessage("Nhập địa chỉ API Backend (Dùng 10.0.2.2 cho Android Emulator, hoặc IP mạng LAN như 192.168.x.x cho máy thật):")
            .setView(input)
            .setPositiveButton("Lưu") { _, _ ->
                val newUrl = input.text.toString().trim()
                if (newUrl.isNotBlank()) {
                    val finalUrl = if (newUrl.endsWith("/")) newUrl else "$newUrl/"
                    session.baseUrl = finalUrl
                    ApiClient.resetService()
                    Toast.makeText(this, "Đã lưu địa chỉ máy chủ: $finalUrl", Toast.LENGTH_SHORT).show()
                }
            }
            .setNegativeButton("Hủy", null)
            .setNeutralButton("Mặc định (10.0.2.2)") { _, _ ->
                session.baseUrl = SessionManager.DEFAULT_BASE_URL
                ApiClient.resetService()
                Toast.makeText(this, "Đã khôi phục mặc định: ${SessionManager.DEFAULT_BASE_URL}", Toast.LENGTH_SHORT).show()
            }
            .show()
    }

    private fun handleLogout() {
        AlertDialog.Builder(this)
            .setTitle("Đăng xuất tài khoản")
            .setMessage("Bạn có chắc chắn muốn đăng xuất khỏi ứng dụng?")
            .setPositiveButton("Đăng xuất") { _, _ ->
                lifecycleScope.launch {
                    try {
                        withContext(Dispatchers.IO) {
                            ApiClient.getService(this@SettingsActivity).logout()
                        }
                    } catch (_: Exception) {
                        // Best effort logout
                    } finally {
                        session.clearSession()
                        val intent = Intent(this@SettingsActivity, MainActivity::class.java)
                        intent.flags = Intent.FLAG_ACTIVITY_NEW_TASK or Intent.FLAG_ACTIVITY_CLEAR_TASK
                        startActivity(intent)
                        finish()
                    }
                }
            }
            .setNegativeButton("Hủy", null)
            .show()
    }
}
