module.exports = {
    expo: {
        name: "Flight Catcher",
        slug: "whats-that-in-the-sky",
        version: "1.0.0",
        orientation: "portrait",
        icon: "./assets/images/icon.png",
        scheme: "flightcatcher",
        userInterfaceStyle: "dark",
        newArchEnabled: true,
        splash: {
            image: "./assets/images/splash-icon.png",
            resizeMode: "contain",
            backgroundColor: "#000000",
        },
        ios: {
            supportsTablet: true,
            bundleIdentifier: "com.whats-in-they-sky.app",
            usesAppleSignIn: true,
            entitlements: {
                "aps-environment": "production",
            },
            infoPlist: {
                NSPhotoLibraryUsageDescription: "This app accesses your photo library to let you pick a profile picture and submit plane captures.",
                ITSAppUsesNonExemptEncryption: false,
                LSMinimumSystemVersion: "13.0"
            },
        },
        android: {
            splash: {
                image: "./assets/images/splash-icon.png",
                backgroundColor: "#000000",
            },
            package: "com.whats-in-they-sky.app",
            // googleServicesFile: "./google-services.json",
            versionCode: 1
        },
        web: {
            favicon: "./assets/images/favicon.png",
            output: "server",
        },
        plugins: [
            "expo-router",
          "expo-secure-store",
          "expo-localization",  
          [
              "expo-updates",
              {
                  username: "maatty"
              }
          ],
        ],
        extra: {
            eas: {
                projectId: "777197d0-632d-4500-93d8-5aee799550f8",
            },
        },
        owner: "oide",
        runtimeVersion: {
            policy: "appVersion",
        },
        updates: {
            url: "https://u.expo.dev/777197d0-632d-4500-93d8-5aee799550f8",
        },
        experiments: {
            typedRoutes: true,
        },
    },
};