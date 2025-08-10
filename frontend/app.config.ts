module.exports = {
    expo: {
        name: "Interview Coach",
        slug: "interview-coach",
        version: "1.0.0",
        orientation: "portrait",
        icon: "./assets/images/icon.png",
        scheme: "interviewcoach",
        userInterfaceStyle: "dark",
        newArchEnabled: true,
        splash: {
            image: "./assets/images/splash-icon.png",
            resizeMode: "contain",
            backgroundColor: "#000000",
        },
        ios: {
            supportsTablet: true,
            bundleIdentifier: "com.interview-coach.app",
            usesAppleSignIn: true,
            entitlements: {
                "aps-environment": "production",
            },
            infoPlist: {
                NSMicrophoneUsageDescription: "This app uses the microphone to record audio.",
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
            package: "com.interviewcoach.app",
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
          "@livekit/react-native-expo-plugin",
          "@config-plugins/react-native-webrtc",
          [
              "expo-updates",
              {
                  username: "maatty"
              }
          ],
        ],
        extra: {
            eas: {
                projectId: "75d5c908-4f3b-477a-bf82-4d8149ad48ca",
            },
        },
        owner: "oide",
        runtimeVersion: {
            policy: "appVersion",
        },
        updates: {
            url: "https://u.expo.dev/75d5c908-4f3b-477a-bf82-4d8149ad48ca",
        },
        experiments: {
            typedRoutes: true,
        },
    },
};