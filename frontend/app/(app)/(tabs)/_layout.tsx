import { Tabs } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { BlurView } from 'expo-blur';
import { View, TouchableOpacity, StyleSheet, Text } from 'react-native';
import { router } from 'expo-router';

function CustomTabBar({ state, descriptors, navigation }) {
    return (
        <View style={styles.tabBar}>
            <BlurView tint="dark" intensity={15} style={styles.blurView}>
                <View style={{ flexDirection: 'row', width: '100%', justifyContent: 'space-between', paddingHorizontal: 30 }}>
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
                                navigation.navigate(route.name);
                            }
                        };

                        return (
                            <TouchableOpacity
                                key={route.key}
                                onPress={onPress}
                                style={styles.tab}
                            >
                                {options.tabBarIcon({
                                    color: isFocused ? '#F59E0B' : '#B3B3B3',
                                    size: 24,
                                })}
                                <Text style={[
                                    styles.tabText,
                                    { color: isFocused ? '#F59E0B' : '#B3B3B3' }
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
                >
                    <View style={styles.centerButtonInner}>
                        <Ionicons name="add" size={28} color="#ffffff" />
                    </View>
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
                    backgroundColor: 'rgba(10,10,10,0.8)',
                        borderTopWidth: 0,
                    height: 84,
                    paddingHorizontal: 30,
                },
                tabBarBackground: () => (
                    <BlurView 
                        tint="dark" 
                        intensity={10} 
                        style={{ 
                            flex: 1,
                            backgroundColor: 'rgba(55, 55, 55, 0.8)',
                        }} 
                    />
                ),
                tabBarActiveTintColor: '#F59E0B',
                tabBarInactiveTintColor: '#B3B3B3',
                headerStyle: {
                    backgroundColor: 'transparent',
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

const styles = StyleSheet.create({
    tabBar: {
        position: 'absolute',
        bottom: 0,
        left: 0,
        right: 0,
        height: 84,
            borderTopWidth: 0,
    },
    blurView: {
        flex: 1,
        flexDirection: 'row',
        backgroundColor: 'rgba(10,10,10,0.2)',
        justifyContent: 'center',
        alignItems: 'center',
    },
    tab: {
        width: '35%',
        justifyContent: 'center',
        alignItems: 'center',
        height: 84,
        paddingBottom: 8,
    },
    tabText: {
        fontSize: 12,
        marginTop: 4,
    },
    centerButton: {
        position: 'absolute',
        top: -22,
        left: '50%',
        width: 64,
        height: 64,
        marginLeft: -32,
        alignItems: 'center',
        justifyContent: 'center',
        zIndex: 100,
    },
    centerButtonInner: {
        width: 64,
        height: 64,
        borderRadius: 32,
        borderWidth: 1,
        borderColor: 'rgba(245, 158, 11, 1)',
        backgroundColor: 'rgba(245, 158, 11, 0.3)',
        alignItems: 'center',
        justifyContent: 'center',
        shadowColor: '#000',
        shadowOffset: {
            width: 0,
            height: 2,
        },
        shadowOpacity: 0.25,
        shadowRadius: 3.84,
        elevation: 5,
    },
});