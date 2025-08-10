export const formatNumber = (num: number): string => {
  if (num < 0) {
    return `-${formatNumber(-num)}`;
  }

  if (num < 1000) {
    return String(num);
  }

  const tiers = [
    { divisor: 1e12, suffix: 'T' },
    { divisor: 1e9, suffix: 'B' },
    { divisor: 1e6, suffix: 'M' },
    { divisor: 1e3, suffix: 'K' },
  ];

  for (const tier of tiers) {
    if (num >= tier.divisor) {
      const shortValue = num / tier.divisor;
      let formattedValue: string;

      if (shortValue < 10) {
        // e.g., 1.23M for 1,234,567
        const truncated = Math.floor(shortValue * 100) / 100;
        formattedValue = truncated.toFixed(2);
      } else if (shortValue < 100) {
        // e.g., 12.3M for 12,345,678
        const truncated = Math.floor(shortValue * 10) / 10;
        formattedValue = truncated.toFixed(1);
      } else {
        // e.g., 123M for 123,456,789
        formattedValue = String(Math.floor(shortValue));
      }

      // Remove trailing '.00' or '.0' from whole numbers
      return formattedValue.replace(/\.0+$/, '') + tier.suffix;
    }
  }

  return String(num); // Fallback for numbers < 1000, though handled above
};
