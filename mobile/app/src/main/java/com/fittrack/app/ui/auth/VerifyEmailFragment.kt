package com.fittrack.app.ui.auth

import android.content.Intent
import android.os.Bundle
import android.view.LayoutInflater
import android.view.View
import android.view.ViewGroup
import androidx.fragment.app.Fragment
import androidx.navigation.fragment.findNavController
import com.fittrack.app.R
import com.fittrack.app.databinding.ActivityVerifyEmailBinding
import com.fittrack.app.ui.onboarding.OnboardingGenderActivity

class VerifyEmailFragment : Fragment() {

    private var _binding: ActivityVerifyEmailBinding? = null
    private val binding get() = _binding!!

    override fun onCreateView(
        inflater: LayoutInflater,
        container: ViewGroup?,
        savedInstanceState: Bundle?
    ): View {
        _binding = ActivityVerifyEmailBinding.inflate(inflater, container, false)
        return binding.root
    }

    override fun onViewCreated(view: View, savedInstanceState: Bundle?) {
        super.onViewCreated(view, savedInstanceState)
        setupUI()
        setupNavigation()
    }

    private fun setupUI() {
        binding.tvResendPrompt.setHtmlText(R.string.resend_code_full)
    }

    private fun setupNavigation() {
        binding.btnBack.setOnClickListener {
            findNavController().navigateUp()
        }

        binding.btnVerify.setOnClickListener {
            val intent = Intent(requireContext(), OnboardingGenderActivity::class.java)
            startActivity(intent)
        }
    }

    override fun onDestroyView() {
        super.onDestroyView()
        _binding = null
    }
}
