import React from 'react';
import { View, Text, TouchableOpacity, ScrollView, StyleSheet } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { router } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { BlurView } from 'expo-blur';
import ChatGPTBackground from './ChatGPTBackground';
import { GlassStyles, GlassTextColors } from '../constants/GlassStyles';
import { CVProfile } from '../_api/interviews/cv';
import usePosthogSafely from '../hooks/posthog/usePosthogSafely';

interface CVProfileDisplayProps {
  profile: CVProfile;
}

const CVProfileDisplay: React.FC<CVProfileDisplayProps> = ({ profile }) => {
  const { posthogCapture } = usePosthogSafely();

  const handleContinue = () => {
    posthogCapture('cv_profile_continue', {
      skills_count: profile.skills.length,
      experience_years: profile.experience_years,
      has_education: profile.education.length > 0,
      has_certifications: profile.certifications.length > 0,
    });
    router.push('/interviews/create');
  };

  const getExperienceLevel = () => {
    if (profile.experience_years <= 2) return { level: 'Junior', color: '#10b981', icon: 'leaf-outline' };
    if (profile.experience_years <= 5) return { level: 'Mid-Level', color: '#f59e0b', icon: 'trending-up-outline' };
    return { level: 'Senior', color: '#8b5cf6', icon: 'star-outline' };
  };

  const experienceInfo = getExperienceLevel();

  return (
    <ChatGPTBackground style={styles.container}>
      <SafeAreaView style={styles.safeArea}>
        <View style={styles.content}>
          {/* Header */}
          <View style={styles.header}>
            <View style={styles.successBadge}>
              <Ionicons name="checkmark-circle" size={22} color="#10b981" />
            </View>
            <Text style={styles.headerTitle}>Profile Created!</Text>
            <Text style={styles.headerSubtitle}>
              We understand your background and experience
            </Text>
          </View>

          {/* Experience Level - No container */}
          <View style={styles.experienceSection}>
            <View style={[styles.experienceIcon, { backgroundColor: `${experienceInfo.color}20` }]}>
              <Ionicons name={experienceInfo.icon as any} size={20} color={experienceInfo.color} />
            </View>
            <View style={styles.experienceInfo}>
              <Text style={styles.experienceLevel}>{experienceInfo.level} Developer</Text>
              <Text style={styles.experienceYears}>
                {profile.experience_years} years of experience
              </Text>
            </View>
          </View>

          {/* Skills Section - Compact */}
          {profile.skills.length > 0 && (
            <View style={styles.section}>
              <View style={styles.sectionHeader}>
                <Ionicons name="code-slash-outline" size={16} color={GlassTextColors.accent} />
                <Text style={styles.sectionTitle}>Core Skills</Text>
              </View>
              <View style={styles.skillsGrid}>
                {profile.skills.slice(0, 8).map((skill, index) => (
                  <View key={index} style={styles.skillChip}>
                    <Text style={styles.skillText}>{skill}</Text>
                  </View>
                ))}
                {profile.skills.length > 8 && (
                  <View style={styles.skillChip}>
                    <Text style={styles.skillText}>+{profile.skills.length - 8}</Text>
                  </View>
                )}
              </View>
            </View>
          )}

          {/* Education & Certifications - Side by Side */}
          <View style={styles.bottomSections}>
            {/* Education */}
            {profile.education.length > 0 && (
              <View style={styles.halfSection}>
                <View style={styles.sectionHeader}>
                  <Ionicons name="school-outline" size={16} color={GlassTextColors.accent} />
                  <Text style={styles.sectionTitle}>Education</Text>
                </View>
                <View>
                  {profile.education.slice(0, 2).map((edu: any, index) => (
                    <View key={index} style={styles.compactItem}>
                      <Text style={styles.compactTitle}>
                        {edu.degree || edu.qualification || 'Degree'}
                      </Text>
                      {edu.institution && (
                        <Text style={styles.compactSubtitle}>{edu.institution}</Text>
                      )}
                    </View>
                  ))}
                </View>
              </View>
            )}

            {/* Certifications */}
            {profile.certifications.length > 0 && (
              <View style={styles.halfSection}>
                <View style={styles.sectionHeader}>
                  <Ionicons name="ribbon-outline" size={16} color={GlassTextColors.accent} />
                  <Text style={styles.sectionTitle}>Certifications</Text>
                </View>
                <View>
                  {profile.certifications.slice(0, 2).map((cert, index) => (
                    <View key={index} style={styles.compactItem}>
                      <View style={styles.certificationRow}>
                        <Ionicons name="checkmark-circle" size={12} color="#10b981" />
                        <Text style={styles.compactTitle} numberOfLines={1}>{cert}</Text>
                      </View>
                    </View>
                  ))}
                  {profile.certifications.length > 2 && (
                    <Text style={styles.moreText}>+{profile.certifications.length - 2} more</Text>
                  )}
                </View>
              </View>
            )}
          </View>

          {/* Continue Button */}
          <TouchableOpacity onPress={handleContinue} style={styles.continueButton}>
            <LinearGradient
              colors={['rgba(139, 92, 246, 0.8)', 'rgba(236, 72, 153, 0.6)']}
              style={styles.continueGradient}
            >
              <Text style={styles.continueText}>Continue to Create Interview</Text>
              <Ionicons name="arrow-forward" size={18} color="#ffffff" />
            </LinearGradient>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    </ChatGPTBackground>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  safeArea: {
    flex: 1,
  },
  content: {
    flex: 1,
    paddingHorizontal: 24,
    paddingVertical: 16,
    justifyContent: 'space-between',
  },
  header: {
    alignItems: 'center',
    paddingBottom: 12,
  },
  successBadge: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: 'rgba(16, 185, 129, 0.2)',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 10,
    borderWidth: 1,
    borderColor: 'rgba(16, 185, 129, 0.3)',
  },
  headerTitle: {
    color: GlassTextColors.primary,
    fontSize: 26,
    fontWeight: '700',
    marginBottom: 6,
    textAlign: 'center',
  },
  headerSubtitle: {
    color: GlassTextColors.secondary,
    fontSize: 15,
    textAlign: 'center',
    lineHeight: 20,
    paddingHorizontal: 12,
  },
  experienceSection: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 14,
    paddingVertical: 4,
    marginBottom: 4,
  },
  experienceIcon: {
    width: 44,
    height: 44,
    borderRadius: 22,
    alignItems: 'center',
    justifyContent: 'center',
  },
  experienceInfo: {
    flex: 1,
  },
  experienceLevel: {
    color: GlassTextColors.primary,
    fontSize: 20,
    fontWeight: '700',
    marginBottom: 3,
  },
  experienceYears: {
    color: GlassTextColors.secondary,
    fontSize: 14,
  },
  section: {
    paddingVertical: 6,
  },
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 10,
  },
  sectionTitle: {
    color: GlassTextColors.primary,
    fontSize: 16,
    fontWeight: '600',
  },
  skillsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  skillChip: {
    backgroundColor: 'rgba(139, 92, 246, 0.15)',
    borderRadius: 14,
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderWidth: 1,
    borderColor: 'rgba(139, 92, 246, 0.2)',
  },
  skillText: {
    color: GlassTextColors.primary,
    fontSize: 13,
    fontWeight: '500',
  },
  bottomSections: {
    flexDirection: 'row',
    gap: 18,
    paddingVertical: 10,
    marginTop: 4,
  },
  halfSection: {
    flex: 1,
  },
  compactItem: {
    marginBottom: 8,
  },
  compactTitle: {
    color: GlassTextColors.primary,
    fontSize: 14,
    fontWeight: '600',
    marginBottom: 2,
    lineHeight: 18,
  },
  compactSubtitle: {
    color: GlassTextColors.secondary,
    fontSize: 12,
    lineHeight: 16,
  },
  certificationRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  moreText: {
    color: GlassTextColors.muted,
    fontSize: 11,
    fontStyle: 'italic',
    marginTop: 3,
  },
  continueButton: {
    borderRadius: 14,
    overflow: 'hidden',
    marginTop: 8,
    marginBottom: 4,
  },
  continueGradient: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 10,
    paddingVertical: 16,
    paddingHorizontal: 24,
  },
  continueText: {
    color: '#ffffff',
    fontSize: 17,
    fontWeight: '600',
  },
});

export default CVProfileDisplay;