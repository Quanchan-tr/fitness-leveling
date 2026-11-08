package com.fittrack.app.data.models

import com.google.gson.annotations.SerializedName

data class ApiResponse<T>(
    @SerializedName("data") val data: T? = null,
    @SerializedName("error") val error: ApiError? = null,
    @SerializedName("meta") val meta: Map<String, Any>? = null
)

data class ApiError(
    @SerializedName("code") val code: String? = null,
    @SerializedName("message") val message: String? = null,
    @SerializedName("details") val details: Map<String, Any>? = null
)

