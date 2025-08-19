module.exports = {
    expo: {
        name: "Interview Guide AI",
        slug: "interview-coach",
        version: "1.0.0",
        orientation: "portrait",
        icon: "./assets/images/FinalAppIcon.png",
        scheme: "interviewcoach",
        userInterfaceStyle: "dark",
        newArchEnabled: true,
        splash: {
            image: "./assets/images/SPLASH.png",
            resizeMode: "contain",
            backgroundColor: "#1b2234",
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
                image: "./assets/images/SPLASH.png",
                backgroundColor: "#1b2234",
            },
            package: "com.interviewcoach.app",
            // googleServicesFile: "./google-services.json",
            versionCode: 1
        },
        web: {
            favicon: "./assets/images/FinalAppIcon.png",
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