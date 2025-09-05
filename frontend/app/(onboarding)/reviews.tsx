import React, { useEffect, useState, useRef } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Platform, FlatList, Animated, Dimensions, Image } from 'react-native';
import { router } from 'expo-router';
import { useFocusEffect } from '@react-navigation/native';
import * as StoreReview from 'expo-store-review';
import { Ionicons } from '@expo/vector-icons';
import ChatGPTBackground from '../../components/ChatGPTBackground';
import OnboardingProgress from '../../components/OnboardingProgress';
import { getNavigationDirection, setNavigationDirection } from '../../utils/navigationDirection';
import usePosthogSafely from '../../hooks/posthog/usePosthogSafely';
import { TYPOGRAPHY } from '../../constants/Typography';
import Colors from '../../constants/Colors';

const { width: SCREEN_WIDTH } = Dimensions.get('window');
const CARD_WIDTH = SCREEN_WIDTH - 48; // Full width minus padding
const CARD_SPACING = 16;
const CARD_MARGIN = 12; // Add margin for better spacing

const OnboardingReviews = () => {
  const { posthogCapture } = usePosthogSafely();
  const [selectedIndustry] = useState('Marketing'); // This would come from onboarding context
  const [currentIndex, setCurrentIndex] = useState(0);
  const flatListRef = useRef<FlatList>(null);

  // Animation values - exactly like profile-setup
  const contentTranslateX = useRef(new Animated.Value(0)).current;
  const contentOpacity = useRef(new Animated.Value(1)).current;
  const buttonOpacity = useRef(new Animated.Value(1)).current;
  const buttonTranslateY = useRef(new Animated.Value(0)).current;

  // Entrance animation - exactly like profile-setup with direction awareness
  useFocusEffect(
    React.useCallback(() => {
      // Determine slide direction based on last navigation direction
      const slideInFrom = getNavigationDirection() === 'back' ? -SCREEN_WIDTH : SCREEN_WIDTH;
      
      // Reset to slide-in position 
      contentTranslateX.setValue(slideInFrom);
      buttonTranslateY.setValue(30);
      contentOpacity.setValue(0);
      buttonOpacity.setValue(0);
      
      // Add a brief pause before sliding in new content for a more relaxed feel - exactly like profile-setup
      setTimeout(() => {
        // Animate in content and button together with gentle timing - exactly like profile-setup
        Animated.parallel([
          Animated.timing(contentTranslateX, {
            toValue: 0,
            duration: 700,
            useNativeDriver: true,
          }),
          Animated.timing(contentOpacity, {
            toValue: 1,
            duration: 600,
            useNativeDriver: true,
          }),
          // Button animates in slightly after content starts, creating a nice cascade - exactly like profile-setup
          Animated.sequence([
            Animated.delay(200),
            Animated.parallel([
              Animated.timing(buttonOpacity, {
                toValue: 1,
                duration: 500,
                useNativeDriver: true,
              }),
              Animated.timing(buttonTranslateY, {
                toValue: 0,
                duration: 600,
                useNativeDriver: true,
              })
            ])
          ])
        ]).start();
      }, 100);
    }, [])
  );

  useEffect(() => {
    requestStoreReview();
  }, []);

  // Scroll to current index when it changes
  useEffect(() => {
    if (flatListRef.current) {
      flatListRef.current.scrollToIndex({
        index: currentIndex,
        animated: true,
        viewPosition: 0.5,
      });
    }
  }, [currentIndex]);

  const requestStoreReview = async () => {
    if (Platform.OS === 'web') return;
    
    try {
      const isAvailable = await StoreReview.isAvailableAsync();
      const hasAction = await StoreReview.hasAction();
      
      if (isAvailable && hasAction) {
        // Add a small delay to ensure the screen is fully loaded
        setTimeout(async () => {
          try {
            await StoreReview.requestReview();
            posthogCapture('onboarding_review_requested', {
              platform: Platform.OS
            });
          } catch (reviewError) {
            // Silently fail - this is expected in simulator/development
            console.log('Store review not available in current environment');
          }
        }, 1000);
      }
    } catch (error) {
      // Silently handle - store review failures shouldn't impact UX
      console.log('Store review not available:');
    }
  };

  const testimonials = [
    {
      name: 'Sarah M.',
      role: 'Marketing Manager',
      industry: 'Marketing',
      text: 'I froze in 3 real interviews. After 6 mocks, I landed an offer at a top tech company.',
      rating: 5,
      profilePicture: 'https://media.istockphoto.com/id/1478440723/photo/black-woman-arms-crossed-and-standing-in-confidence-with-vision-isolated-against-a-gray.jpg?s=612x612&w=0&k=20&c=cd4SdG1qNIxP9potasQ1jfzD9VbSbdkCqOtQtBmIT_0='
    },
    {
      name: 'David Chen',
      role: 'Software Engineer',
      industry: 'Technology',
      text: 'The AI feedback was spot-on. Helped me identify blind spots I never knew I had.',
      rating: 5,
      profilePicture: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=150&h=150&fit=crop&crop=face&auto=format'
    },
    {
      name: 'Jennifer L.',
      role: 'Sales Director',
      industry: 'Sales',
      text: 'Went from nervous wreck to confident closer. 9x improvement is no joke!',
      rating: 4.5,
      profilePicture: 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=150&h=150&fit=crop&crop=face&auto=format'
    }
  ];

  const handleContinue = () => {
    // Set direction for next screen
    setNavigationDirection('forward');
    
    // Slide out to left (forward direction) - exactly like profile-setup
    Animated.parallel([
      Animated.timing(contentTranslateX, {
        toValue: -SCREEN_WIDTH,
        duration: 600,
        useNativeDriver: true,
      }),
      Animated.timing(contentOpacity, {
        toValue: 0,
        duration: 500,
        useNativeDriver: true,
      }),
      Animated.timing(buttonOpacity, {
        toValue: 0,
        duration: 400,
        useNativeDriver: true,
      }),
      Animated.timing(buttonTranslateY, {
        toValue: 30,
        duration: 500,
        useNativeDriver: true,
      })
    ]).start(() => {
      // Navigate after animation completes
      setTimeout(() => {
        router.push('/(onboarding)/demo-interview');
      }, 100);
    });
  };

  const handleBack = () => {
    // Set direction for previous screen
    setNavigationDirection('back');
    
    // Slide out to right (back direction) - exactly like profile-setup
    Animated.parallel([
      Animated.timing(contentTranslateX, {
        toValue: SCREEN_WIDTH,
        duration: 600,
        useNativeDriver: true,
      }),
      Animated.timing(contentOpacity, {
        toValue: 0,
        duration: 500,
        useNativeDriver: true,
      }),
      Animated.timing(buttonOpacity, {
        toValue: 0,
        duration: 400,
        useNativeDriver: true,
      }),
      Animated.timing(buttonTranslateY, {
        toValue: 30,
        duration: 500,
        useNativeDriver: true,
      })
    ]).start(() => {
      setTimeout(() => {
        router.back();
      }, 100);
    });
  };

  const renderTestimonial = ({ item, index }: { item: any; index: number }) => (
    <View style={styles.testimonialCard}>
      {/* Top row: Stars (left), chatbubble (right) */}
      <View style={styles.testimonialTopRow}>
        <View style={styles.starsRow}>
          {(() => {
            // Render stars based on item.rating (can be 4.5, 5, etc)
            const stars = [];
            const fullStars = Math.floor(item.rating);
            const hasHalfStar = item.rating - fullStars >= 0.5;
            for (let i = 0; i < fullStars; i++) {
              stars.push(
                <Ionicons
                  key={`star-full-${i}`}
                  name="star"
                  size={18}
                  color={Colors.brand.primary}
                  style={{ marginRight: 2 }}
                />
              );
            }
            if (hasHalfStar) {
              stars.push(
                <Ionicons
                  key="star-half"
                  name="star-half"
                  size={18}
                  color={Colors.brand.primary}
                  style={{ marginRight: 2 }}
                />
              );
            }
            // Fill the rest with outline stars up to 5
            const totalStars = hasHalfStar ? fullStars + 1 : fullStars;
            for (let i = totalStars; i < 5; i++) {
              stars.push(
                <Ionicons
                  key={`star-outline-${i}`}
                  name="star-outline"
                  size={18}
                  color={Colors.brand.primary}
                  style={{ marginRight: 2 }}
                />
              );
            }
            return stars;
          })()}
        </View>
        <View style={styles.quoteIconTop}>
          <Ionicons name="chatbubble-ellipses-outline" size={20} color={Colors.brand.primary} />
        </View>
      </View>
      {/* Review text */}
      <Text style={styles.testimonialText}>{item.text}</Text>
                         {/* Footer: author, role, industry */}
                   <View style={styles.testimonialFooter}>
                     <View style={styles.authorSection}>
                       <Image 
                         source={{ uri: item.profilePicture }}
                         style={styles.testimonialProfilePicture}
                         resizeMode="cover"
                       />
                       <View style={styles.authorInfo}>
                         <Text style={styles.testimonialAuthor}>{item.name}</Text>
                         <Text style={styles.testimonialRole}>{item.role}</Text>
                       </View>
                     </View>
                     <View style={styles.industryBadge}>
                       <Text style={styles.industryText}>{item.industry}</Text>
                     </View>
                   </View>
    </View>
  );

  const onViewableItemsChanged = useRef(({ viewableItems }: any) => {
    if (viewableItems.length > 0) {
      setCurrentIndex(viewableItems[0].index);
    }
  }).current;

  const viewabilityConfig = useRef({
    itemVisiblePercentThreshold: 50,
  }).current;

  return (
    <ChatGPTBackground style={styles.gradient}>
      <View style={styles.container}>
        <OnboardingProgress 
          currentStep={17} 
          totalSteps={12}
          onBack={handleBack}
        />
        
        {/* Animated content container - exactly like profile-setup */}
        <Animated.View 
          style={[
            styles.animatedContent,
            {
              transform: [{ translateX: contentTranslateX }],
              opacity: contentOpacity,
            }
          ]}
        >
          <View style={styles.content}>
            <Text style={styles.screenTitle}>Join thousands who got hired</Text>
            
            <View style={styles.statsContainer}>
              <View style={styles.profilePicturesRow}>
                <Image 
                  source={{ uri: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&h=150&fit=crop&crop=face&auto=format' }}
                  style={[styles.profilePicture, styles.profilePictureFirst]}
                  resizeMode="cover"
                />
                <Image 
                  source={{ uri: 'https://www.elitesingles.co.uk/wp-content/uploads/sites/59/2019/11/elite_singles_slide_6-350x264.png' }}
                  style={[styles.profilePicture, styles.profilePictureSecond]}
                  resizeMode="cover"
                />
                <Image 
                  source={{ uri: 'https://images.unsplash.com/photo-1480455624313-e29b44bbfde1?fm=jpg&q=60&w=3000&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxzZWFyY2h8NHx8bWFsZXxlbnwwfHwwfHx8MA%3D%3D' }}
                  style={[styles.profilePicture, styles.profilePictureThird]}
                  resizeMode="cover"
                />
              </View>
              
              <Text style={styles.statsText}>
                <Text style={styles.statsHighlight}>10,000+</Text> success stories • <Text style={styles.statsHighlight}>87%</Text> get offers
              </Text>
            </View>

            <Text style={styles.subtitle}>
              Real results from people just like you
            </Text>

            {/* Horizontal Carousel */}
            <View style={styles.carouselContainer}>
              <FlatList
                ref={flatListRef}
                data={testimonials}
                renderItem={renderTestimonial}
                keyExtractor={(item, index) => index.toString()}
                horizontal
                showsHorizontalScrollIndicator={false}
                snapToInterval={CARD_WIDTH + CARD_SPACING}
                snapToAlignment="center"
                decelerationRate="fast"
                contentContainerStyle={styles.carouselContent}
                onViewableItemsChanged={onViewableItemsChanged}
                viewabilityConfig={viewabilityConfig}
                pagingEnabled={false}
                getItemLayout={(data, index) => ({
                  length: CARD_WIDTH + CARD_SPACING,
                  offset: (CARD_WIDTH + CARD_SPACING) * index,
                  index,
                })}
                initialScrollIndex={0}
              />
            </View>

            {/* Pagination Dots */}
            <View style={styles.paginationContainer}>
              {testimonials.map((_, index) => (
                <TouchableOpacity
                  key={index}
                  style={[
                    styles.paginationDot,
                    index === currentIndex && styles.paginationDotActive
                  ]}
                  onPress={() => {
                    setCurrentIndex(index);
                    flatListRef.current?.scrollToIndex({
                      index,
                      animated: true,
                      viewPosition: 0.5,
                    });
                  }}
                />
              ))}
            </View>

            <View style={styles.trustIndicator}>
              <Ionicons name="shield-checkmark" size={24} color={Colors.semantic.successAlt} />
              <Text style={styles.trustText}>Trusted by professionals worldwide</Text>
            </View>
          </View>
        </Animated.View>

        <Animated.View 
          style={[
            styles.bottomContainer,
            {
              opacity: buttonOpacity,
              transform: [{ translateY: buttonTranslateY }],
            }
          ]}
        >
          <TouchableOpacity 
            style={styles.continueButton} 
            onPress={handleContinue}
            activeOpacity={0.8}
          >
            <Text style={styles.continueButtonText}>Get Started</Text>
            <Ionicons name="arrow-forward" size={20} color={Colors.white} />
          </TouchableOpacity>
        </Animated.View>
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
    paddingTop: Platform.OS === 'ios' ? 20 : 20,
  },
  content: {
    flex: 1,
    paddingHorizontal: 0,
    justifyContent: 'space-evenly',
    alignItems: 'center',
    paddingTop: 12,
    paddingBottom: 20,
  },
  animatedContent: {
    flex: 1,
  },
  screenTitle: {
    ...TYPOGRAPHY.heading1,
    color: Colors.white,
    textAlign: 'center',
    marginBottom: 16,
  },
  statsContainer: {
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 20,
    paddingHorizontal: 20,
    paddingVertical: 16,
    backgroundColor: Colors.glass.backgroundSubtle,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: Colors.glass.borderSecondary,
    width: '100%',
    maxWidth: 320,
  },
  profilePicturesRow: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 16,
    width: '100%',
  },
  profilePicture: {
    width: 60,
    height: 60,
    borderRadius: 30,
    borderWidth: 1.2,
    borderColor: Colors.brand.primary,
  },
  profilePictureFirst: {
    zIndex: 3,
  },
  profilePictureSecond: {
    marginLeft: -15,
    zIndex: 2,
  },
  profilePictureThird: {
    marginLeft: -15,
    zIndex: 1,
  },
  statsText: {
    ...TYPOGRAPHY.bodyMedium,
    color: Colors.text.tertiary,
    textAlign: 'center',
    lineHeight: 22,
  },
  statsHighlight: {
    fontWeight: '700',
    color: Colors.brand.primary,
  },
  statItem: {
    alignItems: 'center',
    flex: 1,
  },
  statNumber: {
    ...TYPOGRAPHY.displaySmall,
    fontWeight: '700',
    color: Colors.brand.primary,
    marginBottom: 4,
  },
  statLabel: {
    ...TYPOGRAPHY.labelSmall,
    fontWeight: '500',
    color: Colors.text.tertiary,
    textAlign: 'center',
  },
  statDivider: {
    width: 1,
    height: 40,
    backgroundColor: Colors.glass.borderInteractive,
    marginHorizontal: 20,
  },
  subtitle: {
    ...TYPOGRAPHY.bodyMedium,
    color: Colors.text.tertiary,
    textAlign: 'center',
    marginBottom: 20,
    paddingHorizontal: 16,
  },
  carouselContainer: {
    width: '100%',
    marginBottom: 20,
  },
  carouselContent: {
    paddingHorizontal: CARD_MARGIN,
  },
  testimonialCard: {
    backgroundColor: Colors.glass.backgroundSecondary,
    borderRadius: 16,
    padding: 16,
    borderWidth: 1,
    borderColor: Colors.glass.border,
    position: 'relative',
    width: CARD_WIDTH,
    marginRight: CARD_SPACING,
    shadowColor: Colors.black,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 3,
  },
  testimonialTopRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  starsRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  ratingNumber: {
    ...TYPOGRAPHY.labelSmall,
    color: Colors.text.tertiary,
    marginLeft: 8,
    fontWeight: '600',
  },
  quoteIconTop: {
    opacity: 0.6,
  },
  quoteIcon: {
    position: 'absolute',
    top: 16,
    right: 16,
    opacity: 0.6,
  },
  testimonialText: {
    ...TYPOGRAPHY.bodyMedium,
    color: Colors.text.primary,
    lineHeight: 22,
    marginBottom: 16,
    paddingRight: 32,
  },
  testimonialFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  authorSection: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  testimonialProfilePicture: {
    width: 40,
    height: 40,
    borderRadius: 20,
    borderWidth: 2,
    borderColor: Colors.glass.purple,
    marginRight: 12,
  },
  authorInfo: {
    flex: 1,
  },
  testimonialAuthor: {
    ...TYPOGRAPHY.labelMedium,
    fontWeight: '600',
    color: Colors.white,
    marginBottom: 2,
  },
  testimonialRole: {
    ...TYPOGRAPHY.bodyXSmall,
    color: Colors.text.muted,
  },
  industryBadge: {
    backgroundColor: Colors.glass.purple,
    borderRadius: 12,
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderWidth: 1,
    borderColor: Colors.glass.purpleMedium,
  },
  industryText: {
    ...TYPOGRAPHY.overline,
    color: Colors.brand.primary,
  },
  paginationContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 20,
    gap: 12,
  },
  paginationDot: {
    width: 10,
    height: 10,
    borderRadius: 5,
    backgroundColor: Colors.glass.borderPressed,
    opacity: 0.8,
  },
  paginationDotActive: {
    backgroundColor: Colors.brand.primary,
    opacity: 1,
    width: 10,
    height: 10,
    borderRadius: 5,
  },
  trustIndicator: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    backgroundColor: Colors.glass.successSecondary,
    borderRadius: 20,
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderWidth: 1,
    borderColor: Colors.glass.successBorderAlt,
  },
  trustText: {
    ...TYPOGRAPHY.labelSmall,
    color: Colors.semantic.successAlt,
  },
  bottomContainer: {
    width: '100%',
    paddingHorizontal: 24,
    paddingBottom: Platform.OS === 'ios' ? 50 : 30,
    alignItems: 'center',
  },
  continueButton: {
    width: '100%',
    maxWidth: 320,
    height: 56,
    borderRadius: 28,
    backgroundColor: Colors.glass.purple,
    borderWidth: 1,
    borderColor: Colors.brand.primaryRGB,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 24,
    shadowColor: Colors.brand.primary,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 12,
    elevation: 8,
  },
  continueButtonText: {
    ...TYPOGRAPHY.buttonLarge,
    color: Colors.white,
    marginRight: 8,
  },
});

export default OnboardingReviews;