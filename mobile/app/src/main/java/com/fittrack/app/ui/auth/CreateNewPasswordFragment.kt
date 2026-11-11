package com.fittrack.app.ui.auth

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
import com.fittrack.app.data.models.ResetPasswordRequest
import com.fittrack.app.databinding.ActivityCreateNewPasswordBinding
import kotlinx.coroutines.Dispatchers
import kotlinx.coroutines.launch
import kotlinx.coroutines.withContext
import java.io.IOException

class CreateNewPasswordFragment : Fragment() {

    private var _binding: ActivityCreateNewPasswordBinding? = null
    private val binding get() = _binding!!

    private val apiService by lazy { ApiClient.getService(requireContext()) }
    private var email: String = ""
    private var resetToken: String = ""

    override fun onCreateView(
        inflater: LayoutInflater,
        container: ViewGroup?,
        savedInstanceState: Bundle?
    ): View {
        _binding = ActivityCreateNewPasswordBinding.inflate(inflater, container, false)
        return binding.root
    }

    override fun onViewCreated(view: View, savedInstanceState: Bundle?) {
        super.onViewCreated(view, savedInstanceState)
        email = arguments?.getString("email") ?: ""
        resetToken = arguments?.getString("reset_token") ?: ""

        setupUI()
        setupNavigation()
    }

    private fun setupUI() {
        setupPasswordToggle(binding.edtPassword, binding.btnTogglePassword)
        setupPasswordToggle(binding.edtConfirmPassword, binding.btnToggleConfirmPassword)
    }

    private fun setupNavigation() {
        binding.btnBack.setOnClickListener {
            findNavController().navigateUp()
        }

        binding.btnUpdate.setOnClickListener {
            submitNewPassword()
        }
    }

    private fun submitNewPassword() {
        val password = binding.edtPassword.text.toString()
        val confirmPassword = binding.edtConfirmPassword.text.toString()

        if (password.length < 8) {
            Toast.makeText(requireContext(), "Mật khẩu mới phải có tối thiểu 8 ký tự", Toast.LENGTH_SHORT).show()
            return
        }

        if (password != confirmPassword) {
            Toast.makeText(requireContext(), "Mật khẩu xác nhận không trùng khớp", Toast.LENGTH_SHORT).show()
            return
        }

        if (email.isEmpty() || resetToken.isEmpty()) {
            Toast.makeText(requireContext(), "Phiên làm việc không hợp lệ. Vui lòng thực hiện lại từ đầu.", Toast.LENGTH_LONG).show()
            findNavController().navigate(R.id.action_createNewPasswordFragment_to_loginFragment)
            return
        }

        binding.btnUpdate.isEnabled = false
        val originalText = binding.btnUpdate.text.toString()
        binding.btnUpdate.text = "Đang lưu mật khẩu..."

        viewLifecycleOwner.lifecycleScope.launch {
            try {
                val req = ResetPasswordRequest(
                    email = email,
                    resetToken = resetToken,
                    password = password,
                    passwordConfirmation = confirmPassword
                )
                val response = withContext(Dispatchers.IO) {
                    apiService.resetPassword(req)
                }

                if (response.isSuccessful) {
                    Toast.makeText(
                        requireContext(),
                        "🎉 Đặt lại mật khẩu thành công! Vui lòng đăng nhập với mật khẩu mới.",
                        Toast.LENGTH_LONG
                    ).show()

                    findNavController().navigate(R.id.action_createNewPasswordFragment_to_loginFragment)
                } else {
                    val errMsg = response.body()?.error?.message ?: "Đặt lại mật khẩu thất bại. Phiên xác thực có thể đã hết hạn."
                    Toast.makeText(requireContext(), errMsg, Toast.LENGTH_LONG).show()
                    binding.btnUpdate.isEnabled = true
                    binding.btnUpdate.text = originalText
                }
            } catch (e: IOException) {
                Toast.makeText(
                    requireContext(),
                    "Không thể kết nối máy chủ FitTrack VPS Cloud. Vui lòng kiểm tra lại mạng.",
                    Toast.LENGTH_LONG
                ).show()
                binding.btnUpdate.isEnabled = true
                binding.btnUpdate.text = originalText
            } catch (e: Exception) {
                Toast.makeText(requireContext(), "Lỗi: ${e.localizedMessage}", Toast.LENGTH_LONG).show()
                binding.btnUpdate.isEnabled = true
                binding.btnUpdate.text = originalText
            }
        }
    }

    override fun onDestroyView() {
        super.onDestroyView()
        _binding = null
    }
}
