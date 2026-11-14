package com.fittrack.app.ui.routine

import android.content.Intent
import android.os.Bundle
import android.view.View
import android.widget.Toast
import androidx.appcompat.app.AppCompatActivity
import androidx.lifecycle.lifecycleScope
import com.fittrack.app.data.api.ApiClient
import com.fittrack.app.databinding.ActivityRoutineDetailBinding
import com.fittrack.app.ui.workout.ActiveWorkoutActivity
import kotlinx.coroutines.Dispatchers
import kotlinx.coroutines.launch
import kotlinx.coroutines.withContext

class RoutineDetailActivity : AppCompatActivity() {

    private lateinit var binding: ActivityRoutineDetailBinding
    private var routineId: String? = null

    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)
        binding = ActivityRoutineDetailBinding.inflate(layoutInflater)
        setContentView(binding.root)

        routineId = intent.getStringExtra("ROUTINE_ID")
        val routineTitle = intent.getStringExtra("ROUTINE_TITLE")
        if (!routineTitle.isNullOrBlank()) {
            binding.tvRoutineName.text = routineTitle
        }

        binding.btnBack.setOnClickListener {
            finish()
        }

        binding.btnShare.setOnClickListener {
            val title = binding.tvRoutineName.text.toString()
            val shareIntent = Intent(Intent.ACTION_SEND).apply {
                type = "text/plain"
                putExtra(Intent.EXTRA_TEXT, "Cùng tập giáo án \"$title\" trên FitTrack AI!")
            }
            startActivity(Intent.createChooser(shareIntent, "Chia sẻ giáo án"))
        }

        val startWorkoutAction = {
            val intent = Intent(this, ActiveWorkoutActivity::class.java).apply {
                putExtra("ROUTINE_ID", routineId)
                putExtra("ROUTINE_TITLE", binding.tvRoutineName.text.toString())
            }
            startActivity(intent)
        }

        binding.btnStartWorkoutNow.setOnClickListener {
            startWorkoutAction()
        }

        binding.cardExercise1.setOnClickListener { startWorkoutAction() }
        binding.cardExercise2.setOnClickListener { startWorkoutAction() }
        binding.cardExercise3.setOnClickListener { startWorkoutAction() }
        binding.cardExercise4.setOnClickListener { startWorkoutAction() }
        binding.cardExercise5.setOnClickListener { startWorkoutAction() }

        fetchRoutineDetail()
    }

    private fun fetchRoutineDetail() {
        val id = routineId?.takeIf { it.isNotBlank() } ?: return
        lifecycleScope.launch {
            try {
                val res = withContext(Dispatchers.IO) {
                    ApiClient.getService(this@RoutineDetailActivity).getRoutineDetail(id)
                }
                if (res.isSuccessful && res.body()?.data != null) {
                    val routine = res.body()!!.data!!
                    binding.tvRoutineName.text = routine.title
                } else {
                    Toast.makeText(this@RoutineDetailActivity, "Không tải được chi tiết giáo án (${res.code()})", Toast.LENGTH_SHORT).show()
                }
            } catch (e: Exception) {
                Toast.makeText(this@RoutineDetailActivity, "Lỗi kết nối máy chủ: ${e.localizedMessage}", Toast.LENGTH_SHORT).show()
            }
        }
    }
}
