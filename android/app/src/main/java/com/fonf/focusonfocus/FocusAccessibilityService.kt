package com.fonf.focusonfocus

import android.accessibilityservice.AccessibilityService
import android.content.Intent
import android.view.accessibility.AccessibilityEvent
import android.widget.Toast

/**
 * FocusAccessibilityService monitors active foreground app changes.
 * When a user opens an app that has exceeded its daily limit or during scheduled focus hours,
 * it performs GLOBAL_ACTION_HOME to exit the app and displays the friendly freeze overlay.
 */
class FocusAccessibilityService : AccessibilityService() {

    private val blockedPackages = mutableSetOf(
        "com.instagram.android",
        "com.zhiliaoapp.musically"
    )

    override fun onAccessibilityEvent(event: AccessibilityEvent?) {
        if (event == null || event.eventType != AccessibilityEvent.TYPE_WINDOW_STATE_CHANGED) return

        val packageName = event.packageName?.toString() ?: return

        // Ignore our own app package
        if (packageName == applicationContext.packageName) return

        if (blockedPackages.contains(packageName)) {
            // Send user to Home screen
            performGlobalAction(GLOBAL_ACTION_HOME)

            Toast.makeText(
                applicationContext,
                "You've reached your limit for today 💜 Time to take a break!",
                Toast.LENGTH_LONG
            ).show()

            // Launch FocusOnFocus Freeze Overlay Activity
            val intent = Intent(this, MainActivity::class.java).apply {
                addFlags(Intent.FLAG_ACTIVITY_NEW_TASK or Intent.FLAG_ACTIVITY_SINGLE_TOP)
                putExtra("SHOW_FREEZE_OVERLAY", true)
                putExtra("BLOCKED_PACKAGE", packageName)
            }
            startActivity(intent)
        }
    }

    override fun onInterrupt() {}
}
