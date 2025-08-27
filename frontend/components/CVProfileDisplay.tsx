import React from 'react';
import { View, Text, TouchableOpacity, ScrollView, StyleSheet } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { router } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { BlurView } from 'expo-blur';
import ChatGPTBackground from './ChatGPTBackground';
import { GlassStyles, GlassTextColors } from '../constants/GlassStyles';
import Colors from '../constants/Colors';
import { CVProfile } from '../_api/interviews/cv';
import usePosthogSafely from '../hooks/posthog/usePosthogSafely';
import { TYPOGRAPHY } from '../constants/Typography';

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
    if (profile.experience_years <= 2) return { level: 'Junior', color: Colors.semantic.successAlt, icon: 'leaf-outline' };
    if (profile.experience_years <= 5) return { level: 'Mid-Level', color: Colors.accent.gold, icon: 'trending-up-outline' };
    return { level: 'Senior', color: Colors.brand.secondary, icon: 'star-outline' };
  };

  const experienceInfo = getExperienceLevel();

  return (
    <ChatGPTBackground style={styles.container}>
      <SafeAreaView style={styles.safeArea}>
        <View style={styles.content}>
          {/* Header */}
          <View style={styles.header}>
            <View style={styles.successBadge}>
              <Ionicons name="checkmark-circle" size={24} color={Colors.semantic.successAlt} />
            </View>
            <Text style={styles.headerTitle}>Profile Created!</Text>
            <Text style={styles.headerSubtitle}>
              We understand your background and experience
            </Text>
          </View>

          {/* Experience Level - Enhanced Glass Container */}
          <View style={styles.experienceContainer}>
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
          </View>

          {/* Skills Section - Enhanced Glass Container */}
          {profile.skills.length > 0 && (
            <View style={styles.sectionContainer}>
              <View style={styles.section}>
                <View style={styles.sectionHeader}>
                  <Ionicons name="code-slash-outline" size={18} color={Colors.accent.blue} />
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
            </View>
          )}

          {/* Education & Certifications - Enhanced Glass Containers */}
          <View style={styles.bottomSections}>
            {/* Education */}
            {profile.education.length > 0 && (
              <View style={styles.halfSectionContainer}>
                <View style={styles.halfSection}>
                  <View style={styles.sectionHeader}>
                    <Ionicons name="school-outline" size={18} color={Colors.accent.blue} />
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
              </View>
            )}

            {/* Certifications */}
            {profile.certifications.length > 0 && (
              <View style={styles.halfSectionContainer}>
                <View style={styles.halfSection}>
                  <View style={styles.sectionHeader}>
                    <Ionicons name="ribbon-outline" size={18} color={Colors.accent.blue} />
                    <Text style={styles.sectionTitle}>Certifications</Text>
                  </View>
                  <View>
                    {profile.certifications.slice(0, 2).map((cert, index) => (
                      <View key={index} style={styles.compactItem}>
                        <View style={styles.certificationRow}>
                          <Ionicons name="checkmark-circle" size={12} color={Colors.semantic.successAlt} />
                          <Text style={styles.compactTitle} numberOfLines={1}>{cert}</Text>
                        </View>
                      </View>
                    ))}
                    {profile.certifications.length > 2 && (
                      <Text style={styles.moreText}>+{profile.certifications.length - 2} more</Text>
                    )}
                  </View>
                </View>
              </View>
            )}
          </View>

          {/* Continue Button - Enhanced Design System Button */}
          <TouchableOpacity onPress={handleContinue} style={styles.continueButton}>
            <LinearGradient
              colors={[Colors.brand.primary, Colors.special.pink]}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 0 }}
              style={styles.continueGradient}
            >
              <Text style={styles.continueText}>Continue to Create Interview</Text>
              <Ionicons name="arrow-forward" size={18} color={Colors.white} />
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
    paddingHorizontal: 20, // Design system spacing
    paddingVertical: 16,
    justifyContent: 'space-between',
  },
  header: {
    alignItems: 'center',
    paddingBottom: 16, // Design system spacing
  },
  successBadge: {
    width: 56, // Design system button height
    height: 56,
    borderRadius: 28, // Fully rounded
    backgroundColor: Colors.glass.successSecondary, // Enhanced glass effect
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 12, // Design system spacing
    borderWidth: 1,
    borderColor: Colors.glass.successBorderAlt,
    // Design system shadow
    shadowColor: Colors.black,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 4,
  },
  headerTitle: {
    ...TYPOGRAPHY.displaySmall,
    color: Colors.white, // Design system text primary
    marginBottom: 8, // Design system spacing
    textAlign: 'center',
  },
  headerSubtitle: {
    ...TYPOGRAPHY.bodyMedium,
    color: Colors.text.secondary, // Design system text secondary
    textAlign: 'center',
    paddingHorizontal: 12,
  },
  experienceContainer: {
    backgroundColor: Colors.glass.background, // Design system glass background
    borderColor: Colors.glass.border, // Design system glass border
    borderWidth: 1,
    borderRadius: 16, // Design system card border radius
    padding: 20, // Design system card padding
    marginBottom: 16, // Design system spacing
    // Design system shadow
    shadowColor: Colors.black,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 4,
  },
  experienceSection: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 16, // Design system spacing
  },
  experienceIcon: {
    width: 48, // Design system button height small
    height: 48,
    borderRadius: 24, // Fully rounded
    alignItems: 'center',
    justifyContent: 'center',
  },
  experienceInfo: {
    flex: 1,
  },
  experienceLevel: {
    ...TYPOGRAPHY.heading3,
    color: Colors.white, // Design system text primary
    marginBottom: 4, // Design system spacing
  },
  experienceYears: {
    ...TYPOGRAPHY.bodySmall,
    color: Colors.text.tertiary, // Design system text tertiary
  },
  sectionContainer: {
    backgroundColor: Colors.glass.background, // Design system glass background
    borderColor: Colors.glass.border, // Design system glass border
    borderWidth: 1,
    borderRadius: 16, // Design system card border radius
    padding: 20, // Design system card padding
    marginBottom: 16, // Design system spacing
    // Design system shadow
    shadowColor: Colors.black,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 4,
  },
  section: {
    // Removed padding as it's now in container
  },
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8, // Design system spacing
    marginBottom: 12, // Design system spacing
  },
  sectionTitle: {
    ...TYPOGRAPHY.heading4,
    color: Colors.white, // Design system text primary
  },
  skillsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8, // Design system spacing
  },
  skillChip: {
    backgroundColor: Colors.glass.purple, // Design system purple with opacity
    borderRadius: 12, // Design system border radius
    paddingHorizontal: 12, // Design system spacing
    paddingVertical: 8, // Design system spacing
    borderWidth: 1,
    borderColor: Colors.glass.purpleTint, // Design system purple with opacity
  },
  skillText: {
    ...TYPOGRAPHY.labelMedium,
    color: Colors.white, // Design system text primary
  },
  bottomSections: {
    flexDirection: 'row',
    gap: 16, // Design system spacing
    marginBottom: 16, // Design system spacing
  },
  halfSectionContainer: {
    flex: 1,
    backgroundColor: Colors.glass.background, // Design system glass background
    borderColor: Colors.glass.border, // Design system glass border
    borderWidth: 1,
    borderRadius: 16, // Design system card border radius
    padding: 16, // Design system card padding
    // Design system shadow
    shadowColor: Colors.black,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 4,
  },
  halfSection: {
    // Removed flex: 1 as it's now in container
  },
  compactItem: {
    marginBottom: 8, // Design system spacing
  },
  compactTitle: {
    ...TYPOGRAPHY.labelMedium,
    fontWeight: '600',
    color: Colors.white, // Design system text primary
    marginBottom: 2, // Design system spacing
  },
  compactSubtitle: {
    ...TYPOGRAPHY.bodyXSmall,
    color: Colors.text.tertiary, // Design system text tertiary
  },
  certificationRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6, // Design system spacing
  },
  moreText: {
    ...TYPOGRAPHY.caption,
    color: Colors.text.muted, // Design system text muted
    fontStyle: 'italic',
    marginTop: 4, // Design system spacing
  },
  continueButton: {
    borderRadius: 28, // Design system button primary border radius (fully rounded)
    overflow: 'hidden',
    marginTop: 8, // Design system spacing
    marginBottom: 4, // Design system spacing
    // Design system button primary shadow
    shadowColor: Colors.brand.primary,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 12,
    elevation: 12,
  },
  continueGradient: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 10, // Design system spacing
    paddingVertical: 16, // Design system spacing
    paddingHorizontal: 24, // Design system spacing
    height: 56, // Design system button height
  },
  continueText: {
    ...TYPOGRAPHY.buttonLarge,
    color: Colors.white,
  },
});

export default CVProfileDisplay;