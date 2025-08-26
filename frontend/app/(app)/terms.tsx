import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Platform,
} from 'react-native';
import { useRouter, useFocusEffect } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import ChatGPTBackground from '../../components/ChatGPTBackground';
import usePosthogSafely from '../../hooks/posthog/usePosthogSafely';
import { GlassStyles, GlassTextColors } from '../../constants/GlassStyles';

const Terms = () => {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { posthogScreen } = usePosthogSafely();

  useFocusEffect(
    React.useCallback(() => {
      if (Platform.OS === 'web') return;
      posthogScreen('terms_of_service');
    }, [posthogScreen])
  );

  const termsContent = [
    { type: 'h1', text: 'Terms and Conditions' },
    { type: 'p', text: 'Our iOS app, Interview Guide AI, is designed to help you prepare for job interviews through AI-powered mock interviews and personalized feedback. By accessing and using Interview Guide AI, you agree to the following terms and conditions, which we ask you to read carefully.' },
    
    { type: 'h2', text: 'Services Offered' },
    { type: 'p', text: 'Interview Guide AI provides an AI-powered interview preparation platform that allows users to:' },
    { type: 'bullet', text: '• Create and manage professional profiles with CV uploads' },
    { type: 'bullet', text: '• Create job interview sessions by providing job listing links or uploading job descriptions' },
    { type: 'bullet', text: '• Participate in realistic mock interviews with AI voice agents' },
    { type: 'bullet', text: '• Receive detailed transcripts, performance grades, and personalized feedback on interview performance' },
    
    { type: 'h2', text: 'Collection and Use of Personal Information' },
    { type: 'p', text: 'To provide you with personalized interview preparation services, users are required to register and submit certain personal details, including but not limited to your name, email address, CV/resume, and job descriptions. This information enables us to customize your mock interview experience and provide relevant feedback based on your specific job applications.' },
    
    { type: 'h2', text: 'Data Protection' },
    { type: 'p', text: 'We prioritize the security of your personal information, storing all user data within the secure confines of a MongoDB Atlas cloud database. This, along with axios, the HTTP request provider, are the sole third-party services with access to your information, underlining our commitment to data privacy and protection.' },
    
    { type: 'h2', text: 'Content and User Conduct' },
    { type: 'p', text: 'Interview Guide AI is a platform built on respect and integrity. Sharing of accounts is strictly forbidden, as are any forms of harassment, cheating, or abuse. Users are expected to engage with the AI interview system honestly and authentically to receive meaningful feedback.' },
    
    { type: 'h2', text: 'Intellectual Property' },
    { type: 'p', text: 'The interview content, AI-generated responses, and feedback provided by Interview Guide AI are designed exclusively for the personal and educational use of our registered users. Your CV and job descriptions remain your intellectual property.' },
    
    { type: 'h2', text: 'Disclaimer and Liability' },
    { type: 'p', text: 'Although we strive for accuracy, Interview Guide AI cannot guarantee the completeness, reliability, or up-to-dateness of the interview feedback or AI-generated content provided. Therefore, we shall not be held liable for any damages or losses incurred from your use of our app, including but not limited to interview outcomes, within the limits of applicable law.' },
    
    { type: 'h2', text: 'Contact Us' },
    { type: 'p', text: 'Should you have any inquiries or concerns regarding these Terms and Conditions, please reach out to us at matthew@interviewguideai.cc.' },
    
    { type: 'h2', text: 'Acceptance of Terms' },
    { type: 'p', text: 'By registering and engaging with Interview Guide AI, you affirm that you have thoroughly read, understood, and consented to be bound by these Terms and Conditions. We thank you for choosing Interview Guide AI as your interview preparation ally and look forward to supporting you on your path to career success.' },
  ];

  const renderContent = (item: any, index: number) => {
    switch (item.type) {
      case 'h1':
        return (
          <Text key={index} style={styles.h1}>
            {item.text}
          </Text>
        );
      case 'h2':
        return (
          <Text key={index} style={styles.h2}>
            {item.text}
          </Text>
        );
      case 'bullet':
        return (
          <Text key={index} style={styles.bullet}>
            {item.text}
          </Text>
        );
      default:
        return (
          <Text key={index} style={styles.paragraph}>
            {item.text}
          </Text>
        );
    }
  };

  return (
    <ChatGPTBackground style={styles.background}>
      <View style={[styles.container, { paddingTop: insets.top }]}>
        {/* Header */}
        <View style={styles.header}>
          <TouchableOpacity
            style={styles.backButton}
            onPress={() => router.back()}
          >
            <Ionicons name="chevron-back" size={24} color="#ffffff" />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Terms of Service</Text>
          <View style={styles.headerSpacer} />
        </View>

        {/* Content */}
        <ScrollView
          style={styles.scrollView}
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
        >
          <View style={styles.contentContainer}>
            {termsContent.map((item, index) => renderContent(item, index))}
          </View>
        </ScrollView>
      </View>
    </ChatGPTBackground>
  );
};

const styles = StyleSheet.create({
  background: {
    flex: 1,
  },
  container: {
    flex: 1,
    backgroundColor: 'transparent',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(255,255,255,0.15)',
  },
  backButton: {
    width: 40,
    height: 40,
    ...GlassStyles.interactive,
    alignItems: 'center',
    justifyContent: 'center',
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: GlassTextColors.primary,
    textAlign: 'center',
    flex: 1,
  },
  headerSpacer: {
    width: 40,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingBottom: 40,
  },
  contentContainer: {
    ...GlassStyles.card,
    marginHorizontal: 20,
    marginTop: 20,
    padding: 24,
  },
  h1: {
    fontSize: 28,
    fontWeight: 'bold',
    color: GlassTextColors.primary,
    marginBottom: 16,
    textAlign: 'center',
    letterSpacing: -0.5,
  },
  h2: {
    fontSize: 20,
    fontWeight: '600',
    color: '#A855F7',
    marginTop: 24,
    marginBottom: 12,
    letterSpacing: -0.3,
  },
  paragraph: {
    fontSize: 16,
    lineHeight: 24,
    color: GlassTextColors.muted,
    marginBottom: 16,
    textAlign: 'left',
  },
  bullet: {
    fontSize: 16,
    lineHeight: 24,
    color: GlassTextColors.muted,
    marginBottom: 8,
    marginLeft: 8,
    textAlign: 'left',
  },
});

export default Terms;