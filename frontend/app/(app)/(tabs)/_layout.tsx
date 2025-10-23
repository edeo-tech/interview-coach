import { Tabs } from 'expo-router';
import { Platform, Text } from 'react-native';
import { Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';
import ColorsLight from '@/constants/ColorsLight';
import { ICON_SIZES } from '@/constants/Icons';
import { TYPOGRAPHY } from '@/constants/Typography';

export default function TabLayout() {
    return (
        <Tabs
            screenOptions={{
                headerShown: false,
                tabBarStyle: {
                    backgroundColor: ColorsLight.background.primary,
                    borderTopWidth: 1,
                    borderTopColor: ColorsLight.border.default,
                    height: Platform.OS === 'ios' ? 84 : 64,
                    paddingBottom: Platform.OS === 'ios' ? 24 : 8,
                    paddingTop: 8,
                    ...Platform.select({
                        ios: {
                            shadowColor: ColorsLight.black,
                            shadowOffset: { width: 0, height: -2 },
                            shadowOpacity: 0.05,
                            shadowRadius: 8,
                        },
                        android: {
                            elevation: 8,
                        },
                    }),
                },
                tabBarActiveTintColor: ColorsLight.accent.gold,
                tabBarInactiveTintColor: ColorsLight.icon.inactive,
                tabBarLabelStyle: {
                    fontSize: 11,
                    marginTop: 2,
                },
                tabBarLabel: ({ focused, children }) => (
                    <Text
                        style={{
                            fontSize: 11,
                            marginTop: 2,
                            fontFamily: TYPOGRAPHY.tabLabel.fontFamily,
                            fontWeight: focused ? '600' : '500',
                            color: focused ? ColorsLight.text.primary : ColorsLight.icon.inactive,
                        }}
                    >
                        {children}
                    </Text>
                ),
                headerStyle: {
                    backgroundColor: ColorsLight.background.primary,
                },
                headerTintColor: ColorsLight.text.primary,
                headerTitleStyle: {
                    ...TYPOGRAPHY.heading3,
                },
            }}
        >
            <Tabs.Screen
                name="home"
                options={{
                    title: 'Home',
                    tabBarIcon: ({ color }) => (
                        <Ionicons name="home" size={ICON_SIZES.tab} color={color} />
                    ),
                }}
            />
            <Tabs.Screen
                name="finances"
                options={{
                    title: 'Finances',
                    tabBarIcon: ({ color }) => (
                        <MaterialCommunityIcons name="currency-inr" size={ICON_SIZES.tab} color={color} />
                    ),
                }}
            />
            <Tabs.Screen
                name="pay"
                options={{
                    title: 'Pay',
                    tabBarIcon: ({ color }) => (
                        <MaterialCommunityIcons name="qrcode-scan" size={ICON_SIZES.tab} color={color} />
                    ),
                }}
            />
            <Tabs.Screen
                name="invest"
                options={{
                    title: 'Invest',
                    tabBarIcon: ({ color }) => (
                        <Ionicons name="trending-up" size={ICON_SIZES.tab} color={color} />
                    ),
                }}
            />
            <Tabs.Screen
                name="explore"
                options={{
                    title: 'Explore',
                    tabBarIcon: ({ color }) => (
                        <Ionicons name="grid" size={ICON_SIZES.tab} color={color} />
                    ),
                }}
            />
        </Tabs>
    );
}