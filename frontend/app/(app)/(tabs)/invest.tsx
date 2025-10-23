import React from 'react';
import { View, Text, StyleSheet, ScrollView } from 'react-native';
import ColorsLight from '@/constants/ColorsLight';
import { TYPOGRAPHY } from '@/constants/Typography';
import SectionHeader from '@/components/ui/SectionHeader';
import GradientHeroCard from '@/components/ui/cards/GradientHeroCard';
import SoftCard from '@/components/ui/cards/SoftCard';
import PillButton from '@/components/ui/buttons/PillButton';
import ActionListItem from '@/components/ui/list/ActionListItem';
import NfoListItem from '@/components/ui/list/NfoListItem';
import FundListItem from '@/components/ui/list/FundListItem';
import InvestHeader from '@/components/ui/InvestHeader';

export default function InvestScreen() {
    return (
        <View style={styles.container}>
            <InvestHeader />
            <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
                <Text style={styles.pageTitle}>Invest</Text>

                <View style={styles.cardSpacing}>
                    <GradientHeroCard
                        title="Investment Advice"
                        subtitle="Jio BlackRock Investment Advisers"
                        primaryAction={{ label: 'Invest', onPress: () => {} }}
                        secondaryAction={{ label: 'Portfolio', onPress: () => {} }}
                    />
                </View>

                <SoftCard>
                    <View style={styles.softHeaderRow}>
                        <Text style={styles.softTitle}>Managed Funds</Text>
                    </View>
                    <Text style={styles.softSubtitle}>
                        Access mutual funds that combine global investment expertise, innovative strategies and technology.
                    </Text>
                    <View style={styles.softActionsRow}>
                        <PillButton label="Explore" onPress={() => {}} />
                        <PillButton label="Learn more" onPress={() => {}} tone="neutral" />
                    </View>
                </SoftCard>

                <View style={styles.sectionSpacer} />
                <SectionHeader
                    title="Investment Advice"
                    strongTitle
                    showChevron
                    captionPosition="below"
                    caption="By Jio BlackRock Investment Advisers Pvt. Ltd."
                />
                <View style={styles.listStack}>
                    <ActionListItem
                        title="Wealth checkup"
                        subtitle="See how delaying affects your returns"
                        leftIconName="heart"
                        onPress={() => {}}
                    />
                    <ActionListItem
                        title="Understand your wealth potential"
                        subtitle="See how your money can grow over time"
                        leftIconName="trending-up"
                        onPress={() => {}}
                        style={styles.listItemSpacing}
                    />
                    <ActionListItem
                        title="Delay cost calculator"
                        subtitle="Estimate returns from monthly investing"
                        leftIconName="time"
                        onPress={() => {}}
                    />
                </View>

                <View style={styles.sectionSpacer} />
                <SectionHeader
                    title="Mutual Funds"
                    strongTitle
                    showChevron
                    captionPosition="below"
                    caption="By Jio BlackRock Asset Management Pvt. Ltd."
                />

                <Text style={styles.sectionLabelStrong}>NFOs</Text>
                <NfoListItem
                    name="JioBlackRock Income Plus Arbitrage Active FoF Direct Growth"
                    subtitle="Equity · Moderate risk"
                    closesIn="Closes in 3 days"
                    chips={["Short Term", "Easy Liquidity"]}
                    onPress={() => {}}
                    style={styles.nfoSpacing}
                    variant="plain"
                />

                <Text style={styles.sectionLabelStrong}>Active Funds</Text>
                <View style={styles.listStack}>
                    <FundListItem
                        name="JioBlackRock Liquid Fund"
                        category="Equity"
                        risk="Very high risk"
                        returnDeltaPct={10.17}
                        periodLabel="1Y"
                        onPress={() => {}}
                        variant="plain"
                    />
                    <FundListItem
                        name="JioBlackRock Money Market Fund"
                        category="Commodities"
                        risk="High risk"
                        returnDeltaPct={33.37}
                        periodLabel="1Y"
                        onPress={() => {}}
                        variant="plain"
                        style={styles.listItemSpacing}
                    />
                    <FundListItem
                        name="JioBlackRock Overnight Fund"
                        category="Hybrid"
                        risk="Low risk"
                        returnDeltaPct={7.67}
                        periodLabel="1Y"
                        onPress={() => {}}
                        variant="plain"
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
    sectionLabelStrong: {
        ...TYPOGRAPHY.heading3,
        color: ColorsLight.text.primary,
        fontWeight: '700',
        marginBottom: 12,
        marginTop: 10,
        paddingHorizontal: 2,
    },
    nfoSpacing: {
        marginBottom: 16,
    },
});
