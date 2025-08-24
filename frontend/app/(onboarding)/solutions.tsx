import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Platform, ScrollView } from 'react-native';
import { router } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import ChatGPTBackground from '../../components/ChatGPTBackground';
import OnboardingProgress from '../../components/OnboardingProgress';
import { useOnboarding } from '../../contexts/OnboardingContext';

const ProblemValidation = () => {
  const { data } = useOnboarding();
  
  const handleContinue = () => {
    router.push('/(onboarding)/demo');
  };

  const getPrimaryProblem = () => {
    const ratings = {
      preparation: data.preparationRating || 0,
      communication: data.communicationRating || 0,
      nerves: data.nervesRating || 0,
    };

    // Find the highest rating (most problematic area)
    const highestRating = Math.max(...Object.values(ratings));
    const primaryProblemKey = Object.keys(ratings).find(key => ratings[key] === highestRating) || 'preparation';
    
    const problemMap = {
      preparation: 'lack of preparation',
      communication: 'communication issues', 
      nerves: 'interview nerves'
    };

    return {
      name: problemMap[primaryProblemKey],
      rating: highestRating,
      area: primaryProblemKey
    };
  };

  const primaryProblem = getPrimaryProblem();
  const industryName = data.industry ? data.industry.charAt(0).toUpperCase() + data.industry.slice(1) : 'your field';

  const getInsightMessage = () => {
    const hasFailedBefore = data.hasFailed;
    
    switch (primaryProblem.area) {
      case 'preparation':
        return hasFailedBefore 
          ? "Looking at your past struggles, research shows that 73% of failed interviews trace back to inadequate preparation rather than lack of qualifications."
          : "Research shows that 73% of candidates fail because they wing it instead of preparing strategic examples - but you can avoid this.";
      case 'communication':
        return hasFailedBefore
          ? "Based on your experience, you're not alone - studies reveal that 68% of rejections happen due to poor communication, not insufficient skills."
          : "Studies reveal that 68% of rejections happen due to poor communication, not lack of skills - this is your chance to stand out.";
      case 'nerves':
        return hasFailedBefore
          ? "Your nervousness makes sense given your past experience, but data shows 61% of qualified candidates self-sabotage due to unmanaged anxiety."
          : "Data shows that 61% of qualified candidates self-sabotage due to unmanaged interview anxiety - you can master this before it becomes an issue.";
      default:
        return hasFailedBefore
          ? "Most interview failures aren't about credentials - they're about the preparation you can now control."
          : "Most interview failures aren't about credentials - they're about preparation, which you have the power to master.";
    }
  };

  const getComparisonCards = () => {
    const cardContent = {
      preparation: {
        struggling: {
          title: "Unprepared",
          items: [
            "Wings it with generic answers",
            "Stumbles through examples", 
            "Lacks company knowledge",
            "Can't articulate their value"
          ]
        },
        succeeding: {
          title: "Well-Prepared",
          items: [
            "Uses specific, relevant examples",
            "Demonstrates deep company research",
            "Articulates clear value proposition", 
            "Asks insightful questions"
          ]
        }
      },
      communication: {
        struggling: {
          title: "Poor Communicator", 
          items: [
            "Rambles without clear points",
            "Uses unprofessional language",
            "Poor body language/presence",
            "Doesn't listen actively"
          ]
        },
        succeeding: {
          title: "Strong Communicator",
          items: [
            "Concise, structured responses",
            "Professional, confident tone",
            "Engaging body language",
            "Asks clarifying questions"
          ]
        }
      },
      nerves: {
        struggling: {
          title: "Anxious Candidate",
          items: [
            "Freezes up under pressure",
            "Voice shakes, appears nervous",
            "Makes careless mistakes", 
            "Undersells their abilities"
          ]
        },
        succeeding: {
          title: "Calm & Confident",
          items: [
            "Stays composed under pressure",
            "Speaks with steady confidence",
            "Thinks clearly through challenges",
            "Showcases abilities naturally"
          ]
        }
      }
    };

    const content = cardContent[primaryProblem.area] || cardContent.preparation;
    
    return (
      <>
        <View style={styles.comparisonCard}>
          <View style={styles.cardHeader}>
            <Ionicons name="close-circle" size={32} color="#EF4444" />
            <Text style={styles.cardTitle}>{content.struggling.title}</Text>
          </View>
          <View style={styles.cardContent}>
            {content.struggling.items.map((item, index) => (
              <Text key={index} style={styles.cardItem}>• {item}</Text>
            ))}
          </View>
        </View>

        <View style={[styles.comparisonCard, styles.preparedCard]}>
          <View style={styles.cardHeader}>
            <Ionicons name="checkmark-circle" size={32} color="#10B981" />
            <Text style={[styles.cardTitle, styles.preparedTitle]}>{content.succeeding.title}</Text>
          </View>
          <View style={styles.cardContent}>
            {content.succeeding.items.map((item, index) => (
              <Text key={index} style={styles.cardItem}>• {item}</Text>
            ))}
          </View>
        </View>
      </>
    );
  };

  return (
    <ChatGPTBackground style={styles.gradient}>
      <View style={styles.container}>
        <OnboardingProgress currentStep={13} totalSteps={17} />
        
        <ScrollView style={styles.scrollContent} showsVerticalScrollIndicator={false}>
          <View style={styles.content}>
            <Text style={styles.screenTitle}>Screen 13: Problem Validation</Text>
            
            <View style={styles.insightContainer}>
              <Text style={styles.insightText}>
                {data.hasFailed 
                  ? `Looking back at your interview struggles, your main challenge was `
                  : `Based on your self-assessment, your biggest interview concern is `
                }<Text style={styles.highlightText}>{primaryProblem.name}</Text>. {getInsightMessage()}
              </Text>
            </View>

            <View style={styles.comparisonContainer}>
              <Text style={styles.comparisonTitle}>The Difference</Text>
              
              <View style={styles.comparisonRow}>
                {getComparisonCards()}
              </View>
            </View>
          </View>
        </ScrollView>

        <View style={styles.bottomContainer}>
          <TouchableOpacity style={styles.continueButton} onPress={handleContinue}>
            <Text style={styles.continueButtonText}>I want to be prepared</Text>
            <Ionicons name="arrow-forward" size={20} color="#ffffff" />
          </TouchableOpacity>
        </View>
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
    paddingTop: Platform.OS === 'ios' ? 32 : 16,
    paddingBottom: Platform.OS === 'ios' ? 32 : 16,
  },
  scrollContent: {
    flex: 1,
  },
  content: {
    paddingHorizontal: 20,
    paddingVertical: 20,
  },
  screenTitle: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#ffffff',
    textAlign: 'center',
    marginBottom: 24,
  },
  insightContainer: {
    backgroundColor: 'rgba(245, 158, 11, 0.15)',
    borderRadius: 16,
    padding: 24,
    marginBottom: 32,
    borderWidth: 1,
    borderColor: 'rgba(245, 158, 11, 0.3)',
  },
  insightText: {
    fontSize: 18,
    color: 'rgba(255, 255, 255, 0.9)',
    textAlign: 'center',
    lineHeight: 26,
  },
  highlightText: {
    color: '#F59E0B',
    fontWeight: '700',
  },
  comparisonContainer: {
    marginBottom: 24,
  },
  comparisonTitle: {
    fontSize: 22,
    fontWeight: 'bold',
    color: '#ffffff',
    textAlign: 'center',
    marginBottom: 20,
  },
  comparisonRow: {
    gap: 16,
  },
  comparisonCard: {
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    borderRadius: 16,
    padding: 20,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.2)',
    marginBottom: 12,
  },
  preparedCard: {
    backgroundColor: 'rgba(16, 185, 129, 0.1)',
    borderColor: 'rgba(16, 185, 129, 0.3)',
  },
  cardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    marginBottom: 16,
  },
  cardTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#ffffff',
  },
  preparedTitle: {
    color: '#10B981',
  },
  cardContent: {
    gap: 8,
  },
  cardItem: {
    fontSize: 14,
    color: 'rgba(255, 255, 255, 0.8)',
    lineHeight: 20,
  },
  bottomContainer: {
    paddingHorizontal: 20,
    paddingBottom: 20,
  },
  continueButton: {
    backgroundColor: '#F59E0B',
    borderRadius: 12,
    paddingVertical: 18,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
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

export default ProblemValidation;