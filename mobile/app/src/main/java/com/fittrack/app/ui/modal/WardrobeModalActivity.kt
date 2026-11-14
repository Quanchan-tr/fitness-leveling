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
import androidx.lifecycle.lifecycleScope
import androidx.recyclerview.widget.GridLayoutManager
import androidx.recyclerview.widget.RecyclerView
import com.fittrack.app.R
import com.fittrack.app.data.api.ApiClient
import com.fittrack.app.data.models.EquipAvatarRequest
import com.fittrack.app.data.session.SessionManager
import com.fittrack.app.databinding.ActivityModalWardrobeBinding
import kotlinx.coroutines.Dispatchers
import kotlinx.coroutines.launch
import kotlinx.coroutines.withContext

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
    private var userLevel = 1

    // Currently equipped item IDs per slot (populated from VPS GET /avatar)
    private val equippedMap = mutableMapOf<String, String>()

    // Current color & effect state for 3D bridge
    private var shirtColor = "#FF5722"
    private var shortsColor = "#1E293B"
    private var headbandColor = "none"
    private var shoeColor = "#FF5722"
    private var hairColor = "#2D1E18"
    private var specialType = "none"
    private var specialColor = ""

    private var fullCatalog: List<WardrobeItem> = emptyList()

    private lateinit var adapter: EquipmentAdapter

    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)
        binding = ActivityModalWardrobeBinding.inflate(layoutInflater)
        setContentView(binding.root)

        userLevel = SessionManager.getInstance(this).userLevel.coerceAtLeast(1)
        binding.tvModalLevelBadge.text = "Lv. $userLevel"

        setup3DPreview()
        setupSlotCategories()
        setupRecyclerView()
        setupActionButtons()
        fetchAvatarCatalogFromBackend()
    }

    private fun fetchAvatarCatalogFromBackend() {
        val session = SessionManager.getInstance(this)
        if (!session.isLoggedIn) {
            Toast.makeText(this, "Vui lòng đăng nhập để mở tủ đồ trên VPS", Toast.LENGTH_SHORT).show()
            return
        }

        lifecycleScope.launch {
            try {
                val res = withContext(Dispatchers.IO) {
                    ApiClient.getService(this@WardrobeModalActivity).getAvatarConfig()
                }
                val data = res.body()?.data
                if (res.isSuccessful && data != null) {
                    fullCatalog = data.catalog.map { dto ->
                        val slotLower = dto.slot.lowercase()
                        val icon = when (slotLower) {
                            "headwear" -> "🧢"
                            "hair" -> "💇"
                            "top" -> "👕"
                            "bottom" -> "👖"
                            "shoes" -> "👟"
                            "accessories" -> "🕶️"
                            "special" -> "✨"
                            else -> "🎒"
                        }
                        WardrobeItem(
                            id = dto.id,
                            slot = slotLower,
                            name = dto.name,
                            set = dto.theme ?: dto.rarity,
                            tier = dto.rarity.uppercase(),
                            icon = icon,
                            colorHex = dto.colorHex ?: "#FF5722",
                            unlockLevel = dto.unlockLevel
                        )
                    }

                    equippedMap.clear()
                    data.equipped.forEach { (slotKey, item) ->
                        if (item != null) {
                            val lower = slotKey.lowercase()
                            equippedMap[lower] = item.id
                            when (lower) {
                                "top" -> shirtColor = item.colorHex ?: shirtColor
                                "bottom" -> shortsColor = item.colorHex ?: shortsColor
                                "headwear" -> headbandColor = item.colorHex ?: headbandColor
                                "shoes" -> shoeColor = item.colorHex ?: shoeColor
                                "hair" -> hairColor = item.colorHex ?: hairColor
                                "special" -> {
                                    specialColor = item.colorHex ?: ""
                                    specialType = if (item.name.contains("Cánh", ignoreCase = true)) "wings" else "aura"
                                }
                            }
                        }
                    }

                    update3DModel()
                    refreshCategoryItems()
                } else {
                    Toast.makeText(this@WardrobeModalActivity, "Không thể tải tủ đồ (${res.code()})", Toast.LENGTH_SHORT).show()
                }
            } catch (e: Exception) {
                Toast.makeText(this@WardrobeModalActivity, "Lỗi kết nối VPS: ${e.localizedMessage}", Toast.LENGTH_SHORT).show()
            }
        }
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
            val session = SessionManager.getInstance(this)
            if (!session.isLoggedIn) {
                Toast.makeText(this, "Vui lòng đăng nhập để lưu trang phục", Toast.LENGTH_SHORT).show()
                return@setOnClickListener
            }

            binding.btnApplyOutfit.isEnabled = false
            lifecycleScope.launch {
                try {
                    val api = ApiClient.getService(this@WardrobeModalActivity)
                    val res = withContext(Dispatchers.IO) {
                        api.equipAvatarItem(
                            EquipAvatarRequest(
                                gender = session.userGender,
                                headwearId = equippedMap["headwear"],
                                hairId = equippedMap["hair"],
                                topId = equippedMap["top"],
                                bottomId = equippedMap["bottom"],
                                shoesId = equippedMap["shoes"],
                                accessoryId = equippedMap["accessories"],
                                specialId = equippedMap["special"]
                            )
                        )
                    }
                    if (res.isSuccessful) {
                        val resultIntent = Intent().apply {
                            putExtra("SELECTED_SHIRT_COLOR", shirtColor)
                            putExtra("SELECTED_SHORTS_COLOR", shortsColor)
                            putExtra("SELECTED_HEADBAND_COLOR", headbandColor)
                            putExtra("SELECTED_SHOE_COLOR", shoeColor)
                            putExtra("SELECTED_HAIR_COLOR", hairColor)
                            putExtra("SELECTED_SPECIAL_TYPE", specialType)
                            putExtra("SELECTED_SPECIAL_COLOR", specialColor)
                        }
                        setResult(RESULT_OK, resultIntent)
                        Toast.makeText(this@WardrobeModalActivity, "✓ Đã lưu trang phục lên VPS!", Toast.LENGTH_SHORT).show()
                        finish()
                    } else {
                        binding.btnApplyOutfit.isEnabled = true
                        Toast.makeText(this@WardrobeModalActivity, "Không thể lưu trang phục (${res.code()})", Toast.LENGTH_SHORT).show()
                    }
                } catch (e: Exception) {
                    binding.btnApplyOutfit.isEnabled = true
                    Toast.makeText(this@WardrobeModalActivity, "Lỗi kết nối VPS: ${e.localizedMessage}", Toast.LENGTH_SHORT).show()
                }
            }
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
