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

/**
 * Connects a list of 1-digit OTP EditTexts with auto-advance, backspace focus, and full-code paste handling.
 */
fun setupOtpInputFlow(vararg editTexts: EditText, onOtpFilled: (String) -> Unit = {}) {
    val list = editTexts.toList()
    list.forEachIndexed { index, editText ->
        editText.addTextChangedListener(object : android.text.TextWatcher {
            override fun beforeTextChanged(s: CharSequence?, start: Int, count: Int, after: Int) {}
            override fun onTextChanged(s: CharSequence?, start: Int, before: Int, count: Int) {}
            override fun afterTextChanged(s: android.text.Editable?) {
                val text = s?.toString() ?: ""
                if (text.length > 1) {
                    val pasted = text.trim()
                    if (pasted.length == list.size) {
                        list.forEachIndexed { j, box ->
                            box.setText(pasted[j].toString())
                        }
                        list.last().requestFocus()
                        list.last().setSelection(1)
                        onOtpFilled(pasted)
                        return
                    } else if (text.isNotEmpty()) {
                        editText.setText(text.takeLast(1))
                        editText.setSelection(1)
                    }
                }

                if (text.isNotEmpty() && index < list.size - 1) {
                    list[index + 1].requestFocus()
                }

                val currentCode = list.joinToString("") { it.text.toString().trim() }
                if (currentCode.length == list.size) {
                    onOtpFilled(currentCode)
                }
            }
        })

        editText.setOnKeyListener { _, keyCode, event ->
            if (keyCode == android.view.KeyEvent.KEYCODE_DEL && event.action == android.view.KeyEvent.ACTION_DOWN) {
                if (editText.text.isNullOrEmpty() && index > 0) {
                    val prev = list[index - 1]
                    prev.requestFocus()
                    prev.setText("")
                    return@setOnKeyListener true
                }
            }
            false
        }
    }
}
