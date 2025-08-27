import React, { useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Alert, Platform } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import * as Haptics from 'expo-haptics';
import { useAuth } from '@/context/authentication/AuthContext';
import { useToast } from '@/components/Toast';
import { useRouter, useFocusEffect } from 'expo-router';
import { useUserJobs } from '../../../_queries/jobs/jobs';
import { useCV } from '../../../_queries/interviews/cv';
import { useUserStats } from '../../../_queries/users/stats';
import usePosthogSafely from '../../../hooks/posthog/usePosthogSafely';
import useHapticsSafely from '../../../hooks/haptics/useHapticsSafely';
import { ImpactFeedbackStyle } from 'expo-haptics';
import ChatGPTBackground from '../../../components/ChatGPTBackground';
import { TYPOGRAPHY } from '../../../constants/Typography';
import { GlassStyles, GlassTextColors } from '../../../constants/GlassStyles';
import Colors from '../../../constants/Colors';

const StatCard = ({ icon, label, value, color = Colors.brand.primary }: any) => (
    <View style={styles.statCard}>
        <Ionicons name={icon} size={24} color={color} />
        <Text style={styles.statValue}>{value}</Text>
        <Text style={styles.statLabel}>{label}</Text>
    </View>
);

const getScoreIconAndColor = (score: number | null | string) => {
    // Handle string values (like "85%") by extracting the number
    let numericScore: number | null = null;
    
    if (typeof score === 'string') {
        const match = score.match(/(\d+)/);
        numericScore = match ? parseInt(match[1], 10) : null;
    } else {
        numericScore = score;
    }
    
    if (numericScore === null || numericScore === undefined) {
        return { icon: 'trending-up', color: Colors.semantic.successAlt };
    }
    
    if (numericScore < 40) {
        return { icon: 'trending-down', color: Colors.semantic.error }; // Red for low scores
    } else if (numericScore >= 40 && numericScore < 70) {
        return { icon: 'arrow-forward', color: Colors.semantic.warning }; // Yellow/orange for medium scores
    } else {
        return { icon: 'trending-up', color: Colors.semantic.successAlt }; // Green for high scores
    }
};

const MenuItem = ({ icon, label, onPress }: any) => (
    <TouchableOpacity style={styles.menuButton} onPress={() => {
        Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
        onPress();
    }} activeOpacity={0.8}>
        <View style={styles.menuIconContainer}>
            <Ionicons name={icon} size={20} color={Colors.text.tertiary} />
        </View>
        <Text style={styles.menuLabel}>{label}</Text>
        <Ionicons name="chevron-forward" size={16} color={Colors.text.tertiary} />
    </TouchableOpacity>
);

export default function Profile() {
    const { auth, logout, logoutLoading, logoutSuccess, logoutErrorMessage, clearLogoutError, resetLogout } = useAuth();
    const { showToast } = useToast();
    const router = useRouter();
    const { data: jobsData } = useUserJobs(5); // Only fetch 5 for profile display
    const jobs = jobsData?.pages[0]?.jobs || [];
    const { data: currentCV } = useCV();
    const { data: userStats } = useUserStats();
    const { posthogScreen, posthogCapture } = usePosthogSafely();
    const { impactAsync, selectionAsync } = useHapticsSafely();

    useFocusEffect(
        React.useCallback(() => {
            if (Platform.OS === 'web') return;
            posthogScreen('profile');
        }, [posthogScreen])
    );

    // Handle logout error
    useEffect(() => {
        if (logoutErrorMessage) {
            showToast(logoutErrorMessage, 'error');
            clearLogoutError();
        }
    }, [logoutErrorMessage, showToast, clearLogoutError]);

    const formatDate = (dateString: string) => {
        return new Date(dateString).toLocaleDateString('en-US', {
            month: 'short',
            day: 'numeric',
            year: 'numeric'
        });
    };

    const getIndustryRole = () => {
        if (!jobs || jobs.length === 0) {
            return 'Industry / Role: Not specified';
        }
        
        // Get the most recent job to determine target role
        const latestJob = jobs[0];
        const roleTitle = latestJob.role_title || 'Software Engineer';
        
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

    const getMemberSinceDate = () => {
        if (!auth?.created_at) return 'January 2025';
        
        const createdDate = new Date(auth.created_at);
        return createdDate.toLocaleDateString('en-US', {
            month: 'long',
            year: 'numeric'
        });
    };

    const getAverageScoreDisplay = () => {
        if (userStats?.average_score !== null && userStats?.average_score !== undefined) {
            return `${Math.round(userStats.average_score)}%`;
        }
        return 'N/A';
    };

    const user = {
        name: auth?.name || 'User',
        email: auth?.email || 'user@example.com',
        joinedDate: getMemberSinceDate(),
        totalInterviews: userStats?.total_attempts || 0,
        averageScore: getAverageScoreDisplay(),
        streak: auth?.streak || 0,
        rank: 'Advanced',
    };

    const handleJobPress = (jobId: string) => {
        posthogCapture('view_job_details', {
            source: 'profile',
            job_id: jobId
        });
        router.push(`/jobs/${jobId}` as any);
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
                            posthogCapture('user_logout', {
                                total_interviews: userStats?.total_attempts || 0,
                                has_cv: !!currentCV,
                                user_rank: user.rank
                            });
                            await logout();
                            showToast('Logged out successfully', 'info');
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
        <ChatGPTBackground style={styles.gradient}>
            <SafeAreaView style={styles.container} edges={['left', 'right']}>
                <ScrollView 
                    style={styles.scrollView}
                    contentContainerStyle={styles.scrollContent}
                    showsVerticalScrollIndicator={false}
                >
            {/* Profile Header */}
            <View style={styles.header}>
                <View style={styles.headerContent}>
                    <View style={styles.headerLeft}>
                        <Text style={styles.name}>{user.name}</Text>
                        <Text style={styles.email}>{user.email}</Text>
                    </View>
                    <View style={styles.headerRight}>
                        <Text style={styles.industry}>{getIndustryRole().split(' / ')[0] || 'Tech'}</Text>
                    </View>
                </View>
                
            </View>

            {/* CV Section - Pill Button */}
            <TouchableOpacity 
                style={styles.cvButton} 
                onPress={() => {
                    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
                    posthogCapture('navigate_to_cv_upload', {
                        source: 'profile',
                        has_existing_cv: !!currentCV
                    });
                    router.push('/interviews/cv-upload');
                }}
                activeOpacity={0.9}
            >
                <View style={styles.cvIcon}>
                    <Ionicons name="document-text" size={20} color={currentCV ? Colors.semantic.successAlt : Colors.brand.primary} />
                </View>
                <View style={styles.cvInfo}>
                    <Text style={styles.cvTitle}>
                        {currentCV ? "Your CV" : "Upload Your CV"}
                    </Text>
                    <Text style={styles.cvSubtitle}>
                        {currentCV 
                            ? `${currentCV.skills.length} skills • ${currentCV.experience_years} years experience`
                            : "Get personalized interview questions"
                        }
                    </Text>
                </View>
                <Ionicons name="chevron-forward" size={20} color={GlassTextColors.muted} />
            </TouchableOpacity>

            <View style={styles.statsContainer}>
                <StatCard
                    icon="bar-chart"
                    label="Total Interviews"
                    value={user.totalInterviews}
                    color={Colors.brand.primary}
                />
                <StatCard
                    icon={getScoreIconAndColor(user.averageScore).icon}
                    label="Average Score"
                    value={user.averageScore}
                    color={getScoreIconAndColor(user.averageScore).color}
                />
                <StatCard
                    icon="flame"
                    label="Day Streak"
                    value={user.streak}
                    color={Colors.semantic.error}
                />
            </View>

            {/* Job History Section */}
            <View style={styles.section}>
                <Text style={styles.sectionTitle}>Job History</Text>
                <View style={styles.menuContainer}>
                    {(!jobs || jobs.length === 0) ? (
                        <View style={styles.emptyState}>
                            <View style={styles.emptyStateIcon}>
                                <Ionicons name="briefcase-outline" size={32} color={Colors.text.tertiary} />
                            </View>
                            <Text style={styles.emptyStateText}>No job applications yet</Text>
                            <Text style={styles.emptyStateSubtext}>Add your first job to start practicing interviews</Text>
                        </View>
                    ) : (
                        jobs.map((job) => (
                            <TouchableOpacity
                                key={job._id}
                                onPress={() => {
                                    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
                                    handleJobPress(job._id);
                                }}
                                style={styles.jobButton}
                                activeOpacity={0.8}
                            >
                                <View style={styles.jobIcon}>
                                    <Ionicons name="briefcase" size={16} color={Colors.brand.primary} />
                                </View>
                                <View style={styles.jobInfo}>
                                    <Text style={styles.jobTitle}>{job.role_title}</Text>
                                    <Text style={styles.jobCompany}>{job.company}</Text>
                                </View>
                                <Ionicons name="chevron-forward" size={16} color={Colors.text.tertiary} />
                            </TouchableOpacity>
                        ))
                    )}
                </View>
            </View>

            {/* Account Section */}
            <View style={styles.section}>
                <Text style={styles.sectionTitle}>Account</Text>
                <View style={styles.menuContainer}>
                    <MenuItem 
                        icon="settings-outline" 
                        label="Settings"
                        onPress={() => {
                            posthogCapture('navigate_to_settings', {
                                source: 'profile'
                            });
                            router.push('/(app)/settings');
                        }}
                    />
                </View>
            </View>

            {/* Logout Button */}
            <TouchableOpacity 
                style={[styles.logoutButton, logoutLoading && styles.logoutButtonDisabled]} 
                onPress={() => {
                    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Heavy);
                    handleLogout();
                }} 
                disabled={logoutLoading}
                activeOpacity={0.8}
            >
                <Ionicons name="log-out-outline" size={20} color={Colors.semantic.error} />
                <Text style={styles.logoutText}>{logoutLoading ? 'Logging Out...' : 'Log Out'}</Text>
            </TouchableOpacity>

                </ScrollView>
            </SafeAreaView>
        </ChatGPTBackground>
    );
}

const styles = StyleSheet.create({
    gradient: {
        flex: 1,
    },
    container: {
        flex: 1,
        backgroundColor: Colors.background.transparent,
    },
    scrollView: {
        flex: 1,
        paddingHorizontal: 20,
    },
    scrollContent: {
        paddingBottom: 120,
    },
    header: {
        paddingTop: 60,
        marginBottom: 20,
    },
    headerContent: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'flex-start',
    },
    headerLeft: {
        flex: 1,
    },
    headerRight: {
        alignItems: 'flex-end',
    },
    name: {
        ...TYPOGRAPHY.pageTitle,
        color: Colors.text.primary,
        marginBottom: 4,
    },
    email: {
        ...TYPOGRAPHY.bodyMedium,
        color: Colors.text.secondary,
    },
    industry: {
        ...TYPOGRAPHY.labelLarge,
        color: Colors.brand.primary,
        fontWeight: '600' as const,
    },
    statsContainer: {
        flexDirection: 'row',
        gap: 12,
        marginBottom: 32,
    },
    statCard: {
        alignItems: 'center',
        backgroundColor: Colors.background.transparent,
        borderWidth: 1,
        borderColor: Colors.glass.border,
        borderRadius: 16,
        padding: 20,
        flex: 1,
        ...Platform.select({
            ios: {
                shadowColor: Colors.black,
                shadowOffset: { width: 0, height: 2 },
                shadowOpacity: 0.1,
                shadowRadius: 4,
            }
        }),
    },
    statIconContainer: {
        width: 48,
        height: 48,
        borderRadius: 12,
        backgroundColor: Colors.glass.backgroundSubtle,
        alignItems: 'center',
        justifyContent: 'center',
        marginBottom: 12,
        borderWidth: 1,
        borderColor: Colors.glass.borderSecondary,
    },
    statValue: {
        ...TYPOGRAPHY.pageTitle,
        color: Colors.text.primary,
        marginTop: 8,
        marginBottom: 4,
    },
    statLabel: {
        ...TYPOGRAPHY.bodySmall,
        color: Colors.text.tertiary,
    },
    section: {
        marginBottom: 28,
    },
    sectionTitle: {
        ...TYPOGRAPHY.sectionHeader,
        color: Colors.text.primary,
        marginBottom: 16,
    },
    menuContainer: {
        gap: 12,
    },
    menuButton: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: Colors.glass.background,
        borderRadius: 50,
        paddingVertical: 14,
        paddingHorizontal: 16,
    },
    menuIconContainer: {
        width: 32,
        height: 32,
        borderRadius: 16,
        backgroundColor: Colors.glass.backgroundInput,
        alignItems: 'center',
        justifyContent: 'center',
        marginRight: 12,
    },
    menuLabel: {
        flex: 1,
        ...TYPOGRAPHY.itemTitle,
        color: Colors.text.primary,
    },
    logoutButton: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: Colors.glass.error,
        marginTop: 8,
        marginBottom: 40,
        padding: 16,
        borderRadius: 50,
        borderWidth: 1,
        borderColor: Colors.glass.errorBorder,
        gap: 8,
        ...Platform.select({
            ios: {
                shadowColor: Colors.semantic.error,
                shadowOffset: { width: 0, height: 2 },
                shadowOpacity: 0.1,
                shadowRadius: 4,
            }
        }),
    },
    logoutButtonDisabled: {
        opacity: 0.6,
    },
    logoutText: {
        ...TYPOGRAPHY.labelLarge,
        fontWeight: '600' as const,
        color: Colors.semantic.error,
    },
    emptyState: {
        alignItems: 'center',
        padding: 32,
    },
    emptyStateIcon: {
        width: 64,
        height: 64,
        borderRadius: 16,
        backgroundColor: Colors.glass.backgroundSubtle,
        alignItems: 'center',
        justifyContent: 'center',
        marginBottom: 16,
        borderWidth: 1,
        borderColor: Colors.glass.borderSecondary,
    },
    emptyStateText: {
        ...TYPOGRAPHY.sectionHeader,
        color: Colors.text.primary,
        marginBottom: 8,
    },
    emptyStateSubtext: {
        ...TYPOGRAPHY.bodyMedium,
        color: Colors.text.tertiary,
        textAlign: 'center',
        lineHeight: 20,
    },
    jobButton: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: Colors.glass.background,
        borderRadius: 50,
        paddingVertical: 14,
        paddingHorizontal: 16,
    },
    jobIcon: {
        width: 32,
        height: 32,
        borderRadius: 16,
        backgroundColor: Colors.glass.backgroundInput,
        alignItems: 'center',
        justifyContent: 'center',
        marginRight: 12,
    },
    jobInfo: {
        flex: 1,
    },
    jobTitle: {
        ...TYPOGRAPHY.itemTitle,
        color: Colors.text.primary,
        marginBottom: 2,
    },
    jobCompany: {
        ...TYPOGRAPHY.bodySmall,
        color: Colors.text.secondary,
    },
    cvButton: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: Colors.glass.background,
        borderRadius: 50,
        paddingVertical: 14,
        paddingHorizontal: 16,
        marginBottom: 24,
    },
    cvIcon: {
        width: 32,
        height: 32,
        borderRadius: 16,
        backgroundColor: Colors.glass.backgroundInput,
        alignItems: 'center',
        justifyContent: 'center',
        marginRight: 12,
    },
    cvInfo: {
        flex: 1,
    },
    cvTitle: {
        ...TYPOGRAPHY.itemTitle,
        color: Colors.text.primary,
        marginBottom: 2,
    },
    cvSubtitle: {
        ...TYPOGRAPHY.bodySmall,
        color: Colors.text.tertiary,
    },
});