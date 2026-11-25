package com.fittrack.app.ui.admin

import android.os.Bundle
import android.view.View
import android.widget.Toast
import androidx.appcompat.app.AppCompatActivity
import androidx.core.content.ContextCompat
import androidx.lifecycle.lifecycleScope
import com.fittrack.app.R
import com.fittrack.app.data.api.ApiClient
import com.fittrack.app.data.models.AdminCommunityCommentDto
import com.fittrack.app.data.models.AdminCommunityPostDto
import com.fittrack.app.data.session.SessionManager
import com.fittrack.app.databinding.ActivityAdminListBinding
import kotlinx.coroutines.Dispatchers
import kotlinx.coroutines.launch
import kotlinx.coroutines.withContext

class AdminCommunityActivity : AppCompatActivity() {

    private lateinit var binding: ActivityAdminListBinding
    private lateinit var session: SessionManager
    private val adapter = AdminRecordAdapter()

    private var activeFilter = "posts"
    private var searchQuery = ""

    private val filterOptions = listOf(
        "posts" to "Bài viết",
        "comments" to "Bình luận",
        "posts_trashed" to "Bài đã xóa",
        "comments_trashed" to "BL đã xóa"
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
            tab = AdminNavTab.COMMUNITY,
            title = "Kiểm duyệt Cộng đồng",
            subtitle = "Quản lý bài viết và bình luận từ người dùng",
            searchHint = "Tìm nội dung hoặc tác giả...",
            showAddButton = false,
            adapter = adapter,
            onSearchChanged = { q ->
                searchQuery = q
                loadItems()
            }
        )

        renderFilters()
        loadItems()
    }

    private fun renderFilters() {
        binding.renderFilterPills(this, filterOptions, activeFilter) { selected ->
            activeFilter = selected
            renderFilters()
            loadItems()
        }
    }

    private fun loadItems() {
        binding.pbLoading.visibility = View.VISIBLE
        binding.tvEmpty.visibility = View.GONE

        lifecycleScope.launch {
            try {
                val api = ApiClient.getService(this@AdminCommunityActivity)
                val q = searchQuery.ifBlank { null }
                val trashed = if (activeFilter.endsWith("_trashed")) "only" else null

                if (activeFilter.startsWith("posts")) {
                    val res = withContext(Dispatchers.IO) {
                        api.getAdminCommunityPosts(q = q, trashed = trashed, perPage = 50)
                    }
                    if (res.isSuccessful) {
                        bindPosts(res.body()?.data.orEmpty(), trashed != null)
                    } else {
                        Toast.makeText(this@AdminCommunityActivity, "Lỗi tải bài viết (${res.code()})", Toast.LENGTH_SHORT).show()
                    }
                } else {
                    val res = withContext(Dispatchers.IO) {
                        api.getAdminCommunityComments(q = q, trashed = trashed, perPage = 50)
                    }
                    if (res.isSuccessful) {
                        bindComments(res.body()?.data.orEmpty(), trashed != null)
                    } else {
                        Toast.makeText(this@AdminCommunityActivity, "Lỗi tải bình luận (${res.code()})", Toast.LENGTH_SHORT).show()
                    }
                }
            } catch (e: Exception) {
                Toast.makeText(this@AdminCommunityActivity, "Lỗi mạng: ${e.localizedMessage}", Toast.LENGTH_SHORT).show()
            } finally {
                binding.pbLoading.visibility = View.GONE
            }
        }
    }

    private fun bindPosts(list: List<AdminCommunityPostDto>, isTrashed: Boolean) {
        binding.tvEmpty.visibility = if (list.isEmpty()) View.VISIBLE else View.GONE
        val blue = ContextCompat.getColor(this, R.color.primary_blue)
        val blueSoft = ContextCompat.getColor(this, R.color.primary_blue_soft)
        val errorColor = ContextCompat.getColor(this, R.color.error)
        val secondary = ContextCompat.getColor(this, R.color.admin_text_secondary)
        val surface = ContextCompat.getColor(this, R.color.admin_surface)
        val white = ContextCompat.getColor(this, R.color.white)

        val cards = list.map { post ->
            val actions = if (isTrashed) {
                listOf(
                    AdminCardAction("Khôi phục", R.drawable.bg_admin_pill_active, white) {
                        runMutation { ApiClient.getService(this).restoreAdminCommunityPost(post.id) }
                    }
                )
            } else {
                listOf(
                    AdminCardAction("Xóa mềm", R.drawable.bg_admin_pill_inactive, errorColor) {
                        confirmAdminAction(this, "Xóa mềm bài viết", "Xóa bài viết vi phạm này?") {
                            runMutation { ApiClient.getService(this).deleteAdminCommunityPost(post.id) }
                        }
                    }
                )
            }

            AdminCardItem(
                id = post.id,
                title = post.user?.name ?: "Thành viên",
                badgeText = if (isTrashed) "Đã xóa" else "Bài viết",
                badgeBgColor = if (isTrashed) surface else blueSoft,
                badgeTextColor = if (isTrashed) secondary else blue,
                subtitle = post.content,
                meta = "${post.likesCount} thích • ${post.commentsCount} bình luận",
                actions = actions
            )
        }
        adapter.submitList(cards)
    }

    private fun bindComments(list: List<AdminCommunityCommentDto>, isTrashed: Boolean) {
        binding.tvEmpty.visibility = if (list.isEmpty()) View.VISIBLE else View.GONE
        val emerald = ContextCompat.getColor(this, R.color.admin_emerald)
        val emeraldBg = ContextCompat.getColor(this, R.color.admin_emerald_bg)
        val errorColor = ContextCompat.getColor(this, R.color.error)
        val secondary = ContextCompat.getColor(this, R.color.admin_text_secondary)
        val surface = ContextCompat.getColor(this, R.color.admin_surface)
        val white = ContextCompat.getColor(this, R.color.white)

        val cards = list.map { comment ->
            val actions = if (isTrashed) {
                listOf(
                    AdminCardAction("Khôi phục", R.drawable.bg_admin_pill_active, white) {
                        runMutation { ApiClient.getService(this).restoreAdminCommunityComment(comment.id) }
                    }
                )
            } else {
                listOf(
                    AdminCardAction("Xóa mềm", R.drawable.bg_admin_pill_inactive, errorColor) {
                        confirmAdminAction(this, "Xóa mềm bình luận", "Xóa bình luận vi phạm này?") {
                            runMutation { ApiClient.getService(this).deleteAdminCommunityComment(comment.id) }
                        }
                    }
                )
            }

            AdminCardItem(
                id = comment.id,
                title = comment.user?.name ?: "Thành viên",
                badgeText = if (isTrashed) "Đã xóa" else "Bình luận",
                badgeBgColor = if (isTrashed) surface else emeraldBg,
                badgeTextColor = if (isTrashed) secondary else emerald,
                subtitle = comment.content,
                meta = "Trong bài: ${comment.post?.content?.take(60) ?: "..."}",
                actions = actions
            )
        }
        adapter.submitList(cards)
    }

    private fun runMutation(call: suspend () -> retrofit2.Response<*>) {
        binding.pbLoading.visibility = View.VISIBLE
        lifecycleScope.launch {
            try {
                val res = withContext(Dispatchers.IO) { call() }
                if (res.isSuccessful) {
                    loadItems()
                } else {
                    Toast.makeText(this@AdminCommunityActivity, "Thao tác thất bại (${res.code()})", Toast.LENGTH_SHORT).show()
                    binding.pbLoading.visibility = View.GONE
                }
            } catch (e: Exception) {
                Toast.makeText(this@AdminCommunityActivity, "Lỗi: ${e.localizedMessage}", Toast.LENGTH_SHORT).show()
                binding.pbLoading.visibility = View.GONE
            }
        }
    }
}
