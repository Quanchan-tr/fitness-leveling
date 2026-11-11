package com.fittrack.app.ui.profile

import android.os.Bundle
import android.widget.Toast
import androidx.appcompat.app.AlertDialog
import androidx.appcompat.app.AppCompatActivity
import androidx.lifecycle.lifecycleScope
import com.fittrack.app.data.api.ApiClient
import com.fittrack.app.data.models.UpdateProfileRequest
import com.fittrack.app.data.session.SessionManager
import com.fittrack.app.databinding.ActivityEditProfileBinding
import com.fittrack.app.ui.BottomNavTab
import com.fittrack.app.ui.setupBottomNav
import kotlinx.coroutines.Dispatchers
import kotlinx.coroutines.launch
import kotlinx.coroutines.withContext

class EditProfileActivity : AppCompatActivity() {

    private lateinit var binding: ActivityEditProfileBinding
    private lateinit var session: SessionManager

    private val goalOptions = listOf(
        Pair("gain_muscle", "Tăng cơ (Gain Muscle)"),
        Pair("gain_strength", "Tăng sức mạnh (Strength)"),
        Pair("lose_weight", "Giảm mỡ / Giảm cân (Cut)"),
        Pair("maintain", "Duy trì vóc dáng (Maintain)")
    )

    private val genderOptions = listOf(
        Pair("male", "Nam"),
        Pair("female", "Nữ"),
        Pair("other", "Khác")
    )

    private var selectedGoalKey: String = "gain_muscle"
    private var selectedGenderKey: String = "male"

    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)
        binding = ActivityEditProfileBinding.inflate(layoutInflater)
        setContentView(binding.root)

        session = SessionManager.getInstance(this)

        setupPickers()

        binding.btnBack.setOnClickListener {
            finish()
        }

        binding.btnSaveTop.setOnClickListener {
            handleSaveProfile()
        }

        binding.btnSaveProfileChanges.setOnClickListener {
            handleSaveProfile()
        }

        binding.bottomNavigation.setupBottomNav(this, BottomNavTab.PROFILE)

        loadProfileData()
    }

    private fun setupPickers() {
        // Goal picker dropdown
        binding.etGoal.setOnClickListener {
            val labels = goalOptions.map { it.second }.toTypedArray()
            val currentIndex = goalOptions.indexOfFirst { it.first == selectedGoalKey }.coerceAtLeast(0)

            AlertDialog.Builder(this)
                .setTitle("Chọn mục tiêu luyện tập")
                .setSingleChoiceItems(labels, currentIndex) { dialog, which ->
                    val chosen = goalOptions[which]
                    selectedGoalKey = chosen.first
                    binding.etGoal.setText(chosen.second)
                    dialog.dismiss()
                }
                .setNegativeButton("Hủy", null)
                .show()
        }

        // Gender picker dropdown
        binding.etGender.setOnClickListener {
            val labels = genderOptions.map { it.second }.toTypedArray()
            val currentIndex = genderOptions.indexOfFirst { it.first == selectedGenderKey }.coerceAtLeast(0)

            AlertDialog.Builder(this)
                .setTitle("Chọn giới tính")
                .setSingleChoiceItems(labels, currentIndex) { dialog, which ->
                    val chosen = genderOptions[which]
                    selectedGenderKey = chosen.first
                    binding.etGender.setText(chosen.second)
                    dialog.dismiss()
                }
                .setNegativeButton("Hủy", null)
                .show()
        }
    }

    private fun loadProfileData() {
        if (!session.isLoggedIn) return

        binding.etFullName.setText(session.userName)

        lifecycleScope.launch {
            try {
                val response = withContext(Dispatchers.IO) {
                    ApiClient.getService(this@EditProfileActivity).getMe()
                }
                if (response.isSuccessful && response.body()?.data != null) {
                    val user = response.body()!!.data!!
                    binding.etFullName.setText(user.name)
                    user.heightCm?.let { binding.etHeight.setText(it.toString()) }
                    user.weightKg?.let { binding.etWeight.setText(it.toString()) }
                    user.birthDate?.let { binding.etBirthday.setText(it) }

                    // Sync Gender dropdown
                    user.gender?.let { g ->
                        val found = genderOptions.find { it.first.equals(g, ignoreCase = true) }
                        if (found != null) {
                            selectedGenderKey = found.first
                            binding.etGender.setText(found.second)
                        }
                    }

                    // Sync Goal dropdown
                    user.goal?.let { g ->
                        val found = goalOptions.find { it.first.equals(g, ignoreCase = true) }
                        if (found != null) {
                            selectedGoalKey = found.first
                            binding.etGoal.setText(found.second)
                        }
                    }
                }
            } catch (_: Exception) {
                // Keep default offline data
            }
        }
    }

    private fun handleSaveProfile() {
        val name = binding.etFullName.text.toString().trim()
        val height = binding.etHeight.text.toString().trim().toDoubleOrNull()
        val weight = binding.etWeight.text.toString().trim().toDoubleOrNull()
        val birthday = binding.etBirthday.text.toString().trim().takeIf { it.isNotEmpty() }
        val gender = selectedGenderKey
        val goal = selectedGoalKey

        if (name.isEmpty()) {
            Toast.makeText(this, "Họ và tên không được để trống", Toast.LENGTH_SHORT).show()
            return
        }

        session.userName = name
        height?.let { session.userHeight = it.toFloat() }
        weight?.let { session.userWeight = it.toFloat() }
        session.userGoal = goal

        if (session.isLoggedIn) {
            lifecycleScope.launch {
                try {
                    val req = UpdateProfileRequest(
                        name = name,
                        heightCm = height,
                        weightKg = weight,
                        birthDate = birthday,
                        gender = gender,
                        goal = goal
                    )
                    val res = withContext(Dispatchers.IO) {
                        ApiClient.getService(this@EditProfileActivity).updateProfile(req)
                    }
                    if (res.isSuccessful) {
                        Toast.makeText(this@EditProfileActivity, "✓ Cập nhật hồ sơ thành công!", Toast.LENGTH_SHORT).show()
                    }
                } catch (_: Exception) {
                    // Non-blocking sync
                }
                finish()
            }
        } else {
            Toast.makeText(this, "✓ Đã lưu cài đặt!", Toast.LENGTH_SHORT).show()
            finish()
        }
    }
}
