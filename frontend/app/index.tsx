import { useEffect } from 'react';
import { Redirect } from 'expo-router';

export default function Index() {
    // Redirect directly to app tabs
    return <Redirect href="/(app)/(tabs)/home" />;
}