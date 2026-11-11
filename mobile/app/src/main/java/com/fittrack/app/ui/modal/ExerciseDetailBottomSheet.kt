package com.fittrack.app.ui.modal

import android.content.Intent
import android.graphics.Color
import android.graphics.Typeface
import android.os.Bundle
import android.view.LayoutInflater
import android.view.View
import android.view.ViewGroup
import android.widget.LinearLayout
import android.widget.TextView
import androidx.core.content.ContextCompat
import com.fittrack.app.R
import com.fittrack.app.data.models.ExerciseDto
import com.fittrack.app.databinding.ModalExerciseDetailBottomSheetBinding
import com.fittrack.app.ui.workout.ActiveWorkoutActivity
import com.fittrack.app.util.loadUrl
import com.google.android.material.bottomsheet.BottomSheetDialogFragment

class ExerciseDetailBottomSheet : BottomSheetDialogFragment() {

    private var _binding: ModalExerciseDetailBottomSheetBinding? = null
    private val binding get() = _binding!!

    private var exercise: ExerciseDto? = null

    override fun onCreateView(
        inflater: LayoutInflater,
        container: ViewGroup?,
        savedInstanceState: Bundle?
    ): View {
        _binding = ModalExerciseDetailBottomSheetBinding.inflate(inflater, container, false)
        return binding.root
    }

    override fun onViewCreated(view: View, savedInstanceState: Bundle?) {
        super.onViewCreated(view, savedInstanceState)
        bindExerciseData()
        setupListeners()
    }

    private fun bindExerciseData() {
        val ex = exercise ?: return

        binding.tvExerciseName.text = ex.name
        binding.tvExerciseCategory.text = (ex.category ?: ex.bodyPart ?: "STRENGTH").uppercase()

        val muscle = ex.targetMuscle ?: ex.bodyPart ?: "Toàn thân"
        binding.tvTargetMuscleBadge.text = "💪 $muscle"

        val equip = ex.equipment ?: "Tự do"
        binding.tvEquipmentBadge.text = "🏋️ $equip"

        if (!ex.description.isNullOrBlank()) {
            binding.tvExerciseDesc.visibility = View.VISIBLE
            binding.tvExerciseDesc.text = ex.description
        } else {
            binding.tvExerciseDesc.visibility = View.GONE
        }

        val imageUrl = ex.gifUrl?.takeIf { it.isNotBlank() } ?: ex.thumbnailUrl
        binding.ivExerciseImage.loadUrl(imageUrl, R.drawable.ic_dumbbell_solid)

        // Populate Steps
        binding.llInstructionsList.removeAllViews()
        val steps = ex.instructions?.takeIf { it.isNotEmpty() } ?: listOf(
            "Chuẩn bị tư thế: Giữ vững trọng tâm, siết chặt cơ bụng và hít một hơi sâu.",
            "Thực hiện chuyển động: Kiểm soát tạ/cơ thể theo đúng quỹ đạo, không để rung lắc hoặc sai khớp.",
            "Hoàn tất hiệp: Thở ra đều đặn khi đẩy/kéo về vị trí ban đầu và lặp lại đúng số lần mục tiêu."
        )

        steps.forEachIndexed { index, stepText ->
            val row = LinearLayout(requireContext()).apply {
                orientation = LinearLayout.HORIZONTAL
                layoutParams = LinearLayout.LayoutParams(
                    LinearLayout.LayoutParams.MATCH_PARENT,
                    LinearLayout.LayoutParams.WRAP_CONTENT
                ).apply {
                    topMargin = 12
                }
            }

            val numBadge = TextView(requireContext()).apply {
                text = "${index + 1}"
                setTextColor(Color.WHITE)
                textSize = 11f
                typeface = Typeface.DEFAULT_BOLD
                gravity = android.view.Gravity.CENTER
                background = ContextCompat.getDrawable(requireContext(), R.drawable.bg_primary_button)
                layoutParams = LinearLayout.LayoutParams(54, 54).apply {
                    rightMargin = 20
                }
            }

            val stepTv = TextView(requireContext()).apply {
                text = stepText
                setTextColor(ContextCompat.getColor(requireContext(), R.color.text_dark))
                textSize = 13.5f
                setLineSpacing(0f, 1.25f)
                layoutParams = LinearLayout.LayoutParams(
                    0,
                    LinearLayout.LayoutParams.WRAP_CONTENT,
                    1f
                )
            }

            row.addView(numBadge)
            row.addView(stepTv)
            binding.llInstructionsList.addView(row)
        }
    }

    private fun setupListeners() {
        binding.btnCloseSheet.setOnClickListener {
            dismiss()
        }

        binding.btnStartExerciseNow.setOnClickListener {
            val intent = Intent(requireContext(), ActiveWorkoutActivity::class.java).apply {
                putExtra("EXERCISE_NAME", exercise?.name ?: "Bài tập thể hình")
                putExtra("EXERCISE_IMAGE", exercise?.gifUrl ?: exercise?.thumbnailUrl.orEmpty())
                putExtra("EXERCISE_TARGET", exercise?.targetMuscle ?: exercise?.bodyPart.orEmpty())
                putExtra("EXERCISE_EQUIPMENT", exercise?.equipment.orEmpty())
                putExtra("EXERCISE_STEPS", ArrayList(exercise?.instructions.orEmpty()))
            }
            startActivity(intent)
            dismiss()
        }
    }

    override fun onDestroyView() {
        super.onDestroyView()
        _binding = null
    }

    companion object {
        fun newInstance(exercise: ExerciseDto): ExerciseDetailBottomSheet {
            return ExerciseDetailBottomSheet().apply {
                this.exercise = exercise
            }
        }
    }
}

