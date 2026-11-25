package com.fittrack.app.ui.admin

import android.os.Bundle
import android.text.InputType
import android.view.View
import android.widget.CheckBox
import android.widget.EditText
import android.widget.Toast
import androidx.appcompat.app.AlertDialog
import androidx.appcompat.app.AppCompatActivity
import androidx.core.content.ContextCompat
import androidx.lifecycle.lifecycleScope
import com.fittrack.app.R
import com.fittrack.app.data.api.ApiClient
import com.fittrack.app.data.models.AdminFoodDto
import com.fittrack.app.data.models.AdminUpsertFoodRequest
import com.fittrack.app.data.repository.FoodRepository
import com.fittrack.app.data.session.SessionManager
import com.fittrack.app.databinding.ActivityAdminListBinding
import kotlinx.coroutines.Dispatchers
import kotlinx.coroutines.launch
import kotlinx.coroutines.withContext

class AdminFoodsActivity : AppCompatActivity() {

    private lateinit var binding: ActivityAdminListBinding
    private lateinit var session: SessionManager
    private val adapter = AdminRecordAdapter()

    private var activeFilter = "ALL"
    private var searchQuery = ""

    private val filterOptions = listOf(
        "ALL" to "Tất cả",
        "DISH" to "Món chế biến",
        "RAW" to "Nguyên liệu",
        "TRASHED" to "Đã xóa"
    )

    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)
        session = SessionManager.getInstance(this)
        if (!session.isAdmin) {
            finish()
            return
        }

        binding = ActivityAdminListBinding.inflate(layoutInflater)
        setContentView(binding.root)

        binding.initAdminListScreen(
            activity = this,
            tab = AdminNavTab.FOODS,
            title = "Kho Món ăn",
            subtitle = "Thêm/sửa món ăn đồng bộ ngay với mục Dinh dưỡng",
            searchHint = "Tìm món ăn (có/không dấu)...",
            showAddButton = true,
            adapter = adapter,
            onSearchChanged = { q ->
                searchQuery = q
                loadFoods()
            },
            onAddClicked = { showFoodDialog(null) }
        )

        renderFilters()
        loadFoods()
    }

    private fun renderFilters() {
        binding.renderFilterPills(this, filterOptions, activeFilter) { selected ->
            activeFilter = selected
            renderFilters()
            loadFoods()
        }
    }

    private fun loadFoods() {
        binding.pbLoading.visibility = View.VISIBLE
        binding.tvEmpty.visibility = View.GONE

        lifecycleScope.launch {
            try {
                val res = withContext(Dispatchers.IO) {
                    ApiClient.getService(this@AdminFoodsActivity).getAdminFoods(
                        q = searchQuery.ifBlank { null },
                        itemType = if (activeFilter == "DISH" || activeFilter == "RAW") activeFilter else "ALL",
                        trashed = if (activeFilter == "TRASHED") "only" else null,
                        perPage = 50
                    )
                }
                if (res.isSuccessful) {
                    bindFoods(res.body()?.data.orEmpty())
                } else {
                    Toast.makeText(this@AdminFoodsActivity, "Lỗi tải món ăn (${res.code()})", Toast.LENGTH_SHORT).show()
                }
            } catch (e: Exception) {
                Toast.makeText(this@AdminFoodsActivity, "Lỗi mạng: ${e.localizedMessage}", Toast.LENGTH_SHORT).show()
            } finally {
                binding.pbLoading.visibility = View.GONE
            }
        }
    }

    private fun bindFoods(list: List<AdminFoodDto>) {
        binding.tvEmpty.visibility = if (list.isEmpty()) View.VISIBLE else View.GONE
        val blue = ContextCompat.getColor(this, R.color.primary_blue)
        val blueSoft = ContextCompat.getColor(this, R.color.primary_blue_soft)
        val errorColor = ContextCompat.getColor(this, R.color.error)
        val secondary = ContextCompat.getColor(this, R.color.admin_text_secondary)
        val surface = ContextCompat.getColor(this, R.color.admin_surface)
        val white = ContextCompat.getColor(this, R.color.white)

        val cards = list.map { food ->
            val isTrashed = !food.deletedAt.isNullOrBlank()
            val actions = if (isTrashed) {
                listOf(
                    AdminCardAction("Khôi phục", R.drawable.bg_admin_pill_active, white) {
                        runMutation { ApiClient.getService(this).restoreAdminFood(food.id) }
                    }
                )
            } else {
                listOf(
                    AdminCardAction("Sửa", R.drawable.bg_admin_badge_blue, blue) {
                        showFoodDialog(food)
                    },
                    AdminCardAction("Xóa", R.drawable.bg_admin_pill_inactive, errorColor) {
                        confirmAdminAction(this, "Xóa mềm món ăn", "Xóa mềm \"${food.name}\"?") {
                            runMutation { ApiClient.getService(this).deleteAdminFood(food.id) }
                        }
                    }
                )
            }

            AdminCardItem(
                id = food.id,
                title = food.name,
                badgeText = if (isTrashed) "Đã xóa" else food.itemType,
                badgeBgColor = if (isTrashed) surface else blueSoft,
                badgeTextColor = if (isTrashed) secondary else blue,
                subtitle = "${food.category} • ${food.servingSize}",
                meta = "${food.calories} kcal • P ${food.protein}g • C ${food.carbs}g • F ${food.fat}g",
                actions = actions
            )
        }
        adapter.submitList(cards)
    }

    private fun showFoodDialog(existing: AdminFoodDto?) {
        val (scroll, container) = wrapDialogContainer(this)
        val edtName = EditText(this).apply {
            hint = "Tên món ăn *"
            setText(existing?.name.orEmpty())
        }
        val edtCategory = EditText(this).apply {
            hint = "Danh mục * (vd: Món mặn, Cơm)"
            setText(existing?.category ?: "Món mặn")
        }
        val edtServing = EditText(this).apply {
            hint = "Khẩu phần * (vd: 1 phần, 100g)"
            setText(existing?.servingSize ?: "1 phần")
        }
        val edtCalories = EditText(this).apply {
            hint = "Calo (kcal) *"
            inputType = InputType.TYPE_CLASS_NUMBER
            setText(existing?.calories?.toString() ?: "250")
        }
        val edtProtein = EditText(this).apply {
            hint = "Đạm / Protein (g) *"
            inputType = InputType.TYPE_CLASS_NUMBER or InputType.TYPE_NUMBER_FLAG_DECIMAL
            setText(existing?.protein?.toString() ?: "20")
        }
        val edtCarbs = EditText(this).apply {
            hint = "Tinh bột / Carbs (g) *"
            inputType = InputType.TYPE_CLASS_NUMBER or InputType.TYPE_NUMBER_FLAG_DECIMAL
            setText(existing?.carbs?.toString() ?: "25")
        }
        val edtFat = EditText(this).apply {
            hint = "Chất béo / Fat (g) *"
            inputType = InputType.TYPE_CLASS_NUMBER or InputType.TYPE_NUMBER_FLAG_DECIMAL
            setText(existing?.fat?.toString() ?: "8")
        }
        val edtImage = EditText(this).apply {
            hint = "Link ảnh URL (tùy chọn)"
            setText(existing?.imageUrl.orEmpty())
        }
        val cbRaw = CheckBox(this).apply {
            text = "Là nguyên liệu thô (RAW)"
            isChecked = existing?.itemType == "RAW"
        }

        listOf(edtName, edtCategory, edtServing, edtCalories, edtProtein, edtCarbs, edtFat, edtImage, cbRaw)
            .forEach { container.addView(it) }

        AlertDialog.Builder(this, R.style.ThemeOverlay_FitTrack_Dialog_Alert)
            .setTitle(if (existing == null) "Thêm món ăn" else "Cập nhật món ăn")
            .setView(scroll)
            .setPositiveButton("Lưu") { _, _ ->
                val name = edtName.text.toString().trim()
                val category = edtCategory.text.toString().trim()
                val serving = edtServing.text.toString().trim()
                if (name.isBlank() || category.isBlank() || serving.isBlank()) {
                    Toast.makeText(this, "Vui lòng nhập tên món, danh mục và khẩu phần.", Toast.LENGTH_SHORT).show()
                    return@setPositiveButton
                }

                val req = AdminUpsertFoodRequest(
                    name = name,
                    category = category,
                    itemType = if (cbRaw.isChecked) "RAW" else "DISH",
                    servingSize = serving,
                    calories = edtCalories.text.toString().toIntOrNull() ?: 0,
                    protein = edtProtein.text.toString().toDoubleOrNull() ?: 0.0,
                    carbs = edtCarbs.text.toString().toDoubleOrNull() ?: 0.0,
                    fat = edtFat.text.toString().toDoubleOrNull() ?: 0.0,
                    imageUrl = edtImage.text.toString().trim().ifBlank { null },
                    description = existing?.description
                )

                runMutation {
                    val api = ApiClient.getService(this@AdminFoodsActivity)
                    if (existing == null) api.createAdminFood(req) else api.updateAdminFood(existing.id, req)
                }
            }
            .setNegativeButton("Hủy", null)
            .show()
    }

    private fun runMutation(call: suspend () -> retrofit2.Response<*>) {
        binding.pbLoading.visibility = View.VISIBLE
        lifecycleScope.launch {
            try {
                val res = withContext(Dispatchers.IO) { call() }
                if (res.isSuccessful) {
                    FoodRepository.getInstance(this@AdminFoodsActivity).invalidateCache()
                    loadFoods()
                } else {
                    Toast.makeText(this@AdminFoodsActivity, "Thao tác thất bại (${res.code()})", Toast.LENGTH_SHORT).show()
                    binding.pbLoading.visibility = View.GONE
                }
            } catch (e: Exception) {
                Toast.makeText(this@AdminFoodsActivity, "Lỗi: ${e.localizedMessage}", Toast.LENGTH_SHORT).show()
                binding.pbLoading.visibility = View.GONE
            }
        }
    }
}
