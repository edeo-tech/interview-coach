import React, { useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Alert, Platform } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
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

const StatCard = ({ icon, label, value, color = '#A855F7' }: any) => (
    <View style={styles.statCard}>
        <View style={styles.statIconContainer}>
            <Ionicons name={icon} size={24} color={color} />
        </View>
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
        return { icon: 'trending-up', color: '#10B981' };
    }
    
    if (numericScore < 40) {
        return { icon: 'trending-down', color: '#EF4444' }; // Red for low scores
    } else if (numericScore >= 40 && numericScore < 70) {
        return { icon: 'arrow-forward', color: '#F59E0B' }; // Yellow/orange for medium scores
    } else {
        return { icon: 'trending-up', color: '#10B981' }; // Green for high scores
    }
};

const MenuItem = ({ icon, label, onPress }: any) => (
    <TouchableOpacity style={styles.menuItem} onPress={() => {
        // Light impact for menu navigation - minor action
        useHapticsSafely().impactAsync(ImpactFeedbackStyle.Light);
        onPress();
    }} activeOpacity={0.8}>
        <View style={styles.menuIconContainer}>
            <Ionicons name={icon} size={20} color="rgba(255, 255, 255, 0.7)" />
        </View>
        <Text style={styles.menuLabel}>{label}</Text>
        <Ionicons name="chevron-forward" size={16} color="rgba(255, 255, 255, 0.7)" />
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
        <View style={styles.container}>
        <ScrollView 
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
                    <Ionicons name="trophy" size={16} color="#A855F7" />
                    <Text style={styles.rankText}>{user.rank}</Text>
                </View>
            </View>

            <View style={styles.cvSection}>
                <TouchableOpacity 
                    style={styles.cvContainer} 
                    onPress={() => {
                        // Medium impact for CV upload - important profile action
                        impactAsync(ImpactFeedbackStyle.Medium);
                        posthogCapture('navigate_to_cv_upload', {
                            source: 'profile',
                            has_existing_cv: !!currentCV
                        });
                        router.push('/interviews/cv-upload');
                    }}
                    activeOpacity={0.9}
                >
                    <View style={styles.cvLeft}>
                        <Ionicons name="document-text" size={28} color={currentCV ? "#10B981" : "#A855F7"} />
                    </View>
                    <View style={styles.cvInfo}>
                        <Text style={styles.cvTitle}>
                            {currentCV ? "Your CV" : "Upload Your CV"}
                        </Text>
                        <Text style={styles.cvSubtitle}>
                            {currentCV 
                                ? `${currentCV.skills.length} skills • ${currentCV.experience_years} years experience`
                                : "Get personalized interview questions tailored to your background"
                            }
                        </Text>
                    </View>
                    <Ionicons name="create-outline" size={22} color="rgba(255, 255, 255, 0.7)" />
                </TouchableOpacity>
            </View>

            <View style={styles.statsContainer}>
                <StatCard
                    icon="bar-chart"
                    label="Total Interviews"
                    value={user.totalInterviews}
                    color="#A855F7"
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
                    color="#EF4444"
                />
            </View>

            <View style={styles.section}>
                <Text style={styles.sectionTitle}>Job History</Text>
                <View style={styles.menuContainer}>
                    {(!jobs || jobs.length === 0) ? (
                        <View style={styles.emptyState}>
                            <View style={styles.emptyStateIcon}>
                                <Ionicons name="briefcase-outline" size={32} color="rgba(255, 255, 255, 0.7)" />
                            </View>
                            <Text style={styles.emptyStateText}>No job applications yet</Text>
                            <Text style={styles.emptyStateSubtext}>Add your first job to start practicing interviews</Text>
                        </View>
                    ) : (
                        jobs.map((job) => (
                            <TouchableOpacity
                                key={job._id}
                                onPress={() => {
                                    // Selection haptic for job history items
                                    selectionAsync();
                                    handleJobPress(job._id);
                                }}
                                style={styles.jobItem}
                                activeOpacity={0.8}
                            >
                                <View style={styles.jobIcon}>
                                    <Ionicons name="briefcase" size={16} color="#A855F7" />
                                </View>
                                <View style={styles.jobInfo}>
                                    <Text style={styles.jobTitle}>{job.role_title}</Text>
                                    <Text style={styles.jobCompany}>{job.company}</Text>
                                    <View style={styles.jobMetaContainer}>
                                        <Text style={styles.jobLocation}>{job.location}</Text>
                                        <Text style={styles.jobDate}>• {formatDate(job.created_at)}</Text>
                                    </View>
                                </View>
                                <View style={styles.jobStatusContainer}>
                                    <Text style={styles.jobStatus}>{job.status}</Text>
                                    <Ionicons name="chevron-forward" size={16} color="rgba(255, 255, 255, 0.7)" />
                                </View>
                            </TouchableOpacity>
                        ))
                    )}
                </View>
            </View>

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
                    <MenuItem 
                        icon="document-text-outline" 
                        label="Terms of Service"
                        onPress={() => {
                            posthogCapture('view_terms_of_service', {
                                source: 'profile'
                            });
                            router.push('/(app)/terms');
                        }}
                    />
                </View>
            </View>

            <TouchableOpacity 
                style={[styles.logoutButton, logoutLoading && styles.logoutButtonDisabled]} 
                onPress={() => {
                    // Heavy impact for logout - critical destructive action
                    impactAsync(ImpactFeedbackStyle.Heavy);
                    handleLogout();
                }} 
                disabled={logoutLoading}
                activeOpacity={0.8}
            >
                <Ionicons name="log-out-outline" size={20} color="#EF4444" />
                <Text style={styles.logoutText}>{logoutLoading ? 'Logging Out...' : 'Log Out'}</Text>
            </TouchableOpacity>

            <Text style={styles.joinedText}>Member since {user.joinedDate}</Text>
        </ScrollView>
        </View>
        </ChatGPTBackground>
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
        paddingTop: 62,
        paddingBottom: 24,
    },
    name: {
        fontSize: 32,
        fontWeight: '800',
        color: '#FFFFFF',
        marginBottom: 8,
        marginTop: 8,
        fontFamily: Platform.OS === 'ios' ? 'SpaceGrotesk' : 'sans-serif',
        letterSpacing: -0.02,
    },
    email: {
        fontSize: 16,
        fontWeight: '400',
        color: 'rgba(255, 255, 255, 0.7)',
        marginBottom: 16,
        fontFamily: Platform.OS === 'ios' ? 'Inter' : 'sans-serif',
        lineHeight: 24,
    },
    profileDetailContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 8,
        paddingHorizontal: 20,
    },
    profileDetailLabel: {
        fontSize: 14,
        fontWeight: '500',
        color: 'rgba(255, 255, 255, 0.7)',
        marginRight: 8,
        minWidth: 80,
        fontFamily: Platform.OS === 'ios' ? 'Inter' : 'sans-serif',
        letterSpacing: 0.01,
    },
    profileDetailValue: {
        fontSize: 14,
        fontWeight: '600',
        color: '#A855F7',
        flex: 1,
        fontFamily: Platform.OS === 'ios' ? 'Inter' : 'sans-serif',
        letterSpacing: 0,
    },
    rankBadge: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: 'rgba(168, 85, 247, 0.15)',
        paddingHorizontal: 16,
        paddingVertical: 8,
        borderRadius: 20,
        borderWidth: 1,
        borderColor: 'rgba(168, 85, 247, 0.3)',
        gap: 6,
        marginTop: 12,
    },
    rankText: {
        fontSize: 14,
        fontWeight: '600',
        color: '#A855F7',
        fontFamily: Platform.OS === 'ios' ? 'Inter' : 'sans-serif',
        letterSpacing: 0.01,
    },
    statsContainer: {
        flexDirection: 'row',
        justifyContent: 'space-evenly',
        paddingHorizontal: 20,
        marginBottom: 30,
    },
    statCard: {
        alignItems: 'center',
        backgroundColor: 'rgba(255, 255, 255, 0.12)',
        borderWidth: 1,
        borderColor: 'rgba(255, 255, 255, 0.15)',
        borderRadius: 16,
        padding: 20,
        flex: 1,
        marginHorizontal: 6,
        ...Platform.select({
            ios: {
                shadowColor: '#000',
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
        backgroundColor: 'rgba(255, 255, 255, 0.08)',
        alignItems: 'center',
        justifyContent: 'center',
        marginBottom: 12,
        borderWidth: 1,
        borderColor: 'rgba(255, 255, 255, 0.12)',
    },
    statValue: {
        fontSize: 24,
        fontWeight: '700',
        color: '#FFFFFF',
        marginBottom: 4,
        fontFamily: Platform.OS === 'ios' ? 'Inter' : 'sans-serif',
        letterSpacing: 0,
    },
    statLabel: {
        fontSize: 12,
        fontWeight: '500',
        color: 'rgba(255, 255, 255, 0.7)',
        fontFamily: Platform.OS === 'ios' ? 'Inter' : 'sans-serif',
        letterSpacing: 0.02,
    },
    section: {
        paddingHorizontal: 20,
        marginBottom: 24,
    },
    sectionTitle: {
        fontSize: 20,
        fontWeight: '600',
        color: '#FFFFFF',
        marginBottom: 16,
        fontFamily: Platform.OS === 'ios' ? 'Inter' : 'sans-serif',
        letterSpacing: 0,
    },
    menuContainer: {
        backgroundColor: 'rgba(255, 255, 255, 0.12)',
        borderWidth: 1,
        borderColor: 'rgba(255, 255, 255, 0.15)',
        borderRadius: 16,
        overflow: 'hidden',
        ...Platform.select({
            ios: {
                shadowColor: '#000',
                shadowOffset: { width: 0, height: 2 },
                shadowOpacity: 0.1,
                shadowRadius: 4,
            }
        }),
    },
    menuItem: {
        flexDirection: 'row',
        alignItems: 'center',
        padding: 16,
        borderBottomWidth: 1,
        borderBottomColor: 'rgba(255, 255, 255, 0.08)',
    },
    menuIconContainer: {
        width: 32,
        height: 32,
        borderRadius: 8,
        backgroundColor: 'rgba(255, 255, 255, 0.08)',
        alignItems: 'center',
        justifyContent: 'center',
        marginRight: 12,
        borderWidth: 1,
        borderColor: 'rgba(255, 255, 255, 0.12)',
    },
    menuLabel: {
        flex: 1,
        fontSize: 16,
        fontWeight: '500',
        color: '#FFFFFF',
        fontFamily: Platform.OS === 'ios' ? 'Inter' : 'sans-serif',
        letterSpacing: 0,
    },
    logoutButton: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: 'rgba(239, 68, 68, 0.15)',
        marginHorizontal: 20,
        marginBottom: 16,
        padding: 16,
        borderRadius: 16,
        borderWidth: 1,
        borderColor: 'rgba(239, 68, 68, 0.3)',
        gap: 8,
        ...Platform.select({
            ios: {
                shadowColor: '#EF4444',
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
        fontSize: 16,
        fontWeight: '600',
        color: '#EF4444',
        fontFamily: Platform.OS === 'ios' ? 'Inter' : 'sans-serif',
        letterSpacing: 0.01,
    },
    joinedText: {
        textAlign: 'center',
        fontSize: 14,
        fontWeight: '400',
        color: 'rgba(255, 255, 255, 0.55)',
        marginBottom: 40,
        fontFamily: Platform.OS === 'ios' ? 'Inter' : 'sans-serif',
        letterSpacing: 0.02,
    },
    emptyState: {
        alignItems: 'center',
        padding: 32,
    },
    emptyStateIcon: {
        width: 64,
        height: 64,
        borderRadius: 16,
        backgroundColor: 'rgba(255, 255, 255, 0.08)',
        alignItems: 'center',
        justifyContent: 'center',
        marginBottom: 16,
        borderWidth: 1,
        borderColor: 'rgba(255, 255, 255, 0.12)',
    },
    emptyStateText: {
        fontSize: 18,
        fontWeight: '600',
        color: '#FFFFFF',
        marginBottom: 8,
        fontFamily: Platform.OS === 'ios' ? 'Inter' : 'sans-serif',
        letterSpacing: 0,
    },
    emptyStateSubtext: {
        fontSize: 14,
        fontWeight: '400',
        color: 'rgba(255, 255, 255, 0.7)',
        textAlign: 'center',
        fontFamily: Platform.OS === 'ios' ? 'Inter' : 'sans-serif',
        lineHeight: 20,
    },
    jobItem: {
        flexDirection: 'row',
        alignItems: 'center',
        padding: 16,
        borderBottomWidth: 1,
        borderBottomColor: 'rgba(255, 255, 255, 0.08)',
    },
    jobIcon: {
        width: 32,
        height: 32,
        borderRadius: 8,
        backgroundColor: 'rgba(168, 85, 247, 0.15)',
        alignItems: 'center',
        justifyContent: 'center',
        marginRight: 12,
        borderWidth: 1,
        borderColor: 'rgba(168, 85, 247, 0.3)',
    },
    jobInfo: {
        flex: 1,
    },
    jobTitle: {
        fontSize: 16,
        fontWeight: '600',
        color: '#FFFFFF',
        marginBottom: 4,
        fontFamily: Platform.OS === 'ios' ? 'Inter' : 'sans-serif',
        letterSpacing: 0,
    },
    jobCompany: {
        fontSize: 14,
        fontWeight: '500',
        color: 'rgba(255, 255, 255, 0.85)',
        marginBottom: 4,
        fontFamily: Platform.OS === 'ios' ? 'Inter' : 'sans-serif',
        lineHeight: 18,
    },
    jobMetaContainer: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    jobLocation: {
        fontSize: 12,
        fontWeight: '400',
        color: 'rgba(255, 255, 255, 0.55)',
        fontFamily: Platform.OS === 'ios' ? 'Inter' : 'sans-serif',
        letterSpacing: 0.02,
    },
    jobDate: {
        fontSize: 12,
        fontWeight: '400',
        color: 'rgba(255, 255, 255, 0.55)',
        fontFamily: Platform.OS === 'ios' ? 'Inter' : 'sans-serif',
        letterSpacing: 0.02,
        marginLeft: 4,
    },
    jobStatusContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 8,
    },
    jobStatus: {
        fontSize: 12,
        fontWeight: '500',
        color: '#10B981',
        fontFamily: Platform.OS === 'ios' ? 'Inter' : 'sans-serif',
        letterSpacing: 0.02,
        textTransform: 'capitalize',
    },
    cvSection: {
        paddingHorizontal: 20,
        marginBottom: 24,
        marginTop: 8,
    },
    cvContainer: {
        backgroundColor: 'rgba(168, 85, 247, 0.15)',
        borderRadius: 20,
        borderWidth: 2,
        borderColor: 'rgba(168, 85, 247, 0.3)',
        flexDirection: 'row',
        alignItems: 'center',
        padding: 20,
        ...Platform.select({
            ios: {
                shadowColor: '#A855F7',
                shadowOffset: { width: 0, height: 4 },
                shadowOpacity: 0.3,
                shadowRadius: 12,
            }
        }),
    },
    cvLeft: {
        width: 56,
        height: 56,
        borderRadius: 16,
        backgroundColor: 'rgba(168, 85, 247, 0.25)',
        alignItems: 'center',
        justifyContent: 'center',
        marginRight: 16,
        borderWidth: 2,
        borderColor: 'rgba(168, 85, 247, 0.4)',
    },
    cvInfo: {
        flex: 1,
    },
    cvTitle: {
        fontSize: 18,
        fontWeight: '700',
        color: '#FFFFFF',
        marginBottom: 6,
        fontFamily: Platform.OS === 'ios' ? 'Inter' : 'sans-serif',
        letterSpacing: 0,
    },
    cvSubtitle: {
        fontSize: 14,
        fontWeight: '500',
        color: 'rgba(255, 255, 255, 0.85)',
        lineHeight: 20,
        fontFamily: Platform.OS === 'ios' ? 'Inter' : 'sans-serif',
        letterSpacing: 0.01,
    },
});