import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ViewStyle } from 'react-native';
import ColorsLight from '@/constants/ColorsLight';
import { TYPOGRAPHY } from '@/constants/Typography';
import Tag from '@/components/ui/Tag';
import { Ionicons } from '@expo/vector-icons';

export type NfoListItemProps = {
    name: string;
    subtitle?: string; // e.g., "JioBlackRock Income Plus Arbitrage"
    chips?: string[]; // e.g., ['Short Term', 'Easy Liquidity']
    closesIn?: string; // e.g., 'Closes in 3 days'
    onPress?: () => void;
    style?: ViewStyle;
    variant?: 'plain' | 'card';
};

export default function NfoListItem({ name, subtitle, chips = [], closesIn, onPress, style, variant = 'plain' }: NfoListItemProps) {
    return (
        <TouchableOpacity
            activeOpacity={onPress ? 0.7 : 1}
            onPress={onPress}
            style={[variant === 'card' ? styles.containerCard : styles.containerPlain, style]}
        >
            <View style={styles.leftIconWrapTop}>
                <Ionicons name="megaphone" size={18} color={ColorsLight.brand.primary} />
            </View>
            <View style={styles.center}>
                <Text style={styles.title}>{name}</Text>
                {!!subtitle && <Text style={styles.meta}>{subtitle}</Text>}
                <View style={styles.tagRow}>
                    {!!closesIn && (
                        <Tag label={closesIn} size="xs" tone="neutral" style={{ marginRight: 6 }} />
                    )}
                    {chips.map((c, idx) => (
                        <Tag key={`${c}-${idx}`} label={c} size="xs" tone="brand" style={{ marginRight: 6 }} />
                    ))}
                </View>
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
        paddingVertical: 8,
    },
    leftIconWrapTop: {
        width: 32,
        height: 24,
        borderRadius: 12,
        backgroundColor: ColorsLight.icon.background,
        alignItems: 'center',
        justifyContent: 'flex-start',
        paddingTop: 4,
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
    tagRow: {
        flexDirection: 'row',
        alignItems: 'center',
        marginTop: 8,
        flexWrap: 'wrap',
    },
});


