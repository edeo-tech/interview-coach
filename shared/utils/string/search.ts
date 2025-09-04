import { levenshteinDistance } from "./levenshteinDistance";

/**
 * Checks if two strings match within a specified edit distance
 * @param source The source string to compare
 * @param target The target string to compare against
 * @param maxDistance Maximum allowed edit distance (default: 3)
 * @returns Boolean indicating if strings match within the allowed distance
 */
export const fuzzyMatch = (source: string, target: string, maxDistance: number = 2): boolean => {
    // Convert both strings to lowercase for case-insensitive comparison
    const normalizedSource = source.toLowerCase();
    const normalizedTarget = target.toLowerCase();
    
    // For very short strings, reduce the allowed distance
    const effectiveMaxDistance = Math.min(maxDistance, Math.floor(normalizedTarget.length / 2));
    
    // If target is a substring of source, it's a match
    if (normalizedSource.includes(normalizedTarget)) {
        return true;
    }
    
    // Check if any part of the source matches the target within the allowed distance
    // This helps with matching partial words in longer names
    if (normalizedTarget.length < normalizedSource.length) {
        for (let i = 0; i <= normalizedSource.length - normalizedTarget.length; i++) {
            const substring = normalizedSource.substring(i, i + normalizedTarget.length);
            if (levenshteinDistance(substring, normalizedTarget) <= effectiveMaxDistance) {
                return true;
            }
        }
    }
    
    // Check the entire strings
    return levenshteinDistance(normalizedSource, normalizedTarget) <= effectiveMaxDistance;
}

/**
 * Sorts search results by relevance to a query
 * @param items Array of items to sort
 * @param query Search query
 * @param getTextToMatch Function that extracts the text to match from each item
 * @returns Sorted array of items
 */
export const sortBySearchRelevance = <T>(
    items: T[], 
    query: string, 
    getTextToMatch: (item: T) => string
): T[] => {
    const queryLower = query.toLowerCase();
    
    return [...items].sort((a, b) => {
        const aText = getTextToMatch(a).toLowerCase();
        const bText = getTextToMatch(b).toLowerCase();
        
        // Check if names start with the query (highest priority)
        const aStartsWithQuery = aText.startsWith(queryLower);
        const bStartsWithQuery = bText.startsWith(queryLower);
        
        if (aStartsWithQuery && !bStartsWithQuery) return -1;
        if (!aStartsWithQuery && bStartsWithQuery) return 1;
        
        // If both or neither start with the query, check for exact word match
        const aHasExactWordMatch = aText.split(' ').some(word => word === queryLower);
        const bHasExactWordMatch = bText.split(' ').some(word => word === queryLower);
        
        if (aHasExactWordMatch && !bHasExactWordMatch) return -1;
        if (!aHasExactWordMatch && bHasExactWordMatch) return 1;
        
        // If still tied, sort by Levenshtein distance
        const aDistance = levenshteinDistance(aText, queryLower);
        const bDistance = levenshteinDistance(bText, queryLower);
        
        return aDistance - bDistance;
    });
};
