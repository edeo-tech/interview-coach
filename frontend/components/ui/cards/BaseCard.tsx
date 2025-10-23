import React, { ReactNode } from 'react';
import { View, StyleSheet, ViewStyle } from 'react-native';
import ColorsLight from '@/constants/ColorsLight';

export type BaseCardProps = {
    children: ReactNode;
    style?: ViewStyle;
    padding?: number;
    elevated?: boolean;
};

export default function BaseCard({ children, style, padding = 16, elevated = true }: BaseCardProps) {
    return (
        <View
            style={[
                styles.card,
                elevated ? styles.elevated : undefined,
                { padding },
                style,
            ]}
        >
            {children}
        </View>
    );
}

const styles = StyleSheet.create({
    card: {
        backgroundColor: ColorsLight.card.background,
        borderRadius: 16,
        borderWidth: 1,
        borderColor: ColorsLight.border.default,
    },
    elevated: {
        shadowColor: ColorsLight.shadow.small.shadowColor,
        shadowOffset: ColorsLight.shadow.small.shadowOffset,
        shadowOpacity: ColorsLight.shadow.small.shadowOpacity,
        shadowRadius: ColorsLight.shadow.small.shadowRadius,
        elevation: ColorsLight.shadow.small.elevation,
    },
});


