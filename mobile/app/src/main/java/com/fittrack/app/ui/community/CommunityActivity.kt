package com.fittrack.app.ui.community

import android.os.Bundle
import android.view.View
import android.widget.Toast
import androidx.appcompat.app.AppCompatActivity
import androidx.core.content.ContextCompat
import androidx.lifecycle.lifecycleScope
import com.fittrack.app.R
import com.fittrack.app.data.api.ApiClient
import com.fittrack.app.data.models.CommunityPostDto
import com.fittrack.app.data.models.CreatePostRequest
import com.fittrack.app.data.session.SessionManager
import com.fittrack.app.databinding.ActivityCommunityBinding
import com.fittrack.app.ui.BottomNavTab
import com.fittrack.app.ui.setupBottomNav
import kotlinx.coroutines.Dispatchers
import kotlinx.coroutines.launch
import kotlinx.coroutines.withContext
import java.util.UUID

class CommunityActivity : AppCompatActivity() {

    private lateinit var binding: ActivityCommunityBinding
    private lateinit var session: SessionManager

    private var post1Id: String? = null
    private var isLiked1 = false
    private var likeCount1 = 0

    private var post2Id: String? = null
    private var isLiked2 = false
    private var likeCount2 = 0

    private var attachedMediaType: String? = null // null, "IMAGE", or "VIDEO"

    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)
        binding = ActivityCommunityBinding.inflate(layoutInflater)
        setContentView(binding.root)

        session = SessionManager.getInstance(this)

        setupBottomNav()
        setupFeedInteractions()
        setupComposerInteractions()

        fetchCommunityFeed()
    }

    override fun onResume() {
        super.onResume()
        fetchCommunityFeed()
    }

    private fun fetchCommunityFeed() {
        if (!session.isLoggedIn) {
            Toast.makeText(this, "Vui lòng đăng nhập để xem bảng tin cộng đồng", Toast.LENGTH_SHORT).show()
            return
        }

        lifecycleScope.launch {
            try {
                val response = withContext(Dispatchers.IO) {
                    ApiClient.getService(this@CommunityActivity).getCommunityPosts()
                }
                if (response.isSuccessful) {
                    val posts = response.body()?.data.orEmpty()
                    if (posts.isEmpty()) {
                        binding.tvPost1Author.text = "Chưa có bài viết"
                        binding.tvPost1Content.text = "Hãy là người đầu tiên chia sẻ thành tích tập luyện!"
                        binding.tvLikeCount1.text = "0"
                        binding.tvPost2Author.text = ""
                        binding.tvPost2Content.text = ""
                        binding.tvLikeCount2.text = "0"
                        return@launch
                    }

                    val p1 = posts[0]
                    post1Id = p1.id
                    binding.tvPost1Author.text = p1.userName ?: "Thành viên FitTrack"
                    binding.tvPost1Content.text = p1.content
                    likeCount1 = p1.likesCount
                    isLiked1 = p1.isLiked
                    binding.tvLikeCount1.text = likeCount1.toString()

                    if (posts.size > 1) {
                        val p2 = posts[1]
                        post2Id = p2.id
                        binding.tvPost2Author.text = p2.userName ?: "Thành viên FitTrack"
                        binding.tvPost2Content.text = p2.content
                        likeCount2 = p2.likesCount
                        isLiked2 = p2.isLiked
                        binding.tvLikeCount2.text = likeCount2.toString()
                    }
                } else {
                    Toast.makeText(this@CommunityActivity, "Không thể tải bảng tin (${response.code()})", Toast.LENGTH_SHORT).show()
                }
            } catch (e: Exception) {
                Toast.makeText(this@CommunityActivity, "Lỗi kết nối máy chủ: ${e.localizedMessage}", Toast.LENGTH_SHORT).show()
            }
        }
    }

    private fun setupComposerInteractions() {
        // Attach photo/video disabled until real multipart media upload is supported
        binding.btnAttachPhoto.setOnClickListener {
            Toast.makeText(this, "Tính năng tải ảnh từ thiết bị đang được phát triển. Vui lòng đăng bài văn bản.", Toast.LENGTH_SHORT).show()
        }

        binding.btnAttachVideo.setOnClickListener {
            Toast.makeText(this, "Tính năng tải video từ thiết bị đang được phát triển. Vui lòng đăng bài văn bản.", Toast.LENGTH_SHORT).show()
        }

        // Remove media buttons
        binding.btnRemoveImage.setOnClickListener {
            attachedMediaType = null
            binding.layoutMediaPreview.visibility = View.GONE
            binding.layoutPreviewImage.visibility = View.GONE
        }

        binding.btnRemoveVideo.setOnClickListener {
            attachedMediaType = null
            binding.layoutMediaPreview.visibility = View.GONE
            binding.layoutPreviewVideo.visibility = View.GONE
        }

        // Submit new post
        binding.btnSubmitPost.setOnClickListener {
            val content = binding.etCreatePost.text.toString().trim()
            if (content.isEmpty()) {
                Toast.makeText(this, "Vui lòng nhập nội dung bài viết", Toast.LENGTH_SHORT).show()
                return@setOnClickListener
            }
            if (!session.isLoggedIn) {
                Toast.makeText(this, "Vui lòng đăng nhập để đăng bài", Toast.LENGTH_SHORT).show()
                return@setOnClickListener
            }

            binding.btnSubmitPost.isEnabled = false
            val api = ApiClient.getService(this)
            lifecycleScope.launch {
                try {
                    val res = withContext(Dispatchers.IO) {
                        api.createCommunityPost(
                            idempotencyKey = UUID.randomUUID().toString(),
                            request = CreatePostRequest(content = content, mediaUrl = null)
                        )
                    }
                    binding.btnSubmitPost.isEnabled = true
                    if (res.isSuccessful && res.body()?.data != null) {
                        binding.cardNewlyCreatedPost.visibility = View.VISIBLE
                        binding.tvNewPostContent.text = res.body()!!.data!!.content
                        binding.cardNewPostMedia.visibility = View.GONE
                        binding.etCreatePost.text.clear()
                        attachedMediaType = null
                        Toast.makeText(this@CommunityActivity, "✓ Đã đăng bài lên cộng đồng!", Toast.LENGTH_SHORT).show()
                        fetchCommunityFeed()
                    } else {
                        Toast.makeText(this@CommunityActivity, "Không thể đăng bài (${res.code()})", Toast.LENGTH_SHORT).show()
                    }
                } catch (e: Exception) {
                    binding.btnSubmitPost.isEnabled = true
                    Toast.makeText(this@CommunityActivity, "Lỗi kết nối VPS: ${e.localizedMessage}", Toast.LENGTH_SHORT).show()
                }
            }
        }
    }

    private fun setupFeedInteractions() {
        binding.btnHeaderAction.setOnClickListener {
            binding.etCreatePost.requestFocus()
        }

        binding.btnSaveRoutine.setOnClickListener {
            startActivity(android.content.Intent(this, com.fittrack.app.ui.workout.WorkoutsActivity::class.java))
        }

        binding.btnCommentPost1.setOnClickListener { showCommentDialog(post1Id) }
        binding.btnCommentPost2.setOnClickListener { showCommentDialog(post2Id) }

        binding.btnSharePost1.setOnClickListener {
            sharePostContent(binding.tvPost1Content.text.toString())
        }
        binding.btnSharePost2.setOnClickListener {
            sharePostContent(binding.tvPost2Content.text.toString())
        }

        binding.btnLikePost1.setOnClickListener {
            isLiked1 = !isLiked1
            likeCount1 += if (isLiked1) 1 else -1
            binding.tvLikeCount1.text = likeCount1.toString()
            binding.icLikePost1.setColorFilter(
                ContextCompat.getColor(this, if (isLiked1) R.color.primary else R.color.text_slate)
            )

            post1Id?.let { id ->
                lifecycleScope.launch {
                    try {
                        withContext(Dispatchers.IO) {
                            ApiClient.getService(this@CommunityActivity).togglePostLike(id)
                        }
                    } catch (_: Exception) {}
                }
            }
        }

        binding.btnLikePost2.setOnClickListener {
            isLiked2 = !isLiked2
            likeCount2 += if (isLiked2) 1 else -1
            binding.tvLikeCount2.text = likeCount2.toString()
            binding.icLikePost2.setColorFilter(
                ContextCompat.getColor(this, if (isLiked2) R.color.primary else R.color.text_slate)
            )

            post2Id?.let { id ->
                lifecycleScope.launch {
                    try {
                        withContext(Dispatchers.IO) {
                            ApiClient.getService(this@CommunityActivity).togglePostLike(id)
                        }
                    } catch (_: Exception) {}
                }
            }
        }
    }

    private fun sharePostContent(content: String) {
        if (content.isBlank()) return
        val shareIntent = android.content.Intent(android.content.Intent.ACTION_SEND).apply {
            type = "text/plain"
            putExtra(android.content.Intent.EXTRA_TEXT, "$content — FitTrack AI")
        }
        startActivity(android.content.Intent.createChooser(shareIntent, "Chia sẻ bài viết"))
    }

    private fun showCommentDialog(postId: String?) {
        if (postId.isNullOrBlank()) {
            Toast.makeText(this, "Chưa có bài viết để bình luận", Toast.LENGTH_SHORT).show()
            return
        }
        val input = android.widget.EditText(this).apply {
            hint = "Nhập bình luận của bạn..."
        }
        androidx.appcompat.app.AlertDialog.Builder(this)
            .setTitle("Bình luận")
            .setView(input)
            .setPositiveButton("Gửi") { _, _ ->
                val text = input.text.toString().trim()
                if (text.isEmpty()) return@setPositiveButton
                lifecycleScope.launch {
                    try {
                        val res = withContext(Dispatchers.IO) {
                            ApiClient.getService(this@CommunityActivity).addPostComment(
                                postId,
                                com.fittrack.app.data.models.AddCommentRequest(text)
                            )
                        }
                        if (res.isSuccessful) {
                            Toast.makeText(this@CommunityActivity, "✓ Đã gửi bình luận!", Toast.LENGTH_SHORT).show()
                            fetchCommunityFeed()
                        } else {
                            Toast.makeText(this@CommunityActivity, "Lỗi gửi bình luận (${res.code()})", Toast.LENGTH_SHORT).show()
                        }
                    } catch (e: Exception) {
                        Toast.makeText(this@CommunityActivity, "Lỗi kết nối: ${e.localizedMessage}", Toast.LENGTH_SHORT).show()
                    }
                }
            }
            .setNegativeButton("Hủy", null)
            .show()
    }

    private fun setupBottomNav() {
        binding.bottomNavigation.setupBottomNav(this, BottomNavTab.COMMUNITY)
    }
}
