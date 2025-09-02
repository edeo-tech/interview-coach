import React, { useState } from 'react';
import { View, Text, TouchableOpacity, Alert, ScrollView, ActivityIndicator, StyleSheet, Platform, Modal } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { router, useFocusEffect } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import ChatGPTBackground from '../../../components/ChatGPTBackground';
import CVUploadProgress from '../../../components/CVUploadProgress';
import * as DocumentPicker from 'expo-document-picker';
import { useCV, useUploadCV, useDeleteCV } from '../../../_queries/interviews/cv';
import usePosthogSafely from '../../../hooks/posthog/usePosthogSafely';
import useHapticsSafely from '../../../hooks/haptics/useHapticsSafely';
import { useToast } from '../../../components/Toast';
import { TYPOGRAPHY } from '../../../constants/Typography';
import Colors from '../../../constants/Colors';
import { GlassStyles } from '../../../constants/GlassStyles';

const CVUpload = () => {
  const { data: currentCV, isLoading: cvLoading } = useCV();
  const uploadMutation = useUploadCV();
  const deleteMutation = useDeleteCV();
  const [uploadProgress, setUploadProgress] = useState(false);
  const [showProgressModal, setShowProgressModal] = useState(false);
  const { posthogScreen, posthogCapture } = usePosthogSafely();
  const { selectionAsync } = useHapticsSafely();
  const { showToast } = useToast();

  useFocusEffect(
    React.useCallback(() => {
      if (Platform.OS === 'web') return;
      posthogScreen('cv_upload');
    }, [posthogScreen])
  );

  const handleUpload = async () => {
    try {
      const result = await DocumentPicker.getDocumentAsync({
        type: ['application/pdf', 'application/msword', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document', 'text/plain'],
        copyToCacheDirectory: true
      });
      
      if (result.canceled) {
        return;
      }

      const file = result.assets[0];
      
      // Validate file size (max 5MB)
      if (file.size && file.size > 5 * 1024 * 1024) {
        Alert.alert('File Too Large', 'Please select a file smaller than 5MB.');
        return;
      }

      setUploadProgress(true);
      setShowProgressModal(true);

      const formData = new FormData();
      formData.append('file', {
        uri: file.uri,
        type: file.mimeType || 'application/pdf',
        name: file.name || 'cv.pdf',
      } as any);
      
      await uploadMutation.mutateAsync(formData);
      
      posthogCapture('cv_upload_success', {
        source: 'cv_upload_page',
        file_type: file.mimeType || 'unknown',
        file_size_kb: file.size ? Math.round(file.size / 1024) : null,
        is_replacement: !!currentCV
      });
      
    } catch (error: any) {
      console.error('Upload error:', error);
      setShowProgressModal(false);
      posthogCapture('cv_upload_failed', {
        source: 'cv_upload_page',
        error_message: error.response?.data?.detail || error.message,
        file_type: 'unknown',
        is_replacement: !!currentCV
      });
      showToast('Problem uploading CV. Please try again.', 'error');
    } finally {
      setUploadProgress(false);
    }
  };

  const handleProgressComplete = () => {
    // Navigate immediately to prevent any intermediate screens
    // Use replace to prevent going back to CV upload
    router.replace('/interviews/create');
    
    // Delay modal close to prevent UI flash
    setTimeout(() => {
      setShowProgressModal(false);
    }, 100);
  };

  const handleDelete = () => {
    Alert.alert(
      'Delete CV',
      'Are you sure you want to delete your CV? This will remove it from all future interviews.',
      [
        { text: 'Cancel', style: 'cancel' },
        { 
          text: 'Delete', 
          style: 'destructive',
          onPress: async () => {
            try {
              await deleteMutation.mutateAsync();
              posthogCapture('cv_deleted', {
                source: 'cv_upload_page',
                had_skills_count: currentCV?.skills?.length || 0,
                had_experience_years: currentCV?.experience_years || 0
              });
              showToast('CV deleted successfully', 'success');
            } catch (error: any) {
              posthogCapture('cv_deletion_failed', {
                source: 'cv_upload_page',
                error_message: error.message
              });
              showToast('Unable to delete CV. Please try again.', 'error');
            }
          }
        }
      ]
    );
  };

  const formatSkills = (skills: string[]) => {
    if (skills.length <= 5) return skills.join(', ');
    return skills.slice(0, 5).join(', ') + ` +${skills.length - 5} more`;
  };

  const renderPersonalInfo = () => {
    if (!currentCV?.personal_info || Object.keys(currentCV.personal_info).length === 0) return null;
    
    return (
      <View style={styles.sectionContainer}>
        <Text style={styles.sectionTitle}>Personal Information</Text>
        <View style={styles.sectionContent}>
          {currentCV.personal_info.name && (
            <View style={styles.infoRow}>
              <Ionicons name="person" size={16} color={Colors.text.secondary} />
              <Text style={styles.infoText}>{currentCV.personal_info.name}</Text>
            </View>
          )}
          {currentCV.personal_info.email && (
            <View style={styles.infoRow}>
              <Ionicons name="mail" size={16} color={Colors.text.secondary} />
              <Text style={styles.infoText}>{currentCV.personal_info.email}</Text>
            </View>
          )}
          {currentCV.personal_info.phone && (
            <View style={styles.infoRow}>
              <Ionicons name="call" size={16} color={Colors.text.secondary} />
              <Text style={styles.infoText}>{currentCV.personal_info.phone}</Text>
            </View>
          )}
          {currentCV.personal_info.location && (
            <View style={styles.infoRow}>
              <Ionicons name="location" size={16} color={Colors.text.secondary} />
              <Text style={styles.infoText}>{currentCV.personal_info.location}</Text>
            </View>
          )}
          {currentCV.personal_info.linkedin && (
            <View style={styles.infoRow}>
              <Ionicons name="logo-linkedin" size={16} color={Colors.text.secondary} />
              <Text style={styles.infoText}>{currentCV.personal_info.linkedin}</Text>
            </View>
          )}
        </View>
      </View>
    );
  };

  const renderProfessionalSummary = () => {
    if (!currentCV?.professional_summary) return null;
    
    return (
      <View style={styles.sectionContainer}>
        <Text style={styles.sectionTitle}>Professional Summary</Text>
        <View style={styles.sectionContent}>
          <Text style={styles.summaryText}>{currentCV.professional_summary}</Text>
        </View>
      </View>
    );
  };

  const renderSkillsSection = () => {
    const hasSkills = currentCV?.technical_skills?.length || 
                     currentCV?.programming_languages?.length ||
                     currentCV?.frameworks?.length ||
                     currentCV?.tools?.length ||
                     currentCV?.soft_skills?.length ||
                     currentCV?.spoken_languages?.length;
    
    if (!hasSkills) return null;

    return (
      <View style={styles.sectionContainer}>
        <Text style={styles.sectionTitle}>Skills & Technologies</Text>
        <View style={styles.sectionContent}>
          {currentCV.programming_languages?.length > 0 && (
            <View style={styles.skillCategory}>
              <Text style={styles.skillCategoryTitle}>Programming Languages</Text>
              <View style={styles.skillTags}>
                {currentCV.programming_languages.map((skill, index) => (
                  <View key={index} style={styles.skillTag}>
                    <Text style={styles.skillTagText}>{skill}</Text>
                  </View>
                ))}
              </View>
            </View>
          )}
          
          {currentCV.frameworks?.length > 0 && (
            <View style={styles.skillCategory}>
              <Text style={styles.skillCategoryTitle}>Frameworks & Libraries</Text>
              <View style={styles.skillTags}>
                {currentCV.frameworks.map((skill, index) => (
                  <View key={index} style={styles.skillTag}>
                    <Text style={styles.skillTagText}>{skill}</Text>
                  </View>
                ))}
              </View>
            </View>
          )}
          
          {currentCV.tools?.length > 0 && (
            <View style={styles.skillCategory}>
              <Text style={styles.skillCategoryTitle}>Tools & Platforms</Text>
              <View style={styles.skillTags}>
                {currentCV.tools.map((skill, index) => (
                  <View key={index} style={styles.skillTag}>
                    <Text style={styles.skillTagText}>{skill}</Text>
                  </View>
                ))}
              </View>
            </View>
          )}
          
          {currentCV.technical_skills?.length > 0 && (
            <View style={styles.skillCategory}>
              <Text style={styles.skillCategoryTitle}>Technical Skills</Text>
              <View style={styles.skillTags}>
                {currentCV.technical_skills.map((skill, index) => (
                  <View key={index} style={styles.skillTag}>
                    <Text style={styles.skillTagText}>{skill}</Text>
                  </View>
                ))}
              </View>
            </View>
          )}
          
          {currentCV.soft_skills?.length > 0 && (
            <View style={styles.skillCategory}>
              <Text style={styles.skillCategoryTitle}>Soft Skills</Text>
              <View style={styles.skillTags}>
                {currentCV.soft_skills.map((skill, index) => (
                  <View key={index} style={styles.skillTag}>
                    <Text style={styles.skillTagText}>{skill}</Text>
                  </View>
                ))}
              </View>
            </View>
          )}
          
          {currentCV.spoken_languages?.length > 0 && (
            <View style={styles.skillCategory}>
              <Text style={styles.skillCategoryTitle}>Languages</Text>
              <View style={styles.skillTags}>
                {currentCV.spoken_languages.map((skill, index) => (
                  <View key={index} style={styles.skillTag}>
                    <Text style={styles.skillTagText}>{skill}</Text>
                  </View>
                ))}
              </View>
            </View>
          )}
        </View>
      </View>
    );
  };

  const renderExperience = () => {
    if (!currentCV?.experience?.length) return null;
    
    return (
      <View style={styles.sectionContainer}>
        <Text style={styles.sectionTitle}>Work Experience</Text>
        <View style={styles.sectionContent}>
          {currentCV.experience.map((exp, index) => (
            <View key={index} style={styles.experienceItem}>
              <View style={styles.experienceHeader}>
                <Text style={styles.experienceTitle}>{exp.title || exp.position}</Text>
                <Text style={styles.experienceCompany}>{exp.company}</Text>
              </View>
              <View style={styles.experienceDetails}>
                {exp.duration && (
                  <View style={styles.infoRow}>
                    <Ionicons name="calendar" size={14} color={Colors.text.secondary} />
                    <Text style={styles.experienceDetailText}>{exp.duration}</Text>
                  </View>
                )}
                {exp.location && (
                  <View style={styles.infoRow}>
                    <Ionicons name="location" size={14} color={Colors.text.secondary} />
                    <Text style={styles.experienceDetailText}>{exp.location}</Text>
                  </View>
                )}
              </View>
              {exp.description && (
                <Text style={styles.experienceDescription}>{exp.description}</Text>
              )}
            </View>
          ))}
        </View>
      </View>
    );
  };

  const renderEducation = () => {
    if (!currentCV?.education?.length) return null;
    
    return (
      <View style={styles.sectionContainer}>
        <Text style={styles.sectionTitle}>Education</Text>
        <View style={styles.sectionContent}>
          {currentCV.education.map((edu, index) => (
            <View key={index} style={styles.experienceItem}>
              <View style={styles.experienceHeader}>
                <Text style={styles.experienceTitle}>{edu.degree || edu.qualification}</Text>
                <Text style={styles.experienceCompany}>{edu.institution || edu.school}</Text>
              </View>
              <View style={styles.experienceDetails}>
                {edu.year && (
                  <View style={styles.infoRow}>
                    <Ionicons name="calendar" size={14} color={Colors.text.secondary} />
                    <Text style={styles.experienceDetailText}>{edu.year}</Text>
                  </View>
                )}
                {edu.gpa && (
                  <View style={styles.infoRow}>
                    <Ionicons name="star" size={14} color={Colors.text.secondary} />
                    <Text style={styles.experienceDetailText}>GPA: {edu.gpa}</Text>
                  </View>
                )}
              </View>
            </View>
          ))}
        </View>
      </View>
    );
  };

  const renderCertifications = () => {
    if (!currentCV?.certifications?.length) return null;
    
    return (
      <View style={styles.sectionContainer}>
        <Text style={styles.sectionTitle}>Certifications</Text>
        <View style={styles.sectionContent}>
          {currentCV.certifications.map((cert, index) => (
            <View key={index} style={styles.experienceItem}>
              <Text style={styles.experienceTitle}>{cert.name || cert.title}</Text>
              <View style={styles.experienceDetails}>
                {cert.issuer && (
                  <View style={styles.infoRow}>
                    <Ionicons name="business" size={14} color={Colors.text.secondary} />
                    <Text style={styles.experienceDetailText}>{cert.issuer}</Text>
                  </View>
                )}
                {cert.date && (
                  <View style={styles.infoRow}>
                    <Ionicons name="calendar" size={14} color={Colors.text.secondary} />
                    <Text style={styles.experienceDetailText}>{cert.date}</Text>
                  </View>
                )}
              </View>
            </View>
          ))}
        </View>
      </View>
    );
  };

  const renderProjects = () => {
    if (!currentCV?.projects?.length) return null;
    
    return (
      <View style={styles.sectionContainer}>
        <Text style={styles.sectionTitle}>Projects</Text>
        <View style={styles.sectionContent}>
          {currentCV.projects.map((project, index) => (
            <View key={index} style={styles.experienceItem}>
              <Text style={styles.experienceTitle}>{project.name || project.title}</Text>
              {project.technologies && (
                <View style={styles.projectTechnologies}>
                  {project.technologies.map((tech, techIndex) => (
                    <View key={techIndex} style={styles.skillTag}>
                      <Text style={styles.skillTagText}>{tech}</Text>
                    </View>
                  ))}
                </View>
              )}
              {project.description && (
                <Text style={styles.experienceDescription}>{project.description}</Text>
              )}
            </View>
          ))}
        </View>
      </View>
    );
  };

  const getFileTypeIcon = (mimeType: string) => {
    if (mimeType.includes('pdf')) return 'document-text';
    if (mimeType.includes('word')) return 'document';
    return 'document-outline';
  };

  return (
    <ChatGPTBackground style={styles.gradient}>
      <View style={styles.container}>
        <ScrollView
          style={styles.scrollView}
          contentContainerStyle={styles.scrollViewContent}
          showsVerticalScrollIndicator={false}
        >
          {/* Header */}
          <View style={styles.header}>
            <TouchableOpacity onPress={() => {
              selectionAsync();
              router.back();
            }}>
              <Ionicons name="chevron-back" size={24} color={Colors.text.primary} />
            </TouchableOpacity>
            <Text style={styles.headerTitle}>Your CV</Text>
          </View>
          {/* Current CV Status - Only show if CV exists */}
          {cvLoading ? (
            <View style={styles.loadingCard}>
              <ActivityIndicator size="small" color={Colors.brand.primary} />
              <Text style={styles.loadingText}>Loading CV information...</Text>
            </View>
          ) : currentCV ? (
            <View style={styles.cvOverview}>
              {/* Header with status and delete */}
              <View style={styles.cvHeaderSection}>
                <View style={styles.cvCardHeader}>
                  <Text style={styles.cvCardTitle}>Your CV Overview</Text>
                  <View style={styles.activeStatus}>
                    <Ionicons name="checkmark-circle" size={20} color={Colors.semantic.successAlt} />
                    <Text style={styles.activeText}>Active</Text>
                  </View>
                </View>
                
                <View style={styles.cvMetadata}>
                  <View style={styles.cvInfoItem}>
                    <Ionicons name="briefcase" size={16} color={Colors.text.secondary} />
                    <Text style={styles.cvInfoText}>
                      {currentCV.total_experience_years || currentCV.experience_years || 0} years experience
                    </Text>
                  </View>
                  
                  <View style={styles.cvInfoItem}>
                    <Ionicons name="calendar" size={16} color={Colors.text.secondary} />
                    <Text style={styles.cvInfoText}>
                      Uploaded {new Date(currentCV.created_at).toLocaleDateString()}
                    </Text>
                  </View>

                  {currentCV.current_level && (
                    <View style={styles.cvInfoItem}>
                      <Ionicons name="trending-up" size={16} color={Colors.text.secondary} />
                      <Text style={styles.cvInfoText}>
                        {currentCV.current_level.charAt(0).toUpperCase() + currentCV.current_level.slice(1)} level
                      </Text>
                    </View>
                  )}
                </View>

                <TouchableOpacity
                  onPress={() => {
                    selectionAsync();
                    handleDelete();
                  }}
                  disabled={deleteMutation.isPending}
                  style={styles.deleteButton}
                >
                  <Ionicons name="trash" size={16} color={Colors.semantic.error} />
                  <Text style={styles.deleteButtonText}>
                    {deleteMutation.isPending ? 'Deleting...' : 'Delete CV'}
                  </Text>
                </TouchableOpacity>
              </View>

              {/* Comprehensive CV sections */}
              {renderPersonalInfo()}
              {renderProfessionalSummary()}
              {renderSkillsSection()}
              {renderExperience()}
              {renderEducation()}
              {renderCertifications()}
              {renderProjects()}
            </View>
          ) : null}

          {/* Main Upload Area */}
          <View style={currentCV ? styles.uploadContainerWithCV : styles.uploadContainer}>
            <TouchableOpacity
              onPress={() => {
                selectionAsync();
                handleUpload();
              }}
              disabled={uploadProgress}
              style={[
                currentCV ? styles.uploadAreaCompact : styles.uploadArea,
                uploadProgress && styles.uploadAreaDisabled
              ]}
            >
              <View style={styles.uploadIconContainer}>
                <Ionicons name="cloud-upload" size={currentCV ? 48 : 64} color={Colors.brand.secondary} />
              </View>
              
              <Text style={currentCV ? styles.uploadTitleCompact : styles.uploadTitle}>
                {currentCV ? 'Replace your CV' : 'Upload your CV'}
              </Text>
              
              <Text style={currentCV ? styles.uploadSubtitleCompact : styles.uploadSubtitle}>
                {currentCV ? 'Upload a new CV to replace the current one' : 'Get personalized interview questions based on your experience'}
              </Text>
              
              <View style={styles.uploadButton}>
                <Text style={styles.uploadButtonText}>Choose file</Text>
              </View>
              
              <Text style={styles.formatHint}>
                PDF, DOC, DOCX, or TXT • Max 5MB
              </Text>
            </TouchableOpacity>
          </View>
        </ScrollView>

        {/* Progress Modal */}
        <Modal
          visible={showProgressModal}
          transparent={true}
          animationType="fade"
          statusBarTranslucent={true}
        >
          <CVUploadProgress onComplete={handleProgressComplete} />
        </Modal>
      </View>
    </ChatGPTBackground>
  );
};

const styles = StyleSheet.create({
  gradient: {
    flex: 1,
  },
  container: {
    flex: 1,
    backgroundColor: 'transparent',
  },
  scrollView: {
    flex: 1,
    paddingHorizontal: 20, // Consistent with other screens
  },
  scrollViewContent: {
    paddingBottom: 100, // Extra space at bottom
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingTop: 60,
    paddingBottom: 20,
    marginBottom: 8,
  },
  headerTitle: {
    ...TYPOGRAPHY.pageTitle,
    color: Colors.text.primary,
    marginLeft: 16,
  },
  loadingCard: {
    backgroundColor: Colors.glass.background,
    borderRadius: 16,
    padding: 24,
    alignItems: 'center',
    marginBottom: 24, // spacing.6
    borderWidth: 1,
    borderColor: Colors.glass.border,
    shadowColor: Colors.black,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 4, // Android shadow
  },
  loadingText: {
    color: Colors.text.tertiary,
    marginTop: 8,
    ...TYPOGRAPHY.bodyMedium,
  },
  cvOverview: {
    marginBottom: 32,
  },
  cvHeaderSection: {
    ...GlassStyles.card,
    padding: 20,
    marginBottom: 20,
  },
  cvMetadata: {
    gap: 12,
    marginTop: 16,
    marginBottom: 16,
  },
  cvCardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  cvCardTitle: {
    ...TYPOGRAPHY.sectionHeader,
    color: Colors.text.primary,
  },
  activeStatus: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  activeText: {
    color: Colors.semantic.success,
    marginLeft: 8, // spacing.2
    ...TYPOGRAPHY.labelMedium,
  },
  cvInfoItem: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  cvInfoText: {
    ...TYPOGRAPHY.bodySmall,
    color: Colors.text.tertiary,
    marginLeft: 8,
  },
  cvInfoTextWrap: {
    flex: 1,
  },
  deleteButton: {
    backgroundColor: Colors.glass.error,
    borderRadius: 50, // Pill-shaped like other buttons
    paddingVertical: 12,
    paddingHorizontal: 16,
    marginTop: 20,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  deleteButtonText: {
    color: Colors.semantic.error,
    marginLeft: 8,
    ...TYPOGRAPHY.buttonMedium,
  },
  uploadContainer: {
    flex: 1,
    justifyContent: 'center',
    marginVertical: 40, // spacing.10
  },
  uploadContainerWithCV: {
    marginTop: 0,
    marginBottom: 32, // spacing.8
  },
  uploadArea: {
    backgroundColor: Colors.glass.backgroundInput,
    borderWidth: 2,
    borderStyle: 'dashed',
    borderColor: Colors.glass.purpleLight,
    borderRadius: 20,
    padding: 48,
    alignItems: 'center',
    minHeight: 320, // Custom height for large upload area
    justifyContent: 'center',
  },
  uploadAreaCompact: {
    backgroundColor: Colors.glass.backgroundInput,
    borderWidth: 2,
    borderStyle: 'dashed',
    borderColor: Colors.glass.purpleLight,
    borderRadius: 20,
    padding: 32,
    alignItems: 'center',
    minHeight: 240, // Custom height for compact upload area
    justifyContent: 'center',
  },
  uploadAreaDisabled: {
    opacity: 0.5,
  },
  uploadIconContainer: {
    marginBottom: 20, // spacing.5
  },
  uploadTitle: {
    color: Colors.text.primary,
    textAlign: 'center',
    marginBottom: 12,
    ...TYPOGRAPHY.heading1,
  },
  uploadTitleCompact: {
    color: Colors.text.primary,
    textAlign: 'center',
    marginBottom: 8,
    ...TYPOGRAPHY.heading3,
  },
  uploadSubtitle: {
    color: Colors.text.secondary,
    textAlign: 'center',
    marginBottom: 32,
    maxWidth: 280,
    ...TYPOGRAPHY.bodyMedium,
  },
  uploadSubtitleCompact: {
    color: Colors.text.secondary,
    textAlign: 'center',
    marginBottom: 24,
    maxWidth: 260,
    ...TYPOGRAPHY.bodySmall,
  },
  uploadButton: {
    backgroundColor: Colors.glass.purpleTint,
    borderRadius: 50, // Pill-shaped
    paddingVertical: 14,
    paddingHorizontal: 24,
    marginBottom: 16,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: Colors.glass.purpleBright,
  },
  uploadButtonText: {
    ...TYPOGRAPHY.labelMedium,
    color: Colors.text.primary,
    fontWeight: '600',
  },
  formatHint: {
    ...TYPOGRAPHY.bodySmall,
    color: Colors.text.muted,
    textAlign: 'center',
  },
  
  // New comprehensive CV section styles
  sectionContainer: {
    ...GlassStyles.card,
    padding: 20,
    marginBottom: 16,
  },
  sectionTitle: {
    ...TYPOGRAPHY.sectionHeader,
    color: Colors.text.primary,
    marginBottom: 16,
  },
  sectionContent: {
    gap: 16,
  },
  
  // Personal info and general info styles
  infoRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  infoText: {
    ...TYPOGRAPHY.bodyMedium,
    color: Colors.text.primary,
    marginLeft: 12,
    flex: 1,
  },
  summaryText: {
    ...TYPOGRAPHY.bodyMedium,
    color: Colors.text.primary,
    lineHeight: 22,
  },
  
  // Skills section styles
  skillCategory: {
    marginBottom: 16,
  },
  skillCategoryTitle: {
    ...TYPOGRAPHY.labelLarge,
    color: Colors.text.secondary,
    marginBottom: 8,
  },
  skillTags: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  skillTag: {
    ...GlassStyles.interactive,
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
  },
  skillTagText: {
    ...TYPOGRAPHY.labelSmall,
    color: Colors.text.primary,
    fontSize: 13,
  },
  
  // Experience, education, certifications, projects styles
  experienceItem: {
    marginBottom: 20,
  },
  experienceHeader: {
    marginBottom: 8,
  },
  experienceTitle: {
    ...TYPOGRAPHY.labelLarge,
    color: Colors.text.primary,
    marginBottom: 4,
  },
  experienceCompany: {
    ...TYPOGRAPHY.bodyMedium,
    color: Colors.text.secondary,
    marginBottom: 8,
  },
  experienceDetails: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 16,
    marginBottom: 8,
  },
  experienceDetailText: {
    ...TYPOGRAPHY.bodySmall,
    color: Colors.text.secondary,
    marginLeft: 8,
  },
  experienceDescription: {
    ...TYPOGRAPHY.bodySmall,
    color: Colors.text.primary,
    lineHeight: 20,
    marginTop: 8,
  },
  
  // Project-specific styles
  projectTechnologies: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 6,
    marginTop: 8,
    marginBottom: 8,
  },
});

export default CVUpload;