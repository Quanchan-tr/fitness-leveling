package com.fittrack.app.ui.admin

import android.content.Context
import android.content.Intent
import android.graphics.drawable.GradientDrawable
import android.text.Editable
import android.text.TextWatcher
import android.view.LayoutInflater
import android.view.View
import android.view.ViewGroup
import android.widget.LinearLayout
import android.widget.ScrollView
import android.widget.TextView
import androidx.appcompat.app.AlertDialog
import androidx.appcompat.app.AppCompatActivity
import androidx.core.content.ContextCompat
import androidx.lifecycle.lifecycleScope
import androidx.recyclerview.widget.LinearLayoutManager
import androidx.recyclerview.widget.RecyclerView
import com.fittrack.app.R
import com.fittrack.app.databinding.ActivityAdminListBinding
import com.fittrack.app.databinding.ItemAdminRecordBinding
import com.fittrack.app.ui.dashboard.DashboardActivity
import com.fittrack.app.util.WindowInsetsHelper
import kotlinx.coroutines.Job
import kotlinx.coroutines.delay
import kotlinx.coroutines.launch

data class AdminCardAction(
    val label: String,
    val bgRes: Int,
    val textColor: Int,
    val onClick: () -> Unit
)

data class AdminCardItem(
    val id: String,
    val title: String,
    val badgeText: String?,
    val badgeBgColor: Int,
    val badgeTextColor: Int,
    val subtitle: String,
    val meta: String? = null,
    val actions: List<AdminCardAction> = emptyList()
)

class AdminRecordAdapter : RecyclerView.Adapter<AdminRecordAdapter.ViewHolder>() {

    private val items = mutableListOf<AdminCardItem>()

    fun submitList(newItems: List<AdminCardItem>) {
        items.clear()
        items.addAll(newItems)
        notifyDataSetChanged()
    }

    override fun onCreateViewHolder(parent: ViewGroup, viewType: Int): ViewHolder {
        val binding = ItemAdminRecordBinding.inflate(
            LayoutInflater.from(parent.context),
            parent,
            false
        )
        return ViewHolder(binding)
    }

    override fun onBindViewHolder(holder: ViewHolder, position: Int) {
        holder.bind(items[position])
    }

    override fun getItemCount(): Int = items.size

    class ViewHolder(private val binding: ItemAdminRecordBinding) :
        RecyclerView.ViewHolder(binding.root) {

        fun bind(item: AdminCardItem) {
            binding.tvItemTitle.text = item.title
            binding.tvItemSubtitle.text = item.subtitle

            if (item.badgeText.isNullOrBlank()) {
                binding.tvItemBadge.visibility = View.GONE
            } else {
                binding.tvItemBadge.visibility = View.VISIBLE
                binding.tvItemBadge.text = item.badgeText
                binding.tvItemBadge.setTextColor(item.badgeTextColor)
                val bg = GradientDrawable().apply {
                    shape = GradientDrawable.RECTANGLE
                    cornerRadius = 24f
                    setColor(item.badgeBgColor)
                }
                binding.tvItemBadge.background = bg
            }

            if (item.meta.isNullOrBlank()) {
                binding.tvItemMeta.visibility = View.GONE
            } else {
                binding.tvItemMeta.visibility = View.VISIBLE
                binding.tvItemMeta.text = item.meta
            }

            val actionViews = listOf(binding.btnAction1, binding.btnAction2, binding.btnAction3)
            actionViews.forEachIndexed { idx, tv ->
                val action = item.actions.getOrNull(idx)
                if (action == null) {
                    tv.visibility = View.GONE
                    tv.setOnClickListener(null)
                } else {
                    tv.visibility = View.VISIBLE
                    tv.text = action.label
                    tv.setBackgroundResource(action.bgRes)
                    tv.setTextColor(action.textColor)
                    tv.setOnClickListener { action.onClick() }
                }
            }
            binding.layoutItemActions.visibility =
                if (item.actions.isEmpty()) View.GONE else View.VISIBLE
        }
    }
}

fun ActivityAdminListBinding.initAdminListScreen(
    activity: AppCompatActivity,
    tab: AdminNavTab,
    title: String,
    subtitle: String,
    searchHint: String,
    showAddButton: Boolean,
    adapter: AdminRecordAdapter,
    onSearchChanged: (String) -> Unit,
    onAddClicked: (() -> Unit)? = null
) {
    WindowInsetsHelper.applySystemInsets(
        activity,
        root,
        layoutHeader,
        adminBottomNav.root
    )
    adminBottomNav.setupAdminBottomNav(activity, tab)

    tvAdminTitle.text = title
    tvAdminSubtitle.text = subtitle
    etAdminSearch.hint = searchHint

    btnAdminAdd.visibility = if (showAddButton) View.VISIBLE else View.GONE
    btnAdminAdd.setOnClickListener { onAddClicked?.invoke() }

    btnBackToUser.setOnClickListener {
        val intent = Intent(activity, DashboardActivity::class.java).apply {
            flags = Intent.FLAG_ACTIVITY_REORDER_TO_FRONT
        }
        activity.startActivity(intent)
        activity.finish()
    }

    rvAdminItems.layoutManager = LinearLayoutManager(activity)
    rvAdminItems.adapter = adapter

    var searchJob: Job? = null
    etAdminSearch.addTextChangedListener(object : TextWatcher {
        override fun beforeTextChanged(s: CharSequence?, start: Int, count: Int, after: Int) {}
        override fun onTextChanged(s: CharSequence?, start: Int, before: Int, count: Int) {}
        override fun afterTextChanged(s: Editable?) {
            searchJob?.cancel()
            searchJob = activity.lifecycleScope.launch {
                delay(300)
                onSearchChanged(s?.toString()?.trim().orEmpty())
            }
        }
    })
}

fun ActivityAdminListBinding.renderFilterPills(
    activity: AppCompatActivity,
    options: List<Pair<String, String>>,
    selectedKey: String,
    onSelected: (String) -> Unit
) {
    containerFilterPills.removeAllViews()
    val white = ContextCompat.getColor(activity, R.color.white)
    val secondary = ContextCompat.getColor(activity, R.color.admin_text_secondary)

    options.forEachIndexed { idx, (key, label) ->
        val pill = TextView(activity).apply {
            text = label
            textSize = 12f
            setTypeface(typeface, android.graphics.Typeface.BOLD)
            setPadding(32, 16, 32, 16)
            isClickable = true
            isFocusable = true
            val isSelected = key == selectedKey
            setBackgroundResource(
                if (isSelected) R.drawable.bg_admin_pill_active else R.drawable.bg_admin_pill_inactive
            )
            setTextColor(if (isSelected) white else secondary)
            val lp = LinearLayout.LayoutParams(
                LinearLayout.LayoutParams.WRAP_CONTENT,
                LinearLayout.LayoutParams.WRAP_CONTENT
            )
            if (idx > 0) lp.marginStart = 16
            layoutParams = lp
            setOnClickListener { onSelected(key) }
        }
        containerFilterPills.addView(pill)
    }
}

fun confirmAdminAction(
    context: Context,
    title: String,
    message: String,
    confirmLabel: String = "Xác nhận",
    onConfirm: () -> Unit
) {
    AlertDialog.Builder(context, R.style.ThemeOverlay_FitTrack_Dialog_Alert)
        .setTitle(title)
        .setMessage(message)
        .setPositiveButton(confirmLabel) { _, _ -> onConfirm() }
        .setNegativeButton("Hủy", null)
        .show()
}

fun wrapDialogContainer(context: Context): Pair<ScrollView, LinearLayout> {
    val container = LinearLayout(context).apply {
        orientation = LinearLayout.VERTICAL
        setPadding(48, 24, 48, 12)
    }
    val scroll = ScrollView(context).apply {
        addView(container)
    }
    return scroll to container
}
