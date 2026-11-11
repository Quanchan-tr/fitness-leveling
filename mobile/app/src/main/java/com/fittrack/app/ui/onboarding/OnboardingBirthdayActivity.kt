package com.fittrack.app.ui.onboarding

import android.content.Intent
import android.os.Bundle
import androidx.appcompat.app.AppCompatActivity
import com.fittrack.app.data.session.SessionManager
import com.fittrack.app.databinding.ActivityOnboardingBirthdayBinding
import java.util.Locale

class OnboardingBirthdayActivity : AppCompatActivity() {

    private lateinit var binding: ActivityOnboardingBirthdayBinding
    private lateinit var session: SessionManager

    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)
        binding = ActivityOnboardingBirthdayBinding.inflate(layoutInflater)
        setContentView(binding.root)

        session = SessionManager.getInstance(this)

        // Initialize with default date: 1998-05-15
        binding.datePickerBirthday.init(1998, 4, 15, null)

        binding.btnBack.setOnClickListener {
            finish()
        }

        binding.btnContinue.setOnClickListener {
            val year = binding.datePickerBirthday.year
            val month = binding.datePickerBirthday.month + 1
            val day = binding.datePickerBirthday.dayOfMonth
            val birthDate = String.format(Locale.US, "%04d-%02d-%02d", year, month, day)

            session.obBirthDate = birthDate
            startActivity(Intent(this, OnboardingWeightActivity::class.java))
        }
    }
}
