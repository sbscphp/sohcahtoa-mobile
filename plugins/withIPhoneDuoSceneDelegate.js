const { withAppDelegate, withInfoPlist } = require('expo/config-plugins');

function withIPhoneDuoSceneDelegate(config) {
  // 1. Configure Info.plist with UIApplicationSceneManifest
  config = withInfoPlist(config, (modConfig) => {
    modConfig.modResults.UIApplicationSceneManifest = {
      UIApplicationSupportsMultipleScenes: true,
      UISceneConfigurations: {
        UIWindowSceneSessionRoleApplication: [
          {
            UISceneConfigurationName: 'Default Configuration',
            UISceneDelegateClassName: 'EXExpoAppSceneDelegate',
          },
        ],
      },
    };
    return modConfig;
  });

  // 2. Configure AppDelegate.swift with ExpoReactNativeFactoryProvider & SceneDelegate Lifecycle
  config = withAppDelegate(config, (modConfig) => {
    let contents = modConfig.modResults.contents;

    // Keep internal import Expo if present, otherwise import Expo
    if (!contents.includes('import Expo')) {
      contents = `internal import Expo\n${contents}`;
    }

    // Adopt ExpoReactNativeFactoryProvider
    if (!contents.includes('ExpoReactNativeFactoryProvider')) {
      contents = contents.replace(
        /class AppDelegate:\s*ExpoAppDelegate\s*\{/,
        'class AppDelegate: ExpoAppDelegate, ExpoReactNativeFactoryProvider {'
      );
    }

    // Gate startReactNative with RCTIsSceneDelegateApp check
    if (!contents.includes('RCTIsSceneDelegateApp()')) {
      contents = contents.replace(
        /(#if os\(iOS\) \|\| os\(tvOS\)\n)(\s*)(window = UIWindow)/,
        '$1$2if !RCTIsSceneDelegateApp() {\n$2  $3'
      );
      contents = contents.replace(
        /(launchOptions: launchOptions\)\n)(\s*)(#endif)/,
        '$1$2}\n$2$3'
      );
    }

    // Add configurationForConnecting if missing
    if (!contents.includes('configurationForConnecting')) {
      const sceneSessionSnippet = `
  // MARK: - UISceneSession Lifecycle
  public func application(
    _ application: UIApplication,
    configurationForConnecting connectingSceneSession: UISceneSession,
    options: UIScene.ConnectionOptions
  ) -> UISceneConfiguration {
    let configuration = UISceneConfiguration(name: nil, sessionRole: connectingSceneSession.role)
    configuration.delegateClass = ExpoAppSceneDelegate.self
    return configuration
  }
`;
      // Insert before the last closing brace of AppDelegate class
      const lastBraceIndex = contents.lastIndexOf('}');
      if (lastBraceIndex !== -1) {
        contents = contents.slice(0, lastBraceIndex) + sceneSessionSnippet + contents.slice(lastBraceIndex);
      }
    }

    // Ensure Metro port 3000 fallback is present in bundleURL()
    if (!contents.includes('localhost:3000')) {
      contents = contents.replace(
        /return RCTBundleURLProvider\.sharedSettings\(\)\.jsBundleURL\(forBundleRoot: "\.expo\/\.virtual-metro-entry"\)/,
        `let provider = RCTBundleURLProvider.sharedSettings()
    if let url = provider.jsBundleURL(forBundleRoot: ".expo/.virtual-metro-entry") {
      return url
    }
    provider.jsLocation = "localhost:3000"
    if let url = provider.jsBundleURL(forBundleRoot: ".expo/.virtual-metro-entry") {
      return url
    }
    return RCTBundleURLProvider.jsBundleURL(
      forBundleRoot: ".expo/.virtual-metro-entry",
      packagerHost: "localhost:3000",
      enableDev: true,
      enableMinification: false,
      inlineSourceMap: false
    ) ?? URL(string: "http://localhost:3000/.expo/.virtual-metro-entry.bundle?platform=ios&dev=true&minify=false")`
      );
    }

    modConfig.modResults.contents = contents;
    return modConfig;
  });

  return config;
}

module.exports = withIPhoneDuoSceneDelegate;
