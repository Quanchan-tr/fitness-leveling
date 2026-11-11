package com.fittrack.app.ui.profile

import android.os.Bundle
import android.widget.Toast
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

    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)
        binding = ActivityEditProfileBinding.inflate(layoutInflater)
        setContentView(binding.root)

        session = SessionManager.getInstance(this)

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
                    user.gender?.let { binding.etGender.setText(it) }
                    user.goal?.let { binding.etGoal.setText(it) }
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
        val gender = binding.etGender.text.toString().trim().lowercase().takeIf { it in listOf("male", "female", "other") }
        val goal = binding.etGoal.text.toString().trim().lowercase().takeIf { it.isNotEmpty() }

        if (name.isEmpty()) {
            Toast.makeText(this, "Họ và tên không được để trống", Toast.LENGTH_SHORT).show()
            return
        }

        session.userName = name
        height?.let { session.userHeight = it.toFloat() }
        weight?.let { session.userWeight = it.toFloat() }
        goal?.let { session.userGoal = it }

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
