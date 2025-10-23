import { useCallback } from 'react';
import { router } from 'expo-router';
import { useScreenContext } from '@/contexts/ScreenContextProvider';

// Try to import useConversation hook from ElevenLabs
let useConversation: any = null;

try {
  const elevenLabsModule = require('@elevenlabs/react-native');
  useConversation = elevenLabsModule.useConversation;
} catch (e) {
  console.warn('ElevenLabs module not available');
}

const ISHA_AGENT_ID = 'agent_5401k88mqfpze0vb5bdsykschff3';

export const useIshaConversation = () => {
  const { currentScreen } = useScreenContext();

  // Handler to get current screen content
  // Must return string | number | undefined per ElevenLabs SDK requirements
  const handleGetScreenContent = useCallback(() => {
    if (!currentScreen) {
      return JSON.stringify({
        error: 'No screen context available',
        message: 'Unable to determine current screen content'
      });
    }

    return JSON.stringify({
      screenName: currentScreen.screenName,
      title: currentScreen.title,
      description: currentScreen.description,
      keyData: currentScreen.keyData || {},
      availableActions: currentScreen.availableActions || []
    });
  }, [currentScreen]);

  // Handler to navigate to specific pages
  // Must return string | number | undefined per ElevenLabs SDK requirements
  const handleNavigation = useCallback((params: any) => {
    const page = params?.page;

    if (!page) {
      return JSON.stringify({
        success: false,
        message: 'No page specified'
      });
    }

    switch (page) {
      case 'my_portfolio':
        router.push('/(app)/myportfolio');
        return JSON.stringify({
          success: true,
          message: 'Navigating to My Portfolio',
          page: 'My Portfolio'
        });

      case 'mutual_funds':
        router.push('/(app)/mutualfunds');
        return JSON.stringify({
          success: true,
          message: 'Navigating to Mutual Funds learning page',
          page: 'Mutual Funds'
        });

      default:
        return JSON.stringify({
          success: false,
          message: 'Unknown page requested',
          availablePages: ['my_portfolio', 'mutual_funds']
        });
    }
  }, []);

  // Define client tools for the agent
  // Format: Record<string, (parameters: unknown) => string | number | undefined>
  const clientTools = {
    get_screen_content: handleGetScreenContent,
    navigate_to_page: handleNavigation
  };

  // If ElevenLabs is available, use the real conversation hook
  if (useConversation) {
    const conversation = useConversation({
      clientTools,
      onConnect: ({ conversationId }: { conversationId: string }) => {
        console.log('Isha connected:', conversationId);
      },
      onDisconnect: (details: string) => {
        console.log('Isha disconnected:', details);
      },
      onError: (error: string) => {
        console.error('Isha conversation error:', error);
      },
      onMessage: (message: any) => {
        console.log('Isha message:', message);
      }
    });

    // Wrap startSession to pass agentId
    const originalStartSession = conversation.startSession;
    conversation.startSession = async () => {
      return originalStartSession({ agentId: ISHA_AGENT_ID });
    };

    return conversation;
  }

  // Mock conversation for development/fallback
  return {
    status: 'disconnected',
    isSpeaking: false,
    startSession: async () => {
      console.warn('Mock Isha: startSession called');
    },
    endSession: async () => {
      console.warn('Mock Isha: endSession called');
    }
  };
};
