import React, { useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView } from 'react-native';
import InvestHeader from '@/components/ui/InvestHeader';
import ColorsLight from '@/constants/ColorsLight';
import { TYPOGRAPHY } from '@/constants/Typography';
import GradientHeroCard from '@/components/ui/cards/GradientHeroCard';
import SoftCard from '@/components/ui/cards/SoftCard';
import PillButton from '@/components/ui/buttons/PillButton';
import SectionHeader from '@/components/ui/SectionHeader';
import ActionListItem from '@/components/ui/list/ActionListItem';
import { useScreenContext } from '@/contexts/ScreenContextProvider';

export default function HomeScreen() {
  const { registerScreen, unregisterScreen } = useScreenContext();

  useEffect(() => {
    registerScreen({
      screenName: 'home',
      title: 'Home',
      description: 'Dashboard showing overview of user finances, quick actions, insights, and recommendations',
      keyData: {
        quickActions: ['Pay', 'Invest', 'Top up'],
        insights: [
          'Track your spending - 8% more than last month',
          'Set a savings goal - People who set goals save 2x more',
          'Improve credit health - 3 suggestions to raise your score'
        ],
        recommendations: [
          'Automate your investments with monthly SIP',
          'Build an emergency fund with 3-6 months expenses'
        ]
      },
      availableActions: [
        'Add money',
        'View insights',
        'Pay bills',
        'Invest',
        'Top up account',
        'Track spending',
        'Set savings goals',
        'Improve credit health',
        'Automate investments',
        'Build emergency fund'
      ]
    });

    return () => unregisterScreen();
  }, [registerScreen, unregisterScreen]);
  return (
    <View style={styles.container}>
      <InvestHeader />
      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        <Text style={styles.pageTitle}>Home</Text>

        <View style={styles.cardSpacing}>
          <GradientHeroCard
            title="Welcome back"
            subtitle="Here's a quick snapshot of your money today"
            primaryAction={{ label: 'Add money', onPress: () => {} }}
            secondaryAction={{ label: 'View insights', onPress: () => {} }}
          />
        </View>

        <SoftCard>
          <View style={styles.softHeaderRow}>
            <Text style={styles.softTitle}>Quick actions</Text>
          </View>
          <Text style={styles.softSubtitle}>Do more with your money in just a tap.</Text>
          <View style={styles.softActionsRow}>
            <PillButton label="Pay" onPress={() => {}} />
            <PillButton label="Invest" onPress={() => {}} tone="neutral" />
            <PillButton label="Top up" onPress={() => {}} tone="neutral" />
          </View>
        </SoftCard>

        <View style={styles.sectionSpacer} />
        <SectionHeader
          title="Insights"
          strongTitle
          showChevron
          captionPosition="below"
          caption="Based on your recent activity"
        />
        <View style={styles.listStack}>
          <ActionListItem
            title="Track your spending"
            subtitle="You're spending 8% more than last month"
            leftIconName="card"
            onPress={() => {}}
          />
          <ActionListItem
            title="Set a savings goal"
            subtitle="People who set goals save 2x more"
            leftIconName="trending-up"
            onPress={() => {}}
            style={styles.listItemSpacing}
          />
          <ActionListItem
            title="Improve credit health"
            subtitle="3 suggestions to raise your score"
            leftIconName="shield-checkmark"
            onPress={() => {}}
          />
        </View>

        <View style={styles.sectionSpacer} />
        <SectionHeader
          title="Recommended for you"
          strongTitle
          showChevron
          captionPosition="below"
          caption="Handpicked ideas to grow your money"
        />
        <View style={styles.listStack}>
          <ActionListItem
            title="Automate your investments"
            subtitle="Start a monthly SIP in under 2 minutes"
            leftIconName="time"
            onPress={() => {}}
          />
          <ActionListItem
            title="Build an emergency fund"
            subtitle="Park 3–6 months of expenses for rainy days"
            leftIconName="umbrella"
            onPress={() => {}}
            style={styles.listItemSpacing}
          />
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
});
