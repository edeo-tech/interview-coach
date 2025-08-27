import React from 'react';
import { View, Text, ScrollView, StyleSheet } from 'react-native';
import { TYPOGRAPHY } from '../constants/Typography';
import Colors from '../constants/Colors';
import ChatGPTBackground from './ChatGPTBackground';

/**
 * Typography Showcase Component
 * 
 * Demonstrates the new enhanced typography system with:
 * - Plus Jakarta Sans for display/hero content  
 * - Space Grotesk for section headings
 * - Inter for body text and UI elements
 */
const TypographyShowcase = () => {
  return (
    <ChatGPTBackground style={styles.container}>
      <ScrollView contentContainerStyle={styles.content}>
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Display Typography</Text>
          <Text style={[TYPOGRAPHY.hero, styles.demoText]}>
            Hero Text - Plus Jakarta Sans
          </Text>
          <Text style={[TYPOGRAPHY.heroMedium, styles.demoText]}>
            Hero Medium - Plus Jakarta Sans
          </Text>
          <Text style={[TYPOGRAPHY.displayLarge, styles.demoText]}>
            Display Large - Plus Jakarta Sans
          </Text>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Headings</Text>
          <Text style={[TYPOGRAPHY.heading1, styles.demoText]}>
            Heading 1 - Space Grotesk Bold
          </Text>
          <Text style={[TYPOGRAPHY.heading2, styles.demoText]}>
            Heading 2 - Space Grotesk SemiBold
          </Text>
          <Text style={[TYPOGRAPHY.heading3, styles.demoText]}>
            Heading 3 - Space Grotesk Light
          </Text>
          <Text style={[TYPOGRAPHY.heading4, styles.demoText]}>
            Heading 4 - Inter SemiBold
          </Text>
          <Text style={[TYPOGRAPHY.heading5, styles.demoText]}>
            Heading 5 - Inter SemiBold
          </Text>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Body Text</Text>
          <Text style={[TYPOGRAPHY.bodyLarge, styles.demoText]}>
            Body Large - Inter Regular. Perfect for important content that needs to stand out while maintaining excellent readability across all devices.
          </Text>
          <Text style={[TYPOGRAPHY.bodyMedium, styles.demoText]}>
            Body Medium - Inter Regular. The primary body text size for most content in the interview coaching app. Optimized for readability and accessibility.
          </Text>
          <Text style={[TYPOGRAPHY.bodySmall, styles.demoText]}>
            Body Small - Inter Regular. Used for secondary information, captions, and supporting details that complement the main content.
          </Text>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>UI Elements</Text>
          <Text style={[TYPOGRAPHY.buttonLarge, styles.demoText]}>
            Button Large - Inter SemiBold
          </Text>
          <Text style={[TYPOGRAPHY.buttonMedium, styles.demoText]}>
            Button Medium - Inter SemiBold
          </Text>
          <Text style={[TYPOGRAPHY.labelLarge, styles.demoText]}>
            Label Large - Inter Medium
          </Text>
          <Text style={[TYPOGRAPHY.labelMedium, styles.demoText]}>
            Label Medium - Inter Medium
          </Text>
          <Text style={[TYPOGRAPHY.caption, styles.demoText]}>
            Caption - Inter Regular
          </Text>
          <Text style={[TYPOGRAPHY.overline, styles.demoText]}>
            Overline - Inter Medium
          </Text>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Professional Context</Text>
          <Text style={[TYPOGRAPHY.hero, { ...styles.demoText, color: Colors.brand.primary }]}>
            Interview Coach
          </Text>
          <Text style={[TYPOGRAPHY.bodyMedium, styles.demoText]}>
            Our enhanced typography system creates a professional, trustworthy, and modern aesthetic perfect for career development and interview preparation. The combination of Plus Jakarta Sans, Space Grotesk, and Inter provides:
          </Text>
          <Text style={[TYPOGRAPHY.bodyMedium, styles.demoText, { marginTop: 16 }]}>
            • <Text style={[TYPOGRAPHY.labelMedium, { color: Colors.text.primary }]}>Plus Jakarta Sans</Text> for impactful heroes and display text
          </Text>
          <Text style={[TYPOGRAPHY.bodyMedium, styles.demoText]}>
            • <Text style={[TYPOGRAPHY.labelMedium, { color: Colors.text.primary }]}>Space Grotesk</Text> for distinctive section headings
          </Text>
          <Text style={[TYPOGRAPHY.bodyMedium, styles.demoText]}>
            • <Text style={[TYPOGRAPHY.labelMedium, { color: Colors.text.primary }]}>Inter</Text> for excellent readability in all UI contexts
          </Text>
        </View>
      </ScrollView>
    </ChatGPTBackground>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  content: {
    padding: 20,
    paddingTop: 60,
  },
  section: {
    marginBottom: 32,
  },
  sectionTitle: {
    ...TYPOGRAPHY.heading2,
    color: Colors.accent.blue,
    marginBottom: 16,
    textAlign: 'center',
  },
  demoText: {
    color: Colors.text.primary,
    marginBottom: 12,
  },
});

export default TypographyShowcase;