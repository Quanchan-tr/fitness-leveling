package com.fittrack.app.data.api

import android.content.Context
import com.fittrack.app.data.session.SessionManager
import okhttp3.Interceptor
import okhttp3.OkHttpClient
import okhttp3.Response
import okhttp3.logging.HttpLoggingInterceptor
import retrofit2.Retrofit
import retrofit2.converter.gson.GsonConverterFactory
import java.util.concurrent.TimeUnit

object ApiClient {

    @Volatile
    private var apiService: ApiService? = null

    @Volatile
    private var currentBaseUrl: String? = null

    fun getService(context: Context): ApiService {
        val session = SessionManager.getInstance(context)
        val url = session.baseUrl

        return if (apiService != null && currentBaseUrl == url) {
            apiService!!
        } else {
            synchronized(this) {
                if (apiService != null && currentBaseUrl == url) {
                    apiService!!
                } else {
                    currentBaseUrl = url
                    val client = buildOkHttpClient(session)
                    val retrofit = Retrofit.Builder()
                        .baseUrl(url)
                        .client(client)
                        .addConverterFactory(GsonConverterFactory.create())
                        .build()

                    val service = retrofit.create(ApiService::class.java)
                    apiService = service
                    service
                }
            }
        }
    }

    private fun buildOkHttpClient(session: SessionManager): OkHttpClient {
        val logging = HttpLoggingInterceptor().apply {
            level = HttpLoggingInterceptor.Level.BODY
        }

        val authInterceptor = Interceptor { chain ->
            val original = chain.request()
            val requestBuilder = original.newBuilder()
                .header("Accept", "application/json")
                .header("Content-Type", "application/json")

            val token = session.authToken
            if (!token.isNullOrBlank()) {
                requestBuilder.header("Authorization", "Bearer $token")
            }

            chain.proceed(requestBuilder.build())
        }

        return OkHttpClient.Builder()
            .addInterceptor(authInterceptor)
            .addInterceptor(logging)
            .connectTimeout(15, TimeUnit.SECONDS)
            .readTimeout(20, TimeUnit.SECONDS)
            .writeTimeout(20, TimeUnit.SECONDS)
            .build()
    }

    fun resetService() {
        synchronized(this) {
            apiService = null
            currentBaseUrl = null
        }
    }
}

