package com.fittrack.app.ui.auth

import android.content.Intent
import android.os.Bundle
import android.view.LayoutInflater
import android.view.View
import android.view.ViewGroup
import android.widget.EditText
import android.widget.Toast
import androidx.appcompat.app.AlertDialog
import androidx.fragment.app.Fragment
import androidx.lifecycle.lifecycleScope
import androidx.navigation.fragment.findNavController
import com.fittrack.app.BuildConfig
import com.fittrack.app.R
import com.fittrack.app.data.api.ApiClient
import com.fittrack.app.data.models.LoginRequest
import com.fittrack.app.data.session.SessionManager
import com.fittrack.app.databinding.ActivityLoginBinding
import com.fittrack.app.ui.dashboard.DashboardActivity
import kotlinx.coroutines.Dispatchers
import kotlinx.coroutines.launch
import kotlinx.coroutines.withContext
import java.io.IOException

class LoginFragment : Fragment() {

    private var _binding: ActivityLoginBinding? = null
    private val binding get() = _binding!!

    override fun onCreateView(
        inflater: LayoutInflater,
        container: ViewGroup?,
        savedInstanceState: Bundle?
    ): View {
        _binding = ActivityLoginBinding.inflate(inflater, container, false)
        return binding.root
    }

    override fun onViewCreated(view: View, savedInstanceState: Bundle?) {
        super.onViewCreated(view, savedInstanceState)
        setupUI()
        setupNavigation()
    }

    private fun setupUI() {
        setupPasswordToggle(binding.edtPassword, binding.btnTogglePassword)
        binding.tvSignUpPrompt.setHtmlText(R.string.dont_have_account_full)

        // Pre-fill demo account placeholder for convenience
        val session = SessionManager.getInstance(requireContext())
        if (session.userEmail.isNotBlank()) {
            binding.edtEmail.setText(session.userEmail)
        }

        // Long click header to change Server Base URL only in debug builds
        if (BuildConfig.DEBUG) {
            binding.tvTitle.setOnLongClickListener {
                showServerConfigDialog()
                true
            }
        }
    }

    private fun setupNavigation() {
        binding.btnLogin.setOnClickListener {
            handleLogin()
        }

        binding.tvForgotPassword.setOnClickListener {
            findNavController().navigate(R.id.action_loginFragment_to_forgotPasswordFragment)
        }

        binding.tvSignUpPrompt.setOnClickListener {
            findNavController().navigate(R.id.action_loginFragment_to_signUpFragment)
        }
    }

    private fun showServerConfigDialog() {
        val session = SessionManager.getInstance(requireContext())
        val input = EditText(requireContext()).apply {
            setText(session.baseUrl)
            setSelection(text.length)
            hint = SessionManager.DEFAULT_BASE_URL
        }

        AlertDialog.Builder(requireContext())
            .setTitle("⚙️ Cấu hình API Base URL")
            .setMessage("Máy chủ Production mặc định:\n${SessionManager.DEFAULT_BASE_URL}")
            .setView(input)
            .setPositiveButton("Lưu") { _, _ ->
                val newUrl = input.text.toString().trim()
                if (newUrl.isNotBlank()) {
                    session.baseUrl = if (newUrl.endsWith("/")) newUrl else "$newUrl/"
                    Toast.makeText(requireContext(), "Đã cập nhật API Base URL!", Toast.LENGTH_SHORT).show()
                }
            }
            .setNeutralButton("Khôi phục mặc định") { _, _ ->
                session.baseUrl = SessionManager.DEFAULT_BASE_URL
                Toast.makeText(requireContext(), "Đã đặt lại máy chủ mặc định", Toast.LENGTH_SHORT).show()
            }
            .setNegativeButton("Hủy", null)
            .show()
    }

    private fun handleLogin() {
        val email = binding.edtEmail.text?.toString()?.trim().orEmpty()
        val password = binding.edtPassword.text?.toString()?.trim().orEmpty()

        if (email.isBlank() || password.isBlank()) {
            Toast.makeText(requireContext(), "Vui lòng nhập đầy đủ Email và Mật khẩu", Toast.LENGTH_SHORT).show()
            return
        }

        val session = SessionManager.getInstance(requireContext())
        val apiService = ApiClient.getService(requireContext())

        // Loading state
        binding.btnLogin.isEnabled = false
        val originalText = binding.btnLogin.text
        binding.btnLogin.text = "Đang đăng nhập..."

        viewLifecycleOwner.lifecycleScope.launch {
            try {
                val response = withContext(Dispatchers.IO) {
                    apiService.login(LoginRequest(email = email, password = password))
                }

                if (response.isSuccessful && response.body()?.data != null) {
                    val authData = response.body()!!.data!!
                    session.saveUserSession(
                        token = authData.token ?: "",
                        id = authData.user.id,
                        name = authData.user.name,
                        email = authData.user.email,
                        level = authData.user.level,
                        xp = authData.user.xp,
                        streak = authData.user.currentStreak,
                        role = authData.user.role
                    )

                    Toast.makeText(
                        requireContext(),
                        "⚔️ Chào mừng ${authData.user.name} trở lại!",
                        Toast.LENGTH_SHORT
                    ).show()

                    val intent = Intent(requireContext(), DashboardActivity::class.java)
                    intent.flags = Intent.FLAG_ACTIVITY_NEW_TASK or Intent.FLAG_ACTIVITY_CLEAR_TASK
                    startActivity(intent)
                    requireActivity().finish()
                } else if (response.code() == 403) {
                    val errorBodyStr = response.errorBody()?.string() ?: ""
                    if (errorBodyStr.contains("EMAIL_NOT_VERIFIED")) {
                        Toast.makeText(
                            requireContext(),
                            "⚠️ Tài khoản chưa xác thực email. Đã gửi mã OTP mới tới email của bạn.",
                            Toast.LENGTH_LONG
                        ).show()
                        val bundle = Bundle().apply {
                            putString("email", email)
                        }
                        findNavController().navigate(R.id.action_loginFragment_to_verifyEmailFragment, bundle)
                        binding.btnLogin.isEnabled = true
                        binding.btnLogin.text = originalText
                    } else if (errorBodyStr.contains("ACCOUNT_SUSPENDED")) {
                        Toast.makeText(
                            requireContext(),
                            "Tài khoản của bạn đã bị khóa bởi quản trị viên.",
                            Toast.LENGTH_LONG
                        ).show()
                        binding.btnLogin.isEnabled = true
                        binding.btnLogin.text = originalText
                    } else {
                        Toast.makeText(requireContext(), "Truy cập bị từ chối (403)", Toast.LENGTH_LONG).show()
                        binding.btnLogin.isEnabled = true
                        binding.btnLogin.text = originalText
                    }
                } else {
                    val errMsg = response.body()?.error?.message 
                        ?: "Đăng nhập thất bại (Mã lỗi HTTP ${response.code()}). Vui lòng kiểm tra lại tài khoản."
                    Toast.makeText(requireContext(), errMsg, Toast.LENGTH_LONG).show()
                    binding.btnLogin.isEnabled = true
                    binding.btnLogin.text = originalText
                }
            } catch (_: IOException) {
                binding.btnLogin.isEnabled = true
                binding.btnLogin.text = originalText

                if (BuildConfig.DEBUG) {
                    AlertDialog.Builder(requireContext())
                        .setTitle("Không thể kết nối máy chủ")
                        .setMessage("Không thể kết nối đến: ${session.baseUrl}\n\nKiểm tra kết nối mạng hoặc đổi Base URL.")
                        .setPositiveButton("Đổi Base URL") { _, _ ->
                            showServerConfigDialog()
                        }
                        .setNegativeButton("Đóng", null)
                        .show()
                } else {
                    Toast.makeText(
                        requireContext(),
                        "Không thể kết nối đến máy chủ. Vui lòng kiểm tra kết nối Internet và thử lại.",
                        Toast.LENGTH_LONG
                    ).show()
                }
            } catch (_: Exception) {
                Toast.makeText(requireContext(), "Đã xảy ra lỗi khi đăng nhập. Vui lòng thử lại.", Toast.LENGTH_LONG).show()
                binding.btnLogin.isEnabled = true
                binding.btnLogin.text = originalText
            }
        }
    }

    override fun onDestroyView() {
        super.onDestroyView()
        _binding = null
    }
}
