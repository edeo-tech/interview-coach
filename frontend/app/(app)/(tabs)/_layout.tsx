import { Tabs } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { BlurView } from 'expo-blur';
import { View, TouchableOpacity, StyleSheet, Text, Platform } from 'react-native';
import { router } from 'expo-router';
import { BottomTabBarProps } from '@react-navigation/bottom-tabs';

function CustomTabBar({ state, descriptors, navigation }: BottomTabBarProps) {
    return (
        <View style={styles.tabBar}>
            <BlurView tint="dark" intensity={20} style={styles.blurView}>
                <View style={styles.tabContainer}>
                    {state.routes.map((route, index) => {
                        const { options } = descriptors[route.key];
                        const isFocused = state.index === index;

                        const onPress = () => {
                            const event = navigation.emit({
                                type: 'tabPress',
                                target: route.key,
                                canPreventDefault: true,
                            });

                            if (!isFocused && !event.defaultPrevented) {
                                navigation.navigate(route.name as never);
                            }
                        };

                        return (
                            <TouchableOpacity
                                key={route.key}
                                onPress={onPress}
                                style={styles.tab}
                                activeOpacity={0.8}
                            >
                                {options.tabBarIcon?.({
                                    color: isFocused ? '#A855F7' : 'rgba(255, 255, 255, 0.7)',
                                    size: 24,
                                    focused: isFocused,
                                })}
                                <Text style={[
                                    styles.tabText,
                                    { color: isFocused ? '#A855F7' : 'rgba(255, 255, 255, 0.7)' }
                                ]}>
                                    {options.title}
                                </Text>
                            </TouchableOpacity>
                        );
                    })}
                </View>
                <TouchableOpacity
                    style={styles.centerButton}
                    onPress={() => router.push('/interviews/create')}
                    activeOpacity={0.9}
                >
                    <BlurView tint="dark" intensity={20} style={styles.centerButtonBlur}>
                        <View style={styles.centerButtonInner}>
                            <Ionicons name="add" size={28} color="#FFFFFF" />
                        </View>
                    </BlurView>
                </TouchableOpacity>
            </BlurView>
        </View>
    );
}

export default function TabLayout() {
    return (
        <Tabs
            tabBar={(props) => <CustomTabBar {...props} />}
            screenOptions={{
                headerShown: false,
                tabBarStyle: {
                    backgroundColor: 'rgba(255, 255, 255, 0.12)',
                    borderTopWidth: 1,
                    borderTopColor: 'rgba(255, 255, 255, 0.15)',
                    height: 84,
                    paddingHorizontal: 30,
                },
                tabBarBackground: () => (
                    <BlurView 
                        tint="dark" 
                        intensity={20} 
                        style={{ 
                            flex: 1,
                            backgroundColor: 'rgba(255, 255, 255, 0.12)',
                        }} 
                    />
                ),
                tabBarActiveTintColor: '#A855F7',
                tabBarInactiveTintColor: 'rgba(255, 255, 255, 0.7)',
                headerStyle: {
                    backgroundColor: 'transparent',
                },
                headerTintColor: '#FFFFFF',
                headerTitleStyle: {
                    fontFamily: Platform.OS === 'ios' ? 'Inter' : 'sans-serif',
                    fontWeight: '600',
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

const styles = StyleSheet.create({
    tabBar: {
        position: 'absolute',
        bottom: 0,
        left: 0,
        right: 0,
        height: 84,
        borderTopWidth: 1,
        borderTopColor: 'rgba(255, 255, 255, 0.15)',
        ...Platform.select({
            ios: {
                shadowColor: '#000',
                shadowOffset: { width: 0, height: -2 },
                shadowOpacity: 0.1,
                shadowRadius: 4,
            }
        }),
    },
    blurView: {
        flex: 1,
        flexDirection: 'row',
        backgroundColor: 'rgba(255, 255, 255, 0.12)',
        justifyContent: 'center',
        alignItems: 'center',
        borderTopWidth: 1,
        borderTopColor: 'rgba(255, 255, 255, 0.15)',
    },
    tabContainer: {
        flexDirection: 'row', 
        width: '100%', 
        justifyContent: 'space-between', 
        paddingHorizontal: 30
    },
    tab: {
        width: '35%',
        justifyContent: 'center',
        alignItems: 'center',
        height: 84,
        paddingBottom: Platform.OS === 'android' ? 0 : 8,
    },
    tabText: {
        fontSize: 12,
        marginTop: 4,
        fontWeight: '500',
        fontFamily: Platform.OS === 'ios' ? 'Inter' : 'sans-serif',
        letterSpacing: 0.01,
    },
    centerButton: {
        position: 'absolute',
        top: -15,
        left: '50%',
        width: 64,
        height: 64,
        marginLeft: -32,
        alignItems: 'center',
        justifyContent: 'center',
        zIndex: 100,
    },
    centerButtonBlur: {
        width: 72,
        height: 72,
        borderRadius: 36,
        overflow: 'hidden',
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: 'rgba(255, 255, 255, 0.12)',
        borderWidth: 1,
        borderColor: 'rgba(255, 255, 255, 0.15)',
    },
    centerButtonInner: {
        width: 64,
        height: 64,
        borderRadius: 32,
        borderWidth: 2,
        borderColor: '#A855F7',
        backgroundColor: 'rgba(168, 85, 247, 0.15)',
        alignItems: 'center',
        justifyContent: 'center',
        ...Platform.select({
            ios: {
                shadowColor: '#A855F7',
                shadowOffset: {
                    width: 0,
                    height: 4,
                },
                shadowOpacity: 0.3,
                shadowRadius: 12,
            }
        }),
    },
});