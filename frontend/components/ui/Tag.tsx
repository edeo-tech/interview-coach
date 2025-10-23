import React from 'react';
import { View, Text, StyleSheet, ViewStyle } from 'react-native';
import ColorsLight from '@/constants/ColorsLight';
import { TYPOGRAPHY } from '@/constants/Typography';

export type TagProps = {
    label: string;
    tone?: 'neutral' | 'success' | 'warning' | 'brand';
    size?: 'xs' | 'sm' | 'md';
    style?: ViewStyle;
};

export default function Tag({ label, tone = 'neutral', size = 'sm', style }: TagProps) {
    const height = size === 'md' ? 24 : size === 'sm' ? 20 : 18;
    const radius = height / 2;
    const containerStyle = [
        styles.base,
        { height, borderRadius: radius, paddingHorizontal: size === 'md' ? 10 : size === 'sm' ? 8 : 6 },
        tone === 'neutral' && styles.neutral,
        tone === 'success' && styles.success,
        tone === 'warning' && styles.warning,
        tone === 'brand' && styles.brand,
        style,
    ];
    return (
        <View style={containerStyle}>
            <Text style={[size === 'xs' ? TYPOGRAPHY.bodyXSmall : TYPOGRAPHY.labelSmall, styles.label]} numberOfLines={1}>
                {label}
            </Text>
        </View>
    );
}

const styles = StyleSheet.create({
    base: {
        borderWidth: 1,
        alignItems: 'center',
        justifyContent: 'center',
    },
    label: {
        color: ColorsLight.text.primary,
    },
    neutral: {
        backgroundColor: ColorsLight.background.tertiary,
        borderColor: ColorsLight.border.default,
    },
    success: {
        backgroundColor: ColorsLight.semantic.successBg,
        borderColor: ColorsLight.semantic.successLight,
    },
    warning: {
        backgroundColor: ColorsLight.semantic.warningBg,
        borderColor: ColorsLight.semantic.warningLight,
    },
    brand: {
        backgroundColor: ColorsLight.brand.lavender,
        borderColor: ColorsLight.border.brandLight,
    },
});


