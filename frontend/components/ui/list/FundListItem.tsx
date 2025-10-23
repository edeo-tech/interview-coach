import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ViewStyle } from 'react-native';
import ColorsLight from '@/constants/ColorsLight';
import { TYPOGRAPHY } from '@/constants/Typography';
import { Ionicons } from '@expo/vector-icons';

export type FundListItemProps = {
    name: string;
    category: string;
    risk: 'Low risk' | 'Moderate risk' | 'High risk';
    returnDeltaPct: number; // e.g., 10.17
    periodLabel?: string; // e.g., '1Y'
    onPress?: () => void;
    style?: ViewStyle;
    variant?: 'plain' | 'card';
};

export default function FundListItem({ name, category, risk, returnDeltaPct, periodLabel = '1Y', onPress, style, variant = 'plain' }: FundListItemProps) {
    const positive = returnDeltaPct >= 0;
    const deltaColor = positive ? ColorsLight.semantic.success : ColorsLight.semantic.error;
    const deltaIcon = positive ? 'trending-up' : 'trending-down';
    return (
        <TouchableOpacity
            activeOpacity={onPress ? 0.7 : 1}
            onPress={onPress}
            style={[variant === 'card' ? styles.containerCard : styles.containerPlain, style]}
        >
            <View style={styles.leftIconWrap}>
                <Ionicons name="bar-chart" size={18} color={ColorsLight.brand.primary} />
            </View>
            <View style={styles.center}>
                <Text style={styles.title}>{name}</Text>
                <Text style={styles.meta}>{category} · {risk}</Text>
            </View>
            <View style={styles.right}>
                <View style={styles.deltaRow}>
                    <Ionicons name={deltaIcon} size={14} color={deltaColor} />
                    <Text style={[styles.delta, { color: deltaColor }]}> {positive ? '+' : ''}{returnDeltaPct.toFixed(2)}%</Text>
                </View>
                <Text style={styles.period}>{periodLabel}</Text>
            </View>
        </TouchableOpacity>
    );
}

const styles = StyleSheet.create({
    containerCard: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: ColorsLight.background.card,
        borderRadius: 12,
        borderWidth: 1,
        borderColor: ColorsLight.border.default,
        paddingHorizontal: 14,
        paddingVertical: 12,
    },
    containerPlain: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingVertical: 10,
    },
    leftIconWrap: {
        width: 32,
        height: 32,
        borderRadius: 16,
        backgroundColor: ColorsLight.icon.background,
        alignItems: 'center',
        justifyContent: 'center',
        marginRight: 12,
    },
    center: {
        flex: 1,
        marginRight: 8,
    },
    title: {
        ...TYPOGRAPHY.labelLarge,
        color: ColorsLight.text.primary,
    },
    meta: {
        ...TYPOGRAPHY.bodySmall,
        color: ColorsLight.text.tertiary,
        marginTop: 2,
    },
    right: {
        alignItems: 'flex-end',
    },
    deltaRow: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 2,
    },
    delta: {
        ...TYPOGRAPHY.labelMedium,
    },
    period: {
        ...TYPOGRAPHY.bodyXSmall,
        color: ColorsLight.text.muted,
    },
});


