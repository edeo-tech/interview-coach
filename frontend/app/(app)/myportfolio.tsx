import React from 'react';
import { View, Text, StyleSheet, ScrollView, Image, TouchableOpacity } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';
import { router } from 'expo-router';
import ColorsLight from '@/constants/ColorsLight';
import { TYPOGRAPHY } from '@/constants/Typography';

export default function MyPortfolioScreen() {
    const insets = useSafeAreaInsets();

    return (
        <View style={styles.container}>
            {/* Header */}
            <View style={[styles.headerSafe, { paddingTop: insets.top + 8 }]}> 
                <View style={styles.headerRow}>
                    <TouchableOpacity onPress={() => router.back()} activeOpacity={0.8} style={styles.backRow}>
                        <Ionicons name="chevron-back" size={22} color={ColorsLight.text.primary} />
                        <Text style={styles.backText}>Back</Text>
                    </TouchableOpacity>

                    <View style={styles.builderPill}>
                        <MaterialCommunityIcons name="hammer" size={14} color={ColorsLight.brand.primary} />
                        <Text style={styles.builderText}>THE BUILDER</Text>
                    </View>

                    <TouchableOpacity activeOpacity={0.8} style={styles.kebabButton}>
                        <MaterialCommunityIcons name="dots-vertical" size={20} color={ColorsLight.text.primary} />
                    </TouchableOpacity>
                </View>
            </View>

            <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
                {/* Title and blurb */}
                <Text style={styles.pageTitle}>We have a tailored{"\n"}portfolio for you</Text>
                <Text style={styles.caption}>Subscribe to unlock your portfolio.</Text>

                {/* Wealth potential */}
                <View style={styles.cardSection}>
                    <View style={styles.sectionHeaderRow}>
                        <Text style={styles.sectionLabel}>Your wealth potential</Text>
                        <Ionicons name="information-circle-outline" size={18} color={ColorsLight.text.primary} />
                    </View>

                    {/* What it tells card */}
                    <View style={styles.infoCard}> 
                        <View style={styles.infoCardHeader}>
                            <View style={styles.infoBadge}>
                                <Ionicons name="information" size={13} color={ColorsLight.brand.primary} />
                            </View>
                            <Text style={styles.infoCardTitle}>What it tells</Text>
                        </View>
                        <Text style={styles.infoCardBody}>It shows the growth potential of your portfolio, that has been tailored to your investor type.</Text>
                    </View>

                    <Text style={styles.bigNumber}>₹1.38 crore in 30 years</Text>
                    <Text style={styles.rangeText}>Range: ₹19.2 lakh to 2.13 crore</Text>
                    <Image source={require('@/assets/images/growth.png')} resizeMode="contain" style={styles.growthImg} />
                    <View style={styles.axisRow}>
                        <Text style={styles.axisLabel}>Today</Text>
                        <Text style={styles.axisLabel}>30Y</Text>
                    </View>
                </View>

                {/* Investments controls (static placeholders) */}
                <View style={styles.inputsRow}> 
                    <View style={styles.inputChip}><Text style={styles.inputLabel}>Initial Investment</Text><Text style={styles.inputValue}>₹1,00,000</Text></View>
                    <View style={styles.inputChip}><Text style={styles.inputLabel}>Monthly Contribution</Text><Text style={styles.inputValue}>₹10,000</Text></View>
                </View>

                {/* Market scenarios */}
                <View style={styles.cardSection}>
                    <Text style={styles.sectionTitle}>Your portfolio in different{"\n"}market scenarios</Text>
                    <Text style={styles.caption}>This helps you know how your portfolio responds to market fluctuations.</Text>
                    <Image source={require('@/assets/images/stress test.png')} resizeMode="contain" style={styles.scenarioImg} />
                </View>

                {/* Asset allocation donut */}
                <View style={styles.cardSection}>
                    <Text style={styles.sectionTitle}>Your asset allocation</Text>
                    <Text style={styles.caption}>Here’s how your money is invested across assets to support your plan.</Text>
                    <Image source={require('@/assets/images/donutChartShape.png')} resizeMode="contain" style={styles.donutImg} />
                </View>

                {/* Watch and learn */}
                <View style={styles.cardSection}>
                    <Text style={styles.sectionTitle}>Watch and learn</Text>
                    <View style={styles.articlesRow}>
                        <View style={styles.articleCard}>
                            <Image source={require('@/assets/images/article1.png')} style={styles.articleImg} />
                            <Text style={styles.articleCaption}>Three reasons to consider investment advice</Text>
                            <Text style={styles.articleMeta}>Video · 4 min</Text>
                        </View>
                        <View style={styles.articleCard}>
                            <Image source={require('@/assets/images/article2.png')} style={styles.articleImg} />
                            <Text style={styles.articleCaption}>What is the advantage of asset allocation?</Text>
                            <Text style={styles.articleMeta}>Video · 4 min</Text>
                        </View>
                    </View>
                </View>

                {/* Disclaimer */}
                <Text style={styles.disclaimer}>DISCLAIMER: The information shown is for reference purposes only; not a recommendation or advice. Past performance is not indicative of future results. Investments in securities market are subject to market risks. Read all the related documents carefully before investing.</Text>

                <View style={{ height: 96 }} />
            </ScrollView>

            {/* Bottom CTA */}
            <View style={[styles.ctaBar, { paddingBottom: Math.max(16, insets.bottom) }]}> 
                <TouchableOpacity style={styles.ctaButton} activeOpacity={0.9}>
                    <Text style={styles.ctaText}>Subscribe now</Text>
                </TouchableOpacity>
            </View>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: ColorsLight.background.primary,
    },
    headerSafe: {
        backgroundColor: ColorsLight.background.primary,
    },
    headerRow: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        paddingHorizontal: 16,
        paddingBottom: 12,
    },
    backRow: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    backText: {
        ...TYPOGRAPHY.callout,
        color: ColorsLight.text.primary,
        marginLeft: 4,
    },
    builderPill: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: ColorsLight.icon.background,
        paddingHorizontal: 10,
        paddingVertical: 6,
        borderRadius: 16,
    },
    builderText: {
        ...TYPOGRAPHY.footnote,
        color: ColorsLight.brand.primary,
        fontWeight: '700',
        marginLeft: 6,
        letterSpacing: 0.4,
    },
    kebabButton: {
        padding: 8,
    },

    content: {
        padding: 20,
        paddingTop: 8,
        paddingBottom: 40,
    },

    pageTitle: {
        ...TYPOGRAPHY.heading1,
        color: ColorsLight.text.primary,
        marginBottom: 8,
    },
    caption: {
        ...TYPOGRAPHY.subhead,
        color: ColorsLight.text.secondary,
        marginBottom: 16,
    },

    cardSection: {
        marginTop: 8,
        marginBottom: 16,
    },
    sectionHeaderRow: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        marginBottom: 8,
    },
    sectionLabel: {
        ...TYPOGRAPHY.heading2,
        color: ColorsLight.text.primary,
    },

    infoCard: {
        backgroundColor: ColorsLight.background.secondary,
        borderColor: ColorsLight.border.default,
        borderWidth: 1,
        borderRadius: 12,
        padding: 12,
        marginBottom: 10,
    },
    infoCardHeader: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 6,
    },
    infoBadge: {
        width: 24,
        height: 24,
        borderRadius: 12,
        backgroundColor: ColorsLight.card.backgroundSecondary,
        alignItems: 'center',
        justifyContent: 'center',
        borderColor: ColorsLight.border.brandLight,
        borderWidth: 1,
        marginRight: 8,
    },
    infoCardTitle: {
        ...TYPOGRAPHY.labelLarge,
        color: ColorsLight.text.primary,
    },
    infoCardBody: {
        ...TYPOGRAPHY.bodySmall,
        color: ColorsLight.text.secondary,
    },

    bigNumber: {
        ...TYPOGRAPHY.heading2,
        color: ColorsLight.text.primary,
        marginTop: 6,
    },
    rangeText: {
        ...TYPOGRAPHY.caption,
        color: ColorsLight.text.tertiary,
        marginBottom: 10,
    },
    growthImg: {
        width: '100%',
        height: 220,
    },
    axisRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        marginTop: 6,
    },
    axisLabel: {
        ...TYPOGRAPHY.caption,
        color: ColorsLight.text.tertiary,
    },

    inputsRow: {
        flexDirection: 'row',
        gap: 12,
        marginBottom: 16,
    },
    inputChip: {
        flex: 1,
        backgroundColor: ColorsLight.background.secondary,
        borderWidth: 1,
        borderColor: ColorsLight.border.default,
        borderRadius: 12,
        paddingHorizontal: 12,
        paddingVertical: 10,
    },
    inputLabel: {
        ...TYPOGRAPHY.footnote,
        color: ColorsLight.text.tertiary,
        marginBottom: 4,
    },
    inputValue: {
        ...TYPOGRAPHY.callout,
        color: ColorsLight.text.primary,
        fontWeight: '600',
    },

    sectionTitle: {
        ...TYPOGRAPHY.heading3,
        color: ColorsLight.text.primary,
        marginBottom: 8,
    },
    scenarioImg: {
        width: '100%',
        aspectRatio: 328 / 440,
        borderRadius: 14,
        backgroundColor: ColorsLight.brand.primaryDark,
    },

    donutImg: {
        width: '100%',
        height: 240,
    },

    articlesRow: {
        flexDirection: 'row',
        gap: 12,
    },
    articleCard: {
        flex: 1,
        backgroundColor: ColorsLight.background.card,
        borderRadius: 12,
        borderWidth: 1,
        borderColor: ColorsLight.border.default,
        overflow: 'hidden',
    },
    articleImg: {
        width: '100%',
        height: 120,
    },
    articleCaption: {
        ...TYPOGRAPHY.subhead,
        color: ColorsLight.text.primary,
        paddingHorizontal: 10,
        paddingTop: 10,
    },
    articleMeta: {
        ...TYPOGRAPHY.footnote,
        color: ColorsLight.text.tertiary,
        paddingHorizontal: 10,
        paddingBottom: 12,
    },

    disclaimer: {
        fontSize: 10,
        lineHeight: 14,
        color: ColorsLight.text.tertiary,
        marginTop: 12,
    },

    ctaBar: {
        position: 'absolute',
        left: 0,
        right: 0,
        bottom: 0,
        backgroundColor: ColorsLight.background.primary,
        borderTopWidth: 1,
        borderTopColor: ColorsLight.border.default,
        paddingHorizontal: 20,
        paddingTop: 12,
    },
    ctaButton: {
        backgroundColor: ColorsLight.accent.gold,
        borderRadius: 24,
        paddingVertical: 14,
        alignItems: 'center',
        justifyContent: 'center',
    },
    ctaText: {
        ...TYPOGRAPHY.callout,
        color: ColorsLight.white,
        fontWeight: '700',
    },
});


