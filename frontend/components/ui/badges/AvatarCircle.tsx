import React from 'react';
import { View, Text, StyleSheet, Image, ViewStyle, ImageSourcePropType } from 'react-native';
import ColorsLight from '@/constants/ColorsLight';

export type AvatarCircleProps = {
    uri?: string;
    source?: ImageSourcePropType;
    initials?: string;
    size?: number;
    style?: ViewStyle;
};

export default function AvatarCircle({ uri, source, initials = '', size = 32, style }: AvatarCircleProps) {
    const radius = size / 2;
    if (source) {
        return <Image source={source} style={[styles.image, { width: size, height: size, borderRadius: radius }, style]} />;
    }
    if (uri) {
        return <Image source={{ uri }} style={[styles.image, { width: size, height: size, borderRadius: radius }, style]} />;
    }
    return (
        <View style={[styles.fallback, { width: size, height: size, borderRadius: radius }, style]}>
            {!!initials && <Text style={styles.initials}>{initials}</Text>}
        </View>
    );
}

const styles = StyleSheet.create({
    image: {
        borderWidth: 1,
        borderColor: ColorsLight.border.default,
    },
    fallback: {
        backgroundColor: ColorsLight.icon.background,
        alignItems: 'center',
        justifyContent: 'center',
        borderWidth: 1,
        borderColor: ColorsLight.border.default,
    },
    initials: {
        color: ColorsLight.text.primary,
        fontWeight: '600',
    },
});


