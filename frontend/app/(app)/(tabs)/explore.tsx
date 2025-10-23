import React, { useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, Image } from 'react-native';
import InvestHeader from '@/components/ui/InvestHeader';
import ColorsLight from '@/constants/ColorsLight';
import { TYPOGRAPHY } from '@/constants/Typography';
import SectionHeader from '@/components/ui/SectionHeader';
import GradientHeroCard from '@/components/ui/cards/GradientHeroCard';
import SoftCard from '@/components/ui/cards/SoftCard';
import PillButton from '@/components/ui/buttons/PillButton';
import ActionListItem from '@/components/ui/list/ActionListItem';
import { useScreenContext } from '@/contexts/ScreenContextProvider';

export default function ExploreScreen() {
  const { registerScreen, unregisterScreen } = useScreenContext();

  useEffect(() => {
    registerScreen({
      screenName: 'explore',
      title: 'Explore',
      description: 'Financial education hub with topics, guides, and videos to learn about money management',
      keyData: {
        popularTopics: ['Tax hacks', 'First SIP', 'Debt-free'],
        gettingStartedGuides: [
          'Money basics 101 - Build foundation in under 10 minutes',
          'Emergency fund planner - Figure out how much you need',
          'How SIPs work - Investing steadily beats timing the market'
        ],
        videos: [
          'The power of compounding - 3 min video',
          'Avoid these 5 money mistakes - 4 min video'
        ]
      },
      availableActions: [
        'Browse topics',
        'View beginner guides',
        'Explore tax hacks',
        'Learn about SIPs',
        'Watch educational videos',
        'Read money basics',
        'Plan emergency fund',
        'Learn about debt management'
      ]
    });

    return () => unregisterScreen();
  }, [registerScreen, unregisterScreen]);
  return (
    <View style={styles.container}>
      <InvestHeader />
      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        <Text style={styles.pageTitle}>Explore</Text>

        <View style={styles.cardSpacing}>
          <GradientHeroCard
            title="Discover what's possible"
            subtitle="Ideas and guides to make the most of your money"
            primaryAction={{ label: 'Browse topics', onPress: () => {} }}
            secondaryAction={{ label: 'For beginners', onPress: () => {} }}
          />
        </View>

        <SoftCard>
          <View style={styles.softHeaderRow}>
            <Text style={styles.softTitle}>Popular topics</Text>
          </View>
          <Text style={styles.softSubtitle}>Start with what most people explore first.</Text>
          <View style={styles.softActionsRow}>
            <PillButton label="Tax hacks" onPress={() => {}} />
            <PillButton label="First SIP" onPress={() => {}} tone="neutral" />
            <PillButton label="Debt-free" onPress={() => {}} tone="neutral" />
          </View>
        </SoftCard>

        <View style={styles.sectionSpacer} />
        <SectionHeader
          title="Getting started"
          strongTitle
          captionPosition="below"
          caption="Short, actionable reads"
          showChevron
        />
        <View style={styles.listStack}>
          <ActionListItem
            title="Money basics 101"
            subtitle="Build a solid foundation in under 10 minutes"
            leftIconName="book"
            onPress={() => {}}
          />
          <ActionListItem
            title="Emergency fund planner"
            subtitle="Figure out how much you really need"
            leftIconName="umbrella"
            onPress={() => {}}
            style={styles.listItemSpacing}
          />
          <ActionListItem
            title="How SIPs work"
            subtitle="Investing steadily beats timing the market"
            leftIconName="time"
            onPress={() => {}}
          />
        </View>

        <View style={styles.sectionSpacer} />
        <SectionHeader
          title="Watch and learn"
          strongTitle
          showChevron
          captionPosition="below"
          caption="Short videos to level up fast"
        />
        <View style={styles.mediaRow}>
          <View style={styles.mediaCard}>
            <Image source={require('@/assets/images/article1.png')} style={styles.mediaImg} />
            <Text style={styles.mediaTitle}>The power of compounding</Text>
            <Text style={styles.mediaMeta}>Video · 3 min</Text>
          </View>
          <View style={styles.mediaCard}>
            <Image source={require('@/assets/images/article2.png')} style={styles.mediaImg} />
            <Text style={styles.mediaTitle}>Avoid these 5 money mistakes</Text>
            <Text style={styles.mediaMeta}>Video · 4 min</Text>
          </View>
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: ColorsLight.background.primary,
  },
  content: {
    padding: 20,
    paddingTop: 8,
    paddingBottom: 40,
  },
  pageTitle: {
    ...TYPOGRAPHY.pageTitle,
    color: ColorsLight.text.primary,
    marginBottom: 16,
  },
  cardSpacing: {
    marginBottom: 24,
  },
  softHeaderRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  softTitle: {
    ...TYPOGRAPHY.itemTitle,
    color: ColorsLight.text.primary,
  },
  softSubtitle: {
    ...TYPOGRAPHY.bodySmall,
    color: ColorsLight.text.secondary,
    marginBottom: 12,
  },
  softActionsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  sectionSpacer: {
    height: 16,
  },
  listStack: {
    gap: 12,
    marginBottom: 24,
  },
  listItemSpacing: {
    marginVertical: 2,
  },
  mediaRow: {
    flexDirection: 'row',
    gap: 12,
  },
  mediaCard: {
    flex: 1,
    backgroundColor: ColorsLight.background.card,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: ColorsLight.border.default,
    overflow: 'hidden',
  },
  mediaImg: {
    width: '100%',
    height: 120,
  },
  mediaTitle: {
    ...TYPOGRAPHY.subhead,
    color: ColorsLight.text.primary,
    paddingHorizontal: 10,
    paddingTop: 10,
  },
  mediaMeta: {
    ...TYPOGRAPHY.footnote,
    color: ColorsLight.text.tertiary,
    paddingHorizontal: 10,
    paddingBottom: 12,
  },
});
