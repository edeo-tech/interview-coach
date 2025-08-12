import React from 'react';
import { View } from 'react-native';
import { Slot } from 'expo-router';
import { StatusBar } from 'expo-status-bar';

export default function Main() {
    return (
        <View style={{ flex: 1 }}>
            <StatusBar style="light" translucent backgroundColor="transparent" />
            <Slot />
        </View>
    );
};
