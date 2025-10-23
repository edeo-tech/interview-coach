import React from 'react';
import { TouchableOpacity, Text, StyleSheet, ViewStyle } from 'react-native';
import ColorsLight from '@/constants/ColorsLight';
import { TYPOGRAPHY } from '@/constants/Typography';

export type PillButtonProps = {
    label: string;
    onPress: () => void;
    tone?: 'brand' | 'neutral';
    size?: 'sm' | 'md';
    style?: ViewStyle;
};

export default function PillButton({ label, onPress, tone = 'brand', size = 'md', style }: PillButtonProps) {
    const height = size === 'md' ? 40 : 32;
    const radius = height / 2;
    return (
        <TouchableOpacity
            onPress={onPress}
            activeOpacity={0.85}
            style={[styles.base, tone === 'brand' ? styles.brand : styles.neutral, { height, borderRadius: radius }, style]}
        >
            <Text style={[size === 'md' ? TYPOGRAPHY.buttonSmall : TYPOGRAPHY.labelMedium, styles.label, tone === 'brand' ? styles.labelInverse : styles.labelDark]}> 
                {label}
            </Text>
        </TouchableOpacity>
    );
}

const styles = StyleSheet.create({
    base: {
        paddingHorizontal: 14,
        borderWidth: 1,
        alignItems: 'center',
        justifyContent: 'center',
    },
    brand: {
        backgroundColor: ColorsLight.brand.primary,
        borderColor: ColorsLight.brand.primaryLight,
    },
    neutral: {
        backgroundColor: ColorsLight.background.secondary,
        borderColor: ColorsLight.border.default,
    },
    label: {
        textAlign: 'center',
    },
    labelInverse: {
        color: ColorsLight.text.inverse,
    },
    labelDark: {
        color: ColorsLight.text.primary,
    },
});


