package com.fittrack.app.ui.settings

import android.content.Intent
import android.os.Bundle
import android.text.InputType
import android.widget.EditText
import android.widget.LinearLayout
import android.widget.Toast
import androidx.appcompat.app.AlertDialog
import androidx.appcompat.app.AppCompatActivity
import androidx.appcompat.app.AppCompatDelegate
import androidx.lifecycle.lifecycleScope
import com.fittrack.app.MainActivity
import com.fittrack.app.data.api.ApiClient
import com.fittrack.app.data.models.ChangePasswordRequest
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

        com.fittrack.app.util.WindowInsetsHelper.applySystemInsets(
            this, binding.root, binding.layoutHeader, binding.bottomNavigation.root
        )

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

        binding.switchNotifications.isChecked = session.notificationsEnabled
        binding.switchNotifications.setOnCheckedChangeListener { _, isChecked ->
            session.notificationsEnabled = isChecked
            Toast.makeText(
                this,
                if (isChecked) "Đã bật nhắc nhở luyện tập hàng ngày" else "Đã tắt thông báo",
                Toast.LENGTH_SHORT
            ).show()
        }

        binding.switchDarkMode.isChecked = session.isDarkMode
        binding.switchDarkMode.setOnCheckedChangeListener { _, isChecked ->
            session.isDarkMode = isChecked
            AppCompatDelegate.setDefaultNightMode(
                if (isChecked) AppCompatDelegate.MODE_NIGHT_YES else AppCompatDelegate.MODE_NIGHT_NO
            )
        }

        binding.rowLanguage.setOnClickListener {
            Toast.makeText(this, "Ngôn ngữ hiển thị: Tiếng Việt (Mặc định)", Toast.LENGTH_SHORT).show()
        }

        binding.btnLogout.setOnClickListener {
            handleLogout()
        }
    }

    private fun showChangePasswordDialog() {
        val container = LinearLayout(this).apply {
            orientation = LinearLayout.VERTICAL
            setPadding(48, 24, 48, 8)
        }
        val inputCurrent = EditText(this).apply {
            hint = "Mật khẩu hiện tại"
            inputType = InputType.TYPE_CLASS_TEXT or InputType.TYPE_TEXT_VARIATION_PASSWORD
        }
        val inputNew = EditText(this).apply {
            hint = "Mật khẩu mới (tối thiểu 8 ký tự)"
            inputType = InputType.TYPE_CLASS_TEXT or InputType.TYPE_TEXT_VARIATION_PASSWORD
        }
        val inputConfirm = EditText(this).apply {
            hint = "Xác nhận mật khẩu mới"
            inputType = InputType.TYPE_CLASS_TEXT or InputType.TYPE_TEXT_VARIATION_PASSWORD
        }
        container.addView(inputCurrent)
        container.addView(inputNew)
        container.addView(inputConfirm)

        AlertDialog.Builder(this)
            .setTitle("Đổi mật khẩu tài khoản")
            .setView(container)
            .setPositiveButton("Cập nhật") { _, _ ->
                val currentPass = inputCurrent.text.toString()
                val newPass = inputNew.text.toString()
                val confirmPass = inputConfirm.text.toString()

                if (currentPass.isBlank()) {
                    Toast.makeText(this, "Vui lòng nhập mật khẩu hiện tại", Toast.LENGTH_SHORT).show()
                    return@setPositiveButton
                }
                if (newPass.length < 8) {
                    Toast.makeText(this, "Mật khẩu mới phải có ít nhất 8 ký tự!", Toast.LENGTH_SHORT).show()
                    return@setPositiveButton
                }
                if (newPass != confirmPass) {
                    Toast.makeText(this, "Mật khẩu xác nhận không khớp!", Toast.LENGTH_SHORT).show()
                    return@setPositiveButton
                }

                lifecycleScope.launch {
                    try {
                        val res = withContext(Dispatchers.IO) {
                            ApiClient.getService(this@SettingsActivity).changePassword(
                                ChangePasswordRequest(
                                    currentPassword = currentPass,
                                    newPassword = newPass,
                                    newPasswordConfirmation = confirmPass
                                )
                            )
                        }
                        if (res.isSuccessful) {
                            Toast.makeText(this@SettingsActivity, "✓ Đã cập nhật mật khẩu mới thành công!", Toast.LENGTH_LONG).show()
                        } else {
                            val errMsg = res.body()?.error?.message ?: "Không thể đổi mật khẩu. Vui lòng kiểm tra mật khẩu hiện tại."
                            Toast.makeText(this@SettingsActivity, errMsg, Toast.LENGTH_LONG).show()
                        }
                    } catch (_: Exception) {
                        Toast.makeText(this@SettingsActivity, "Không thể kết nối máy chủ. Vui lòng thử lại.", Toast.LENGTH_SHORT).show()
                    }
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
