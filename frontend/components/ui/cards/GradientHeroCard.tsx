import React, { ReactNode } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ViewStyle } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import ColorsLight from '@/constants/ColorsLight';
import { TYPOGRAPHY } from '@/constants/Typography';
import { Ionicons } from '@expo/vector-icons';

export type GradientHeroCardProps = {
    title: string;
    subtitle?: string;
    primaryAction?: { label: string; onPress: () => void };
    secondaryAction?: { label: string; onPress: () => void };
    rightIcon?: ReactNode;
    style?: ViewStyle;
};

export default function GradientHeroCard({
    title,
    subtitle,
    primaryAction,
    secondaryAction,
    rightIcon,
    style,
}: GradientHeroCardProps) {
    return (
        <LinearGradient
            colors={[ColorsLight.brand.primary, '#7C3AED']}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
            style={[styles.gradient, style]}
        >
            <View style={styles.headerRow}>
                <View style={styles.iconBadge}>
                    <Ionicons name="trending-up" size={20} color={ColorsLight.white} />
                </View>
                <Ionicons name="ellipsis-horizontal" size={18} color={ColorsLight.white} />
            </View>

            <Text style={styles.title}>{title}</Text>
            {!!subtitle && <Text style={styles.subtitle}>{subtitle}</Text>}

            <View style={styles.actionsRow}>
                {!!primaryAction && (
                    <TouchableOpacity style={styles.primaryPill} onPress={primaryAction.onPress} activeOpacity={0.8}>
                        <Text style={styles.primaryLabel}>{primaryAction.label}</Text>
                    </TouchableOpacity>
                )}
                {!!secondaryAction && (
                    <TouchableOpacity style={styles.secondaryPill} onPress={secondaryAction.onPress} activeOpacity={0.8}>
                        <Text style={styles.secondaryLabel}>{secondaryAction.label}</Text>
                    </TouchableOpacity>
                )}
                {!!rightIcon && <View style={{ marginLeft: 'auto' }}>{rightIcon}</View>}
            </View>
        </LinearGradient>
    );
}

const styles = StyleSheet.create({
    gradient: {
        borderRadius: 16,
        padding: 16,
    },
    headerRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 12,
    },
    iconBadge: {
        width: 32,
        height: 32,
        borderRadius: 16,
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: 'rgba(255,255,255,0.2)',
    },
    title: {
        ...TYPOGRAPHY.heading3,
        color: ColorsLight.text.inverse,
    },
    subtitle: {
        ...TYPOGRAPHY.bodySmall,
        color: 'rgba(255,255,255,0.9)',
        marginTop: 6,
        marginBottom: 12,
    },
    actionsRow: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 8,
    },
    primaryPill: {
        backgroundColor: 'rgba(255,255,255,0.15)',
        borderWidth: 1,
        borderColor: 'rgba(255,255,255,0.35)',
        paddingHorizontal: 14,
        height: 36,
        borderRadius: 18,
        alignItems: 'center',
        justifyContent: 'center',
        marginRight: 8,
    },
    secondaryPill: {
        backgroundColor: 'rgba(255,255,255,0.08)',
        borderWidth: 1,
        borderColor: 'rgba(255,255,255,0.25)',
        paddingHorizontal: 14,
        height: 36,
        borderRadius: 18,
        alignItems: 'center',
        justifyContent: 'center',
    },
    primaryLabel: {
        ...TYPOGRAPHY.buttonSmall,
        color: ColorsLight.text.inverse,
    },
    secondaryLabel: {
        ...TYPOGRAPHY.buttonSmall,
        color: ColorsLight.text.inverse,
    },
});


