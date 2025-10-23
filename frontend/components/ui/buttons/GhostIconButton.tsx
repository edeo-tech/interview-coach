import React from 'react';
import { TouchableOpacity, StyleSheet, ViewStyle } from 'react-native';
import ColorsLight from '@/constants/ColorsLight';
import { Ionicons } from '@expo/vector-icons';

export type GhostIconButtonProps = {
    name: keyof typeof Ionicons.glyphMap;
    onPress: () => void;
    size?: number;
    style?: ViewStyle;
};

export default function GhostIconButton({ name, onPress, size = 20, style }: GhostIconButtonProps) {
    const height = 36;
    const radius = height / 2;
    return (
        <TouchableOpacity onPress={onPress} activeOpacity={0.7} style={[styles.base, { height, borderRadius: radius }, style]}>
            <Ionicons name={name} size={size} color={ColorsLight.icon.default} />
        </TouchableOpacity>
    );
}

const styles = StyleSheet.create({
    base: {
        paddingHorizontal: 10,
        backgroundColor: ColorsLight.background.tertiary,
        borderWidth: 1,
        borderColor: ColorsLight.border.default,
        alignItems: 'center',
        justifyContent: 'center',
    },
});


