package com.fittrack.app.ui.community

import android.content.ClipData
import android.content.ClipboardManager
import android.content.Context
import android.net.Uri
import android.os.Bundle
import android.text.Editable
import android.text.TextWatcher
import android.view.View
import android.widget.EditText
import android.widget.LinearLayout
import android.widget.TextView
import android.widget.Toast
import androidx.activity.result.contract.ActivityResultContracts
import androidx.appcompat.app.AlertDialog
import androidx.appcompat.app.AppCompatActivity
import androidx.core.content.ContextCompat
import androidx.lifecycle.lifecycleScope
import com.fittrack.app.R
import com.fittrack.app.data.api.ApiClient
import com.fittrack.app.data.models.CreateCommentRequest
import com.fittrack.app.data.models.CreatePostRequest
import com.fittrack.app.data.models.SuggestedAthleteDto
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
    private var isLiked1 = false
    private var likeCount1 = 0

    private var post2Id: String? = null
    private var isLiked2 = false
    private var likeCount2 = 0

    private var suggestedAthletes: List<SuggestedAthleteDto> = emptyList()

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
                if (response.isSuccessful && response.body()?.data != null) {
                    val posts = response.body()!!.data!!

                    if (posts.isNotEmpty()) {
                        val p1 = posts[0]
                        post1Id = p1.id
                        binding.cardPost1.visibility = View.VISIBLE
                        binding.tvPost1Author.text = p1.userName ?: "Người dùng FitTrack"
                        binding.tvPost1Content.text = p1.content
                        likeCount1 = p1.likesCount
                        isLiked1 = p1.isLiked
                        binding.tvLikeCount1.text = likeCount1.toString()
                    } else {
                        binding.cardPost1.visibility = View.GONE
                    }

                    if (posts.size > 1) {
                        val p2 = posts[1]
                        post2Id = p2.id
                        binding.cardPost2.visibility = View.VISIBLE
                        binding.tvPost2Author.text = p2.userName ?: "Người dùng FitTrack"
                        binding.tvPost2Content.text = p2.content
                        likeCount2 = p2.likesCount
                        isLiked2 = p2.isLiked
                        binding.tvLikeCount2.text = likeCount2.toString()
                    } else {
                        binding.cardPost2.visibility = View.GONE
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
                Calendar.MONDAY -> "T2"
                Calendar.TUESDAY -> "T3"
                Calendar.WEDNESDAY -> "T4"
                Calendar.THURSDAY -> "T5"
                Calendar.FRIDAY -> "T6"
                Calendar.SATURDAY -> "T7"
                else -> "CN"
            }
            val todayRoutines = session.getScheduleForDay(dayKey)
            if (todayRoutines.isEmpty()) {
                Toast.makeText(this, "Bạn chưa lên lịch buổi tập cho hôm nay ($dayKey).", Toast.LENGTH_SHORT).show()
                return@setOnClickListener
            }
            val options = todayRoutines.toTypedArray()

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

        // Attach meal action - pick from today's real logged meals
        binding.btnAttachMeal.setOnClickListener {
            if (!session.isLoggedIn) {
                Toast.makeText(this, "Vui lòng đăng nhập để đính kèm bữa ăn đã ghi nhận.", Toast.LENGTH_SHORT).show()
                return@setOnClickListener
            }
            lifecycleScope.launch {
                try {
                    val res = withContext(Dispatchers.IO) {
                        ApiClient.getService(this@CommunityActivity).getNutritionLogs()
                    }
                    val logs = res.body()?.data.orEmpty()
                    if (logs.isEmpty()) {
                        Toast.makeText(this@CommunityActivity, "Bạn chưa ghi nhận bữa ăn nào hôm nay.", Toast.LENGTH_SHORT).show()
                        return@launch
                    }
                    val mealOptions = logs.take(10).map { log ->
                        "${log.foodName} (${log.calories} kcal • ${log.proteinGrams.toInt()}g P)"
                    }.toTypedArray()

                    AlertDialog.Builder(this@CommunityActivity)
                        .setTitle("Chọn bữa ăn đã ghi nhận")
                        .setItems(mealOptions) { _, which ->
                            val chosen = mealOptions[which]
                            attachedMediaType = "MEAL"
                            attachedMealTitle = chosen
                            binding.layoutMediaPreview.visibility = View.VISIBLE
                            binding.layoutPreviewImage.visibility = View.VISIBLE
                            binding.layoutPreviewVideo.visibility = View.GONE
                            Toast.makeText(this@CommunityActivity, "🥗 Đã đính kèm: $chosen", Toast.LENGTH_SHORT).show()
                        }
                        .setNegativeButton("Hủy", null)
                        .show()
                } catch (_: Exception) {
                    Toast.makeText(this@CommunityActivity, "Không thể tải nhật ký dinh dưỡng.", Toast.LENGTH_SHORT).show()
                }
            }
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

            // Sync with Backend API (do not send local content:// URIs or third-party sample URLs)
            if (session.isLoggedIn) {
                val api = ApiClient.getService(this)
                lifecycleScope.launch {
                    try {
                        withContext(Dispatchers.IO) {
                            api.createCommunityPost(
                                idempotencyKey = UUID.randomUUID().toString(),
                                request = CreatePostRequest(content = finalContent, mediaUrl = null)
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
        binding.cardSuggestedUsers.visibility = View.GONE
        if (!session.isLoggedIn) return

        lifecycleScope.launch {
            try {
                val res = withContext(Dispatchers.IO) {
                    ApiClient.getService(this@CommunityActivity).getSuggestedAthletes(limit = 6)
                }
                val list = res.body()?.data.orEmpty()
                if (!res.isSuccessful || list.isEmpty()) {
                    binding.cardSuggestedUsers.visibility = View.GONE
                    return@launch
                }
                suggestedAthletes = list
                binding.cardSuggestedUsers.visibility = View.VISIBLE

                val slots = listOf(
                    Triple(binding.cardSuggestedUser1, binding.tvSuggestedName1 to binding.tvSuggestedMeta1, binding.btnFollowUser1),
                    Triple(binding.cardSuggestedUser2, binding.tvSuggestedName2 to binding.tvSuggestedMeta2, binding.btnFollowUser2),
                    Triple(binding.cardSuggestedUser3, binding.tvSuggestedName3 to binding.tvSuggestedMeta3, binding.btnFollowUser3)
                )

                slots.forEachIndexed { idx, (card, nameMeta, btnFollow) ->
                    val athlete = list.getOrNull(idx)
                    if (athlete == null) {
                        card.visibility = View.GONE
                    } else {
                        card.visibility = View.VISIBLE
                        nameMeta.first.text = athlete.name
                        nameMeta.second.text = "Lv. ${athlete.level} • ${athlete.badge ?: "Vận động viên"}"
                        var isFollowed = athlete.isFollowing
                        fun renderBtn() {
                            btnFollow.text = if (isFollowed) "✓ Đang theo dõi" else "Theo dõi"
                            btnFollow.background = ContextCompat.getDrawable(
                                this@CommunityActivity,
                                if (isFollowed) R.drawable.bg_tag_chip else R.drawable.bg_primary_button
                            )
                            btnFollow.setTextColor(
                                ContextCompat.getColor(
                                    this@CommunityActivity,
                                    if (isFollowed) R.color.text_dark else R.color.white
                                )
                            )
                        }
                        renderBtn()
                        btnFollow.setOnClickListener {
                            lifecycleScope.launch {
                                try {
                                    val followRes = withContext(Dispatchers.IO) {
                                        ApiClient.getService(this@CommunityActivity).toggleFollowUser(athlete.id)
                                    }
                                    if (followRes.isSuccessful && followRes.body()?.data != null) {
                                        isFollowed = followRes.body()!!.data!!.following
                                        renderBtn()
                                    }
                                } catch (_: Exception) {
                                    Toast.makeText(this@CommunityActivity, "Không thể cập nhật theo dõi.", Toast.LENGTH_SHORT).show()
                                }
                            }
                        }
                    }
                }
            } catch (_: Exception) {
                binding.cardSuggestedUsers.visibility = View.GONE
            }
        }

        binding.btnSeeAllSuggestions.setOnClickListener {
            if (suggestedAthletes.isEmpty()) return@setOnClickListener
            val items = suggestedAthletes.map { "${it.name} (Lv. ${it.level})" }.toTypedArray()
            AlertDialog.Builder(this)
                .setTitle("Vận động viên nổi bật")
                .setItems(items, null)
                .setPositiveButton("Đóng", null)
                .show()
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
            showCommentsDialog(post1Id, binding.tvPost1Author.text.toString())
        }

        binding.btnCommentPost2.setOnClickListener {
            showCommentsDialog(post2Id, binding.tvPost2Author.text.toString())
        }

        binding.btnSharePost1.setOnClickListener {
            copyPostToClipboard(binding.tvPost1Author.text.toString(), binding.tvPost1Content.text.toString())
        }

        binding.btnSharePost2.setOnClickListener {
            copyPostToClipboard(binding.tvPost2Author.text.toString(), binding.tvPost2Content.text.toString())
        }
    }

    private fun copyPostToClipboard(author: String, content: String) {
        val clipboard = getSystemService(Context.CLIPBOARD_SERVICE) as? ClipboardManager
        clipboard?.setPrimaryClip(ClipData.newPlainText("FitTrack Post", "$author: $content"))
        Toast.makeText(this, "Đã sao chép nội dung bài viết vào bộ nhớ tạm!", Toast.LENGTH_SHORT).show()
    }

    private fun showCommentsDialog(postId: String?, authorName: String) {
        if (postId.isNullOrBlank()) {
            Toast.makeText(this, "Bài viết chưa đồng bộ với máy chủ.", Toast.LENGTH_SHORT).show()
            return
        }

        lifecycleScope.launch {
            val commentsList = try {
                val res = withContext(Dispatchers.IO) {
                    ApiClient.getService(this@CommunityActivity).getPostComments(postId)
                }
                res.body()?.data.orEmpty()
            } catch (_: Exception) {
                emptyList()
            }

            val container = LinearLayout(this@CommunityActivity).apply {
                orientation = LinearLayout.VERTICAL
                setPadding(48, 24, 48, 12)
            }
            if (commentsList.isEmpty()) {
                container.addView(TextView(this@CommunityActivity).apply {
                    text = "Chưa có bình luận nào. Hãy là người đầu tiên!"
                    setTextColor(ContextCompat.getColor(this@CommunityActivity, R.color.text_slate))
                    textSize = 12f
                })
            } else {
                commentsList.forEach { c ->
                    container.addView(TextView(this@CommunityActivity).apply {
                        text = "• ${c.user?.name ?: "Thành viên"}: ${c.content}"
                        setTextColor(ContextCompat.getColor(this@CommunityActivity, R.color.text_dark))
                        textSize = 13f
                        setPadding(0, 6, 0, 6)
                    })
                }
            }

            val input = EditText(this@CommunityActivity).apply {
                hint = "Viết bình luận của bạn..."
            }
            container.addView(input)

            AlertDialog.Builder(this@CommunityActivity)
                .setTitle("Bình luận bài viết của $authorName")
                .setView(container)
                .setPositiveButton("Gửi") { _, _ ->
                    val text = input.text.toString().trim()
                    if (text.isNotEmpty()) {
                        lifecycleScope.launch {
                            try {
                                val res = withContext(Dispatchers.IO) {
                                    ApiClient.getService(this@CommunityActivity).addPostComment(
                                        postId,
                                        CreateCommentRequest(content = text)
                                    )
                                }
                                if (res.isSuccessful) {
                                    Toast.makeText(this@CommunityActivity, "✓ Đã gửi bình luận!", Toast.LENGTH_SHORT).show()
                                    fetchCommunityFeed()
                                }
                            } catch (_: Exception) {
                                Toast.makeText(this@CommunityActivity, "Không thể gửi bình luận lúc này.", Toast.LENGTH_SHORT).show()
                            }
                        }
                    }
                }
                .setNegativeButton("Đóng", null)
                .show()
        }
    }

    private fun setupBottomNav() {
        binding.bottomNavigation.setupBottomNav(this, BottomNavTab.COMMUNITY)
    }
}
