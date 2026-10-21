package com.fittrack.app.ui.community

import android.os.Bundle
import androidx.appcompat.app.AppCompatActivity
import com.fittrack.app.databinding.ActivityCommunityBinding

import com.fittrack.app.ui.BottomNavTab
import com.fittrack.app.ui.setupBottomNav

class CommunityActivity : AppCompatActivity() {

    private lateinit var binding: ActivityCommunityBinding

    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)
        binding = ActivityCommunityBinding.inflate(layoutInflater)
        setContentView(binding.root)

        setupBottomNav()
    }

    private fun setupBottomNav() {
        binding.bottomNavigation.setupBottomNav(this, BottomNavTab.COMMUNITY)
    }
}
