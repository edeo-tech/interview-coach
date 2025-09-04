/**
 * Extracts a clean URL from text that might contain additional content
 * Handles common patterns from LinkedIn, Indeed, and other job sites
 */
export function extractUrlFromText(text: string): string {
  // Trim whitespace
  const trimmedText = text.trim();
  
  // If it's already a clean URL, return it
  if (/^https?:\/\//.test(trimmedText) && !trimmedText.includes(' ') && !trimmedText.includes('\n')) {
    return trimmedText;
  }
  
  // Common patterns for URLs in text:
  // 1. LinkedIn often includes "Check out this job at Company: URL"
  // 2. Some sites include "Job Title at Company URL"
  // 3. URLs might be surrounded by whitespace or newlines
  
  // Regex to find URLs - matches http(s) URLs
  const urlRegex = /https?:\/\/(?:www\.)?[-a-zA-Z0-9@:%._\+~#=]{1,256}\.[a-zA-Z0-9()]{1,6}\b(?:[-a-zA-Z0-9()@:%_\+.~#?&\/\/=]*)/gi;
  
  // Find all URLs in the text
  const matches = trimmedText.match(urlRegex);
  
  if (matches && matches.length > 0) {
    // Return the first URL found
    // LinkedIn and most job sites put the actual job URL at the end
    // but we'll take the first valid job posting URL we find
    for (const match of matches) {
      // Filter out common tracking or redirect URLs
      if (!match.includes('linkedin.com/comm/') && 
          !match.includes('linkedin.com/e/') &&
          !match.includes('/track/') &&
          !match.includes('/redir/')) {
        return match;
      }
    }
    // If all URLs are tracking URLs, return the first one anyway
    return matches[0];
  }
  
  // If no URL found, check if the text itself might be a URL without protocol
  // This handles cases like "linkedin.com/jobs/view/123456789"
  const domainRegex = /(?:www\.)?[-a-zA-Z0-9@:%._\+~#=]{1,256}\.[a-zA-Z0-9()]{1,6}\b(?:[-a-zA-Z0-9()@:%_\+.~#?&\/\/=]*)/gi;
  const domainMatches = trimmedText.match(domainRegex);
  
  if (domainMatches && domainMatches.length > 0) {
    // Add https:// to make it a valid URL
    return `https://${domainMatches[0]}`;
  }
  
  // If still no match, return the original text
  // The validation in the component will catch invalid URLs
  return trimmedText;
}

/**
 * Validates if a string is a valid URL
 */
export function isValidUrl(url: string): boolean {
  try {
    const urlObj = new URL(url);
    return urlObj.protocol === 'http:' || urlObj.protocol === 'https:';
  } catch {
    return false;
  }
}

/**
 * Cleans and validates a job posting URL
 */
export function cleanJobUrl(text: string): { url: string; isValid: boolean } {
  const extractedUrl = extractUrlFromText(text);
  const isValid = isValidUrl(extractedUrl);
  
  return {
    url: extractedUrl,
    isValid
  };
}