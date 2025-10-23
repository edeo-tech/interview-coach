import React, { useEffect } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView, Image } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';
import ColorsLight from '@/constants/ColorsLight';
import { TYPOGRAPHY } from '@/constants/Typography';
import { router } from 'expo-router';
import { useScreenContext } from '@/contexts/ScreenContextProvider';

export default function MutualFundsScreen() {
    const insets = useSafeAreaInsets();
    const { registerScreen, unregisterScreen } = useScreenContext();

    useEffect(() => {
        registerScreen({
            screenName: 'mutual_funds',
            title: 'Mutual Funds',
            description: 'Educational content about mutual funds - what they are, how they work, benefits, and risks',
            keyData: {
                mainMessage: 'Invest together, grow together',
                keyPoints: [
                    'Mutual funds pool money from many investors',
                    'Professionally managed portfolio of stocks, bonds, or other assets',
                    'Each investor owns units of the fund',
                    'Performance tracked through Net Asset Value (NAV)',
                    'Benefits: Diversification, professional management, accessibility, liquidity',
                    'Considerations: Value can rise or fall, management fees apply'
                ],
                example: '₹1,000 investment in equity fund owning 100 companies, 8% annual growth potential'
            },
            availableActions: [
                'Learn what mutual funds are',
                'Understand how they work',
                'See benefits and risks',
                'Browse available funds',
                'Learn about ETFs'
            ]
        });

        return () => unregisterScreen();
    }, [registerScreen, unregisterScreen]);

    return (
        <View style={styles.container}>
            <View style={[styles.headerSafe, { paddingTop: insets.top + 8 }]}> 
                <View style={styles.headerRow}>
                    <TouchableOpacity onPress={() => router.back()} activeOpacity={0.8} style={styles.backRow}>
                        <Ionicons name="chevron-back" size={22} color={ColorsLight.text.primary} />
                        <Text style={styles.backText}>Back</Text>
                    </TouchableOpacity>

                    <View style={styles.builderPill}>
                        <MaterialCommunityIcons name="chart-line" size={14} color={ColorsLight.brand.primary} />
                        <Text style={styles.builderText}>MUTUAL FUNDS</Text>
                    </View>

                    <TouchableOpacity activeOpacity={0.8} style={styles.kebabButton}>
                        <MaterialCommunityIcons name="dots-vertical" size={20} color={ColorsLight.text.primary} />
                    </TouchableOpacity>
                </View>
            </View>

            <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
                {/* Hero */}
                <Text style={styles.pageTitle}>Invest together, grow together</Text>
                <Text style={styles.caption}>
                    Mutual funds let you invest alongside thousands of others — pooling your money into a
                    professionally managed portfolio of stocks, bonds, or other assets. Whether you’re saving for the
                    long term or just starting out, they make diversification simple.
                </Text>
                <Image
                    source={require('@/assets/images/HeroSection.png')}
                    resizeMode="contain"
                    style={styles.graphImg}
                />

                {/* What is a mutual fund? */}
                <View style={{ height: 16 }} />
                <Text style={styles.sectionTitle}>What is a mutual fund?</Text>
                <Text style={styles.caption}>
                    A mutual fund is an investment that combines money from many investors to buy a mix of assets.
                    Each investor owns units of the fund — and as the value of those assets changes, so does your
                    investment.
                </Text>
                <Image
                    source={require('@/assets/images/WhatIsaMutualFund.png')}
                    resizeMode="contain"
                    style={styles.graphImgTall}
                />

                {/* How it works */}
                <View style={{ height: 16 }} />
                <Text style={styles.sectionTitle}>How it works</Text>
                <Text style={styles.caption}>
                    When you buy into a mutual fund, your money is managed by professionals who research, choose, and
                    balance investments. The fund’s goal depends on its type — growth, income, or balanced — and
                    performance is tracked through its Net Asset Value (NAV).
                </Text>
                <Image
                    source={require('@/assets/images/NAVs.png')}
                    resizeMode="contain"
                    style={styles.graphImg}
                />

                {/* Benefits */}
                <View style={styles.benefitsCard}>
                    <Text style={styles.benefitsTitle}>Benefits</Text>
                    <View style={styles.benefitsList}>
                        <View style={styles.benefitItem}>
                            <View style={styles.infoBadge}>
                                <MaterialCommunityIcons name="chart-pie" size={14} color={ColorsLight.brand.primary} />
                            </View>
                            <Text style={styles.benefitText}>Diversification: Exposure to many investments in one go.</Text>
                        </View>
                        <View style={styles.benefitItem}>
                            <View style={styles.infoBadge}>
                                <MaterialCommunityIcons name="account-tie" size={14} color={ColorsLight.brand.primary} />
                            </View>
                            <Text style={styles.benefitText}>Professional management: Experts monitor and adjust your portfolio.</Text>
                        </View>
                        <View style={styles.benefitItem}>
                            <View style={styles.infoBadge}>
                                <MaterialCommunityIcons name="wallet-outline" size={14} color={ColorsLight.brand.primary} />
                            </View>
                            <Text style={styles.benefitText}>Accessibility: Start investing with small amounts.</Text>
                        </View>
                        <View style={styles.benefitItem}>
                            <View style={styles.infoBadge}>
                                <MaterialCommunityIcons name="calendar-clock" size={14} color={ColorsLight.brand.primary} />
                            </View>
                            <Text style={styles.benefitText}>Liquidity: Buy or sell at the end of each trading day.</Text>
                        </View>
                    </View>
                </View>

                {/* Risks & considerations */}
                <View style={{ height: 16 }} />
                <Text style={styles.sectionTitle}>Risks & considerations</Text>
                <Text style={styles.caption}>
                    Mutual funds aren’t risk-free — their value can rise or fall. You’ll also pay management fees that
                    vary by fund type. Some funds may have minimum investment amounts or redemption fees.
                </Text>
                <Image
                    source={require('@/assets/images/risks.png')}
                    resizeMode="contain"
                    style={styles.graphImg}
                />

                {/* Example */}
                <View style={{ height: 16 }} />
                <Text style={styles.sectionTitle}>Example</Text>
                <Text style={styles.caption}>
                    Imagine you invest ₹1,000 in an equity mutual fund. That fund might own 100 companies — giving you
                    instant diversification. If the companies’ combined value grows 8% over a year, your investment’s
                    value grows too (minus fees).
                </Text>

                {/* Spacer for CTA bar */}
                <View style={{ height: 120 }} />
            </ScrollView>

            <View style={[styles.ctaBar, { paddingBottom: insets.bottom + 12 }]}>
                <TouchableOpacity
                    activeOpacity={0.9}
                    onPress={() => router.push('/(app)/(tabs)/invest')}
                    style={styles.ctaButton}
                >
                    <Text style={styles.ctaText}>Browse Funds</Text>
                </TouchableOpacity>
                <TouchableOpacity
                    activeOpacity={0.9}
                    onPress={() => router.push('/(app)/(tabs)/explore')}
                    style={styles.ctaButtonSecondary}
                >
                    <Text style={styles.ctaTextSecondary}>Learn About ETFs</Text>
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

    sectionTitle: {
        ...TYPOGRAPHY.heading3,
        color: ColorsLight.text.primary,
        marginBottom: 8,
    },
    graphImg: {
        width: '100%',
        height: 220,
    },
    graphImgTall: {
        width: '100%',
        height: 240,
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
    scenarioImg: {
        width: '100%',
        aspectRatio: 328 / 440,
        borderRadius: 14,
        backgroundColor: ColorsLight.brand.primaryDark,
    },
    heroImgWide: {
        width: '100%',
        height: 220,
        borderRadius: 14,
        backgroundColor: ColorsLight.background.primary,
        marginTop: 4,
    },

    benefitsCard: {
        backgroundColor: ColorsLight.brand.lavender,
        borderRadius: 16,
        borderWidth: 1,
        borderColor: ColorsLight.border.brandLight,
        padding: 16,
        marginTop: 8,
    },
    benefitsTitle: {
        ...TYPOGRAPHY.itemTitle,
        color: ColorsLight.text.primary,
        marginBottom: 8,
    },
    benefitsList: {
        gap: 10,
    },
    benefitItem: {
        flexDirection: 'row',
        alignItems: 'flex-start',
        columnGap: 8,
        rowGap: 0,
        flexWrap: 'wrap',
    },
    benefitText: {
        ...TYPOGRAPHY.bodySmall,
        color: ColorsLight.text.primary,
        flexShrink: 1,
        flexGrow: 1,
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
    ctaButtonSecondary: {
        borderRadius: 24,
        paddingVertical: 14,
        alignItems: 'center',
        justifyContent: 'center',
        marginTop: 10,
        borderWidth: 1,
        borderColor: ColorsLight.border.default,
        backgroundColor: ColorsLight.background.primary,
    },
    ctaTextSecondary: {
        ...TYPOGRAPHY.callout,
        color: ColorsLight.text.primary,
        fontWeight: '700',
    },
});


