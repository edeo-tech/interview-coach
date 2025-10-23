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

export default function PayScreen() {
  return (
    <View style={styles.container}>
      <InvestHeader />
      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        <Text style={styles.pageTitle}>Pay</Text>

        <View style={styles.cardSpacing}>
          <GradientHeroCard
            title="Pay anyone, anywhere"
            subtitle="Scan, send or pay bills in seconds"
            primaryAction={{ label: 'New payment', onPress: () => {} }}
            secondaryAction={{ label: 'Split bill', onPress: () => {} }}
          />
        </View>

        <SoftCard>
          <View style={styles.softHeaderRow}>
            <Text style={styles.softTitle}>Shortcuts</Text>
          </View>
          <Text style={styles.softSubtitle}>Your most used payment actions.</Text>
          <View style={styles.softActionsRow}>
            <PillButton label="Scan QR" onPress={() => {}} />
            <PillButton label="UPI ID" onPress={() => {}} tone="neutral" />
            <PillButton label="Contacts" onPress={() => {}} tone="neutral" />
          </View>
        </SoftCard>

        <View style={styles.sectionSpacer} />
        <SectionHeader
          title="Billers"
          strongTitle
          showChevron
          captionPosition="below"
          caption="Pay your monthly essentials"
        />
        <View style={styles.listStack}>
          <ActionListItem title="Electricity" subtitle="Due in 4 days" leftIconName="flash" />
          <ActionListItem title="Internet" subtitle="Due in 8 days" leftIconName="wifi" style={styles.listItemSpacing} />
          <ActionListItem title="Water" subtitle="Due in 12 days" leftIconName="water" />
        </View>

        <View style={styles.sectionSpacer} />
        <SectionHeader
          title="Recent payments"
          strongTitle
          showChevron
          captionPosition="below"
          caption="Tap to repeat or view details"
        />
        <View style={styles.listStack}>
          <ActionListItem title="Paid to Arjun" subtitle="₹650 · Yesterday" leftIconName="person" />
          <ActionListItem title="Cafe Blue" subtitle="₹320 · Tue" leftIconName="cafe" style={styles.listItemSpacing} />
          <ActionListItem title="Zomato" subtitle="₹480 · Mon" leftIconName="fast-food" />
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
