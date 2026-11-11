package com.fittrack.app.util

import android.graphics.Bitmap
import android.graphics.BitmapFactory
import android.util.LruCache
import android.widget.ImageView
import kotlinx.coroutines.CoroutineScope
import kotlinx.coroutines.Dispatchers
import kotlinx.coroutines.launch
import kotlinx.coroutines.withContext
import java.net.HttpURLConnection
import java.net.URL

private val maxMemory = (Runtime.getRuntime().maxMemory() / 1024).toInt()
private val cacheSize = maxMemory / 8

private val imageMemoryCache = object : LruCache<String, Bitmap>(cacheSize) {
    override fun sizeOf(key: String, value: Bitmap): Int {
        return value.byteCount / 1024
    }
}

/**
 * Asynchronously loads a web image (PNG, JPG, WebP) into an ImageView with LruCache memory caching.
 */
fun ImageView.loadUrl(url: String?, placeholderRes: Int? = null) {
    if (url.isNullOrBlank()) {
        placeholderRes?.let { setImageResource(it) }
        return
    }

    val cached = imageMemoryCache.get(url)
    if (cached != null) {
        setImageBitmap(cached)
        return
    }

    placeholderRes?.let { setImageResource(it) }
    tag = url

    CoroutineScope(Dispatchers.IO).launch {
        try {
            val connection = URL(url).openConnection() as HttpURLConnection
            connection.doInput = true
            connection.connectTimeout = 8000
            connection.readTimeout = 8000
            connection.connect()

            val input = connection.inputStream
            val bitmap = BitmapFactory.decodeStream(input)
            input.close()
            connection.disconnect()

            if (bitmap != null) {
                imageMemoryCache.put(url, bitmap)
                withContext(Dispatchers.Main) {
                    if (tag == url) {
                        setImageBitmap(bitmap)
                    }
                }
            }
        } catch (_: Exception) {
            // Fallback placeholder remains visible
        }
    }
}

