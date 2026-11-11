package com.fittrack.app.ui.routine

import android.content.Intent
import android.os.Bundle
import androidx.appcompat.app.AppCompatActivity
import com.fittrack.app.databinding.ActivityRoutineDetailBinding
import com.fittrack.app.ui.workout.ActiveWorkoutActivity

class RoutineDetailActivity : AppCompatActivity() {

    private lateinit var binding: ActivityRoutineDetailBinding

    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)
        binding = ActivityRoutineDetailBinding.inflate(layoutInflater)
        setContentView(binding.root)

        val routineTitle = intent.getStringExtra("ROUTINE_TITLE")
        if (!routineTitle.isNullOrBlank()) {
            binding.tvRoutineName.text = routineTitle
        }

        binding.btnBack.setOnClickListener {
            finish()
        }

        val startWorkout = { name: String, target: String, imgUrl: String, steps: ArrayList<String> ->
            val intent = Intent(this, ActiveWorkoutActivity::class.java).apply {
                putExtra("ROUTINE_TITLE", binding.tvRoutineName.text.toString())
                putExtra("EXERCISE_NAME", name)
                putExtra("EXERCISE_TARGET", target)
                putExtra("EXERCISE_IMAGE", imgUrl)
                putStringArrayListExtra("EXERCISE_STEPS", steps)
            }
            startActivity(intent)
        }

        // Exercise 1: Barbell Bench Press
        val ex1Steps = arrayListOf(
            "Nằm phẳng trên ghế tập, hai chân đặt chắc chắn trên sàn, mắt nhìn thẳng lên thanh đòn.",
            "Cầm thanh đòn rộng hơn vai một chút, nhấc tạ ra khỏi giá và giữ thăng bằng trên ngực.",
            "Hít sâu, từ từ hạ thanh đòn có kiểm soát xuống chạm nhẹ vào phần giữa ngực.",
            "Thở ra dứt khoát, dùng lực cơ ngực đẩy thanh đòn về vị trí ban đầu và siết chặt cơ ở đỉnh."
        )
        val ex1Img = "https://raw.githubusercontent.com/Quanchan-tr/fitness-leveling/dev/media/exercises/0025-EIeI8Vf.webp"

        // Exercise 2: Incline Dumbbell Press
        val ex2Steps = arrayListOf(
            "Chỉnh ghế dốc góc 30-45 độ, hai tay cầm tạ đơn đặt trên đùi rồi dùng gối trợ lực hất lên ngang vai.",
            "Ưỡn ngực, mở rộng lồng ngực và hạ tạ có kiểm soát sao cho cẳng tay luôn vuông góc sàn.",
            "Thở ra và đẩy hai quả tạ hướng lên theo hình vòng cung nhẹ, tránh chạm tạ vào nhau làm mất áp lực cơ."
        )
        val ex2Img = "https://raw.githubusercontent.com/Quanchan-tr/fitness-leveling/dev/media/exercises/0314-ns0SIbU.webp"

        // Exercise 3: Cable Fly
        val ex3Steps = arrayListOf(
            "Đứng giữa giàn cáp kép, hai tay nắm tay cầm, một chân bước lên trước để tạo thế đứng vững.",
            "Hơi khuỵu khuỷu tay cố định, thở ra và ép hai cánh tay về phía trước ngực như đang ôm thân cây.",
            "Giữ điểm ép căng nhất 1 giây, hít vào rồi từ từ mở rộng cánh tay về lại vị trí bắt đầu."
        )
        val ex3Img = "https://raw.githubusercontent.com/Quanchan-tr/fitness-leveling/dev/media/exercises/1262-w4dLzSx.webp"

        // Exercise 4: Triceps Pushdown
        val ex4Steps = arrayListOf(
            "Đứng thẳng trước máy kéo cáp, hai tay nắm tay cầm ngang ngực, ép chặt khuỷu tay vào sát hai bên mạn sườn.",
            "Thở ra, ghì cánh tay duỗi thẳng xuống phía dưới cho đến khi cơ tay sau căng hết cỡ.",
            "Hít vào và từ từ đưa cẳng tay nâng lên góc 90 độ mà không di chuyển khuỷu tay."
        )
        val ex4Img = "https://raw.githubusercontent.com/Quanchan-tr/fitness-leveling/dev/media/exercises/0172-1PK5Uo3.webp"

        // Exercise 5: Dips
        val ex5Steps = arrayListOf(
            "Nhảy lên thanh xà kép, duỗi thẳng tay, siết cơ bụng và hơi nghiêng phần thân trên về phía trước.",
            "Hít sâu, từ từ gập khuỷu tay hạ thấp người xuống cho đến khi cánh tay đạt góc 90 độ.",
            "Thở ra, dồn lực ngực dưới và tay sau đẩy mạnh toàn bộ cơ thể trở lại vị trí ban đầu."
        )
        val ex5Img = "https://raw.githubusercontent.com/Quanchan-tr/fitness-leveling/dev/media/exercises/0009-PAgTVaK.webp"

        binding.btnStartWorkoutNow.setOnClickListener {
            startWorkout("1. Nằm đẩy tạ đòn", "Cơ ngực (Ngực giữa)", ex1Img, ex1Steps)
        }

        binding.cardExercise1.setOnClickListener {
            startWorkout("1. Nằm đẩy tạ đòn", "Cơ ngực (Ngực giữa)", ex1Img, ex1Steps)
        }

        binding.cardExercise2.setOnClickListener {
            startWorkout("2. Đẩy ngực trên với tạ đơn", "Cơ ngực trên", ex2Img, ex2Steps)
        }

        binding.cardExercise3.setOnClickListener {
            startWorkout("3. Ép ngực cáp", "Cơ ngực trong & viền ngực", ex3Img, ex3Steps)
        }

        binding.cardExercise4.setOnClickListener {
            startWorkout("4. Kéo cáp tay sau", "Cơ tay sau (Triceps)", ex4Img, ex4Steps)
        }

        binding.cardExercise5.setOnClickListener {
            startWorkout("5. Xà kép tay sau & ngực dưới", "Ngực dưới & Tay sau", ex5Img, ex5Steps)
        }
    }
}
