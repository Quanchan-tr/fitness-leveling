package com.fittrack.app.util

import android.graphics.BitmapFactory
import android.graphics.ImageDecoder
import android.graphics.drawable.Animatable
import android.graphics.drawable.AnimatedImageDrawable
import android.graphics.drawable.BitmapDrawable
import android.os.Build
import android.util.LruCache
import android.widget.ImageView
import kotlinx.coroutines.CoroutineScope
import kotlinx.coroutines.Dispatchers
import kotlinx.coroutines.launch
import kotlinx.coroutines.withContext
import java.net.HttpURLConnection
import java.net.URL
import java.nio.ByteBuffer

private val maxMemory = (Runtime.getRuntime().maxMemory() / 1024).toInt()
private val cacheSize = maxMemory / 8 // KB

// Cache raw byte arrays to preserve all animation frames of WebP and GIF
private val byteMemoryCache = object : LruCache<String, ByteArray>(cacheSize) {
    override fun sizeOf(key: String, value: ByteArray): Int {
        return value.size / 1024
    }
}

/**
 * Asynchronously loads an image (Animated WebP, Animated GIF, PNG, JPG) into an ImageView.
 * Decodes multi-frame WebP/GIF animations natively on Android 9+ (API 28+) and loops infinitely.
 */
fun ImageView.loadUrl(url: String?, placeholderRes: Int? = null) {
    (drawable as? Animatable)?.stop()

    if (url.isNullOrBlank()) {
        placeholderRes?.let { setImageResource(it) }
        tag = null
        return
    }

    tag = url

    val cachedBytes = byteMemoryCache.get(url)
    if (cachedBytes != null) {
        applyDecodedBytes(cachedBytes, url)
        return
    }

    placeholderRes?.let { setImageResource(it) }

    CoroutineScope(Dispatchers.IO).launch {
        try {
            val connection = URL(url).openConnection() as HttpURLConnection
            connection.doInput = true
            connection.connectTimeout = 10000
            connection.readTimeout = 10000
            connection.connect()

            val bytes = connection.inputStream.use { it.readBytes() }
            connection.disconnect()

            if (bytes.isNotEmpty()) {
                byteMemoryCache.put(url, bytes)
                withContext(Dispatchers.Main) {
                    if (tag == url) {
                        applyDecodedBytes(bytes, url)
                    }
                }
            }
        } catch (_: Exception) {
            // Placeholder remains visible on failure
        }
    }
}

private fun ImageView.applyDecodedBytes(bytes: ByteArray, url: String) {
    CoroutineScope(Dispatchers.IO).launch {
        try {
            val decodedDrawable = if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.P) {
                val byteBuffer = ByteBuffer.wrap(bytes)
                val source = ImageDecoder.createSource(byteBuffer)
                ImageDecoder.decodeDrawable(source)
            } else {
                val bitmap = BitmapFactory.decodeByteArray(bytes, 0, bytes.size)
                bitmap?.let { BitmapDrawable(resources, it) }
            }

            if (decodedDrawable != null) {
                withContext(Dispatchers.Main) {
                    if (tag == url) {
                        (drawable as? Animatable)?.stop()
                        setImageDrawable(decodedDrawable)
                        if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.P && decodedDrawable is AnimatedImageDrawable) {
                            decodedDrawable.repeatCount = AnimatedImageDrawable.REPEAT_INFINITE
                            decodedDrawable.start()
                        } else if (decodedDrawable is Animatable) {
                            decodedDrawable.start()
                        }
                    }
                }
            }
        } catch (_: Exception) {
            // Fallback: try static bitmap decode if ImageDecoder fails
            try {
                val fallbackBitmap = BitmapFactory.decodeByteArray(bytes, 0, bytes.size)
                if (fallbackBitmap != null) {
                    withContext(Dispatchers.Main) {
                        if (tag == url) {
                            setImageBitmap(fallbackBitmap)
                        }
                    }
                }
            } catch (_: Exception) {}
        }
    }
}
