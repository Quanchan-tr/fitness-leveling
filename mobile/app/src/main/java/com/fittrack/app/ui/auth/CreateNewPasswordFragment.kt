package com.fittrack.app.ui.auth

import android.os.Bundle
import android.view.LayoutInflater
import android.view.View
import android.view.ViewGroup
import androidx.fragment.app.Fragment
import androidx.navigation.fragment.findNavController
import com.fittrack.app.R
import com.fittrack.app.databinding.ActivityCreateNewPasswordBinding

class CreateNewPasswordFragment : Fragment() {

    private var _binding: ActivityCreateNewPasswordBinding? = null
    private val binding get() = _binding!!

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
            findNavController().navigate(R.id.action_createNewPasswordFragment_to_loginFragment)
        }
    }

    override fun onDestroyView() {
        super.onDestroyView()
        _binding = null
    }
}
