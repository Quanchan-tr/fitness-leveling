package com.fittrack.app.ui.auth

import android.os.Bundle
import android.view.LayoutInflater
import android.view.View
import android.view.ViewGroup
import androidx.fragment.app.Fragment
import androidx.navigation.fragment.findNavController
import com.fittrack.app.R
import com.fittrack.app.databinding.ActivityForgotPasswordBinding

class ForgotPasswordFragment : Fragment() {

    private var _binding: ActivityForgotPasswordBinding? = null
    private val binding get() = _binding!!

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
            findNavController().navigate(R.id.action_forgotPasswordFragment_to_verifyForgotPasswordFragment)
        }

        binding.tvLoginPrompt.setOnClickListener {
            findNavController().navigate(R.id.action_forgotPasswordFragment_to_loginFragment)
        }
    }

    override fun onDestroyView() {
        super.onDestroyView()
        _binding = null
    }
}
