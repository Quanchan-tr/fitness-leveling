# Keep Retrofit service interfaces and Gson model DTOs for release minification
-keep class com.fittrack.app.data.models.** { *; }
-keep class com.fittrack.app.data.api.ApiService { *; }
-keepattributes Signature, *Annotation*

# Retrofit & OkHttp
-dontwarn retrofit2.**
-keep class retrofit2.** { *; }
-keepclasseswithmembers class * {
    @retrofit2.http.* <methods>;
}
-dontwarn okhttp3.**
-dontwarn okio.**
