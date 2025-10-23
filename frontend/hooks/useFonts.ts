import { useFonts } from 'expo-font';
import {
  Inter_400Regular,
  Inter_500Medium,
  Inter_600SemiBold,
  Inter_700Bold,
} from '@expo-google-fonts/inter';
import {
  FamiljenGrotesk_400Regular,
  FamiljenGrotesk_500Medium,
  FamiljenGrotesk_600SemiBold,
  FamiljenGrotesk_700Bold,
} from '@expo-google-fonts/familjen-grotesk';
import {
  Nunito_400Regular,
  Nunito_600SemiBold,
  Nunito_700Bold,
} from '@expo-google-fonts/nunito';

export const useAppFonts = () => {
  const [fontsLoaded, fontError] = useFonts({
    // Inter variants - for readability & information
    'Inter-Regular': Inter_400Regular,
    'Inter-Medium': Inter_500Medium,
    'Inter-SemiBold': Inter_600SemiBold,
    'Inter-Bold': Inter_700Bold,
    
    // Familjen Grotesk variants - for brand & expressive headings
    'FamiljenGrotesk-Regular': FamiljenGrotesk_400Regular,
    'FamiljenGrotesk-Medium': FamiljenGrotesk_500Medium,
    'FamiljenGrotesk-SemiBold': FamiljenGrotesk_600SemiBold,
    'FamiljenGrotesk-Bold': FamiljenGrotesk_700Bold,

    // Keep Nunito registered for legacy (optional)
    'Nunito-Regular': Nunito_400Regular,
    'Nunito-SemiBold': Nunito_600SemiBold,
    'Nunito-Bold': Nunito_700Bold,
  });

  return { fontsLoaded, fontError };
};