const { withMainApplication, withMainActivity } = require('@expo/config-plugins');

/**
 * Expo Config Plugin to ensure:
 * 1. SecurityBridgePackage is registered in MainApplication.kt
 * 2. FLAG_SECURE is applied in MainActivity.kt to prevent screenshots and task snapshots
 */
function withSecurityBridge(config) {
  // 1. Configure MainApplication.kt
  config = withMainApplication(config, (modConfig) => {
    let contents = modConfig.modResults.contents;

    if (!contents.includes('SecurityBridgePackage')) {
      contents = contents.replace(
        /PackageList\(this\)\.packages\.apply\s*\{/,
        'PackageList(this).packages.apply {\n          add(com.iamkennis.sohcahtoa.security.SecurityBridgePackage())'
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
        contents = contents.replace(
          /package\s+com\.iamkennis\.sohcahtoa/,
          'package com.iamkennis.sohcahtoa\nimport android.view.WindowManager'
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
