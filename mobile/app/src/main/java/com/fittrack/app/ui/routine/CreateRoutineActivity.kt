package com.fittrack.app.ui.routine

import android.content.Intent
import android.os.Bundle
import android.widget.Toast
import androidx.appcompat.app.AppCompatActivity
import androidx.lifecycle.lifecycleScope
import com.fittrack.app.data.api.ApiClient
import com.fittrack.app.data.models.CreateRoutineRequest
import com.fittrack.app.data.session.SessionManager
import com.fittrack.app.databinding.ActivityCreateRoutineBinding
import com.fittrack.app.ui.modal.ExercisePickerModalActivity
import kotlinx.coroutines.Dispatchers
import kotlinx.coroutines.launch
import kotlinx.coroutines.withContext
import java.util.UUID

class CreateRoutineActivity : AppCompatActivity() {

    private lateinit var binding: ActivityCreateRoutineBinding
    private lateinit var session: SessionManager

    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)
        binding = ActivityCreateRoutineBinding.inflate(layoutInflater)
        setContentView(binding.root)

        session = SessionManager.getInstance(this)

        binding.btnBack.setOnClickListener {
            finish()
        }

        binding.btnAddExercise.setOnClickListener {
            startActivity(Intent(this, ExercisePickerModalActivity::class.java))
        }

        binding.btnSaveRoutine.setOnClickListener {
            handleSaveRoutine()
        }
    }

    private fun handleSaveRoutine() {
        val title = binding.etRoutineName.text.toString().trim()
        if (title.isBlank()) {
            Toast.makeText(this, "Vui lòng nhập tên routine / giáo án", Toast.LENGTH_SHORT).show()
            return
        }

        binding.btnSaveRoutine.isEnabled = false
        val originalText = binding.btnSaveRoutine.text
        binding.btnSaveRoutine.text = "Đang lưu lên Cloud..."

        lifecycleScope.launch {
            try {
                val api = ApiClient.getService(this@CreateRoutineActivity)
                val response = withContext(Dispatchers.IO) {
                    api.createRoutine(
                        idempotencyKey = UUID.randomUUID().toString(),
                        request = CreateRoutineRequest(
                            title = title,
                            description = "Giáo án luyện tập tùy biến trên FitTrack Mobile",
                            targetSplit = "custom",
                            scheduleDays = listOf("monday", "wednesday", "friday"),
                            isActive = true
                        )
                    )
                }

                if (response.isSuccessful && response.body()?.data != null) {
                    Toast.makeText(
                        this@CreateRoutineActivity,
                        "✓ Đã tạo routine \"$title\" thành công trên VPS!",
                        Toast.LENGTH_SHORT
                    ).show()
                    finish()
                } else {
                    val errMsg = response.body()?.error?.message ?: "Không thể tạo routine (${response.code()})"
                    Toast.makeText(this@CreateRoutineActivity, errMsg, Toast.LENGTH_LONG).show()
                    binding.btnSaveRoutine.isEnabled = true
                    binding.btnSaveRoutine.text = originalText
                }
            } catch (e: Exception) {
                Toast.makeText(this@CreateRoutineActivity, "Lỗi kết nối VPS: ${e.localizedMessage}", Toast.LENGTH_LONG).show()
                binding.btnSaveRoutine.isEnabled = true
                binding.btnSaveRoutine.text = originalText
            }
        }
    }
}
