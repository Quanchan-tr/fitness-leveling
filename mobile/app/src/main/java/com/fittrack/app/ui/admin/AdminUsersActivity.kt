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
import com.fittrack.app.data.models.AdminCreateUserRequest
import com.fittrack.app.data.models.AdminUpdateUserRequest
import com.fittrack.app.data.models.AdminUserDto
import com.fittrack.app.data.session.SessionManager
import com.fittrack.app.databinding.ActivityAdminListBinding
import kotlinx.coroutines.Dispatchers
import kotlinx.coroutines.launch
import kotlinx.coroutines.withContext

class AdminUsersActivity : AppCompatActivity() {

    private lateinit var binding: ActivityAdminListBinding
    private lateinit var session: SessionManager
    private val adapter = AdminRecordAdapter()

    private var statusFilter = "all"
    private var searchQuery = ""

    private val filterOptions = listOf(
        "all" to "Tất cả",
        "active" to "Hoạt động",
        "banned" to "Bị khóa",
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
            tab = AdminNavTab.USERS,
            title = "Quản lý Người dùng",
            subtitle = "Phân quyền, khóa/mở khóa và khôi phục tài khoản",
            searchHint = "Tìm theo tên hoặc email...",
            showAddButton = true,
            adapter = adapter,
            onSearchChanged = { q ->
                searchQuery = q
                loadUsers()
            },
            onAddClicked = { showUserDialog(null) }
        )

        renderFilters()
        loadUsers()
    }

    private fun renderFilters() {
        binding.renderFilterPills(this, filterOptions, statusFilter) { selected ->
            statusFilter = selected
            renderFilters()
            loadUsers()
        }
    }

    private fun loadUsers() {
        binding.pbLoading.visibility = View.VISIBLE
        binding.tvEmpty.visibility = View.GONE

        lifecycleScope.launch {
            try {
                val res = withContext(Dispatchers.IO) {
                    ApiClient.getService(this@AdminUsersActivity).getAdminUsers(
                        q = searchQuery.ifBlank { null },
                        status = statusFilter,
                        perPage = 50
                    )
                }
                if (res.isSuccessful) {
                    val list = res.body()?.data.orEmpty()
                    bindUsers(list)
                } else {
                    Toast.makeText(this@AdminUsersActivity, "Lỗi tải danh sách (${res.code()})", Toast.LENGTH_SHORT).show()
                }
            } catch (e: Exception) {
                Toast.makeText(this@AdminUsersActivity, "Lỗi mạng: ${e.localizedMessage}", Toast.LENGTH_SHORT).show()
            } finally {
                binding.pbLoading.visibility = View.GONE
            }
        }
    }

    private fun bindUsers(list: List<AdminUserDto>) {
        binding.tvEmpty.visibility = if (list.isEmpty()) View.VISIBLE else View.GONE
        val blue = ContextCompat.getColor(this, R.color.primary_blue)
        val blueSoft = ContextCompat.getColor(this, R.color.primary_blue_soft)
        val emerald = ContextCompat.getColor(this, R.color.admin_emerald)
        val emeraldBg = ContextCompat.getColor(this, R.color.admin_emerald_bg)
        val errorColor = ContextCompat.getColor(this, R.color.error)
        val errorBg = ContextCompat.getColor(this, R.color.error_bg)
        val warnColor = ContextCompat.getColor(this, R.color.warning)
        val secondary = ContextCompat.getColor(this, R.color.admin_text_secondary)
        val surface = ContextCompat.getColor(this, R.color.admin_surface)
        val white = ContextCompat.getColor(this, R.color.white)

        val cards = list.map { u ->
            val isSelf = u.id == session.userId
            val isBanned = !u.bannedAt.isNullOrBlank()
            val isTrashed = !u.deletedAt.isNullOrBlank()

            val (badgeText, badgeBg, badgeFg) = when {
                isTrashed -> Triple("Đã xóa", surface, secondary)
                isBanned -> Triple("Bị khóa", errorBg, errorColor)
                u.role == "admin" -> Triple("ADMIN", blueSoft, blue)
                else -> Triple("Hoạt động", emeraldBg, emerald)
            }

            val actions = if (isTrashed) {
                listOf(
                    AdminCardAction("Khôi phục", R.drawable.bg_admin_pill_active, white) {
                        runMutation { ApiClient.getService(this).restoreAdminUser(u.id) }
                    }
                )
            } else {
                buildList {
                    add(AdminCardAction("Sửa", R.drawable.bg_admin_badge_blue, blue) {
                        showUserDialog(u)
                    })
                    if (!isSelf) {
                        add(
                            AdminCardAction(
                                if (isBanned) "Mở khóa" else "Khóa",
                                R.drawable.bg_admin_pill_inactive,
                                if (isBanned) emerald else warnColor
                            ) {
                                confirmAdminAction(
                                    this@AdminUsersActivity,
                                    if (isBanned) "Mở khóa tài khoản" else "Khóa tài khoản",
                                    "Xác nhận ${if (isBanned) "mở khóa" else "khóa"} tài khoản ${u.email}?"
                                ) {
                                    runMutation { ApiClient.getService(this@AdminUsersActivity).toggleBanAdminUser(u.id) }
                                }
                            }
                        )
                        add(AdminCardAction("Xóa", R.drawable.bg_admin_pill_inactive, errorColor) {
                            confirmAdminAction(
                                this@AdminUsersActivity,
                                "Xóa mềm tài khoản",
                                "Xóa mềm tài khoản ${u.email}?"
                            ) {
                                runMutation { ApiClient.getService(this@AdminUsersActivity).deleteAdminUser(u.id) }
                            }
                        })
                    }
                }
            }

            AdminCardItem(
                id = u.id,
                title = if (isSelf) "${u.name} (Bạn)" else u.name,
                badgeText = badgeText,
                badgeBgColor = badgeBg,
                badgeTextColor = badgeFg,
                subtitle = "${u.email} • Quyền: ${u.role.uppercase()}",
                meta = "Lv.${u.level} • ${u.workoutLogsCount} buổi tập • ${u.nutritionLogsCount} bữa ăn • ${u.poseCheckSessionsCount} Pose",
                actions = actions
            )
        }
        adapter.submitList(cards)
    }

    private fun showUserDialog(existing: AdminUserDto?) {
        val (scroll, container) = wrapDialogContainer(this)
        val edtName = EditText(this).apply {
            hint = "Họ tên *"
            setText(existing?.name.orEmpty())
        }
        val edtEmail = EditText(this).apply {
            hint = "Email *"
            inputType = InputType.TYPE_TEXT_VARIATION_EMAIL_ADDRESS
            setText(existing?.email.orEmpty())
        }
        val edtPassword = EditText(this).apply {
            hint = if (existing == null) "Mật khẩu * (tối thiểu 8 ký tự)" else "Mật khẩu mới (bỏ trống nếu giữ)"
            inputType = InputType.TYPE_CLASS_TEXT or InputType.TYPE_TEXT_VARIATION_PASSWORD
        }
        val cbAdmin = CheckBox(this).apply {
            text = "Cấp quyền Admin"
            isChecked = existing?.role == "admin"
            isEnabled = existing == null || existing.id != session.userId
        }
        container.addView(edtName)
        container.addView(edtEmail)
        container.addView(edtPassword)
        container.addView(cbAdmin)

        AlertDialog.Builder(this, R.style.ThemeOverlay_FitTrack_Dialog_Alert)
            .setTitle(if (existing == null) "Thêm người dùng" else "Cập nhật người dùng")
            .setView(scroll)
            .setPositiveButton("Lưu") { _, _ ->
                val name = edtName.text.toString().trim()
                val email = edtEmail.text.toString().trim()
                val password = edtPassword.text.toString()
                val role = if (cbAdmin.isChecked) "admin" else "user"

                if (name.isBlank() || email.isBlank() || (existing == null && password.length < 8)) {
                    Toast.makeText(this, "Vui lòng nhập đầy đủ họ tên, email và mật khẩu (>=8 ký tự).", Toast.LENGTH_SHORT).show()
                    return@setPositiveButton
                }

                runMutation {
                    val api = ApiClient.getService(this@AdminUsersActivity)
                    if (existing == null) {
                        api.createAdminUser(AdminCreateUserRequest(name, email, password, role))
                    } else {
                        api.updateAdminUser(
                            existing.id,
                            AdminUpdateUserRequest(
                                name = name,
                                email = email,
                                password = password.ifBlank { null },
                                role = role
                            )
                        )
                    }
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
                    loadUsers()
                } else {
                    Toast.makeText(this@AdminUsersActivity, "Thao tác thất bại (${res.code()})", Toast.LENGTH_SHORT).show()
                    binding.pbLoading.visibility = View.GONE
                }
            } catch (e: Exception) {
                Toast.makeText(this@AdminUsersActivity, "Lỗi: ${e.localizedMessage}", Toast.LENGTH_SHORT).show()
                binding.pbLoading.visibility = View.GONE
            }
        }
    }
}
