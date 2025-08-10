import { Tabs } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';

export default function TabLayout() {
    return (
        <Tabs
            screenOptions={{
                tabBarStyle: {
                    backgroundColor: '#1a1a1a',
                    borderTopColor: '#333',
                    paddingBottom: 5,
                    height: 60,
                },
                tabBarActiveTintColor: '#3B82F6',
                tabBarInactiveTintColor: '#666',
                headerStyle: {
                    backgroundColor: '#1a1a1a',
                },
                headerTintColor: '#fff',
                headerTitleStyle: {
                    fontFamily: 'Inter_600SemiBold',
                },
            }}
        >
            <Tabs.Screen
                name="home"
                options={{
                    title: 'Interviews',
                    tabBarIcon: ({ color, size }) => (
                        <Ionicons name="briefcase" size={size} color={color} />
                    ),
                }}
            />
            <Tabs.Screen
                name="profile"
                options={{
                    title: 'Profile',
                    tabBarIcon: ({ color, size }) => (
                        <Ionicons name="person" size={size} color={color} />
                    ),
                }}
            />
        </Tabs>
    );
}