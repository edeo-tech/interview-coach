import React from 'react';
import { View, Text, StyleSheet, ScrollView, Pressable, Image } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

const StatCard = ({ icon, label, value, color = '#3B82F6' }: any) => (
    <View style={styles.statCard}>
        <Ionicons name={icon} size={24} color={color} />
        <Text style={styles.statValue}>{value}</Text>
        <Text style={styles.statLabel}>{label}</Text>
    </View>
);

const MenuItem = ({ icon, label, onPress }: any) => (
    <Pressable style={styles.menuItem} onPress={onPress}>
        <Ionicons name={icon} size={24} color="#6B7280" />
        <Text style={styles.menuLabel}>{label}</Text>
        <Ionicons name="chevron-forward" size={20} color="#6B7280" />
    </Pressable>
);

export default function Profile() {
    const user = {
        name: 'John Doe',
        email: 'john.doe@example.com',
        avatar: 'https://i.pravatar.cc/300',
        joinedDate: 'January 2025',
        totalInterviews: 15,
        averageScore: 83,
        streak: 7,
        rank: 'Advanced',
    };

    return (
        <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
            <View style={styles.header}>
                <Image source={{ uri: user.avatar }} style={styles.avatar} />
                <Text style={styles.name}>{user.name}</Text>
                <Text style={styles.email}>{user.email}</Text>
                <View style={styles.rankBadge}>
                    <Ionicons name="trophy" size={16} color="#F59E0B" />
                    <Text style={styles.rankText}>{user.rank}</Text>
                </View>
            </View>

            <View style={styles.statsContainer}>
                <StatCard
                    icon="bar-chart"
                    label="Total Interviews"
                    value={user.totalInterviews}
                    color="#3B82F6"
                />
                <StatCard
                    icon="trending-up"
                    label="Average Score"
                    value={`${user.averageScore}%`}
                    color="#10B981"
                />
                <StatCard
                    icon="flame"
                    label="Day Streak"
                    value={user.streak}
                    color="#EF4444"
                />
            </View>

            <View style={styles.section}>
                <Text style={styles.sectionTitle}>Account</Text>
                <View style={styles.menuContainer}>
                    <MenuItem icon="person-outline" label="Edit Profile" />
                    <MenuItem icon="notifications-outline" label="Notifications" />
                    <MenuItem icon="lock-closed-outline" label="Privacy" />
                    <MenuItem icon="settings-outline" label="Settings" />
                </View>
            </View>

            <View style={styles.section}>
                <Text style={styles.sectionTitle}>Progress</Text>
                <View style={styles.menuContainer}>
                    <MenuItem icon="analytics-outline" label="Performance Analytics" />
                    <MenuItem icon="ribbon-outline" label="Achievements" />
                    <MenuItem icon="calendar-outline" label="Interview History" />
                </View>
            </View>

            <View style={styles.section}>
                <Text style={styles.sectionTitle}>Support</Text>
                <View style={styles.menuContainer}>
                    <MenuItem icon="help-circle-outline" label="Help Center" />
                    <MenuItem icon="chatbubble-outline" label="Contact Support" />
                    <MenuItem icon="document-text-outline" label="Terms & Privacy" />
                </View>
            </View>

            <Pressable style={styles.logoutButton}>
                <Ionicons name="log-out-outline" size={20} color="#EF4444" />
                <Text style={styles.logoutText}>Log Out</Text>
            </Pressable>

            <Text style={styles.joinedText}>Member since {user.joinedDate}</Text>
        </ScrollView>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#0a0a0a',
    },
    header: {
        alignItems: 'center',
        paddingTop: 20,
        paddingBottom: 30,
    },
    avatar: {
        width: 100,
        height: 100,
        borderRadius: 50,
        marginBottom: 16,
        borderWidth: 3,
        borderColor: '#3B82F6',
    },
    name: {
        fontSize: 24,
        fontFamily: 'Inter_700Bold',
        color: '#fff',
        marginBottom: 4,
    },
    email: {
        fontSize: 16,
        fontFamily: 'Inter_400Regular',
        color: '#6B7280',
        marginBottom: 12,
    },
    rankBadge: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: '#1a1a1a',
        paddingHorizontal: 16,
        paddingVertical: 8,
        borderRadius: 20,
        borderWidth: 1,
        borderColor: '#333',
        gap: 6,
    },
    rankText: {
        fontSize: 14,
        fontFamily: 'Inter_600SemiBold',
        color: '#F59E0B',
    },
    statsContainer: {
        flexDirection: 'row',
        justifyContent: 'space-evenly',
        paddingHorizontal: 20,
        marginBottom: 30,
    },
    statCard: {
        alignItems: 'center',
        backgroundColor: '#1a1a1a',
        padding: 16,
        borderRadius: 16,
        borderWidth: 1,
        borderColor: '#333',
        flex: 1,
        marginHorizontal: 6,
    },
    statValue: {
        fontSize: 20,
        fontFamily: 'Inter_700Bold',
        color: '#fff',
        marginTop: 8,
        marginBottom: 4,
    },
    statLabel: {
        fontSize: 12,
        fontFamily: 'Inter_400Regular',
        color: '#6B7280',
    },
    section: {
        paddingHorizontal: 20,
        marginBottom: 24,
    },
    sectionTitle: {
        fontSize: 18,
        fontFamily: 'Inter_600SemiBold',
        color: '#fff',
        marginBottom: 12,
    },
    menuContainer: {
        backgroundColor: '#1a1a1a',
        borderRadius: 16,
        borderWidth: 1,
        borderColor: '#333',
        overflow: 'hidden',
    },
    menuItem: {
        flexDirection: 'row',
        alignItems: 'center',
        padding: 16,
        borderBottomWidth: 1,
        borderBottomColor: '#333',
    },
    menuLabel: {
        flex: 1,
        fontSize: 16,
        fontFamily: 'Inter_500Medium',
        color: '#fff',
        marginLeft: 12,
    },
    logoutButton: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: '#1a1a1a',
        marginHorizontal: 20,
        marginBottom: 16,
        padding: 16,
        borderRadius: 16,
        borderWidth: 1,
        borderColor: '#EF4444',
        gap: 8,
    },
    logoutText: {
        fontSize: 16,
        fontFamily: 'Inter_600SemiBold',
        color: '#EF4444',
    },
    joinedText: {
        textAlign: 'center',
        fontSize: 14,
        fontFamily: 'Inter_400Regular',
        color: '#6B7280',
        marginBottom: 40,
    },
});