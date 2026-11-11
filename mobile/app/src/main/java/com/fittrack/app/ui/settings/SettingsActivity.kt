package com.fittrack.app.ui.settings

import android.content.Intent
import android.os.Bundle
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
            showServerInfoDialog()
        }

        binding.rowLanguage.setOnClickListener {
            Toast.makeText(this, "Ngôn ngữ hiển thị: Tiếng Việt (Mặc định)", Toast.LENGTH_SHORT).show()
        }

        binding.btnLogout.setOnClickListener {
            handleLogout()
        }

        binding.bottomNavigation.setupBottomNav(this, BottomNavTab.PROFILE)
    }

    private fun showServerInfoDialog() {
        AlertDialog.Builder(this)
            .setTitle("🌐 Máy chủ Đám mây (Azure Cloud)")
            .setMessage("Ứng dụng đang kết nối trực tiếp đến Production VPS:\n\nhttps://fittrack.eastasia.cloudapp.azure.com/api/v1/\n\nTrạng thái: Đã bảo mật qua HTTPS & Hoạt động ổn định.")
            .setPositiveButton("Đã hiểu", null)
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
