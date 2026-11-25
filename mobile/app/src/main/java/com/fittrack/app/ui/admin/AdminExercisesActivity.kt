package com.fittrack.app.ui.admin

import android.os.Bundle
import android.view.View
import android.widget.EditText
import android.widget.Toast
import androidx.appcompat.app.AlertDialog
import androidx.appcompat.app.AppCompatActivity
import androidx.core.content.ContextCompat
import androidx.lifecycle.lifecycleScope
import com.fittrack.app.R
import com.fittrack.app.data.api.ApiClient
import com.fittrack.app.data.models.AdminExerciseDto
import com.fittrack.app.data.models.AdminExerciseReportDto
import com.fittrack.app.data.models.AdminResolveReportRequest
import com.fittrack.app.data.models.AdminUpsertExerciseRequest
import com.fittrack.app.data.session.SessionManager
import com.fittrack.app.databinding.ActivityAdminListBinding
import kotlinx.coroutines.Dispatchers
import kotlinx.coroutines.launch
import kotlinx.coroutines.withContext

class AdminExercisesActivity : AppCompatActivity() {

    private lateinit var binding: ActivityAdminListBinding
    private lateinit var session: SessionManager
    private val adapter = AdminRecordAdapter()

    private var activeFilter = "catalog"
    private var searchQuery = ""

    private val filterOptions = listOf(
        "catalog" to "Kho bài tập",
        "pending" to "Chờ duyệt",
        "reports" to "Báo cáo lỗi",
        "trashed" to "Đã xóa"
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
            tab = AdminNavTab.EXERCISES,
            title = "Bài tập & Kiểm duyệt",
            subtitle = "Quản lý kho bài tập, duyệt đóng góp và xử lý báo cáo",
            searchHint = "Tìm tên bài tập...",
            showAddButton = true,
            adapter = adapter,
            onSearchChanged = { q ->
                searchQuery = q
                loadData()
            },
            onAddClicked = { showExerciseDialog(null) }
        )

        renderFilters()
        loadData()
    }

    private fun renderFilters() {
        binding.renderFilterPills(this, filterOptions, activeFilter) { selected ->
            activeFilter = selected
            binding.etAdminSearch.visibility = if (selected == "reports") View.GONE else View.VISIBLE
            renderFilters()
            loadData()
        }
    }

    private fun loadData() {
        binding.pbLoading.visibility = View.VISIBLE
        binding.tvEmpty.visibility = View.GONE

        lifecycleScope.launch {
            try {
                val api = ApiClient.getService(this@AdminExercisesActivity)
                if (activeFilter == "reports") {
                    val res = withContext(Dispatchers.IO) { api.getAdminExerciseReports(status = "pending", perPage = 50) }
                    if (res.isSuccessful) {
                        bindReports(res.body()?.data.orEmpty())
                    } else {
                        Toast.makeText(this@AdminExercisesActivity, "Lỗi tải báo cáo (${res.code()})", Toast.LENGTH_SHORT).show()
                    }
                } else {
                    val res = withContext(Dispatchers.IO) {
                        api.getAdminExercises(
                            q = if (activeFilter == "catalog") searchQuery.ifBlank { null } else null,
                            status = if (activeFilter == "pending") "under_review" else "all",
                            trashed = if (activeFilter == "trashed") "only" else null,
                            perPage = 50
                        )
                    }
                    if (res.isSuccessful) {
                        bindExercises(res.body()?.data.orEmpty())
                    } else {
                        Toast.makeText(this@AdminExercisesActivity, "Lỗi tải bài tập (${res.code()})", Toast.LENGTH_SHORT).show()
                    }
                }
            } catch (e: Exception) {
                Toast.makeText(this@AdminExercisesActivity, "Lỗi mạng: ${e.localizedMessage}", Toast.LENGTH_SHORT).show()
            } finally {
                binding.pbLoading.visibility = View.GONE
            }
        }
    }

    private fun bindExercises(list: List<AdminExerciseDto>) {
        binding.tvEmpty.visibility = if (list.isEmpty()) View.VISIBLE else View.GONE
        val blue = ContextCompat.getColor(this, R.color.primary_blue)
        val emerald = ContextCompat.getColor(this, R.color.admin_emerald)
        val emeraldBg = ContextCompat.getColor(this, R.color.admin_emerald_bg)
        val warnColor = ContextCompat.getColor(this, R.color.warning)
        val warnBg = ContextCompat.getColor(this, R.color.warning_bg)
        val errorColor = ContextCompat.getColor(this, R.color.error)
        val errorBg = ContextCompat.getColor(this, R.color.error_bg)
        val secondary = ContextCompat.getColor(this, R.color.admin_text_secondary)
        val surface = ContextCompat.getColor(this, R.color.admin_surface)
        val white = ContextCompat.getColor(this, R.color.white)

        val cards = list.map { ex ->
            val isTrashed = !ex.deletedAt.isNullOrBlank()
            val (badgeText, badgeBg, badgeFg) = when {
                isTrashed -> Triple("Đã xóa", surface, secondary)
                ex.status == "active" -> Triple("Hoạt động", emeraldBg, emerald)
                ex.status == "under_review" -> Triple("Chờ duyệt", warnBg, warnColor)
                else -> Triple("Từ chối", errorBg, errorColor)
            }

            val actions = when {
                isTrashed -> listOf(
                    AdminCardAction("Khôi phục", R.drawable.bg_admin_pill_active, white) {
                        runMutation { ApiClient.getService(this).restoreAdminExercise(ex.id) }
                    }
                )
                activeFilter == "pending" -> listOf(
                    AdminCardAction("Duyệt", R.drawable.bg_admin_pill_active, white) {
                        runMutation {
                            ApiClient.getService(this).updateAdminExercise(
                                ex.id,
                                AdminUpsertExerciseRequest(status = "active", verified = true)
                            )
                        }
                    },
                    AdminCardAction("Từ chối", R.drawable.bg_admin_pill_inactive, errorColor) {
                        runMutation {
                            ApiClient.getService(this).updateAdminExercise(
                                ex.id,
                                AdminUpsertExerciseRequest(status = "rejected", verified = false)
                            )
                        }
                    },
                    AdminCardAction("Sửa", R.drawable.bg_admin_badge_blue, blue) {
                        showExerciseDialog(ex)
                    }
                )
                else -> listOf(
                    AdminCardAction("Sửa", R.drawable.bg_admin_badge_blue, blue) {
                        showExerciseDialog(ex)
                    },
                    AdminCardAction("Xóa", R.drawable.bg_admin_pill_inactive, errorColor) {
                        confirmAdminAction(this, "Xóa mềm bài tập", "Xóa mềm \"${ex.name}\"?") {
                            runMutation { ApiClient.getService(this).deleteAdminExercise(ex.id) }
                        }
                    }
                )
            }

            AdminCardItem(
                id = ex.id,
                title = ex.name,
                badgeText = badgeText,
                badgeBgColor = badgeBg,
                badgeTextColor = badgeFg,
                subtitle = "${ex.muscleGroup ?: "general"} • ${ex.equipment ?: "body weight"} • ${ex.difficulty}",
                meta = if (ex.hasPoseCheck) "Hỗ trợ AI Pose Check" else null,
                actions = actions
            )
        }
        adapter.submitList(cards)
    }

    private fun bindReports(list: List<AdminExerciseReportDto>) {
        binding.tvEmpty.visibility = if (list.isEmpty()) View.VISIBLE else View.GONE
        val warnColor = ContextCompat.getColor(this, R.color.warning)
        val warnBg = ContextCompat.getColor(this, R.color.warning_bg)
        val errorColor = ContextCompat.getColor(this, R.color.error)
        val secondary = ContextCompat.getColor(this, R.color.admin_text_secondary)

        val cards = list.map { rep ->
            AdminCardItem(
                id = rep.id,
                title = rep.exercise?.name ?: "Bài tập #${rep.exerciseId}",
                badgeText = "Chờ xử lý",
                badgeBgColor = warnBg,
                badgeTextColor = warnColor,
                subtitle = "Lý do: ${rep.reason}${if (!rep.detail.isNullOrBlank()) " — ${rep.detail}" else ""}",
                meta = "Báo cáo bởi: ${rep.reporter?.name ?: "Người dùng"}",
                actions = listOf(
                    AdminCardAction("Bỏ qua", R.drawable.bg_admin_pill_inactive, secondary) {
                        runMutation {
                            ApiClient.getService(this).resolveAdminExerciseReport(
                                rep.id,
                                AdminResolveReportRequest("dismiss")
                            )
                        }
                    },
                    AdminCardAction("Ẩn bài", R.drawable.bg_admin_pill_inactive, errorColor) {
                        confirmAdminAction(
                            this,
                            "Ẩn bài tập bị báo cáo",
                            "Ẩn và xóa mềm bài tập \"${rep.exercise?.name ?: ""}\"?"
                        ) {
                            runMutation {
                                ApiClient.getService(this).resolveAdminExerciseReport(
                                    rep.id,
                                    AdminResolveReportRequest("resolve_and_hide")
                                )
                            }
                        }
                    }
                )
            )
        }
        adapter.submitList(cards)
    }

    private fun showExerciseDialog(existing: AdminExerciseDto?) {
        val (scroll, container) = wrapDialogContainer(this)
        val edtName = EditText(this).apply {
            hint = "Tên bài tập *"
            setText(existing?.name.orEmpty())
        }
        val edtMuscle = EditText(this).apply {
            hint = "Nhóm cơ * (vd: chest, back, legs)"
            setText(existing?.muscleGroup ?: "chest")
        }
        val edtEquipment = EditText(this).apply {
            hint = "Dụng cụ (vd: dumbbell, body weight)"
            setText(existing?.equipment ?: "body weight")
        }
        val edtDifficulty = EditText(this).apply {
            hint = "Độ khó (beginner / intermediate / advanced)"
            setText(existing?.difficulty ?: "beginner")
        }
        val edtGif = EditText(this).apply {
            hint = "Link GIF / Thumbnail URL"
            setText(existing?.gifUrl ?: existing?.thumbnailUrl.orEmpty())
        }
        val edtDesc = EditText(this).apply {
            hint = "Mô tả / hướng dẫn"
            setText(existing?.description.orEmpty())
        }

        container.addView(edtName)
        container.addView(edtMuscle)
        container.addView(edtEquipment)
        container.addView(edtDifficulty)
        container.addView(edtGif)
        container.addView(edtDesc)

        AlertDialog.Builder(this, R.style.ThemeOverlay_FitTrack_Dialog_Alert)
            .setTitle(if (existing == null) "Thêm bài tập" else "Cập nhật bài tập")
            .setView(scroll)
            .setPositiveButton("Lưu") { _, _ ->
                val name = edtName.text.toString().trim()
                val muscle = edtMuscle.text.toString().trim()
                val diff = edtDifficulty.text.toString().trim().lowercase()
                val validDiff = if (diff in listOf("beginner", "intermediate", "advanced")) diff else "beginner"

                if (name.isBlank() || muscle.isBlank()) {
                    Toast.makeText(this, "Vui lòng nhập tên bài tập và nhóm cơ.", Toast.LENGTH_SHORT).show()
                    return@setPositiveButton
                }

                val mediaUrl = edtGif.text.toString().trim().ifBlank { null }
                val req = AdminUpsertExerciseRequest(
                    name = name,
                    muscleGroup = muscle,
                    equipment = edtEquipment.text.toString().trim().ifBlank { "body weight" },
                    difficulty = validDiff,
                    status = existing?.status ?: "active",
                    verified = existing?.verified ?: true,
                    thumbnailUrl = mediaUrl,
                    gifUrl = mediaUrl,
                    description = edtDesc.text.toString().trim().ifBlank { null }
                )

                runMutation {
                    val api = ApiClient.getService(this@AdminExercisesActivity)
                    if (existing == null) api.createAdminExercise(req) else api.updateAdminExercise(existing.id, req)
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
                    loadData()
                } else {
                    Toast.makeText(this@AdminExercisesActivity, "Thao tác thất bại (${res.code()})", Toast.LENGTH_SHORT).show()
                    binding.pbLoading.visibility = View.GONE
                }
            } catch (e: Exception) {
                Toast.makeText(this@AdminExercisesActivity, "Lỗi: ${e.localizedMessage}", Toast.LENGTH_SHORT).show()
                binding.pbLoading.visibility = View.GONE
            }
        }
    }
}
