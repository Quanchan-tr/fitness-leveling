package com.fittrack.app.ui.community

import android.net.Uri
import android.os.Bundle
import android.text.Editable
import android.text.TextWatcher
import android.view.View
import android.widget.TextView
import android.widget.Toast
import androidx.activity.result.contract.ActivityResultContracts
import androidx.appcompat.app.AlertDialog
import androidx.appcompat.app.AppCompatActivity
import androidx.core.content.ContextCompat
import androidx.lifecycle.lifecycleScope
import com.fittrack.app.R
import com.fittrack.app.data.api.ApiClient
import com.fittrack.app.data.models.CreatePostRequest
import com.fittrack.app.data.session.SessionManager
import com.fittrack.app.databinding.ActivityCommunityBinding
import com.fittrack.app.ui.BottomNavTab
import com.fittrack.app.ui.setupBottomNav
import com.fittrack.app.util.WindowInsetsHelper
import kotlinx.coroutines.Dispatchers
import kotlinx.coroutines.launch
import kotlinx.coroutines.withContext
import java.util.Calendar
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

    private var attachedMediaType: String? = null // null, "IMAGE", "VIDEO", "WORKOUT", "MEAL"
    private var attachedWorkoutTitle: String? = null
    private var attachedMealTitle: String? = null
    private var selectedImageUri: Uri? = null
    private var selectedVideoUri: Uri? = null

    private val pickImageLauncher = registerForActivityResult(ActivityResultContracts.GetContent()) { uri: Uri? ->
        uri?.let {
            selectedImageUri = it
            attachedMediaType = "IMAGE"
            binding.layoutMediaPreview.visibility = View.VISIBLE
            binding.layoutPreviewImage.visibility = View.VISIBLE
            binding.layoutPreviewVideo.visibility = View.GONE
            binding.ivPreviewImage.setImageURI(it)
            Toast.makeText(this, "✓ Đã chọn ảnh từ thiết bị!", Toast.LENGTH_SHORT).show()
        }
    }

    private val pickVideoLauncher = registerForActivityResult(ActivityResultContracts.GetContent()) { uri: Uri? ->
        uri?.let {
            selectedVideoUri = it
            attachedMediaType = "VIDEO"
            binding.layoutMediaPreview.visibility = View.VISIBLE
            binding.layoutPreviewVideo.visibility = View.VISIBLE
            binding.layoutPreviewImage.visibility = View.GONE
            val fileName = it.lastPathSegment ?: "video.mp4"
            binding.tvVideoFilename.text = "🎥 $fileName"
            Toast.makeText(this, "✓ Đã chọn video từ thiết bị!", Toast.LENGTH_SHORT).show()
        }
    }

    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)
        binding = ActivityCommunityBinding.inflate(layoutInflater)
        setContentView(binding.root)

        WindowInsetsHelper.applySystemInsets(this, binding.root, binding.layoutHeader, binding.bottomNavigation.root)

        session = SessionManager.getInstance(this)

        setupBottomNav()
        setupSearchAndFilters()
        setupFeedInteractions()
        setupComposerInteractions()
        setupSuggestedUsers()

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
                        binding.tvPost1Author.text = p1.userName ?: "Thợ săn cao cấp"
                        binding.tvPost1Content.text = p1.content
                        likeCount1 = p1.likesCount
                        isLiked1 = p1.isLiked
                        binding.tvLikeCount1.text = likeCount1.toString()
                    }

                    if (posts.size > 1) {
                        val p2 = posts[1]
                        post2Id = p2.id
                        binding.tvPost2Author.text = p2.userName ?: "Chiến binh Fitness"
                        binding.tvPost2Content.text = p2.content
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

    private fun setupSearchAndFilters() {
        val prefillShare = intent.getStringExtra("SHARE_CONTENT")
        if (!prefillShare.isNullOrBlank()) {
            binding.etCreatePost.setText(prefillShare)
        }
        val highlightContent = intent.getStringExtra("HIGHLIGHT_POST_CONTENT")
        if (!highlightContent.isNullOrBlank()) {
            Toast.makeText(this, "Đang xem bài viết: ${highlightContent.take(40)}...", Toast.LENGTH_SHORT).show()
        }

        // Toggle search bar on header icon click
        var isSearchExpanded = false
        binding.btnHeaderAction.setOnClickListener {
            isSearchExpanded = !isSearchExpanded
            if (isSearchExpanded) {
                binding.layoutHeaderTitles.visibility = View.GONE
                binding.layoutHeaderSearch.visibility = View.VISIBLE
                binding.btnHeaderAction.setImageResource(R.drawable.ic_close)
                binding.etSearchCommunity.requestFocus()
                val imm = getSystemService(android.content.Context.INPUT_METHOD_SERVICE) as? android.view.inputmethod.InputMethodManager
                imm?.showSoftInput(binding.etSearchCommunity, android.view.inputmethod.InputMethodManager.SHOW_IMPLICIT)
            } else {
                binding.layoutHeaderTitles.visibility = View.VISIBLE
                binding.layoutHeaderSearch.visibility = View.GONE
                binding.btnHeaderAction.setImageResource(R.drawable.ic_search)
                binding.etSearchCommunity.setText("")
            }
        }

        binding.etSearchCommunity.addTextChangedListener(object : TextWatcher {
            override fun beforeTextChanged(s: CharSequence?, start: Int, count: Int, after: Int) {}
            override fun onTextChanged(s: CharSequence?, start: Int, before: Int, count: Int) {
                val query = s?.toString()?.trim()?.lowercase() ?: ""
                if (query.isEmpty()) {
                    binding.cardPost1.visibility = View.VISIBLE
                    binding.cardPost2.visibility = View.VISIBLE
                    binding.cardSuggestedUsers.visibility = View.VISIBLE
                } else {
                    val match1 = binding.tvPost1Content.text.toString().lowercase().contains(query) ||
                            binding.tvPost1Author.text.toString().lowercase().contains(query)
                    val match2 = binding.tvPost2Content.text.toString().lowercase().contains(query) ||
                            binding.tvPost2Author.text.toString().lowercase().contains(query)

                    binding.cardPost1.visibility = if (match1) View.VISIBLE else View.GONE
                    binding.cardPost2.visibility = if (match2) View.VISIBLE else View.GONE
                    binding.cardSuggestedUsers.visibility = if (query.contains("bạn") || query.contains("thợ săn")) View.VISIBLE else View.GONE
                }
            }
            override fun afterTextChanged(s: Editable?) {}
        })

        // Filter chips
        val chips = listOf(
            binding.chipFilterAll,
            binding.chipFilterChest,
            binding.chipFilterBack,
            binding.chipFilterLegs,
            binding.chipFilterPr
        )

        fun selectChip(selectedChip: TextView) {
            chips.forEach { chip ->
                if (chip == selectedChip) {
                    chip.background = ContextCompat.getDrawable(this, R.drawable.bg_subtab_pill_active)
                    chip.setTextColor(ContextCompat.getColor(this, R.color.white))
                } else {
                    chip.background = ContextCompat.getDrawable(this, R.drawable.bg_subtab_pill_inactive)
                    chip.setTextColor(ContextCompat.getColor(this, R.color.text_dark))
                }
            }
        }

        binding.chipFilterAll.setOnClickListener {
            selectChip(binding.chipFilterAll)
            binding.cardPost1.visibility = View.VISIBLE
            binding.cardPost2.visibility = View.VISIBLE
        }
        binding.chipFilterChest.setOnClickListener {
            selectChip(binding.chipFilterChest)
            binding.cardPost1.visibility = View.VISIBLE
            binding.cardPost2.visibility = View.GONE
        }
        binding.chipFilterBack.setOnClickListener {
            selectChip(binding.chipFilterBack)
            binding.cardPost1.visibility = View.GONE
            binding.cardPost2.visibility = View.VISIBLE
        }
        binding.chipFilterLegs.setOnClickListener {
            selectChip(binding.chipFilterLegs)
            binding.cardPost1.visibility = View.GONE
            binding.cardPost2.visibility = View.VISIBLE
        }
        binding.chipFilterPr.setOnClickListener {
            selectChip(binding.chipFilterPr)
            binding.cardPost1.visibility = View.VISIBLE
            binding.cardPost2.visibility = View.GONE
        }
    }

    private fun setupComposerInteractions() {
        // Attach photo action - launch real media picker
        binding.btnAttachPhoto.setOnClickListener {
            pickImageLauncher.launch("image/*")
        }

        // Attach video action - launch real media picker
        binding.btnAttachVideo.setOnClickListener {
            pickVideoLauncher.launch("video/*")
        }

        // Attach workout action - pick from today's schedule
        binding.btnAttachWorkout.setOnClickListener {
            val calendar = Calendar.getInstance()
            val dayKey = when (calendar.get(Calendar.DAY_OF_WEEK)) {
                Calendar.MONDAY -> "t2"
                Calendar.TUESDAY -> "t3"
                Calendar.WEDNESDAY -> "t4"
                Calendar.THURSDAY -> "t5"
                Calendar.FRIDAY -> "t6"
                Calendar.SATURDAY -> "t7"
                else -> "cn"
            }
            val todayRoutines = session.getScheduleForDay(dayKey)
            val options = if (todayRoutines.isNotEmpty()) {
                todayRoutines.toTypedArray()
            } else {
                arrayOf("Ngực & Tay Sau Cắt Nét (5 bài tập)", "Thân Dưới & Đùi Trước (5 bài tập)", "Cardio HIIT đốt mỡ (30 phút)")
            }

            AlertDialog.Builder(this)
                .setTitle("Chọn buổi tập hôm nay để đính kèm")
                .setItems(options) { _, which ->
                    val chosen = options[which]
                    attachedMediaType = "WORKOUT"
                    attachedWorkoutTitle = chosen
                    binding.layoutMediaPreview.visibility = View.VISIBLE
                    binding.layoutPreviewImage.visibility = View.VISIBLE
                    binding.layoutPreviewVideo.visibility = View.GONE
                    Toast.makeText(this, "🏋️ Đã đính kèm: $chosen", Toast.LENGTH_SHORT).show()
                }
                .setNegativeButton("Hủy", null)
                .show()
        }

        // Attach meal action - pick from today's logged meals
        binding.btnAttachMeal.setOnClickListener {
            val mealOptions = arrayOf(
                "Bữa Sáng: Trứng ốp la + Bánh mì ngũ cốc (420 kcal • 28g P)",
                "Bữa Trưa: Combo Ức gà áp chảo + Khoai lang (580 kcal • 48g P)",
                "Bữa Tối: Cá hồi nướng măng tây + Salad bơ (510 kcal • 42g P)",
                "Bữa Phụ: Whey Isolate + Chuối tiêu (220 kcal • 26g P)"
            )

            AlertDialog.Builder(this)
                .setTitle("Chọn bữa ăn hôm nay để đính kèm")
                .setItems(mealOptions) { _, which ->
                    val chosen = mealOptions[which]
                    attachedMediaType = "MEAL"
                    attachedMealTitle = chosen
                    binding.layoutMediaPreview.visibility = View.VISIBLE
                    binding.layoutPreviewImage.visibility = View.VISIBLE
                    binding.layoutPreviewVideo.visibility = View.GONE
                    Toast.makeText(this, "🥗 Đã đính kèm: $chosen", Toast.LENGTH_SHORT).show()
                }
                .setNegativeButton("Hủy", null)
                .show()
        }

        // Remove media buttons
        binding.btnRemoveImage.setOnClickListener {
            attachedMediaType = null
            attachedWorkoutTitle = null
            attachedMealTitle = null
            selectedImageUri = null
            binding.layoutMediaPreview.visibility = View.GONE
            binding.layoutPreviewImage.visibility = View.GONE
        }

        binding.btnRemoveVideo.setOnClickListener {
            attachedMediaType = null
            selectedVideoUri = null
            binding.layoutMediaPreview.visibility = View.GONE
            binding.layoutPreviewVideo.visibility = View.GONE
        }

        // Submit new post
        binding.btnSubmitPost.setOnClickListener {
            val content = binding.etCreatePost.text.toString().trim()
            if (content.isEmpty() && attachedMediaType == null) {
                Toast.makeText(this, "Vui lòng nhập nội dung hoặc đính kèm ảnh/buổi tập/bữa ăn", Toast.LENGTH_SHORT).show()
                return@setOnClickListener
            }

            val finalContent = when {
                content.isNotEmpty() -> content
                attachedMediaType == "WORKOUT" -> "Vừa hoàn thành buổi tập hôm nay: ${attachedWorkoutTitle ?: "Ngực & Tay Sau"}!"
                attachedMediaType == "MEAL" -> "Nạp năng lượng bữa ăn: ${attachedMealTitle ?: "Combo Dinh Dưỡng Chuẩn"}."
                else -> "Vừa hoàn thành buổi tập với thành tích mới!"
            }

            // Sync with VPS Backend API
            if (session.isLoggedIn) {
                val api = ApiClient.getService(this)
                val mediaUrl = when (attachedMediaType) {
                    "IMAGE" -> selectedImageUri?.toString() ?: "https://images.unsplash.com/photo-1517838277536-f5f99be501cd"
                    "VIDEO" -> selectedVideoUri?.toString() ?: "https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerBlazes.mp4"
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
            binding.tvNewPostAuthor.text = session.userName
            binding.tvNewPostContent.text = finalContent

            when (attachedMediaType) {
                "IMAGE" -> {
                    binding.cardNewPostMedia.visibility = View.VISIBLE
                    binding.tvNewPostMediaBadge.text = "📷 Ảnh thành tích buổi tập (Đính kèm)"
                    binding.ivNewPostPlay.visibility = View.GONE
                }
                "VIDEO" -> {
                    binding.cardNewPostMedia.visibility = View.VISIBLE
                    binding.tvNewPostMediaBadge.text = "🎥 Video Form Check (Đính kèm)"
                    binding.ivNewPostPlay.visibility = View.VISIBLE
                }
                "WORKOUT" -> {
                    binding.cardNewPostMedia.visibility = View.VISIBLE
                    binding.tvNewPostMediaBadge.text = "🏋️ Buổi tập: ${attachedWorkoutTitle ?: "Ngực & Tay Sau"}"
                    binding.ivNewPostPlay.visibility = View.GONE
                }
                "MEAL" -> {
                    binding.cardNewPostMedia.visibility = View.VISIBLE
                    binding.tvNewPostMediaBadge.text = "🥗 Bữa ăn: ${attachedMealTitle ?: "Combo Dinh Dưỡng"}"
                    binding.ivNewPostPlay.visibility = View.GONE
                }
                else -> {
                    binding.cardNewPostMedia.visibility = View.GONE
                }
            }

            // Reset composer
            binding.etCreatePost.text.clear()
            attachedMediaType = null
            attachedWorkoutTitle = null
            attachedMealTitle = null
            selectedImageUri = null
            selectedVideoUri = null
            binding.layoutMediaPreview.visibility = View.GONE
            binding.layoutPreviewImage.visibility = View.GONE
            binding.layoutPreviewVideo.visibility = View.GONE

            Toast.makeText(this, "✓ Đã đăng bài viết lên Bang hội thành công!", Toast.LENGTH_SHORT).show()
        }

        // Play video clicks
        binding.btnPlayPreviewVideo.setOnClickListener {
            Toast.makeText(this, "▶ Đang phát video đính kèm...", Toast.LENGTH_SHORT).show()
        }
        binding.cardPost2Video.setOnClickListener {
            Toast.makeText(this, "▶ Đang mở video Meal Prep & Lịch tập...", Toast.LENGTH_SHORT).show()
        }
    }

    private fun setupSuggestedUsers() {
        if (session.userFollowersCount < 5) {
            binding.cardSuggestedUsers.visibility = View.GONE
            return
        }
        binding.cardSuggestedUsers.visibility = View.VISIBLE
        var isFollowed1 = false
        var isFollowed2 = false
        var isFollowed3 = false

        binding.btnFollowUser1.setOnClickListener {
            isFollowed1 = !isFollowed1
            binding.btnFollowUser1.text = if (isFollowed1) "✓ Đang theo dõi" else "Theo dõi"
            binding.btnFollowUser1.background = ContextCompat.getDrawable(
                this,
                if (isFollowed1) R.drawable.bg_tag_chip else R.drawable.bg_primary_button
            )
            binding.btnFollowUser1.setTextColor(
                ContextCompat.getColor(this, if (isFollowed1) R.color.text_dark else R.color.white)
            )
            Toast.makeText(
                this,
                if (isFollowed1) "Đã theo dõi Huy Hoàng (Powerlifter)" else "Đã bỏ theo dõi",
                Toast.LENGTH_SHORT
            ).show()
        }

        binding.btnFollowUser2.setOnClickListener {
            isFollowed2 = !isFollowed2
            binding.btnFollowUser2.text = if (isFollowed2) "✓ Đang theo dõi" else "Theo dõi"
            binding.btnFollowUser2.background = ContextCompat.getDrawable(
                this,
                if (isFollowed2) R.drawable.bg_tag_chip else R.drawable.bg_primary_button
            )
            binding.btnFollowUser2.setTextColor(
                ContextCompat.getColor(this, if (isFollowed2) R.color.text_dark else R.color.white)
            )
            Toast.makeText(
                this,
                if (isFollowed2) "Đã theo dõi Thanh Vân (Calisthenics)" else "Đã bỏ theo dõi",
                Toast.LENGTH_SHORT
            ).show()
        }

        binding.btnFollowUser3.setOnClickListener {
            isFollowed3 = !isFollowed3
            binding.btnFollowUser3.text = if (isFollowed3) "✓ Đang theo dõi" else "Theo dõi"
            binding.btnFollowUser3.background = ContextCompat.getDrawable(
                this,
                if (isFollowed3) R.drawable.bg_tag_chip else R.drawable.bg_primary_button
            )
            binding.btnFollowUser3.setTextColor(
                ContextCompat.getColor(this, if (isFollowed3) R.color.text_dark else R.color.white)
            )
            Toast.makeText(
                this,
                if (isFollowed3) "Đã theo dõi Đức Thắng (HLV Thể hình)" else "Đã bỏ theo dõi",
                Toast.LENGTH_SHORT
            ).show()
        }

        binding.btnSeeAllSuggestions.setOnClickListener {
            Toast.makeText(this, "Đang mở danh sách gợi ý bạn bè và thợ săn cùng cấp...", Toast.LENGTH_SHORT).show()
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

        binding.btnCommentPost1.setOnClickListener {
            showCommentsDialog("Quan Tran")
        }

        binding.btnCommentPost2.setOnClickListener {
            showCommentsDialog("Minh Anh")
        }

        binding.btnSharePost1.setOnClickListener {
            Toast.makeText(this, "Đã sao chép liên kết bài viết vào bộ nhớ tạm!", Toast.LENGTH_SHORT).show()
        }

        binding.btnSharePost2.setOnClickListener {
            Toast.makeText(this, "Đã sao chép liên kết bài viết vào bộ nhớ tạm!", Toast.LENGTH_SHORT).show()
        }
    }

    private fun showCommentsDialog(authorName: String) {
        val comments = arrayOf(
            "Tuấn Kiệt: Form Bench Press chuẩn đét anh ơi! 🔥",
            "Hương Giang: Chúc mừng bác đã nâng mốc tạ mới nhé!",
            "Coach Hoàng: Nhớ khóa khớp gối khi hạ tạ và siết cơ ngực nhé."
        )

        AlertDialog.Builder(this)
            .setTitle("Bình luận về bài viết của $authorName")
            .setItems(comments, null)
            .setPositiveButton("Đóng", null)
            .show()
    }

    private fun setupBottomNav() {
        binding.bottomNavigation.setupBottomNav(this, BottomNavTab.COMMUNITY)
    }
}
