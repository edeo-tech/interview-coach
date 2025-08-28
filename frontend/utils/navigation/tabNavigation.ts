import { router } from 'expo-router';

/**
 * Navigate to a tab screen and reset its stack
 * This ensures that when the user taps the tab icon, they go to the root of that tab
 */
export function navigateToTabRoot(tab: 'home' | 'profile', params?: any) {
  // Navigate to the tab root, replacing the entire stack
  router.replace({
    pathname: `/(app)/(tabs)/${tab}`,
    params
  });
}

/**
 * Navigate from a deep screen back to a tab, ensuring proper stack reset
 * Use this when leaving screens like grading, where you want clean navigation
 */
export function navigateFromDeepScreen(destination: 'home' | 'profile' | 'job-details' | 'interview-details', params?: any) {
  switch (destination) {
    case 'home':
      // Replace entire stack with home tab
      router.replace('/(app)/(tabs)/home');
      break;
    case 'profile':
      // Replace entire stack with profile tab
      router.replace('/(app)/(tabs)/profile');
      break;
    case 'job-details':
      // For job details, we need a clean navigation within the home tab
      if (params?.jobId) {
        // Use replace to navigate to tabs, then immediately to job details
        router.replace({
          pathname: '/(app)/(tabs)/home/jobs/[id]',
          params: { id: params.jobId }
        });
      }
      break;
    case 'interview-details':
      // For interview details, we need a clean navigation within the home tab
      if (params?.interviewId) {
        // Use replace to navigate to tabs, then immediately to interview details
        router.replace({
          pathname: '/(app)/(tabs)/home/interviews/[id]/details',
          params: { id: params.interviewId }
        });
      }
      break;
  }
}

/**
 * Replace the current screen with a new one, preventing back navigation
 * Use this after creating resources like CV or jobs
 */
export function replaceWithScreen(pathname: string, params?: any) {
  router.replace({
    pathname,
    params
  });
}