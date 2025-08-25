import React, { useEffect, useState } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Platform, ScrollView } from 'react-native';
import { router } from 'expo-router';
import * as StoreReview from 'expo-store-review';
import { Ionicons } from '@expo/vector-icons';
import MorphingBackground from '../../components/MorphingBackground';
import OnboardingProgress from '../../components/OnboardingProgress';
import usePosthogSafely from '../../hooks/posthog/usePosthogSafely';

const OnboardingReviews = () => {
  const { posthogCapture } = usePosthogSafely();
  const [selectedIndustry] = useState('Marketing'); // This would come from onboarding context

  useEffect(() => {
    requestStoreReview();
  }, []);

  const requestStoreReview = async () => {
    if (Platform.OS === 'web') return;
    
    try {
      if (await StoreReview.isAvailableAsync()) {
        await StoreReview.requestReview();
        posthogCapture('onboarding_review_requested', {
          platform: Platform.OS
        });
      }
    } catch (error) {
      console.error('Error requesting store review:', error);
      posthogCapture('onboarding_review_error', {
        error: error.message,
        platform: Platform.OS
      });
    }
  };

  const testimonials = [
    {
      name: 'Sarah M.',
      role: 'Marketing Manager',
      industry: 'Marketing',
      text: 'I froze in 3 real interviews. After 6 mocks, I landed an offer at a top tech company.',
      rating: 5
    },
    {
      name: 'David Chen',
      role: 'Software Engineer',
      industry: 'Technology',
      text: 'The AI feedback was spot-on. Helped me identify blind spots I never knew I had.',
      rating: 5
    },
    {
      name: 'Jennifer L.',
      role: 'Sales Director',
      industry: 'Sales',
      text: 'Went from nervous wreck to confident closer. 9x improvement is no joke!',
      rating: 5
    }
  ];

  const industryMatchedTestimonials = testimonials.filter(t => 
    t.industry === selectedIndustry || t.industry === 'General'
  ).concat(testimonials.filter(t => t.industry !== selectedIndustry)).slice(0, 3);

  const handleContinue = () => {
    router.push({ 
      pathname: '/(app)/paywall',
      params: { source: 'onboarding' }
    });
  };

  const renderStars = (rating) => {
    return (
      <View style={styles.starsContainer}>
        {[1, 2, 3, 4, 5].map((star) => (
          <Ionicons
            key={star}
            name={star <= rating ? 'star' : 'star-outline'}
            size={14}
            color="#F59E0B"
          />
        ))}
      </View>
    );
  };

  return (
    <MorphingBackground mode="static" style={styles.gradient}>
      <View style={styles.container}>
        <OnboardingProgress currentStep={16} totalSteps={17} />
        
        <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
          <Text style={styles.screenTitle}>Join thousands who got hired</Text>
          <Text style={styles.subtitle}>
            Thousands of job seekers across Marketing, Tech, Sales trust Nextround to get ahead.
          </Text>

          <View style={styles.testimonialsContainer}>
            {industryMatchedTestimonials.map((testimonial, index) => (
              <View key={index} style={styles.testimonialCard}>
                <View style={styles.testimonialHeader}>
                  <View>
                    <Text style={styles.testimonialName}>{testimonial.name}</Text>
                    <Text style={styles.testimonialRole}>{testimonial.role}</Text>
                  </View>
                  {renderStars(testimonial.rating)}
                </View>
                <Text style={styles.testimonialText}>"{testimonial.text}"</Text>
              </View>
            ))}
          </View>
        </ScrollView>

        <View style={styles.bottomContainer}>
          <TouchableOpacity style={styles.continueButton} onPress={handleContinue}>
            <Text style={styles.continueButtonText}>Unlock Your Interview Roadmap</Text>
          </TouchableOpacity>
        </View>
      </View>
    </MorphingBackground>
  );
};

const styles = StyleSheet.create({
  gradient: {
    flex: 1,
  },
  container: {
    flex: 1,
    paddingTop: Platform.OS === 'ios' ? 32 : 16,
    paddingBottom: Platform.OS === 'ios' ? 32 : 16,
  },
  content: {
    flex: 1,
    paddingHorizontal: 20,
  },
  screenTitle: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#ffffff',
    textAlign: 'center',
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 16,
    color: 'rgba(255, 255, 255, 0.7)',
    textAlign: 'center',
    marginBottom: 32,
    lineHeight: 22,
  },
  testimonialsContainer: {
    gap: 16,
  },
  testimonialCard: {
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    borderRadius: 16,
    padding: 20,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.2)',
  },
  testimonialHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 12,
  },
  testimonialName: {
    fontSize: 16,
    fontWeight: '600',
    color: '#ffffff',
    marginBottom: 2,
  },
  testimonialRole: {
    fontSize: 14,
    color: 'rgba(255, 255, 255, 0.6)',
  },
  starsContainer: {
    flexDirection: 'row',
    gap: 2,
  },
  testimonialText: {
    fontSize: 15,
    color: 'rgba(255, 255, 255, 0.9)',
    lineHeight: 22,
    fontStyle: 'italic',
  },
  bottomContainer: {
    paddingHorizontal: 20,
    paddingBottom: 20,
  },
  continueButton: {
    backgroundColor: '#F59E0B',
    borderRadius: 12,
    paddingVertical: 18,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#000',
    shadowOpacity: 0.25,
    shadowRadius: 8,
    shadowOffset: { width: 0, height: 4 },
    elevation: 8,
  },
  continueButtonText: {
    color: '#ffffff',
    fontSize: 18,
    fontWeight: '700',
  },
});

export default OnboardingReviews;