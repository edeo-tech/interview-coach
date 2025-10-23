import React from 'react';
import { View, Text, StyleSheet, ScrollView } from 'react-native';
import InvestHeader from '@/components/ui/InvestHeader';
import ColorsLight from '@/constants/ColorsLight';
import { TYPOGRAPHY } from '@/constants/Typography';
import GradientHeroCard from '@/components/ui/cards/GradientHeroCard';
import SoftCard from '@/components/ui/cards/SoftCard';
import PillButton from '@/components/ui/buttons/PillButton';
import SectionHeader from '@/components/ui/SectionHeader';
import ActionListItem from '@/components/ui/list/ActionListItem';

export default function FinancesScreen() {
  return (
    <View style={styles.container}>
      <InvestHeader />
      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        <Text style={styles.pageTitle}>Finances</Text>

        <View style={styles.cardSpacing}>
          <GradientHeroCard
            title="Your money at a glance"
            subtitle="Balances, bills and budgets in one place"
            primaryAction={{ label: 'Add account', onPress: () => {} }}
            secondaryAction={{ label: 'Create budget', onPress: () => {} }}
          />
        </View>

        <SoftCard>
          <View style={styles.softHeaderRow}>
            <Text style={styles.softTitle}>Monthly summary</Text>
          </View>
          <Text style={styles.softSubtitle}>Track what's coming in and going out.</Text>
          <View style={styles.summaryRow}>
            <View style={styles.summaryPill}><Text style={styles.summaryLabel}>Income</Text><Text style={styles.summaryValue}>₹1,20,000</Text></View>
            <View style={styles.summaryPill}><Text style={styles.summaryLabel}>Spent</Text><Text style={styles.summaryValue}>₹86,400</Text></View>
            <View style={styles.summaryPill}><Text style={styles.summaryLabel}>Saved</Text><Text style={styles.summaryValue}>₹18,200</Text></View>
          </View>
          <View style={styles.softActionsRow}>
            <PillButton label="View report" onPress={() => {}} />
            <PillButton label="Export" onPress={() => {}} tone="neutral" />
          </View>
        </SoftCard>

        <View style={styles.sectionSpacer} />
        <SectionHeader
          title="Goals"
          strongTitle
          showChevron
          captionPosition="below"
          caption="Stay on track with your targets"
        />
        <View style={styles.listStack}>
          <ActionListItem
            title="Europe trip"
            subtitle="₹42,000 saved of ₹1,50,000 goal"
            leftIconName="airplane"
            onPress={() => {}}
          />
          <ActionListItem
            title="New bike"
            subtitle="₹12,500 saved of ₹80,000 goal"
            leftIconName="bicycle"
            onPress={() => {}}
            style={styles.listItemSpacing}
          />
        </View>

        <View style={styles.sectionSpacer} />
        <SectionHeader
          title="Recent activity"
          strongTitle
          showChevron
          captionPosition="below"
          caption="Your latest transactions"
        />
        <View style={styles.listStack}>
          <ActionListItem title="Groceries" subtitle="₹2,150 · Yesterday" leftIconName="basket" />
          <ActionListItem title="Electricity bill" subtitle="₹1,240 · Tue" leftIconName="flash" style={styles.listItemSpacing} />
          <ActionListItem title="Gym membership" subtitle="₹999 · Sun" leftIconName="barbell" />
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
    marginTop: 12,
  },
  summaryRow: {
    flexDirection: 'row',
    gap: 8,
  },
  summaryPill: {
    flex: 1,
    backgroundColor: ColorsLight.background.secondary,
    borderWidth: 1,
    borderColor: ColorsLight.border.default,
    borderRadius: 12,
    paddingHorizontal: 12,
    paddingVertical: 10,
  },
  summaryLabel: {
    ...TYPOGRAPHY.footnote,
    color: ColorsLight.text.tertiary,
    marginBottom: 4,
  },
  summaryValue: {
    ...TYPOGRAPHY.callout,
    color: ColorsLight.text.primary,
    fontWeight: '600',
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
