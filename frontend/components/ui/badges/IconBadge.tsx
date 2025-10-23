import React from 'react';
import { View, StyleSheet, ViewStyle } from 'react-native';
import ColorsLight from '@/constants/ColorsLight';
import { Ionicons } from '@expo/vector-icons';

export type IconBadgeProps = {
    name: keyof typeof Ionicons.glyphMap;
    size?: number;
    tint?: 'brand' | 'neutral';
    style?: ViewStyle;
    color?: string;
};

export default function IconBadge({ name, size = 18, tint = 'brand', style, color }: IconBadgeProps) {
    const containerStyle = [styles.base, tint === 'brand' ? styles.brand : styles.neutral, style];
    return (
        <View style={containerStyle}>
            <Ionicons name={name} size={size} color={color || (tint === 'brand' ? ColorsLight.white : ColorsLight.icon.default)} />
        </View>
    );
}

const styles = StyleSheet.create({
    base: {
        width: 32,
        height: 32,
        borderRadius: 16,
        alignItems: 'center',
        justifyContent: 'center',
    },
    brand: {
        backgroundColor: ColorsLight.brand.primary,
    },
    neutral: {
        backgroundColor: ColorsLight.icon.background,
    },
});


