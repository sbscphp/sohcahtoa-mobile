package com.iamkennis.sohcahtoa.security

import android.content.Intent
import android.os.Build
import android.provider.Settings
import com.facebook.react.bridge.Promise
import com.facebook.react.bridge.ReactApplicationContext
import com.facebook.react.bridge.ReactContextBaseJavaModule
import com.facebook.react.bridge.ReactMethod

class SecurityBridgeModule(private val reactContext: ReactApplicationContext) :
    ReactContextBaseJavaModule(reactContext) {

    override fun getName(): String = "SecurityBridge"

    @ReactMethod
    fun isUsbDebuggingEnabled(promise: Promise) {
        try {
            val contentResolver = reactContext.contentResolver
            val isAdbEnabled = if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.JELLY_BEAN_MR1) {
                Settings.Global.getInt(contentResolver, Settings.Global.ADB_ENABLED, 0) == 1
            } else {
                @Suppress("DEPRECATION")
                Settings.Secure.getInt(contentResolver, Settings.Secure.ADB_ENABLED, 0) == 1
            }
            promise.resolve(isAdbEnabled)
        } catch (e: Exception) {
            promise.resolve(false)
        }
    }

    @ReactMethod
    fun openDevelopmentSettings(promise: Promise) {
        try {
            val intent = Intent(Settings.ACTION_APPLICATION_DEVELOPMENT_SETTINGS).apply {
                flags = Intent.FLAG_ACTIVITY_NEW_TASK
            }
            reactContext.startActivity(intent)
            promise.resolve(true)
        } catch (e: Exception) {
            promise.resolve(false)
        }
    }
}
