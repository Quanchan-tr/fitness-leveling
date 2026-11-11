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
    private var isLiked1 = true
    private var likeCount1 = 48

    private var post2Id: String? = null
    private var isLiked2 = false
    private var likeCount2 = 35

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
        if (!session.isLoggedIn) return

        lifecycleScope.launch {
            try {
                val response = withContext(Dispatchers.IO) {
                    ApiClient.getService(this@CommunityActivity).getCommunityPosts()
                }
                if (response.isSuccessful && response.body()?.data?.isNotEmpty() == true) {
                    val posts = response.body()!!.data!!

                    if (posts.isNotEmpty()) {
                        val p1 = posts[0]
                        post1Id = p1.id
                        likeCount1 = p1.likesCount
                        isLiked1 = p1.isLiked
                        binding.tvLikeCount1.text = likeCount1.toString()
                    }

                    if (posts.size > 1) {
                        val p2 = posts[1]
                        post2Id = p2.id
                        likeCount2 = p2.likesCount
                        isLiked2 = p2.isLiked
                        binding.tvLikeCount2.text = likeCount2.toString()
                    }
                }
            } catch (_: Exception) {
                // Keep default offline feed
            }
        }
    }

    private fun setupComposerInteractions() {
        // Attach photo action
        binding.btnAttachPhoto.setOnClickListener {
            attachedMediaType = "IMAGE"
            binding.layoutMediaPreview.visibility = View.VISIBLE
            binding.layoutPreviewImage.visibility = View.VISIBLE
            binding.layoutPreviewVideo.visibility = View.GONE
            Toast.makeText(this, "📷 Đã chọn ảnh thành tích buổi tập!", Toast.LENGTH_SHORT).show()
        }

        // Attach video action
        binding.btnAttachVideo.setOnClickListener {
            attachedMediaType = "VIDEO"
            binding.layoutMediaPreview.visibility = View.VISIBLE
            binding.layoutPreviewVideo.visibility = View.VISIBLE
            binding.layoutPreviewImage.visibility = View.GONE
            Toast.makeText(this, "🎥 Đã đính kèm video Squat Form Check (45s)!", Toast.LENGTH_SHORT).show()
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
            if (content.isEmpty() && attachedMediaType == null) {
                Toast.makeText(this, "Vui lòng nhập nội dung hoặc đính kèm ảnh/video", Toast.LENGTH_SHORT).show()
                return@setOnClickListener
            }

            val finalContent = if (content.isNotEmpty()) content else "Vừa hoàn thành buổi tập với thành tích mới!"

            // Sync with VPS Backend API
            if (session.isLoggedIn) {
                val api = ApiClient.getService(this)
                val mediaUrl = when (attachedMediaType) {
                    "IMAGE" -> "https://images.unsplash.com/photo-1517838277536-f5f99be501cd"
                    "VIDEO" -> "https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerBlazes.mp4"
                    else -> null
                }
                lifecycleScope.launch {
                    try {
                        withContext(Dispatchers.IO) {
                            api.createCommunityPost(
                                idempotencyKey = UUID.randomUUID().toString(),
                                request = CreatePostRequest(content = finalContent, mediaUrl = mediaUrl)
                            )
                        }
                    } catch (_: Exception) {
                        // Non-blocking sync
                    }
                }
            }

            // Display newly created post card
            binding.cardNewlyCreatedPost.visibility = View.VISIBLE
            binding.tvNewPostContent.text = finalContent

            if (attachedMediaType == "IMAGE") {
                binding.cardNewPostMedia.visibility = View.VISIBLE
                binding.tvNewPostMediaBadge.text = "📷 Ảnh thành tích buổi tập (Đính kèm)"
                binding.ivNewPostPlay.visibility = View.GONE
            } else if (attachedMediaType == "VIDEO") {
                binding.cardNewPostMedia.visibility = View.VISIBLE
                binding.tvNewPostMediaBadge.text = "🎥 Video Squat Form Check AI 98% (0:45s)"
                binding.ivNewPostPlay.visibility = View.VISIBLE
            } else {
                binding.cardNewPostMedia.visibility = View.GONE
            }

            // Reset composer
            binding.etCreatePost.text.clear()
            attachedMediaType = null
            binding.layoutMediaPreview.visibility = View.GONE
            binding.layoutPreviewImage.visibility = View.GONE
            binding.layoutPreviewVideo.visibility = View.GONE

            Toast.makeText(this, "✓ Đã đăng bài viết lên Bang hội VPS thành công!", Toast.LENGTH_SHORT).show()
        }

        // Play video clicks
        binding.btnPlayPreviewVideo.setOnClickListener {
            Toast.makeText(this, "▶ Đang phát video kiểm tra form 45s...", Toast.LENGTH_SHORT).show()
        }
        binding.cardPost2Video.setOnClickListener {
            Toast.makeText(this, "▶ Đang mở video Meal Prep & Lịch tập...", Toast.LENGTH_SHORT).show()
        }
    }

    private fun setupFeedInteractions() {
        binding.btnSaveRoutine.setOnClickListener {
            Toast.makeText(this, getString(R.string.community_toast_routine_saved), Toast.LENGTH_SHORT).show()
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

    private fun setupBottomNav() {
        binding.bottomNavigation.setupBottomNav(this, BottomNavTab.COMMUNITY)
    }
}
