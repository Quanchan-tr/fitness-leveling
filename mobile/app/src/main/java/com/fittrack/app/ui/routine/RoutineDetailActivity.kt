package com.fittrack.app.ui.routine

import android.content.Intent
import android.os.Bundle
import androidx.appcompat.app.AppCompatActivity
import com.fittrack.app.data.models.ExerciseDto
import com.fittrack.app.databinding.ActivityRoutineDetailBinding
import com.fittrack.app.ui.modal.ExerciseDetailBottomSheet
import com.fittrack.app.ui.workout.ActiveWorkoutActivity

class RoutineDetailActivity : AppCompatActivity() {

    private lateinit var binding: ActivityRoutineDetailBinding

    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)
        binding = ActivityRoutineDetailBinding.inflate(layoutInflater)
        setContentView(binding.root)

        val routineTitle = intent.getStringExtra("ROUTINE_TITLE")
        val routineId = intent.getStringExtra("ROUTINE_ID").orEmpty()
        val session = com.fittrack.app.data.session.SessionManager.getInstance(this)
        if (!routineTitle.isNullOrBlank()) {
            binding.tvRoutineName.text = routineTitle
            binding.tvTitle.text = routineTitle
        }

        val savedExercises = if (routineId.isNotBlank()) session.getRoutineExercises(routineId) else emptyList()
        if (savedExercises.isNotEmpty()) {
            binding.tvRoutineStats.text = "${savedExercises.size} bài tập • ${savedExercises.sumOf { it.setsCount }} hiệp"
            binding.cardExercise1.visibility = android.view.View.GONE
            binding.cardExercise2.visibility = android.view.View.GONE
            binding.cardExercise3.visibility = android.view.View.GONE
            binding.cardExercise4.visibility = android.view.View.GONE
            binding.cardExercise5.visibility = android.view.View.GONE
            binding.llDynamicExercises.visibility = android.view.View.VISIBLE
            binding.llDynamicExercises.removeAllViews()

            savedExercises.forEachIndexed { idx, ex ->
                val card = android.widget.LinearLayout(this).apply {
                    layoutParams = android.widget.LinearLayout.LayoutParams(
                        android.widget.LinearLayout.LayoutParams.MATCH_PARENT,
                        android.widget.LinearLayout.LayoutParams.WRAP_CONTENT
                    ).apply { topMargin = if (idx == 0) 0 else 16 }
                    background = androidx.core.content.ContextCompat.getDrawable(this@RoutineDetailActivity, com.fittrack.app.R.drawable.bg_card_white)
                    orientation = android.widget.LinearLayout.VERTICAL
                    setPadding(32, 28, 32, 28)
                    isClickable = true
                    isFocusable = true
                }
                val tvTitle = android.widget.TextView(this).apply {
                    text = ex.name
                    setTextColor(androidx.core.content.ContextCompat.getColor(this@RoutineDetailActivity, com.fittrack.app.R.color.text_dark))
                    textSize = 14f
                    typeface = android.graphics.Typeface.DEFAULT_BOLD
                }
                val tvSub = android.widget.TextView(this).apply {
                    text = "${ex.setsCount} hiệp × ${ex.reps} reps • ${ex.weightKg.toInt()} kg  (${ex.targetMuscle})"
                    setTextColor(androidx.core.content.ContextCompat.getColor(this@RoutineDetailActivity, com.fittrack.app.R.color.text_muted))
                    textSize = 12f
                }
                card.addView(tvTitle)
                card.addView(tvSub)
                card.setOnClickListener {
                    val dto = ExerciseDto(
                        id = ex.exerciseId,
                        name = ex.name,
                        targetMuscle = ex.targetMuscle,
                        equipment = ex.equipment,
                        gifUrl = ex.gifUrl,
                        thumbnailUrl = ex.gifUrl,
                        description = ex.instructions.joinToString("\n")
                    )
                    ExerciseDetailBottomSheet.newInstance(dto, idx).show(supportFragmentManager, "ex_detail_$idx")
                }
                binding.llDynamicExercises.addView(card)
            }
        }

        binding.btnBack.setOnClickListener {
            finish()
        }

        binding.btnShare.setOnClickListener {
            androidx.appcompat.app.AlertDialog.Builder(this)
                .setTitle("Tùy chọn lịch tập")
                .setItems(
                    arrayOf(
                        "✏️ Đổi tên lịch tập",
                        "➕ Thêm bài tập vào lịch",
                        "⭐ Đặt làm lịch tập mặc định hôm nay",
                        "📤 Chia sẻ lịch tập"
                    )
                ) { _, which ->
                    when (which) {
                        0 -> {
                            val input = android.widget.EditText(this).apply {
                                setText(binding.tvRoutineName.text)
                            }
                            androidx.appcompat.app.AlertDialog.Builder(this)
                                .setTitle("Đổi tên lịch tập")
                                .setView(input)
                                .setPositiveButton("Lưu") { _, _ ->
                                    val newName = input.text.toString().trim()
                                    if (newName.isNotBlank()) {
                                        binding.tvRoutineName.text = newName
                                        binding.tvTitle.text = newName
                                    }
                                }
                                .setNegativeButton("Hủy", null)
                                .show()
                        }
                        1 -> {
                            android.widget.Toast.makeText(this, "Đã mở danh mục để thêm bài tập mới", android.widget.Toast.LENGTH_SHORT).show()
                        }
                        2 -> {
                            android.widget.Toast.makeText(this, "✓ Đã đặt làm lịch tập mặc định hôm nay!", android.widget.Toast.LENGTH_SHORT).show()
                        }
                        3 -> {
                            val sendIntent = Intent().apply {
                                action = Intent.ACTION_SEND
                                putExtra(Intent.EXTRA_TEXT, "Xem lịch tập ${binding.tvRoutineName.text} của tôi trên FitTrack AI!")
                                type = "text/plain"
                            }
                            startActivity(Intent.createChooser(sendIntent, "Chia sẻ lịch tập"))
                        }
                    }
                }
                .setNegativeButton("Đóng", null)
                .show()
        }

        val startWorkout = { startIndex: Int ->
            val intent = Intent(this, ActiveWorkoutActivity::class.java).apply {
                putExtra("ROUTINE_ID", routineId)
                putExtra("ROUTINE_TITLE", binding.tvRoutineName.text.toString())
                putExtra("START_EXERCISE_INDEX", startIndex)
            }
            startActivity(intent)
        }

        // Exercise 1: Barbell Bench Press
        val ex1Dto = ExerciseDto(
            id = "0025",
            name = "Nằm đẩy tạ đòn (Bench Press)",
            category = "chest",
            bodyPart = "Cơ ngực",
            targetMuscle = "Cơ ngực giữa",
            equipment = "Thanh đòn & Ghế phẳng",
            thumbnailUrl = "https://raw.githubusercontent.com/Quanchan-tr/fitness-leveling/main/media/exercises/0025-EIeI8Vf.webp",
            gifUrl = "https://raw.githubusercontent.com/Quanchan-tr/fitness-leveling/main/media/exercises/0025-EIeI8Vf.webp",
            description = "Nằm phẳng trên ghế tập, hai chân đặt chắc chắn trên sàn, mắt nhìn thẳng lên thanh đòn.\nCầm thanh đòn rộng hơn vai một chút, nhấc tạ ra khỏi giá và giữ thăng bằng trên ngực.\nHít sâu, từ từ hạ thanh đòn có kiểm soát xuống chạm nhẹ vào phần giữa ngực.\nThở ra dứt khoát, dùng lực cơ ngực đẩy thanh đòn về vị trí ban đầu và siết chặt cơ ở đỉnh."
        )

        // Exercise 2: Incline Dumbbell Press
        val ex2Dto = ExerciseDto(
            id = "0314",
            name = "Đẩy ngực trên với tạ đơn",
            category = "chest",
            bodyPart = "Cơ ngực",
            targetMuscle = "Cơ ngực trên & Vai trước",
            equipment = "Tạ đơn & Ghế dốc",
            thumbnailUrl = "https://raw.githubusercontent.com/Quanchan-tr/fitness-leveling/main/media/exercises/0314-ns0SIbU.webp",
            gifUrl = "https://raw.githubusercontent.com/Quanchan-tr/fitness-leveling/main/media/exercises/0314-ns0SIbU.webp",
            description = "Chỉnh ghế dốc góc 30-45 độ, hai tay cầm tạ đơn đặt trên đùi rồi dùng gối trợ lực hất lên ngang vai.\nƯỡn ngực, mở rộng lồng ngực và hạ tạ có kiểm soát sao cho cẳng tay luôn vuông góc sàn.\nThở ra và đẩy hai quả tạ hướng lên theo hình vòng cung nhẹ, tránh chạm tạ vào nhau làm mất áp lực cơ."
        )

        // Exercise 3: Cable Fly
        val ex3Dto = ExerciseDto(
            id = "1262",
            name = "Ép ngực cáp (Cable Fly)",
            category = "chest",
            bodyPart = "Cơ ngực",
            targetMuscle = "Cơ ngực trong & viền ngực",
            equipment = "Máy kéo cáp đôi",
            thumbnailUrl = "https://raw.githubusercontent.com/Quanchan-tr/fitness-leveling/main/media/exercises/1262-w4dLzSx.webp",
            gifUrl = "https://raw.githubusercontent.com/Quanchan-tr/fitness-leveling/main/media/exercises/1262-w4dLzSx.webp",
            description = "Đứng giữa giàn cáp kép, hai tay nắm tay cầm, một chân bước lên trước để tạo thế đứng vững.\nHơi khuỵu khuỷu tay cố định, thở ra và ép hai cánh tay về phía trước ngực như đang ôm thân cây.\nGiữ điểm ép căng nhất 1 giây, hít vào rồi từ từ mở rộng cánh tay về lại vị trí bắt đầu."
        )

        // Exercise 4: Triceps Pushdown
        val ex4Dto = ExerciseDto(
            id = "0172",
            name = "Kéo cáp tay sau (Triceps Pushdown)",
            category = "arms",
            bodyPart = "Bắp tay sau",
            targetMuscle = "Cơ tay sau (Triceps)",
            equipment = "Dây thừng kéo cáp",
            thumbnailUrl = "https://raw.githubusercontent.com/Quanchan-tr/fitness-leveling/main/media/exercises/0172-1PK5Uo3.webp",
            gifUrl = "https://raw.githubusercontent.com/Quanchan-tr/fitness-leveling/main/media/exercises/0172-1PK5Uo3.webp",
            description = "Đứng thẳng trước máy kéo cáp, hai tay nắm tay cầm ngang ngực, ép chặt khuỷu tay vào sát hai bên mạn sườn.\nThở ra, ghì cánh tay duỗi thẳng xuống phía dưới cho đến khi cơ tay sau căng hết cỡ.\nHít vào và từ từ đưa cẳng tay nâng lên góc 90 độ mà không di chuyển khuỷu tay."
        )

        // Exercise 5: Dips
        val ex5Dto = ExerciseDto(
            id = "0009",
            name = "Xà kép tay sau & ngực dưới (Dips)",
            category = "chest",
            bodyPart = "Ngực dưới & Tay sau",
            targetMuscle = "Ngực dưới & Tay sau",
            equipment = "Xà kép",
            thumbnailUrl = "https://raw.githubusercontent.com/Quanchan-tr/fitness-leveling/main/media/exercises/0009-PAgTVaK.webp",
            gifUrl = "https://raw.githubusercontent.com/Quanchan-tr/fitness-leveling/main/media/exercises/0009-PAgTVaK.webp",
            description = "Nhảy lên thanh xà kép, duỗi thẳng tay, siết cơ bụng và hơi nghiêng phần thân trên về phía trước.\nHít sâu, từ từ gập khuỷu tay hạ thấp người xuống cho đến khi cánh tay đạt góc 90 độ.\nThở ra, dồn lực ngực dưới và tay sau đẩy mạnh toàn bộ cơ thể trở lại vị trí ban đầu."
        )

        // Main CTA: Start whole workout from exercise 0
        binding.btnStartWorkoutNow.setOnClickListener {
            startWorkout(0)
        }

        // Clicking each card opens that exercise's detail bottom sheet, from which the user can start training that exercise
        binding.cardExercise1.setOnClickListener {
            ExerciseDetailBottomSheet.newInstance(ex1Dto, 0).show(supportFragmentManager, "ex_detail_1")
        }

        binding.cardExercise2.setOnClickListener {
            ExerciseDetailBottomSheet.newInstance(ex2Dto, 1).show(supportFragmentManager, "ex_detail_2")
        }

        binding.cardExercise3.setOnClickListener {
            ExerciseDetailBottomSheet.newInstance(ex3Dto, 2).show(supportFragmentManager, "ex_detail_3")
        }

        binding.cardExercise4.setOnClickListener {
            ExerciseDetailBottomSheet.newInstance(ex4Dto, 3).show(supportFragmentManager, "ex_detail_4")
        }

        binding.cardExercise5.setOnClickListener {
            ExerciseDetailBottomSheet.newInstance(ex5Dto, 4).show(supportFragmentManager, "ex_detail_5")
        }
    }
}
