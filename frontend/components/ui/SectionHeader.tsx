import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ViewStyle } from 'react-native';
import ColorsLight from '@/constants/ColorsLight';
import { TYPOGRAPHY } from '@/constants/Typography';
import { Ionicons } from '@expo/vector-icons';

export type SectionHeaderProps = {
    title: string;
    subtitle?: string;
    caption?: string;
    onPress?: () => void;
    showChevron?: boolean;
    containerStyle?: ViewStyle;
    captionPosition?: 'above' | 'below';
    strongTitle?: boolean; // bolder, blacker title
};

export default function SectionHeader({
    title,
    subtitle,
    caption,
    onPress,
    showChevron = true,
    containerStyle,
    captionPosition = 'below',
    strongTitle = false,
}: SectionHeaderProps) {
    const PressableRow = onPress ? TouchableOpacity : View;

    return (
        <View style={[styles.wrapper, containerStyle]}> 
            {caption && captionPosition === 'above' && (
                <Text style={styles.caption}>{caption}</Text>
            )}
            <PressableRow onPress={onPress} activeOpacity={0.7} style={styles.row}>
                <View style={styles.texts}>
                    <Text style={[styles.title, strongTitle && styles.titleStrong]}>{title}</Text>
                    {!!subtitle && <Text style={styles.subtitle}>{subtitle}</Text>}
                </View>
                {showChevron && (
                    <Ionicons name="chevron-forward" size={20} color={ColorsLight.icon.default} />
                )}
            </PressableRow>
            {caption && captionPosition === 'below' && (
                <Text style={[styles.caption, { marginTop: 6 }]}>{caption}</Text>
            )}
        </View>
    );
}

const styles = StyleSheet.create({
    wrapper: {
        paddingVertical: 4,
    },
    row: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
    },
    texts: {
        flex: 1,
        paddingRight: 8,
    },
    caption: {
        ...TYPOGRAPHY.bodyXSmall,
        color: ColorsLight.text.secondary,
    },
    title: {
        ...TYPOGRAPHY.sectionHeader,
        color: ColorsLight.text.primary,
    },
    titleStrong: {
        fontWeight: '700',
    },
    subtitle: {
        ...TYPOGRAPHY.bodySmall,
        color: ColorsLight.text.secondary,
        marginTop: 6,
    },
});


