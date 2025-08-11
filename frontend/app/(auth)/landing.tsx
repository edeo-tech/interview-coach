import { useEffect } from 'react';
import { useRouter } from 'expo-router';

const Landing = () =>
{
    const router = useRouter();

    useEffect(() => {
        router.replace('/(auth)/login');
    }, []);

    return null;
}
export default Landing;
