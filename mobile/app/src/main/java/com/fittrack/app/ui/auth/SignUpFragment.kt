package com.fittrack.app.ui.auth

import android.os.Bundle
import android.view.LayoutInflater
import android.view.View
import android.view.ViewGroup
import androidx.fragment.app.Fragment
import androidx.navigation.fragment.findNavController
import com.fittrack.app.R
import com.fittrack.app.databinding.ActivitySignUpBinding

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
            findNavController().navigate(R.id.action_signUpFragment_to_verifyEmailFragment)
        }

        binding.tvSignInPrompt.setOnClickListener {
            findNavController().navigate(R.id.action_signUpFragment_to_loginFragment)
        }
    }

    override fun onDestroyView() {
        super.onDestroyView()
        _binding = null
    }
}
