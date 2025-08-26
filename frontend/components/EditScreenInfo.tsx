import React from 'react';
import { StyleSheet } from 'react-native';

import { ExternalLink } from './ExternalLink';
import { MonoText } from './StyledText';
import { Text, View } from './Themed';

import Colors from '@/constants/Colors';

export default function EditScreenInfo({ path }: { path: string }) {
  return (
    <View>
      <View style={styles.getStartedContainer}>
        <Text style={styles.getStartedText}>
          Open up the code for this screen:
        </Text>

        <View style={[styles.codeHighlightContainer, styles.homeScreenFilename]}>
          <MonoText>{path}</MonoText>
        </View>

        <Text style={styles.getStartedText}>
          Change any of the text, save the file, and your app will automatically update.
        </Text>
      </View>

      <View style={styles.helpContainer}>
        <ExternalLink
          style={styles.helpLink}
          href="https://docs.expo.io/get-started/create-a-new-app/#opening-the-app-on-your-phonetablet">
          <Text style={styles.helpLinkText}>
            Tap here if your app doesn't automatically update after making changes
          </Text>
        </ExternalLink>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  getStartedContainer: {
    alignItems: 'center',
    marginHorizontal: 20, // Design system screen padding
    paddingTop: 16,
  },
  homeScreenFilename: {
    marginVertical: 8, // Design system spacing
  },
  codeHighlightContainer: {
    backgroundColor: 'rgba(255, 255, 255, 0.12)', // Glass background
    borderColor: 'rgba(255, 255, 255, 0.15)', // Glass border
    borderWidth: 1,
    borderRadius: 12, // Design system radius
    paddingHorizontal: 12, // Design system spacing
    paddingVertical: 8, // Design system spacing
    // Subtle shadow per design system
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 4,
  },
  getStartedText: {
    color: 'rgba(255, 255, 255, 0.85)', // Text secondary
    fontSize: 16, // Body medium
    lineHeight: 24, // Body medium line height
    textAlign: 'center',
    marginTop: 8,
  },
  helpContainer: {
    marginTop: 16, // Design system spacing
    marginHorizontal: 20, // Design system screen padding
    alignItems: 'center',
  },
  helpLink: {
    backgroundColor: 'rgba(255, 255, 255, 0.10)', // Input glass background
    borderColor: 'rgba(255, 255, 255, 0.15)',
    borderWidth: 1,
    borderRadius: 12,
    paddingVertical: 16,
    paddingHorizontal: 16,
  },
  helpLinkText: {
    color: '#60A5FA', // Accent blue
    textAlign: 'center',
    fontSize: 14, // Label/Body small
    lineHeight: 18,
    fontWeight: '500',
  },
});
