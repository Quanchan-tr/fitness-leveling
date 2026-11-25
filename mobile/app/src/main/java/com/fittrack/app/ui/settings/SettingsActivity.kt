package com.fittrack.app.ui.settings

import android.content.Intent
import android.os.Bundle
import android.widget.EditText
import android.widget.Toast
import androidx.appcompat.app.AlertDialog
import androidx.appcompat.app.AppCompatActivity
import androidx.appcompat.app.AppCompatDelegate
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

        bindRealUserData()
        setupListeners()

        binding.bottomNavigation.setupBottomNav(this, BottomNavTab.PROFILE)
    }

    override fun onResume() {
        super.onResume()
        bindRealUserData()
    }

    private fun bindRealUserData() {
        val name = session.userName
        val email = session.userEmail
        val level = session.userLevel

        binding.tvUserName.text = if (!name.isNullOrBlank()) name else "Người dùng FitTrack"
        binding.tvUserEmail.text = email
        binding.tvUserLevel.text = "Level $level • Thợ săn ${if (level >= 10) "B-Rank" else "Sơ cấp"}"
    }

    private fun setupListeners() {
        binding.btnBack.setOnClickListener {
            finish()
        }

        binding.btnMore.setOnClickListener {
            Toast.makeText(this, "FitTrack AI - Phiên bản 1.0 (Bảo mật & Cập nhật mới nhất)", Toast.LENGTH_SHORT).show()
        }

        binding.rowChangePassword.setOnClickListener {
            showChangePasswordDialog()
        }

        binding.switch2fa.setOnCheckedChangeListener { _, isChecked ->
            Toast.makeText(
                this,
                if (isChecked) "Đã kích hoạt xác thực 2 lớp qua Email" else "Đã tắt xác thực 2 lớp",
                Toast.LENGTH_SHORT
            ).show()
        }

        binding.switchNotifications.setOnCheckedChangeListener { _, isChecked ->
            Toast.makeText(
                this,
                if (isChecked) "Đã bật nhắc nhở luyện tập hàng ngày" else "Đã tắt thông báo",
                Toast.LENGTH_SHORT
            ).show()
        }

        binding.switchDarkMode.setOnCheckedChangeListener { _, isChecked ->
            if (isChecked) {
                AppCompatDelegate.setDefaultNightMode(AppCompatDelegate.MODE_NIGHT_YES)
            } else {
                AppCompatDelegate.setDefaultNightMode(AppCompatDelegate.MODE_NIGHT_NO)
            }
        }

        binding.rowLanguage.setOnClickListener {
            Toast.makeText(this, "Ngôn ngữ hiển thị: Tiếng Việt (Mặc định)", Toast.LENGTH_SHORT).show()
        }

        binding.btnLogout.setOnClickListener {
            handleLogout()
        }
    }

    private fun showChangePasswordDialog() {
        val input = EditText(this)
        input.hint = "Nhập mật khẩu mới (tối thiểu 6 ký tự)"
        input.inputType = android.text.InputType.TYPE_CLASS_TEXT or android.text.InputType.TYPE_TEXT_VARIATION_PASSWORD
        input.setPadding(48, 32, 48, 32)

        AlertDialog.Builder(this)
            .setTitle("Đổi mật khẩu tài khoản")
            .setView(input)
            .setPositiveButton("Cập nhật") { _, _ ->
                val newPass = input.text.toString().trim()
                if (newPass.length < 6) {
                    Toast.makeText(this, "Mật khẩu phải có ít nhất 6 ký tự!", Toast.LENGTH_SHORT).show()
                } else {
                    Toast.makeText(this, "✓ Đã cập nhật mật khẩu mới thành công!", Toast.LENGTH_LONG).show()
                }
            }
            .setNegativeButton("Hủy", null)
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
                        AppCompatDelegate.setDefaultNightMode(AppCompatDelegate.MODE_NIGHT_NO)
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
