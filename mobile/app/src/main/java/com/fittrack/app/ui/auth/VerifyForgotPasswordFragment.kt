package com.fittrack.app.ui.auth

import android.os.Bundle
import android.os.CountDownTimer
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
import com.fittrack.app.data.models.VerifyResetCodeRequest
import com.fittrack.app.databinding.ActivityVerifyForgotPasswordBinding
import kotlinx.coroutines.Dispatchers
import kotlinx.coroutines.launch
import kotlinx.coroutines.withContext
import java.io.IOException

class VerifyForgotPasswordFragment : Fragment() {

    private var _binding: ActivityVerifyForgotPasswordBinding? = null
    private val binding get() = _binding!!

    private val apiService by lazy { ApiClient.getService(requireContext()) }
    private var email: String = ""
    private var resendTimer: CountDownTimer? = null
    private var isResendCooldown = false

    override fun onCreateView(
        inflater: LayoutInflater,
        container: ViewGroup?,
        savedInstanceState: Bundle?
    ): View {
        _binding = ActivityVerifyForgotPasswordBinding.inflate(inflater, container, false)
        return binding.root
    }

    override fun onViewCreated(view: View, savedInstanceState: Bundle?) {
        super.onViewCreated(view, savedInstanceState)
        email = arguments?.getString("email") ?: ""

        setupUI()
        setupNavigation()
    }

    private fun setupUI() {
        if (email.isNotEmpty()) {
            binding.tvSubtitle.text = "Chúng tôi đã gửi mã xác thực 6 chữ số đến\n$email"
        } else {
            binding.tvSubtitle.setText(R.string.email_sent_description)
        }

        binding.tvResendPrompt.setHtmlText(R.string.resend_code_full)

        setupOtpInputFlow(
            binding.edtOtp1,
            binding.edtOtp2,
            binding.edtOtp3,
            binding.edtOtp4,
            binding.edtOtp5,
            binding.edtOtp6
        ) { filledCode ->
            verifyResetCode(filledCode)
        }
    }

    private fun setupNavigation() {
        binding.btnBack.setOnClickListener {
            findNavController().navigateUp()
        }

        binding.btnVerify.setOnClickListener {
            val code = getEnteredCode()
            if (code.length != 6) {
                Toast.makeText(requireContext(), "Vui lòng nhập đủ 6 chữ số mã xác thực", Toast.LENGTH_SHORT).show()
                return@setOnClickListener
            }
            verifyResetCode(code)
        }

        binding.tvResendPrompt.setOnClickListener {
            if (!isResendCooldown) {
                resendCode()
            }
        }
    }

    private fun getEnteredCode(): String {
        return "${binding.edtOtp1.text}${binding.edtOtp2.text}${binding.edtOtp3.text}${binding.edtOtp4.text}${binding.edtOtp5.text}${binding.edtOtp6.text}".trim()
    }

    private fun verifyResetCode(code: String) {
        if (email.isEmpty()) {
            Toast.makeText(requireContext(), "Không tìm thấy địa chỉ email cần khôi phục", Toast.LENGTH_LONG).show()
            return
        }

        binding.btnVerify.isEnabled = false
        val originalText = binding.btnVerify.text.toString()
        binding.btnVerify.text = "Đang kiểm tra..."

        viewLifecycleOwner.lifecycleScope.launch {
            try {
                val response = withContext(Dispatchers.IO) {
                    apiService.verifyResetCode(VerifyResetCodeRequest(email = email, code = code))
                }

                if (response.isSuccessful && response.body()?.data != null) {
                    val resetToken = response.body()!!.data!!.resetToken ?: ""
                    Toast.makeText(requireContext(), "Mã xác thực hợp lệ!", Toast.LENGTH_SHORT).show()

                    val bundle = Bundle().apply {
                        putString("email", email)
                        putString("reset_token", resetToken)
                    }
                    findNavController().navigate(
                        R.id.action_verifyForgotPasswordFragment_to_createNewPasswordFragment,
                        bundle
                    )
                } else {
                    val errMsg = response.body()?.error?.message ?: "Mã xác thực không đúng hoặc đã hết hạn."
                    Toast.makeText(requireContext(), errMsg, Toast.LENGTH_LONG).show()
                    binding.btnVerify.isEnabled = true
                    binding.btnVerify.text = originalText
                }
            } catch (e: IOException) {
                Toast.makeText(
                    requireContext(),
                    "Không thể kết nối máy chủ FitTrack VPS Cloud. Vui lòng kiểm tra lại mạng.",
                    Toast.LENGTH_LONG
                ).show()
                binding.btnVerify.isEnabled = true
                binding.btnVerify.text = originalText
            } catch (e: Exception) {
                Toast.makeText(requireContext(), "Lỗi: ${e.localizedMessage}", Toast.LENGTH_LONG).show()
                binding.btnVerify.isEnabled = true
                binding.btnVerify.text = originalText
            }
        }
    }

    private fun resendCode() {
        if (email.isEmpty()) {
            Toast.makeText(requireContext(), "Không có email để gửi lại mã", Toast.LENGTH_SHORT).show()
            return
        }

        startResendCooldown()

        viewLifecycleOwner.lifecycleScope.launch {
            try {
                val response = withContext(Dispatchers.IO) {
                    apiService.forgotPassword(ForgotPasswordRequest(email = email))
                }

                if (response.isSuccessful) {
                    Toast.makeText(
                        requireContext(),
                        "Đã gửi lại mã xác thực tới $email. Vui lòng kiểm tra hộp thư Gmail.",
                        Toast.LENGTH_LONG
                    ).show()
                } else {
                    val msg = response.body()?.error?.message ?: "Gửi lại mã thất bại. Vui lòng thử lại sau."
                    Toast.makeText(requireContext(), msg, Toast.LENGTH_LONG).show()
                }
            } catch (e: Exception) {
                Toast.makeText(requireContext(), "Lỗi gửi lại mã: ${e.localizedMessage}", Toast.LENGTH_SHORT).show()
            }
        }
    }

    private fun startResendCooldown() {
        isResendCooldown = true
        binding.tvResendPrompt.isEnabled = false

        resendTimer?.cancel()
        resendTimer = object : CountDownTimer(60000, 1000) {
            override fun onTick(millisUntilFinished: Long) {
                val seconds = millisUntilFinished / 1000
                binding.tvResendPrompt.text = "Gửi lại mã sau (${seconds}s)"
            }

            override fun onFinish() {
                isResendCooldown = false
                binding.tvResendPrompt.isEnabled = true
                binding.tvResendPrompt.setHtmlText(R.string.resend_code_full)
            }
        }.start()
    }

    override fun onDestroyView() {
        super.onDestroyView()
        resendTimer?.cancel()
        _binding = null
    }
}
