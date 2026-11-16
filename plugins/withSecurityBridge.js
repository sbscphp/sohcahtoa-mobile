const fs = require('fs');
const path = require('path');
const { withMainApplication, withMainActivity } = require('@expo/config-plugins');

function getSecurityBridgePackageSource(packageName) {
  return `package ${packageName}.security

import android.view.View
import com.facebook.react.ReactPackage
import com.facebook.react.bridge.NativeModule
import com.facebook.react.bridge.ReactApplicationContext
import com.facebook.react.uimanager.ReactShadowNode
import com.facebook.react.uimanager.ViewManager

class SecurityBridgePackage : ReactPackage {
    override fun createNativeModules(reactContext: ReactApplicationContext): List<NativeModule> {
        return listOf(SecurityBridgeModule(reactContext))
    }

    override fun createViewManagers(
        reactContext: ReactApplicationContext
    ): List<ViewManager<View, ReactShadowNode<*>>> {
        return emptyList()
    }
}
`;
}

function getSecurityBridgeModuleSource(packageName) {
  return `package ${packageName}.security

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
`;
}

/**
 * Expo Config Plugin to ensure:
 * 1. SecurityBridge native Kotlin files are generated/copied into the Android project
 * 2. SecurityBridgePackage is registered in MainApplication.kt
 * 3. FLAG_SECURE is applied in MainActivity.kt to prevent screenshots and task snapshots
 */
function withSecurityBridge(config) {
  const packageName = config.android?.package || 'com.iamkennis.sohcahtoa';

  // 1. Configure MainApplication.kt and copy Kotlin files into the package directory
  config = withMainApplication(config, (modConfig) => {
    const mainAppPath = modConfig.modResults.path;
    const packageDir = path.dirname(mainAppPath);
    const securityDir = path.join(packageDir, 'security');

    if (!fs.existsSync(securityDir)) {
      fs.mkdirSync(securityDir, { recursive: true });
    }

    const packageSourceFile = path.join(__dirname, 'security', 'SecurityBridgePackage.kt');
    const moduleSourceFile = path.join(__dirname, 'security', 'SecurityBridgeModule.kt');

    let packageContent = fs.existsSync(packageSourceFile)
      ? fs.readFileSync(packageSourceFile, 'utf8')
      : getSecurityBridgePackageSource(packageName);

    let moduleContent = fs.existsSync(moduleSourceFile)
      ? fs.readFileSync(moduleSourceFile, 'utf8')
      : getSecurityBridgeModuleSource(packageName);

    // Keep package declaration in sync with the configured android package name
    packageContent = packageContent.replace(/package\s+[\w\.]+/, `package ${packageName}.security`);
    moduleContent = moduleContent.replace(/package\s+[\w\.]+/, `package ${packageName}.security`);

    fs.writeFileSync(path.join(securityDir, 'SecurityBridgePackage.kt'), packageContent, 'utf8');
    fs.writeFileSync(path.join(securityDir, 'SecurityBridgeModule.kt'), moduleContent, 'utf8');

    let contents = modConfig.modResults.contents;

    if (!contents.includes('SecurityBridgePackage')) {
      contents = contents.replace(
        /PackageList\(this\)\.packages\.apply\s*\{/,
        `PackageList(this).packages.apply {\n          add(${packageName}.security.SecurityBridgePackage())`
      );
    }

    modConfig.modResults.contents = contents;
    return modConfig;
  });

  // 2. Configure MainActivity.kt for FLAG_SECURE
  config = withMainActivity(config, (modConfig) => {
    let contents = modConfig.modResults.contents;

    if (!contents.includes('FLAG_SECURE')) {
      if (!contents.includes('import android.view.WindowManager')) {
        const escapedPackage = packageName.replace(/\./g, '\\.');
        contents = contents.replace(
          new RegExp(`package\\s+${escapedPackage}`),
          `package ${packageName}\nimport android.view.WindowManager`
        );
      }
      contents = contents.replace(
        /super\.onCreate\(/,
        'window.setFlags(WindowManager.LayoutParams.FLAG_SECURE, WindowManager.LayoutParams.FLAG_SECURE)\n    super.onCreate('
      );
    }

    modConfig.modResults.contents = contents;
    return modConfig;
  });

  return config;
}

module.exports = withSecurityBridge;
