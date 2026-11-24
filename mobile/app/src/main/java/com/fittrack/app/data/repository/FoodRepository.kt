package com.fittrack.app.data.repository

import android.content.Context
import com.fittrack.app.data.models.FoodItemDto
import com.google.gson.Gson
import com.google.gson.reflect.TypeToken
import kotlinx.coroutines.Dispatchers
import kotlinx.coroutines.withContext
import java.io.InputStreamReader
import java.text.Normalizer

class FoodRepository private constructor(private val context: Context) {

    private var cachedFoods: List<FoodItemDto>? = null

    suspend fun getFoods(): List<FoodItemDto> = withContext(Dispatchers.IO) {
        cachedFoods?.let { return@withContext it }

        try {
            context.assets.open("nutrition_dataset.json").use { inputStream ->
                InputStreamReader(inputStream, Charsets.UTF_8).use { reader ->
                    val type = object : TypeToken<List<FoodItemDto>>() {}.type
                    val list: List<FoodItemDto> = Gson().fromJson(reader, type)
                    cachedFoods = list
                    list
                }
            }
        } catch (e: Exception) {
            e.printStackTrace()
            emptyList()
        }
    }

    suspend fun searchFoods(
        query: String = "",
        categoryChip: String = "ALL",
        limit: Int = 50
    ): List<FoodItemDto> = withContext(Dispatchers.Default) {
        val allFoods = getFoods()
        val qRaw = query.trim().lowercase()
        val qNorm = removeVietnameseTones(qRaw)

        allFoods.asSequence()
            .filter { item ->
                // Filter by category chip
                val matchCategory = when (categoryChip.uppercase()) {
                    "ALL", "TẤT CẢ" -> true
                    "PROTEIN", "ĐẠM" -> {
                        val cat = (item.category ?: "").lowercase()
                        cat.contains("thịt") || cat.contains("thủy") || cat.contains("hải sản") ||
                                cat.contains("trứng") || cat.contains("đậu")
                    }
                    "CARB", "TINH BỘT" -> {
                        val cat = (item.category ?: "").lowercase()
                        cat.contains("cơm") || cat.contains("ngũ cốc") || cat.contains("bánh mì") ||
                                cat.contains("khoai") || cat.contains("mì") || cat.contains("bún")
                    }
                    "VEGGIE", "RAU CỦ" -> {
                        val cat = (item.category ?: "").lowercase()
                        cat.contains("rau") || cat.contains("canh") || cat.contains("trái cây")
                    }
                    "WHEY", "BỔ SUNG" -> {
                        val nameL = item.name.lowercase()
                        nameL.contains("whey") || nameL.contains("sữa") || nameL.contains("protein")
                    }
                    else -> (item.category ?: "").equals(categoryChip, ignoreCase = true)
                }

                if (!matchCategory) return@filter false

                if (qNorm.isEmpty()) return@filter true

                val name = item.name.lowercase()
                val nameNorm = removeVietnameseTones(name)
                val nameEn = (item.nameEn ?: "").lowercase()
                val cat = (item.category ?: "").lowercase()
                val tags = (item.tags ?: emptyList()).joinToString(" ").lowercase()

                name.contains(qRaw) ||
                        nameNorm.contains(qNorm) ||
                        nameEn.contains(qRaw) ||
                        cat.contains(qRaw) ||
                        removeVietnameseTones(cat).contains(qNorm) ||
                        tags.contains(qRaw) ||
                        removeVietnameseTones(tags).contains(qNorm)
            }
            .take(limit)
            .toList()
    }

    private fun removeVietnameseTones(str: String): String {
        val nfd = Normalizer.normalize(str, Normalizer.Form.NFD)
        return nfd.replace("\\p{InCombiningDiacriticalMarks}+".toRegex(), "")
            .replace('đ', 'd')
            .replace('Đ', 'D')
            .lowercase()
            .trim()
    }

    companion object {
        @Volatile
        private var instance: FoodRepository? = null

        fun getInstance(context: Context): FoodRepository {
            return instance ?: synchronized(this) {
                instance ?: FoodRepository(context.applicationContext).also { instance = it }
            }
        }
    }
}

