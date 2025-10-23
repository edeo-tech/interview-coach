import React, { ReactNode } from 'react';
import { View, StyleSheet, ViewStyle } from 'react-native';
import ColorsLight from '@/constants/ColorsLight';

export type SoftCardProps = {
    children: ReactNode;
    style?: ViewStyle;
};

export default function SoftCard({ children, style }: SoftCardProps) {
    return <View style={[styles.card, style]}>{children}</View>;
}

const styles = StyleSheet.create({
    card: {
        backgroundColor: ColorsLight.brand.lavender,
        borderRadius: 16,
        borderWidth: 1,
        borderColor: ColorsLight.border.brandLight,
        padding: 16,
    },
});


