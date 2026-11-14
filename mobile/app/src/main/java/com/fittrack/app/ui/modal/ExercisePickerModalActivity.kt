package com.fittrack.app.ui.modal

import android.content.Intent
import android.os.Bundle
import android.view.View
import android.widget.Toast
import androidx.appcompat.app.AppCompatActivity
import androidx.lifecycle.lifecycleScope
import com.fittrack.app.R
import com.fittrack.app.data.api.ApiClient
import com.fittrack.app.data.models.ExerciseDto
import com.fittrack.app.databinding.ActivityModalExercisePickerBinding
import kotlinx.coroutines.Dispatchers
import kotlinx.coroutines.launch
import kotlinx.coroutines.withContext

class ExercisePickerModalActivity : AppCompatActivity() {

    private lateinit var binding: ActivityModalExercisePickerBinding
    private val selectedIndices = mutableSetOf<Int>()
    private var loadedExercises: List<ExerciseDto> = emptyList()

    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)
        binding = ActivityModalExercisePickerBinding.inflate(layoutInflater)
        setContentView(binding.root)

        setupListeners()
        fetchExercises()
    }

    private fun fetchExercises() {
        val rows = listOf(
            binding.itemExercise1,
            binding.itemExercise2,
            binding.itemExercise3,
            binding.itemExercise4
        )
        rows.forEach { it.visibility = View.GONE }

        lifecycleScope.launch {
            try {
                val res = withContext(Dispatchers.IO) {
                    ApiClient.getService(this@ExercisePickerModalActivity).getExercises(perPage = 10)
                }
                if (res.isSuccessful && res.body()?.data != null) {
                    loadedExercises = res.body()!!.data!!.take(4)
                    if (loadedExercises.isEmpty()) {
                        Toast.makeText(this@ExercisePickerModalActivity, "Chưa có bài tập nào trên máy chủ", Toast.LENGTH_SHORT).show()
                        return@launch
                    }
                    loadedExercises.forEachIndexed { idx, ex ->
                        rows[idx].visibility = View.VISIBLE
                        // Update first TextView inside each item row if present
                        val tv = (rows[idx] as? android.view.ViewGroup)?.let { findFirstTextView(it) }
                        tv?.text = ex.name
                    }
                } else {
                    Toast.makeText(this@ExercisePickerModalActivity, "Lỗi tải bài tập (${res.code()})", Toast.LENGTH_SHORT).show()
                }
            } catch (e: Exception) {
                Toast.makeText(this@ExercisePickerModalActivity, "Lỗi kết nối máy chủ: ${e.localizedMessage}", Toast.LENGTH_SHORT).show()
            }
        }
    }

    private fun findFirstTextView(group: android.view.ViewGroup): android.widget.TextView? {
        for (i in 0 until group.childCount) {
            val child = group.getChildAt(i)
            if (child is android.widget.TextView) return child
            if (child is android.view.ViewGroup) {
                findFirstTextView(child)?.let { return it }
            }
        }
        return null
    }

    private fun setupListeners() {
        binding.btnClosePicker.setOnClickListener { finish() }
        binding.rootContainer.setOnClickListener { finish() }
        binding.cardModal.setOnClickListener { }

        binding.btnSelectEx1.setOnClickListener { toggleSelect(0) }
        binding.itemExercise1.setOnClickListener { toggleSelect(0) }

        binding.btnSelectEx2.setOnClickListener { toggleSelect(1) }
        binding.itemExercise2.setOnClickListener { toggleSelect(1) }

        binding.btnSelectEx3.setOnClickListener { toggleSelect(2) }
        binding.itemExercise3.setOnClickListener { toggleSelect(2) }

        binding.btnSelectEx4.setOnClickListener { toggleSelect(3) }
        binding.itemExercise4.setOnClickListener { toggleSelect(3) }

        binding.btnAddToWorkout.setOnClickListener {
            if (selectedIndices.isEmpty()) {
                Toast.makeText(this, "Vui lòng chọn ít nhất 1 bài tập", Toast.LENGTH_SHORT).show()
                return@setOnClickListener
            }
            val ids = ArrayList(selectedIndices.mapNotNull { loadedExercises.getOrNull(it)?.id })
            val names = ArrayList(selectedIndices.mapNotNull { loadedExercises.getOrNull(it)?.name })
            setResult(RESULT_OK, Intent().apply {
                putStringArrayListExtra("SELECTED_EXERCISE_IDS", ids)
                putStringArrayListExtra("SELECTED_EXERCISE_NAMES", names)
            })
            Toast.makeText(this, getString(R.string.toast_exercises_added, names.size), Toast.LENGTH_SHORT).show()
            finish()
        }
    }

    private fun toggleSelect(index: Int) {
        if (index >= loadedExercises.size) return
        val btn = when (index) {
            0 -> binding.btnSelectEx1
            1 -> binding.btnSelectEx2
            2 -> binding.btnSelectEx3
            3 -> binding.btnSelectEx4
            else -> return
        }

        if (selectedIndices.contains(index)) {
            selectedIndices.remove(index)
            btn.setImageResource(R.drawable.ic_plus_solid)
        } else {
            selectedIndices.add(index)
            btn.setImageResource(R.drawable.ic_check_solid)
        }
    }
}
