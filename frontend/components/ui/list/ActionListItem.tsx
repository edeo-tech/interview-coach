import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ViewStyle } from 'react-native';
import ColorsLight from '@/constants/ColorsLight';
import { TYPOGRAPHY } from '@/constants/Typography';
import { Ionicons } from '@expo/vector-icons';

export type ActionListItemProps = {
    title: string;
    subtitle?: string;
    onPress?: () => void;
    leftIconName?: keyof typeof Ionicons.glyphMap;
    style?: ViewStyle;
};

export default function ActionListItem({ title, subtitle, onPress, leftIconName = 'sparkles', style }: ActionListItemProps) {
    return (
        <TouchableOpacity activeOpacity={onPress ? 0.7 : 1} onPress={onPress} style={[styles.container, style]}
        >
            <View style={styles.leftIconWrap}>
                <Ionicons name={leftIconName} size={18} color={ColorsLight.brand.primary} />
            </View>
            <View style={styles.texts}>
                <Text style={styles.title}>{title}</Text>
                {!!subtitle && <Text style={styles.subtitle}>{subtitle}</Text>}
            </View>
            <Ionicons name="chevron-forward" size={18} color={ColorsLight.icon.default} />
        </TouchableOpacity>
    );
}

const styles = StyleSheet.create({
    container: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: ColorsLight.background.card,
        borderRadius: 12,
        borderWidth: 1,
        borderColor: ColorsLight.border.default,
        paddingHorizontal: 14,
        paddingVertical: 12,
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
    texts: {
        flex: 1,
    },
    title: {
        ...TYPOGRAPHY.labelLarge,
        color: ColorsLight.text.primary,
    },
    subtitle: {
        ...TYPOGRAPHY.bodySmall,
        color: ColorsLight.text.secondary,
        marginTop: 2,
    },
});


