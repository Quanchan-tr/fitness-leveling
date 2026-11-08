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
    }

    private fun setupNavigation() {
        binding.tvTitle.setOnLongClickListener {
            showServerConfigDialog()
            true
        }

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

    private fun handleLogin() {
        var email = binding.edtEmail.text?.toString()?.trim().orEmpty()
        var password = binding.edtPassword.text?.toString()?.trim().orEmpty()

        // Fallback to demo account if fields are left blank
        if (email.isBlank() && password.isBlank()) {
            email = "demo@fitnessleveling.test"
            password = "password123"
            binding.edtEmail.setText(email)
            binding.edtPassword.setText(password)
            Toast.makeText(requireContext(), "⚡ Tự động điền tài khoản Demo Lv.50", Toast.LENGTH_SHORT).show()
        } else if (email.isBlank() || password.isBlank()) {
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
                        token = authData.token,
                        id = authData.user.id,
                        name = authData.user.name,
                        email = authData.user.email,
                        level = authData.user.level,
                        xp = authData.user.xp,
                        streak = authData.user.currentStreak
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
                } else {
                    val errMsg = response.body()?.error?.message 
                        ?: "Đăng nhập thất bại (Mã lỗi HTTP ${response.code()}). Vui lòng kiểm tra lại tài khoản."
                    Toast.makeText(requireContext(), errMsg, Toast.LENGTH_LONG).show()
                    binding.btnLogin.isEnabled = true
                    binding.btnLogin.text = originalText
                }
            } catch (e: IOException) {
                val errorMsg = "Không thể kết nối đến máy chủ (${session.baseUrl})."
                AlertDialog.Builder(requireContext())
                    .setTitle("Lỗi kết nối máy chủ")
                    .setMessage("$errorMsg\n\nBạn có muốn đổi địa chỉ IP máy chủ Backend không?")
                    .setPositiveButton("Đổi IP máy chủ") { _, _ -> showServerConfigDialog() }
                    .setNegativeButton("Đóng", null)
                    .show()
                binding.btnLogin.isEnabled = true
                binding.btnLogin.text = originalText
            } catch (e: Exception) {
                Toast.makeText(requireContext(), "Đã xảy ra lỗi: ${e.localizedMessage}", Toast.LENGTH_LONG).show()
                binding.btnLogin.isEnabled = true
                binding.btnLogin.text = originalText
            }
        }
    }

    private fun showServerConfigDialog() {
        val session = SessionManager.getInstance(requireContext())
        val input = EditText(requireContext()).apply {
            setText(session.baseUrl)
            setSelection(text.length)
            hint = "http://10.0.2.2:8000/api/v1/"
        }

        AlertDialog.Builder(requireContext())
            .setTitle("Cấu hình địa chỉ máy chủ")
            .setMessage("Nhập URL Backend API (ví dụ: http://13.75.74.115:8000/api/v1/):")
            .setView(input)
            .setPositiveButton("Lưu") { _, _ ->
                val newUrl = input.text.toString().trim()
                if (newUrl.isNotBlank()) {
                    val finalUrl = if (newUrl.endsWith("/")) newUrl else "$newUrl/"
                    session.baseUrl = finalUrl
                    ApiClient.resetService()
                    Toast.makeText(requireContext(), "Đã lưu địa chỉ máy chủ: $finalUrl", Toast.LENGTH_SHORT).show()
                }
            }
            .setNegativeButton("Hủy", null)
            .setNeutralButton("Mặc định (10.0.2.2)") { _, _ ->
                session.baseUrl = SessionManager.DEFAULT_BASE_URL
                ApiClient.resetService()
                Toast.makeText(requireContext(), "Đã khôi phục mặc định: ${SessionManager.DEFAULT_BASE_URL}", Toast.LENGTH_SHORT).show()
            }
            .show()
    }

    override fun onDestroyView() {
        super.onDestroyView()
        _binding = null
    }
}
