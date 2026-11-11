package com.fittrack.app.ui.auth

import android.content.Intent
import android.os.Bundle
import android.view.LayoutInflater
import android.view.View
import android.view.ViewGroup
import android.widget.Toast
import androidx.fragment.app.Fragment
import androidx.lifecycle.lifecycleScope
import androidx.navigation.fragment.findNavController
import com.fittrack.app.R
import com.fittrack.app.data.api.ApiClient
import com.fittrack.app.data.models.RegisterRequest
import com.fittrack.app.data.session.SessionManager
import com.fittrack.app.databinding.ActivitySignUpBinding
import com.fittrack.app.ui.onboarding.OnboardingGenderActivity
import kotlinx.coroutines.Dispatchers
import kotlinx.coroutines.launch
import kotlinx.coroutines.withContext
import java.io.IOException

class SignUpFragment : Fragment() {

    private var _binding: ActivitySignUpBinding? = null
    private val binding get() = _binding!!

    override fun onCreateView(
        inflater: LayoutInflater,
        container: ViewGroup?,
        savedInstanceState: Bundle?
    ): View {
        _binding = ActivitySignUpBinding.inflate(inflater, container, false)
        return binding.root
    }

    override fun onViewCreated(view: View, savedInstanceState: Bundle?) {
        super.onViewCreated(view, savedInstanceState)
        setupUI()
        setupNavigation()
    }

    private fun setupUI() {
        setupPasswordToggle(binding.edtPassword, binding.btnTogglePassword)
        setupPasswordToggle(binding.edtConfirmPassword, binding.btnToggleConfirmPassword)
        binding.tvSignInPrompt.setHtmlText(R.string.have_account_full)
    }

    private fun setupNavigation() {
        binding.btnBack.setOnClickListener {
            findNavController().navigateUp()
        }

        binding.btnSignup.setOnClickListener {
            handleRegister()
        }

        binding.tvSignInPrompt.setOnClickListener {
            findNavController().navigate(R.id.action_signUpFragment_to_loginFragment)
        }
    }

    private fun handleRegister() {
        val fullName = binding.edtFullName.text?.toString()?.trim().orEmpty()
        val email = binding.edtEmail.text?.toString()?.trim().orEmpty()
        val password = binding.edtPassword.text?.toString()?.trim().orEmpty()
        val confirmPassword = binding.edtConfirmPassword.text?.toString()?.trim().orEmpty()

        if (fullName.isBlank() || email.isBlank() || password.isBlank()) {
            Toast.makeText(requireContext(), "Vui lòng điền đầy đủ họ tên, email và mật khẩu", Toast.LENGTH_SHORT).show()
            return
        }

        if (password != confirmPassword) {
            Toast.makeText(requireContext(), "Mật khẩu xác nhận không khớp", Toast.LENGTH_SHORT).show()
            return
        }

        if (password.length < 6) {
            Toast.makeText(requireContext(), "Mật khẩu phải từ 6 ký tự trở lên", Toast.LENGTH_SHORT).show()
            return
        }

        val session = SessionManager.getInstance(requireContext())
        val apiService = ApiClient.getService(requireContext())

        binding.btnSignup.isEnabled = false
        val originalText = binding.btnSignup.text
        binding.btnSignup.text = "Đang tạo tài khoản..."

        viewLifecycleOwner.lifecycleScope.launch {
            try {
                val req = RegisterRequest(
                    name = fullName,
                    email = email,
                    password = password
                )
                val response = withContext(Dispatchers.IO) {
                    apiService.register(req)
                }

                if (response.isSuccessful && response.body()?.data != null) {
                    val authData = response.body()!!.data!!
                    if (authData.requiresEmailVerification || authData.token.isNullOrEmpty()) {
                        Toast.makeText(
                            requireContext(),
                            "🎉 Đăng ký thành công! Vui lòng nhập mã OTP đã gửi đến email của bạn.",
                            Toast.LENGTH_LONG
                        ).show()
                        val bundle = Bundle().apply {
                            putString("email", email)
                        }
                        findNavController().navigate(R.id.action_signUpFragment_to_verifyEmailFragment, bundle)
                    } else {
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
                            "🎉 Đăng ký thành công! Hãy bắt đầu thiết lập thể lực của bạn.",
                            Toast.LENGTH_SHORT
                        ).show()

                        val intent = Intent(requireContext(), OnboardingGenderActivity::class.java)
                        intent.flags = Intent.FLAG_ACTIVITY_NEW_TASK or Intent.FLAG_ACTIVITY_CLEAR_TASK
                        startActivity(intent)
                        requireActivity().finish()
                    }
                } else {
                    val errMsg = response.body()?.error?.message ?: "Đăng ký thất bại. Email có thể đã tồn tại."
                    Toast.makeText(requireContext(), errMsg, Toast.LENGTH_LONG).show()
                    binding.btnSignup.isEnabled = true
                    binding.btnSignup.text = originalText
                }
            } catch (e: IOException) {
                Toast.makeText(
                    requireContext(),
                    "Không thể kết nối đến máy chủ FitTrack VPS Cloud. Vui lòng kiểm tra lại kết nối mạng.",
                    Toast.LENGTH_LONG
                ).show()
                binding.btnSignup.isEnabled = true
                binding.btnSignup.text = originalText
            } catch (e: Exception) {
                Toast.makeText(requireContext(), "Lỗi: ${e.localizedMessage}", Toast.LENGTH_LONG).show()
                binding.btnSignup.isEnabled = true
                binding.btnSignup.text = originalText
            }
        }
    }

    override fun onDestroyView() {
        super.onDestroyView()
        _binding = null
    }
}
