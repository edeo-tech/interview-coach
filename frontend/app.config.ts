module.exports = {
    expo: {
        name: "nextround",
        slug: "interview-coach",
        version: "1.0.2",
        orientation: "portrait",
        icon: "./assets/images/AllBlackAppIcon.png",
        scheme: "nextround",
        userInterfaceStyle: "dark",
        newArchEnabled: true,
        splash: {
            image: "./assets/images/ios_splash.png",
            resizeMode: "cover",
            backgroundColor: "#000000",
            fade: true,
        },
        ios: {
            supportsTablet: true,
            bundleIdentifier: "com.interview-coach.app",
            usesAppleSignIn: true,
            entitlements: {
                "aps-environment": "production",
            },
            infoPlist: {
                NSMicrophoneUsageDescription: "This app uses your microphone to record your responses during mock interviews so the AI interviewer can hear you, transcribe your answers, and provide real-time feedback to help you improve.",
                NSPhotoLibraryUsageDescription: "This app accesses your photo library to let you pick a profile picture.",
                NSSpeechRecognitionUsageDescription: "This app uses speech recognition to transcribe your voice during mock interviews so the AI interviewer can hear you, transcribe your answers, and provide real-time feedback to help you improve.",
                ITSAppUsesNonExemptEncryption: false,
                LSMinimumSystemVersion: "13.0"
            },
        },
        android: {
            splash: {
                image: "./assets/images/FinalAppIconTransparent.png",
                resizeMode: "cover",
                backgroundColor: "#000000",
                fade: true,
            },
            package: "com.interviewcoach.app",
            // googleServicesFile: "./google-services.json",
            versionCode: 1
        },
        web: {
            favicon: "./assets/images/AllBlackAppIcon.png",
            output: "server",
        },
        plugins: [
            "expo-router",
          "expo-secure-store",
          "expo-localization",
          "expo-apple-authentication",
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