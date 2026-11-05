package com.fittrack.app.ui.modal

import android.app.Activity
import android.content.Intent
import android.graphics.Color
import android.os.Bundle
import android.view.LayoutInflater
import android.view.View
import android.view.ViewGroup
import android.webkit.WebViewClient
import android.widget.ImageView
import android.widget.TextView
import android.widget.Toast
import androidx.appcompat.app.AppCompatActivity
import androidx.core.content.ContextCompat
import androidx.recyclerview.widget.GridLayoutManager
import androidx.recyclerview.widget.RecyclerView
import com.fittrack.app.R
import com.fittrack.app.databinding.ActivityModalWardrobeBinding

data class WardrobeItem(
    val id: String,
    val slot: String, // "headwear", "hair", "top", "bottom", "shoes", "accessories", "special"
    val name: String,
    val set: String,
    val tier: String, // "COMMON", "RARE", "EPIC", "LEGENDARY"
    val icon: String,
    val colorHex: String,
    val unlockLevel: Int
)

class WardrobeModalActivity : AppCompatActivity() {

    private lateinit var binding: ActivityModalWardrobeBinding

    private var activeSlot = "top"
    private val userLevel = 12 // User level from profile

    // Currently equipped item IDs per slot
    private val equippedMap = mutableMapOf(
        "headwear" to "hw-3",
        "hair" to "hair-1",
        "top" to "top-1",
        "bottom" to "bot-1",
        "shoes" to "shoe-1",
        "accessories" to "acc-1",
        "special" to "spec-1"
    )

    // Current color & effect state for 3D bridge
    private var shirtColor = "#FF5722"
    private var shortsColor = "#1E293B"
    private var headbandColor = "none"
    private var shoeColor = "#FF5722"
    private var hairColor = "#2D1E18"
    private var specialType = "none"
    private var specialColor = ""

    // Full Equipment Catalog synchronized with Web STARTER_AVATAR_CATALOG
    private val fullCatalog = listOf(
        // HEADWEAR
        WardrobeItem("hw-1", "headwear", "Mũ Beanie Len Đỏ", "Casual Fitness", "COMMON", "🧢", "#B91C1C", 0),
        WardrobeItem("hw-2", "headwear", "Nón Kết Gymer Pro", "Sport Pro", "COMMON", "🧢", "#0F172A", 0),
        WardrobeItem("hw-3", "headwear", "Băng Đô Retro 80s", "Retro Runner", "COMMON", "🎗️", "#FF5722", 0),
        WardrobeItem("hw-4", "headwear", "Mũ Rơm Phiêu Lưu", "Adventure", "RARE", "👒", "#FDE047", 5),
        WardrobeItem("hw-5", "headwear", "Mũ Lông Thợ Săn", "Winter Explorer", "RARE", "💂", "#78350F", 7),
        WardrobeItem("hw-6", "headwear", "Mũ Phù Thủy Ma Thuật", "Fantasy Hero", "EPIC", "🧙", "#1E1B4B", 15),
        WardrobeItem("hw-7", "headwear", "Vương Miện Quán Quân", "Champions Set", "LEGENDARY", "👑", "#F59E0B", 25),
        WardrobeItem("hw-8", "headwear", "Mũ Bucket Dã Ngoại Kaki", "Outdoor Tactical", "RARE", "🧢", "#166534", 8),
        WardrobeItem("hw-9", "headwear", "Băng Đô Ninja Hắc Ám", "Shadow Shinobi", "EPIC", "🥷", "#312E81", 18),
        WardrobeItem("hw-10", "headwear", "Mũ Giáp Cyber Valkyrie", "Cyber Valkyrie", "LEGENDARY", "⚡", "#06B6D4", 35),

        // HAIR
        WardrobeItem("hair-1", "hair", "Tóc Ngắn Thể Thao", "Casual", "COMMON", "💇", "#2D1E18", 0),
        WardrobeItem("hair-2", "hair", "Tóc Anime Gai Lãng Tử", "Anime Hero", "RARE", "⚡", "#EAB308", 4),
        WardrobeItem("hair-3", "hair", "Tóc Đuôi Ngựa Chiến Binh", "Warrior", "EPIC", "🦹", "#7C3AED", 12),
        WardrobeItem("hair-4", "hair", "Mái Tóc Saiyan Hoàng Kim", "Mythic Legend", "LEGENDARY", "🔥", "#FDE047", 30),
        WardrobeItem("hair-5", "hair", "Tóc Undercut Vuốt Lệch", "Modern Street", "RARE", "💈", "#475569", 6),
        WardrobeItem("hair-6", "hair", "Tóc Dài Layer Phóng Khoáng", "Bohemian Drift", "EPIC", "💇‍♀️", "#9333EA", 14),
        WardrobeItem("hair-7", "hair", "Mái Tóc Băng Phong Hàn Băng", "Frost Sovereign", "LEGENDARY", "❄️", "#38BDF8", 42),

        // TOP
        WardrobeItem("top-1", "top", "Áo Ba Lỗ Thể Thao Cam", "Casual Fitness", "COMMON", "🎽", "#FF5722", 0),
        WardrobeItem("top-2", "top", "Áo Sơ Mi Caro Cam", "Urban Casual", "RARE", "👔", "#EA580C", 3),
        WardrobeItem("top-3", "top", "Áo Nén Cơ Bắp Pro", "Athletic Pro", "RARE", "👕", "#2563EB", 8),
        WardrobeItem("top-4", "top", "Khung Xương Trợ Lực", "Cyberpunk Mecha", "EPIC", "🦾", "#0284C7", 16),
        WardrobeItem("top-5", "top", "Bộ Giáp Glitch Singularity", "Sci-Fi Void", "LEGENDARY", "🛡️", "#7C3AED", 35),
        WardrobeItem("top-6", "top", "Áo Hoodie Oversize Thể Thao Đen", "Streetwear Pro", "RARE", "🧥", "#18181B", 10),
        WardrobeItem("top-7", "top", "Áo Polo Thể Thao Golf Xanh Navy", "Preppy Sport", "EPIC", "👕", "#1E3A8A", 20),
        WardrobeItem("top-8", "top", "Chiến Giáp Thái Dương Titan", "Solar Sovereign", "LEGENDARY", "⚜️", "#D97706", 45),

        // BOTTOM
        WardrobeItem("bot-1", "bottom", "Quần Đùi Gym Than", "Casual Fitness", "COMMON", "🩳", "#1E293B", 0),
        WardrobeItem("bot-2", "bottom", "Quần Jogger Xám Khói", "Streetwear", "RARE", "👖", "#475569", 4),
        WardrobeItem("bot-3", "bottom", "Quần Nén Bó Cơ Neon", "Athletic Pro", "EPIC", "🩲", "#0F172A", 14),
        WardrobeItem("bot-4", "bottom", "Quần Giáp Công Nghệ Nano", "Sci-Fi Void", "LEGENDARY", "🦿", "#7C3AED", 28),
        WardrobeItem("bot-5", "bottom", "Quần Đùi 2 Lớp Chạy Bộ Phản Quang", "Marathon Speed", "RARE", "🩳", "#0D9488", 7),
        WardrobeItem("bot-6", "bottom", "Quần Kaki Rằn Ri Rừng Rậm Camo", "Tactical Force", "EPIC", "👖", "#3F6212", 16),
        WardrobeItem("bot-7", "bottom", "Quần Bó Tốc Độ Plasma Neon", "Quantum Surge", "LEGENDARY", "⚡", "#EC4899", 38),

        // SHOES
        WardrobeItem("shoe-1", "shoes", "Sneaker Chạy Bộ Cam", "Casual Fitness", "COMMON", "👟", "#FF5722", 0),
        WardrobeItem("shoe-2", "shoes", "Giày Bóng Rổ High-Top", "Court Legend", "RARE", "🏀", "#2563EB", 6),
        WardrobeItem("shoe-3", "shoes", "Giày Cử Tạ Powerlift Pro", "Heavy Lifting", "EPIC", "🏋️", "#DC2626", 15),
        WardrobeItem("shoe-4", "shoes", "Giày Phản Trọng Lực Mag-Lev", "Cyberpunk", "LEGENDARY", "🚀", "#06B6D4", 32),
        WardrobeItem("shoe-5", "shoes", "Giày Lười Canvas Trắng Tối Giản", "Urban Walk", "RARE", "👟", "#F8FAFC", 5),
        WardrobeItem("shoe-6", "shoes", "Ủng Dã Ngoại Trekking Chống Nước", "Alpine Explorer", "EPIC", "🥾", "#78350F", 18),
        WardrobeItem("shoe-7", "shoes", "Ủng Đấu Sĩ Hoàng Kim Titan", "Solar Sovereign", "LEGENDARY", "✨", "#F59E0B", 44),

        // ACCESSORIES
        WardrobeItem("acc-1", "accessories", "Kính Râm Thể Thao UV", "Outdoor", "COMMON", "🕶️", "#0F172A", 0),
        WardrobeItem("acc-2", "accessories", "Găng Tay Da Nâng Tạ", "Powerhouse", "RARE", "🥊", "#78350F", 5),
        WardrobeItem("acc-3", "accessories", "Tai Nghe Chống Ồn Pro", "Music Gym", "EPIC", "🎧", "#38BDF8", 10),
        WardrobeItem("acc-4", "accessories", "Đai Lưng Vô Địch Vàng", "Champion", "LEGENDARY", "🥇", "#F59E0B", 20),
        WardrobeItem("acc-5", "accessories", "Đồng Hồ FitTrack Ultra Biometric", "Smart Fitness", "RARE", "⌚", "#0284C7", 8),
        WardrobeItem("acc-6", "accessories", "Mặt Nạ Oni Chiến Binh Bóng Đêm", "Shadow Shinobi", "EPIC", "👹", "#BE123C", 22),
        WardrobeItem("acc-7", "accessories", "Dây Chuyền Quả Tạ Hoàng Kim Titan", "Solar Sovereign", "LEGENDARY", "📿", "#F59E0B", 40),

        // SPECIAL
        WardrobeItem("spec-1", "special", "Hào Quang Chiến Binh Cam", "Energy Aura", "RARE", "✨", "#FF5722", 5),
        WardrobeItem("spec-2", "special", "Ngọn Lửa Năng Lượng Tím", "Shadow Flame", "EPIC", "🔮", "#A855F7", 18),
        WardrobeItem("spec-3", "special", "Cánh Thiên Thần Pixel & Bụi Vàng", "Celestial", "LEGENDARY", "🪽", "#F59E0B", 40),
        WardrobeItem("spec-4", "special", "Vòng Xoáy Glitch Đa Không Gian", "Singularity", "LEGENDARY", "🌌", "#06B6D4", 50),
        WardrobeItem("spec-5", "special", "Khói Pixel Huyền Ảo Shadow Shinobi", "Ninja Stealth", "RARE", "💨", "#64748B", 12),
        WardrobeItem("spec-6", "special", "Cánh Hắc Long & Đốm Lửa Tím", "Dragon Void", "EPIC", "🦇", "#7E22CE", 25),
        WardrobeItem("spec-7", "special", "Ngọn Lửa Thái Dương Solar Sovereign", "Solar Sovereign", "LEGENDARY", "☀️", "#EA580C", 48)
    )

    private lateinit var adapter: EquipmentAdapter

    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)
        binding = ActivityModalWardrobeBinding.inflate(layoutInflater)
        setContentView(binding.root)

        binding.tvModalLevelBadge.text = "Lv. $userLevel"

        setup3DPreview()
        setupSlotCategories()
        setupRecyclerView()
        setupActionButtons()
    }

    private fun setup3DPreview() {
        binding.webviewWardrobeCharacter.apply {
            setBackgroundColor(0)
            settings.javaScriptEnabled = true
            settings.domStorageEnabled = true
            webViewClient = object : WebViewClient() {
                override fun onPageFinished(view: android.webkit.WebView?, url: String?) {
                    super.onPageFinished(view, url)
                    update3DModel()
                    zoomToSlot("top")
                }
            }
            loadUrl("file:///android_asset/character3d.html")
        }

        binding.btnToggleRotate.setOnClickListener {
            binding.webviewWardrobeCharacter.evaluateJavascript("toggleAutoRotate()", null)
        }
    }

    private fun zoomToSlot(slot: String) {
        val jsSlot = when (slot) {
            "top" -> "top"
            "bottom" -> "bottom"
            "headwear", "hair" -> "head"
            "shoes" -> "shoes"
            else -> "full"
        }
        binding.webviewWardrobeCharacter.evaluateJavascript("zoomSlot('$jsSlot')", null)
    }

    private fun update3DModel() {
        binding.webviewWardrobeCharacter.evaluateJavascript(
            "setOutfit('$shirtColor', '$shortsColor', '$headbandColor', '$shoeColor', '$hairColor', '$specialType', '$specialColor')",
            null
        )
    }

    private fun setupSlotCategories() {
        val slots = listOf(
            Triple(binding.chipSlotHeadwear, "headwear", "🔍 Đang zoom: Nón"),
            Triple(binding.chipSlotHair, "hair", "🔍 Đang zoom: Tóc"),
            Triple(binding.chipSlotTop, "top", "🔍 Đang zoom: Áo"),
            Triple(binding.chipSlotBottom, "bottom", "🔍 Đang zoom: Quần"),
            Triple(binding.chipSlotShoes, "shoes", "🔍 Đang zoom: Giày"),
            Triple(binding.chipSlotAccessories, "accessories", "🔍 Đang zoom: Phụ kiện"),
            Triple(binding.chipSlotSpecial, "special", "🔍 Đang zoom: Hiệu ứng hào quang")
        )

        slots.forEach { (chip, slotKey, hintText) ->
            chip.setOnClickListener {
                activeSlot = slotKey
                binding.tvCameraZoomHint.text = hintText
                zoomToSlot(slotKey)

                slots.forEach { (c, k, _) ->
                    if (k == activeSlot) {
                        c.background = ContextCompat.getDrawable(this, R.drawable.bg_subtab_pill_active)
                        c.setTextColor(ContextCompat.getColor(this, R.color.white))
                    } else {
                        c.background = ContextCompat.getDrawable(this, R.drawable.bg_subtab_pill_inactive)
                        c.setTextColor(ContextCompat.getColor(this, R.color.text_dark))
                    }
                }

                refreshCategoryItems()
            }
        }
    }

    private fun setupRecyclerView() {
        adapter = EquipmentAdapter(
            items = emptyList(),
            equippedId = equippedMap[activeSlot],
            userLevel = userLevel,
            onItemClick = { item ->
                if (item.unlockLevel <= userLevel) {
                    equippedMap[item.slot] = item.id
                    when (item.slot) {
                        "top" -> shirtColor = item.colorHex
                        "bottom" -> shortsColor = item.colorHex
                        "headwear" -> headbandColor = item.colorHex
                        "shoes" -> shoeColor = item.colorHex
                        "hair" -> hairColor = item.colorHex
                        "special" -> {
                            specialColor = item.colorHex
                            specialType = when {
                                item.id in listOf("spec-3", "spec-6") || item.name.contains("Cánh", ignoreCase = true) -> "wings"
                                item.id in listOf("spec-1", "spec-8") || item.name.contains("Sao", ignoreCase = true) || item.name.contains("Blink", ignoreCase = true) -> "blink"
                                else -> "aura"
                            }
                        }
                    }
                    update3DModel()
                    refreshCategoryItems()
                    Toast.makeText(this, "Đã trang bị: ${item.name}", Toast.LENGTH_SHORT).show()
                } else {
                    Toast.makeText(this, "🔒 Cần đạt Cấp độ ${item.unlockLevel} để mở khóa trang phục này!", Toast.LENGTH_SHORT).show()
                }
            }
        )

        binding.rvEquipmentGrid.layoutManager = GridLayoutManager(this, 2)
        binding.rvEquipmentGrid.adapter = adapter

        binding.btnUnequipSlot.setOnClickListener {
            equippedMap.remove(activeSlot)
            when (activeSlot) {
                "top" -> shirtColor = "#FF5722"
                "bottom" -> shortsColor = "#1E293B"
                "headwear" -> headbandColor = "none"
                "shoes" -> shoeColor = "#FF5722"
                "special" -> {
                    specialType = "none"
                    specialColor = ""
                }
            }
            update3DModel()
            refreshCategoryItems()
            Toast.makeText(this, "Đã tháo trang bị slot $activeSlot", Toast.LENGTH_SHORT).show()
        }

        refreshCategoryItems()
    }

    private fun refreshCategoryItems() {
        val filtered = fullCatalog.filter { it.slot == activeSlot }
        val equippedId = equippedMap[activeSlot]
        binding.tvSlotItemsCount.text = "Vật phẩm (${filtered.size})"
        binding.btnUnequipSlot.visibility = if (equippedId != null) View.VISIBLE else View.GONE
        adapter.updateData(filtered, equippedId)
    }

    private fun setupActionButtons() {
        binding.btnCloseWardrobe.setOnClickListener { finish() }
        binding.btnCancelWardrobe.setOnClickListener { finish() }
        binding.rootContainer.setOnClickListener { finish() }
        binding.cardModal.setOnClickListener { /* prevent dismiss */ }

        binding.btnApplyOutfit.setOnClickListener {
            val resultIntent = Intent().apply {
                putExtra("SELECTED_SHIRT_COLOR", shirtColor)
                putExtra("SELECTED_SHORTS_COLOR", shortsColor)
                putExtra("SELECTED_HEADBAND_COLOR", headbandColor)
                putExtra("SELECTED_SHOE_COLOR", shoeColor)
                putExtra("SELECTED_HAIR_COLOR", hairColor)
                putExtra("SELECTED_SPECIAL_TYPE", specialType)
                putExtra("SELECTED_SPECIAL_COLOR", specialColor)
            }
            setResult(Activity.RESULT_OK, resultIntent)
            Toast.makeText(this, "✓ Đã áp dụng trang phục 3D thành công!", Toast.LENGTH_SHORT).show()
            finish()
        }
    }

    // Equipment Grid RecyclerView Adapter
    inner class EquipmentAdapter(
        private var items: List<WardrobeItem>,
        private var equippedId: String?,
        private val userLevel: Int,
        private val onItemClick: (WardrobeItem) -> Unit
    ) : RecyclerView.Adapter<EquipmentAdapter.ViewHolder>() {

        inner class ViewHolder(itemView: View) : RecyclerView.ViewHolder(itemView) {
            val root: View = itemView.findViewById(R.id.card_equipment_root)
            val tvTier: TextView = itemView.findViewById(R.id.tv_item_tier)
            val tvEquippedBadge: TextView = itemView.findViewById(R.id.tv_equipped_badge)
            val tvIcon: TextView = itemView.findViewById(R.id.tv_item_icon)
            val ivLock: ImageView = itemView.findViewById(R.id.iv_lock_status)
            val tvName: TextView = itemView.findViewById(R.id.tv_item_name)
            val tvTheme: TextView = itemView.findViewById(R.id.tv_item_theme)
        }

        fun updateData(newItems: List<WardrobeItem>, newEquippedId: String?) {
            items = newItems
            equippedId = newEquippedId
            notifyDataSetChanged()
        }

        override fun onCreateViewHolder(parent: ViewGroup, viewType: Int): ViewHolder {
            val view = LayoutInflater.from(parent.context).inflate(R.layout.item_wardrobe_equipment, parent, false)
            return ViewHolder(view)
        }

        override fun getItemCount(): Int = items.size

        override fun onBindViewHolder(holder: ViewHolder, position: Int) {
            val item = items[position]
            val isEquipped = item.id == equippedId
            val isUnlocked = item.unlockLevel <= userLevel

            holder.tvName.text = item.name
            holder.tvTheme.text = if (isUnlocked) item.set else "Yêu cầu Cấp ${item.unlockLevel}"
            holder.tvIcon.text = item.icon
            holder.tvTier.text = item.tier

            // Rarity colors
            when (item.tier) {
                "COMMON" -> {
                    holder.tvTier.setTextColor(Color.parseColor("#475569"))
                    holder.tvTier.setBackgroundColor(Color.parseColor("#F1F5F9"))
                }
                "RARE" -> {
                    holder.tvTier.setTextColor(Color.parseColor("#0284C7"))
                    holder.tvTier.setBackgroundColor(Color.parseColor("#E0F2FE"))
                }
                "EPIC" -> {
                    holder.tvTier.setTextColor(Color.parseColor("#9333EA"))
                    holder.tvTier.setBackgroundColor(Color.parseColor("#F3E8FF"))
                }
                "LEGENDARY" -> {
                    holder.tvTier.setTextColor(Color.parseColor("#D97706"))
                    holder.tvTier.setBackgroundColor(Color.parseColor("#FEF3C7"))
                }
            }

            // Equipped State
            if (isEquipped) {
                holder.root.background = ContextCompat.getDrawable(this@WardrobeModalActivity, R.drawable.bg_wardrobe_item_equipped)
                holder.tvEquippedBadge.visibility = View.VISIBLE
            } else {
                holder.root.background = ContextCompat.getDrawable(this@WardrobeModalActivity, R.drawable.bg_wardrobe_item_card)
                holder.tvEquippedBadge.visibility = View.GONE
            }

            // Lock State
            if (!isUnlocked) {
                holder.ivLock.visibility = View.VISIBLE
                holder.root.alpha = 0.55f
            } else {
                holder.ivLock.visibility = View.GONE
                holder.root.alpha = 1.0f
            }

            holder.root.setOnClickListener {
                onItemClick(item)
            }
        }
    }
}
