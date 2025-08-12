import React from 'react';
import { View, Text, StyleSheet, ScrollView, Pressable, Alert, TouchableOpacity } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { useAuth } from '@/context/authentication/AuthContext';
import { useRouter } from 'expo-router';
import { useInterviews } from '../../../_queries/interviews/interviews';
import { useCV } from '../../../_queries/interviews/cv';

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
    const { auth, logout, logoutLoading } = useAuth();
    const router = useRouter();
    const { data: interviews } = useInterviews();
    const { data: currentCV } = useCV();

    const formatDate = (dateString: string) => {
        return new Date(dateString).toLocaleDateString('en-US', {
            month: 'short',
            day: 'numeric',
            year: 'numeric'
        });
    };

    const getIndustryRole = () => {
        if (!interviews || interviews.length === 0) {
            return 'Industry / Role: Not specified';
        }
        
        // Get the most recent interview to determine target role
        const latestInterview = interviews[0];
        const roleTitle = latestInterview.role_title || 'Software Engineer';
        
        // Extract industry from company or role title
        let industry = 'Tech';
        
        // Try to infer industry from role title keywords
        if (roleTitle.toLowerCase().includes('sales') || roleTitle.toLowerCase().includes('sdr') || roleTitle.toLowerCase().includes('account')) {
            industry = 'Sales';
        } else if (roleTitle.toLowerCase().includes('marketing') || roleTitle.toLowerCase().includes('growth')) {
            industry = 'Marketing';
        } else if (roleTitle.toLowerCase().includes('product') || roleTitle.toLowerCase().includes('pm')) {
            industry = 'Product';
        } else if (roleTitle.toLowerCase().includes('engineer') || roleTitle.toLowerCase().includes('developer') || roleTitle.toLowerCase().includes('software')) {
            industry = 'Engineering';
        } else if (roleTitle.toLowerCase().includes('design') || roleTitle.toLowerCase().includes('ui') || roleTitle.toLowerCase().includes('ux')) {
            industry = 'Design';
        } else if (roleTitle.toLowerCase().includes('data') || roleTitle.toLowerCase().includes('analyst')) {
            industry = 'Data';
        }
        
        // Simplify role title for display
        let displayRole = roleTitle;
        if (roleTitle.length > 20) {
            // Truncate long titles but keep meaningful parts
            displayRole = roleTitle.split(' ').slice(0, 2).join(' ');
        }
        
        return `${industry} / ${displayRole}`;
    };

    const getExperienceText = () => {
        if (currentCV?.experience_years) {
            return `${currentCV.experience_years} years experience`;
        }
        return 'Experience level not specified';
    };

    const user = {
        name: auth?.name || 'User',
        email: auth?.email || 'user@example.com',
        joinedDate: 'January 2025',
        totalInterviews: interviews?.length || 0,
        averageScore: 83,
        streak: 7,
        rank: 'Advanced',
    };

    const handleInterviewPress = (interviewId: string) => {
        router.push(`/interviews/${interviewId}/details` as any);
    };

    const handleLogout = () => {
        Alert.alert(
            'Log Out',
            'Are you sure you want to log out?',
            [
                {
                    text: 'Cancel',
                    style: 'cancel',
                },
                {
                    text: 'Log Out',
                    style: 'destructive',
                    onPress: async () => {
                        try {
                            await logout();
                            router.replace('/(auth)/login');
                        } catch (error) {
                            console.error('Logout error:', error);
                        }
                    },
                },
            ]
        );
    };

    return (
        <LinearGradient
            colors={["#0B1023", "#0E2B3A", "#2C7A91"]}
            start={{ x: 0, y: 0 }}
            end={{ x: 0, y: 1 }}
            style={styles.gradient}
        >
        <ScrollView 
            style={styles.container} 
            contentContainerStyle={styles.scrollContent}
            showsVerticalScrollIndicator={false}
        >
            <View style={styles.header}>
                <Text style={styles.name}>{user.name}</Text>
                <Text style={styles.email}>{user.email}</Text>
                <View style={styles.profileDetailContainer}>
                    <Text style={styles.profileDetailLabel}>Target Role:</Text>
                    <Text style={styles.profileDetailValue}>{getIndustryRole().replace('Industry / Role: ', '').replace(/Industry \/ /, '')}</Text>
                </View>
                <View style={styles.profileDetailContainer}>
                    <Text style={styles.profileDetailLabel}>Experience:</Text>
                    <Text style={styles.profileDetailValue}>{getExperienceText()}</Text>
                </View>
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
                <Text style={styles.sectionTitle}>Interview History</Text>
                <View style={styles.menuContainer}>
                    {(!interviews || interviews.length === 0) ? (
                        <View style={styles.emptyState}>
                            <Ionicons name="chatbubble-outline" size={32} color="#6b7280" />
                            <Text style={styles.emptyStateText}>No practice interviews yet</Text>
                            <Text style={styles.emptyStateSubtext}>Start your first mock interview to see it here</Text>
                        </View>
                    ) : (
                        interviews.slice(0, 5).map((interview) => (
                            <TouchableOpacity
                                key={interview.id}
                                onPress={() => handleInterviewPress(interview.id)}
                                style={styles.interviewItem}
                            >
                                <View style={styles.interviewIcon}>
                                    <Ionicons name="briefcase" size={16} color="#3B82F6" />
                                </View>
                                <View style={styles.interviewInfo}>
                                    <Text style={styles.interviewTitle}>{interview.role_title}</Text>
                                    <Text style={styles.interviewCompany}>{interview.company}</Text>
                                    <Text style={styles.interviewDate}>{formatDate(interview.created_at)}</Text>
                                </View>
                                <Ionicons name="chevron-forward" size={16} color="#6B7280" />
                            </TouchableOpacity>
                        ))
                    )}
                    {interviews && interviews.length > 5 && (
                        <TouchableOpacity 
                            style={styles.viewAllButton}
                            onPress={() => router.push('/interviews')}
                        >
                            <Text style={styles.viewAllText}>View all {interviews.length} interviews</Text>
                            <Ionicons name="chevron-forward" size={16} color="#3B82F6" />
                        </TouchableOpacity>
                    )}
                </View>
            </View>

            <View style={styles.section}>
                <Text style={styles.sectionTitle}>Account</Text>
                <View style={styles.menuContainer}>
                    <MenuItem icon="settings-outline" label="Settings" />
                    <MenuItem icon="help-circle-outline" label="Help Center" />
                </View>
            </View>

            <Pressable 
                style={[styles.logoutButton, logoutLoading && styles.logoutButtonDisabled]} 
                onPress={handleLogout} 
                disabled={logoutLoading}
            >
                <Ionicons name="log-out-outline" size={20} color="#EF4444" />
                <Text style={styles.logoutText}>{logoutLoading ? 'Logging Out...' : 'Log Out'}</Text>
            </Pressable>

            <Text style={styles.joinedText}>Member since {user.joinedDate}</Text>
        </ScrollView>
        </LinearGradient>
    );
}

const styles = StyleSheet.create({
    gradient: {
        flex: 1,
    },
    container: {
        flex: 1,
        backgroundColor: 'transparent',
    },
    scrollContent: {
        paddingBottom: 120, // Extra space for nav bar + floating action button
    },
    header: {
        alignItems: 'center',
        paddingTop: 40,
        paddingBottom: 30,
    },
    name: {
        fontSize: 28,
        fontFamily: 'Inter_700Bold',
        color: '#fff',
        marginBottom: 8,
        marginTop: 8,
    },
    email: {
        fontSize: 16,
        fontFamily: 'Inter_400Regular',
        color: '#6B7280',
        marginBottom: 8,
    },
    profileDetailContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 6,
        paddingHorizontal: 20,
    },
    profileDetailLabel: {
        fontSize: 14,
        fontFamily: 'Inter_500Medium',
        color: '#6B7280',
        marginRight: 8,
        minWidth: 80,
    },
    profileDetailValue: {
        fontSize: 14,
        fontFamily: 'Inter_600SemiBold',
        color: '#3B82F6',
        flex: 1,
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
        marginTop: 8,
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
        backgroundColor: 'rgba(255,255,255,0.06)',
        padding: 16,
        borderRadius: 16,
        borderWidth: 1,
        borderColor: 'rgba(255,255,255,0.08)',
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
        backgroundColor: 'rgba(255,255,255,0.06)',
        borderRadius: 16,
        borderWidth: 1,
        borderColor: 'rgba(255,255,255,0.08)',
        overflow: 'hidden',
    },
    menuItem: {
        flexDirection: 'row',
        alignItems: 'center',
        padding: 16,
        borderBottomWidth: 1,
        borderBottomColor: 'rgba(255,255,255,0.08)',
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
        backgroundColor: 'rgba(255,255,255,0.06)',
        marginHorizontal: 20,
        marginBottom: 16,
        padding: 16,
        borderRadius: 16,
        borderWidth: 1,
        borderColor: 'rgba(239,68,68,0.45)',
        gap: 8,
    },
    logoutButtonDisabled: {
        opacity: 0.6,
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
    emptyState: {
        alignItems: 'center',
        padding: 24,
    },
    emptyStateText: {
        fontSize: 16,
        fontFamily: 'Inter_500Medium',
        color: '#9CA3AF',
        marginTop: 12,
        marginBottom: 4,
    },
    emptyStateSubtext: {
        fontSize: 14,
        fontFamily: 'Inter_400Regular',
        color: '#6B7280',
        textAlign: 'center',
    },
    interviewItem: {
        flexDirection: 'row',
        alignItems: 'center',
        padding: 16,
        borderBottomWidth: 1,
        borderBottomColor: 'rgba(255,255,255,0.08)',
    },
    interviewIcon: {
        width: 32,
        height: 32,
        borderRadius: 16,
        backgroundColor: 'rgba(59, 130, 246, 0.15)',
        alignItems: 'center',
        justifyContent: 'center',
        marginRight: 12,
    },
    interviewInfo: {
        flex: 1,
    },
    interviewTitle: {
        fontSize: 16,
        fontFamily: 'Inter_600SemiBold',
        color: '#fff',
        marginBottom: 2,
    },
    interviewCompany: {
        fontSize: 14,
        fontFamily: 'Inter_400Regular',
        color: '#9CA3AF',
        marginBottom: 2,
    },
    interviewDate: {
        fontSize: 12,
        fontFamily: 'Inter_400Regular',
        color: '#6B7280',
    },
    viewAllButton: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        padding: 16,
        borderTopWidth: 1,
        borderTopColor: 'rgba(255,255,255,0.08)',
    },
    viewAllText: {
        fontSize: 14,
        fontFamily: 'Inter_500Medium',
        color: '#3B82F6',
        marginRight: 4,
    },
});