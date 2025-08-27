import { Tabs } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { BlurView } from 'expo-blur';
import { View, TouchableOpacity, StyleSheet, Text, Platform } from 'react-native';
import { router } from 'expo-router';
import { BottomTabBarProps } from '@react-navigation/bottom-tabs';
import * as Haptics from 'expo-haptics';
import Colors from '../../../constants/Colors';

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
                                    color: isFocused ? Colors.brand.primary : Colors.text.tertiary,
                                    size: 24,
                                    focused: isFocused,
                                })}
                                <Text style={[
                                    styles.tabText,
                                    { color: isFocused ? Colors.brand.primary : Colors.text.tertiary }
                                ]}>
                                    {options.title}
                                </Text>
                            </TouchableOpacity>
                        );
                    })}
                </View>
                <TouchableOpacity
                    style={styles.centerButton}
                    onPress={() => {
                        Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
                        router.push('/interviews/create');
                    }}
                    activeOpacity={0.9}
                >
                    <BlurView tint="dark" intensity={20} style={styles.centerButtonBlur}>
                        <View style={styles.centerButtonInner}>
                            <Ionicons name="add" size={32} color={Colors.white} style={{ fontWeight: 'bold' }} />
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
                    backgroundColor: Colors.glass.background,
                    borderTopWidth: 1,
                    borderTopColor: Colors.glass.border,
                    height: 84,
                    paddingHorizontal: 30,
                },
                tabBarBackground: () => (
                    <BlurView 
                        tint="dark" 
                        intensity={20} 
                        style={{ 
                            flex: 1,
                            backgroundColor: Colors.glass.background,
                        }} 
                    />
                ),
                tabBarActiveTintColor: Colors.brand.primary,
                tabBarInactiveTintColor: Colors.text.tertiary,
                headerStyle: {
                    backgroundColor: Colors.transparent,
                },
                headerTintColor: Colors.white,
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
        borderTopColor: Colors.glass.border,
        ...Platform.select({
            ios: {
                shadowColor: Colors.black,
                shadowOffset: { width: 0, height: -2 },
                shadowOpacity: 0.1,
                shadowRadius: 4,
            }
        }),
    },
    blurView: {
        flex: 1,
        flexDirection: 'row',
        backgroundColor: Colors.glass.background,
        justifyContent: 'center',
        alignItems: 'center',
        borderTopWidth: 1,
        borderTopColor: Colors.glass.border,
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
        backgroundColor: 'transparent',
        borderWidth: 0,
        borderColor: Colors.glass.border,
    },
    centerButtonInner: {
        width: 64,
        height: 64,
        borderRadius: 32,
        borderWidth: 2,
        borderColor: Colors.brand.primary,
        backgroundColor: Colors.glass.purple,
        alignItems: 'center',
        justifyContent: 'center',
        ...Platform.select({
            ios: {
                shadowColor: Colors.brand.primary,
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