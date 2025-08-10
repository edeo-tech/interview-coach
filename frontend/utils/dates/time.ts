export const formatTime = (time: string): string =>
{
    return time.replace(/:\d{2}$/, '');
}

export const formatTimestamp = (timestamp: string): string =>
{
    if (!timestamp) return '';
    const inputDate = new Date(timestamp);
    const now = new Date();
    const diffMs = now.getTime() - inputDate.getTime();
    const diffHours = diffMs / (1000 * 60 * 60);
    
    // 1) Return 24-hour digital time, e.g., "06:54" or "17:03"
    if(diffHours < 24)
    {
        return inputDate.toLocaleTimeString([], { 
            hour: '2-digit', 
            minute: '2-digit', 
            hour12: false 
        });
    }
    // 2) Return "Yesterday"
    else if(diffHours < 48)
    {
        return "Yesterday";
    }
    // 3) Return day of the week, e.g., "Monday"
    else if(diffHours < 168)
    {
        return inputDate.toLocaleDateString(
            undefined, 
            { weekday: 'long' }
        );
    }
    // 4) Return date in "dd/mm/yyyy" format
    else
    {
        const day = String(inputDate.getDate()).padStart(
            2, 
            '0'
        );
        const month = String(inputDate.getMonth() + 1).padStart(
            2, 
            '0'
        );
        const year = inputDate.getFullYear();
        return `${day}/${month}/${year}`;
    }
};

export const formatCommentTimestamp = (
    timestamp: string
): string =>
{
    const inputDate = new Date(timestamp);
    const now = new Date();
    const diffMs = now.getTime() - inputDate.getTime();
    
    // Convert to different time units
    const diffSeconds = Math.floor(diffMs / 1000);
    const diffMinutes = Math.floor(diffMs / (1000 * 60));
    const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
    const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));

    // Less than a minute
    if(diffSeconds < 60)
    {
        return `${diffSeconds}s`;
    }
    
    // Less than an hour
    if(diffMinutes < 60)
    {
        return `${diffMinutes}m`;
    }
    
    // Less than a day
    if(diffHours < 24)
    {
        return `${diffHours}h`;
    }
    
    // Less than a week
    if(diffDays < 7)
    {
        return `${diffDays}d`;
    }
    
    // More than a week - format as date
    const year = inputDate.getFullYear();
    const month = String(inputDate.getMonth() + 1).padStart(2, '0');
    const day = String(inputDate.getDate()).padStart(2, '0');
    
    // If same year, omit the year part
    if(year === now.getFullYear())
    {
        return `${month}-${day}`;
    }
    
    // Different year, include the year
    return `${year}-${month}-${day}`;
}

export const getWeekdayNamesShort = (): string[] =>
{
    // The last index needs to be Todays day, and then work backwards
    const today = new Date();
    const todayIndex = today.getDay();
    const weekdayNames = ['Sun', 'Mon', 'Tue', 'Wed', 'Thur', 'Fri', 'Sat'];
    const reversedWeekdays = [...weekdayNames.slice(
        todayIndex + 1
    ), ...weekdayNames.slice(
        0, 
        todayIndex + 1
    )];
    return reversedWeekdays;
}

export const formatMsToTime = (ms: number): string =>
{
    if (!ms || isNaN(ms)) return '00:00';
    const totalSeconds = Math.floor(ms / 1000);
    const minutes = Math.floor(totalSeconds / 60);
    const seconds = totalSeconds % 60;
    return `${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
};
