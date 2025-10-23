import React from 'react';
import { View, Image, StyleSheet, TouchableOpacity } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import ColorsLight from '@/constants/ColorsLight';
import AvatarCircle from '@/components/ui/badges/AvatarCircle';
import { Ionicons } from '@expo/vector-icons';

export type InvestHeaderProps = {
    onSearch?: () => void;
    onScan?: () => void;
    onNotifications?: () => void;
    onProfile?: () => void;
    logoSource?: any;
};

export default function InvestHeader({
    onSearch,
    onScan,
    onNotifications,
    onProfile,
    logoSource,
}: InvestHeaderProps) {
    const source = logoSource || require('@/assets/images/image.png');
    const iconColor = ColorsLight.gray[700];

    return (
        <SafeAreaView edges={['top']} style={styles.safeArea}>
            <View style={styles.row}>
                <TouchableOpacity activeOpacity={0.8}>
                    <Image source={source} style={styles.logo} resizeMode="contain" />
                </TouchableOpacity>
                <View style={styles.actions}>
                    <TouchableOpacity onPress={onSearch || (() => {})} activeOpacity={0.7} style={styles.firstIcon}>
                        <Ionicons name="search" size={22} color={iconColor} />
                    </TouchableOpacity>
                    <TouchableOpacity onPress={onScan || (() => {})} activeOpacity={0.7} style={styles.iconPad}>
                        <Ionicons name="scan" size={22} color={iconColor} />
                    </TouchableOpacity>
                    <TouchableOpacity onPress={onNotifications || (() => {})} activeOpacity={0.7} style={styles.iconPad}>
                        <Ionicons name="notifications" size={22} color={iconColor} />
                    </TouchableOpacity>
                    <TouchableOpacity onPress={onProfile || (() => {})} activeOpacity={0.7} style={styles.iconPad}>
                        <AvatarCircle size={32} source={require('@/assets/images/profile.jpg')} />
                    </TouchableOpacity>
                </View>
            </View>
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    safeArea: {
        backgroundColor: ColorsLight.background.primary,
    },
    row: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        paddingHorizontal: 16,
        paddingTop: 8,
        paddingBottom: 8,
    },
    logo: {
        width: 110,
        height: 28,
    },
    actions: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    firstIcon: {
        marginLeft: 0,
    },
    iconPad: {
        marginLeft: 12,
    },
});


