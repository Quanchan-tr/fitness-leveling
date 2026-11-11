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
                Toast.makeText(
                    requireContext(),
                    "Không thể kết nối đến máy chủ FitTrack VPS Cloud. Vui lòng kiểm tra lại kết nối mạng.",
                    Toast.LENGTH_LONG
                ).show()
                binding.btnLogin.isEnabled = true
                binding.btnLogin.text = originalText
            } catch (e: Exception) {
                Toast.makeText(requireContext(), "Đã xảy ra lỗi: ${e.localizedMessage}", Toast.LENGTH_LONG).show()
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
