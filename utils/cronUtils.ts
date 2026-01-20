
export const getHumanReadableCron = (cron: string): string => {
  const parts = cron.split(' ');
  if (parts.length < 5) return cron;

  const [min, hour, dom, mon, dow] = parts;

  // Pattern: Daily at specific time (e.g., 0 1 * * *)
  if (dom === '*' && mon === '*' && dow === '*') {
    if (min === '0' && !hour.includes(',') && !hour.includes('/') && !hour.includes('*')) {
      const h = parseInt(hour, 10);
      const ampm = h >= 12 ? 'PM' : 'AM';
      const displayHour = h % 12 || 12;
      return `Daily at ${displayHour}:00 ${ampm}`;
    }
    
    // Pattern: Hourly (e.g., 0 * * * *)
    if (min === '0' && hour === '*') {
      return 'Every hour at :00';
    }

    // Pattern: Every X minutes (e.g., */15 * * * *)
    if (min.startsWith('*/') && hour === '*') {
      const interval = min.replace('*/', '');
      return `Every ${interval} minutes`;
    }
  }

  // Fallback for more complex expressions
  return `Interval: ${cron}`;
};
