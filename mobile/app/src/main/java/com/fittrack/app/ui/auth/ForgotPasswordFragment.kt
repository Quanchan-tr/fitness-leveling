package com.fittrack.app.ui.auth

import android.os.Bundle
import android.util.Patterns
import android.view.LayoutInflater
import android.view.View
import android.view.ViewGroup
import android.widget.Toast
import androidx.fragment.app.Fragment
import androidx.lifecycle.lifecycleScope
import androidx.navigation.fragment.findNavController
import com.fittrack.app.R
import com.fittrack.app.data.api.ApiClient
import com.fittrack.app.data.models.ForgotPasswordRequest
import com.fittrack.app.databinding.ActivityForgotPasswordBinding
import kotlinx.coroutines.Dispatchers
import kotlinx.coroutines.launch
import kotlinx.coroutines.withContext
import java.io.IOException

class ForgotPasswordFragment : Fragment() {

    private var _binding: ActivityForgotPasswordBinding? = null
    private val binding get() = _binding!!

    private val apiService by lazy { ApiClient.getService(requireContext()) }

    override fun onCreateView(
        inflater: LayoutInflater,
        container: ViewGroup?,
        savedInstanceState: Bundle?
    ): View {
        _binding = ActivityForgotPasswordBinding.inflate(inflater, container, false)
        return binding.root
    }

    override fun onViewCreated(view: View, savedInstanceState: Bundle?) {
        super.onViewCreated(view, savedInstanceState)
        setupUI()
        setupNavigation()
    }

    private fun setupUI() {
        binding.tvLoginPrompt.setHtmlText(R.string.remember_password_full)
    }

    private fun setupNavigation() {
        binding.btnBack.setOnClickListener {
            findNavController().navigateUp()
        }

        binding.btnSubmit.setOnClickListener {
            submitForgotPassword()
        }

        binding.tvLoginPrompt.setOnClickListener {
            findNavController().navigate(R.id.action_forgotPasswordFragment_to_loginFragment)
        }
    }

    private fun submitForgotPassword() {
        val email = binding.edtEmail.text.toString().trim()

        if (email.isEmpty() || !Patterns.EMAIL_ADDRESS.matcher(email).matches()) {
            Toast.makeText(requireContext(), "Vui lòng nhập địa chỉ email hợp lệ", Toast.LENGTH_SHORT).show()
            return
        }

        binding.btnSubmit.isEnabled = false
        val originalText = binding.btnSubmit.text.toString()
        binding.btnSubmit.text = "Đang gửi mã..."

        viewLifecycleOwner.lifecycleScope.launch {
            try {
                val response = withContext(Dispatchers.IO) {
                    apiService.forgotPassword(ForgotPasswordRequest(email = email))
                }

                if (response.isSuccessful) {
                    Toast.makeText(
                        requireContext(),
                        "Mã xác thực 6 số đã được gửi tới email của bạn.",
                        Toast.LENGTH_LONG
                    ).show()

                    val bundle = Bundle().apply {
                        putString("email", email)
                    }
                    findNavController().navigate(
                        R.id.action_forgotPasswordFragment_to_verifyForgotPasswordFragment,
                        bundle
                    )
                } else {
                    val errMsg = response.body()?.error?.message ?: "Email không tồn tại trong hệ thống FitTrack AI."
                    Toast.makeText(requireContext(), errMsg, Toast.LENGTH_LONG).show()
                    binding.btnSubmit.isEnabled = true
                    binding.btnSubmit.text = originalText
                }
            } catch (e: IOException) {
                Toast.makeText(
                    requireContext(),
                    "Không thể kết nối máy chủ FitTrack VPS Cloud. Vui lòng kiểm tra lại mạng.",
                    Toast.LENGTH_LONG
                ).show()
                binding.btnSubmit.isEnabled = true
                binding.btnSubmit.text = originalText
            } catch (e: Exception) {
                Toast.makeText(requireContext(), "Lỗi: ${e.localizedMessage}", Toast.LENGTH_LONG).show()
                binding.btnSubmit.isEnabled = true
                binding.btnSubmit.text = originalText
            }
        }
    }

    override fun onDestroyView() {
        super.onDestroyView()
        _binding = null
    }
}
