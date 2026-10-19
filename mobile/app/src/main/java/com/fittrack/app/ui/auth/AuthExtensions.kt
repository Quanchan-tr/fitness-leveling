package com.fittrack.app.ui.auth

import android.text.method.HideReturnsTransformationMethod
import android.text.method.PasswordTransformationMethod
import android.widget.EditText
import android.widget.ImageView
import android.widget.TextView
import androidx.annotation.StringRes
import androidx.core.text.HtmlCompat
import com.fittrack.app.R

/**
 * Attaches show/hide password toggle logic to an EditText and ImageView toggle button.
 */
fun setupPasswordToggle(editText: EditText, toggleButton: ImageView) {
    var isPasswordVisible = false
    toggleButton.setOnClickListener {
        isPasswordVisible = !isPasswordVisible
        if (isPasswordVisible) {
            editText.transformationMethod = HideReturnsTransformationMethod.getInstance()
            toggleButton.setImageResource(R.drawable.ic_eye)
        } else {
            editText.transformationMethod = PasswordTransformationMethod.getInstance()
            toggleButton.setImageResource(R.drawable.ic_eye_slash)
        }
        editText.setSelection(editText.text.length)
    }
}

/**
 * Sets HTML-formatted text from string resources with proper styling and color spans.
 */
fun TextView.setHtmlText(@StringRes resId: Int) {
    text = HtmlCompat.fromHtml(context.getString(resId), HtmlCompat.FROM_HTML_MODE_LEGACY)
}
