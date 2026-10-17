package com.fittrack.app.ui.auth

import android.os.Bundle
import androidx.appcompat.app.AppCompatActivity
import com.fittrack.app.databinding.ActivityVerifyForgotPasswordBinding

class VerifyForgotPasswordActivity : AppCompatActivity() {

    private lateinit var binding: ActivityVerifyForgotPasswordBinding

    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)
        binding = ActivityVerifyForgotPasswordBinding.inflate(layoutInflater)
        setContentView(binding.root)
    }
}
