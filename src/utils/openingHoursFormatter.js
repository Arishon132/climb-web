/**
 * Format OSM opening_hours string into human-readable lines.
 * 
 * Converts strings like "Mo-Fr 09:00-17:00; Sa 10:00-16:00" into
 * formatted lines like ["Mon–Fri 09:00–17:00", "Sat 10:00–16:00"]
 * 
 * @param {string | null | undefined} raw - Raw opening_hours string from OSM
 * @returns {string[]} Array of formatted lines, empty array if no valid hours
 */
export function formatOpeningHours(raw) {
  if (!raw || typeof raw !== 'string') {
    return [];
  }

  const trimmed = raw.trim();
  if (!trimmed) {
    return [];
  }

  // Day abbreviation mapping
  const dayMap = {
    'Mo': 'Mon',
    'Tu': 'Tue',
    'We': 'Wed',
    'Th': 'Thu',
    'Fr': 'Fri',
    'Sa': 'Sat',
    'Su': 'Sun',
  };

  // Helper to expand day abbreviations in a string
  const expandDays = (str) => {
    let result = str;
    for (const [abbr, full] of Object.entries(dayMap)) {
      // Match whole word boundaries to avoid partial matches
      result = result.replace(new RegExp(`\\b${abbr}\\b`, 'g'), full);
    }
    return result;
  };

  // Helper to replace time dashes with en dashes
  const formatTimeDashes = (str) => {
    return str.replace(/(\d{1,2}:\d{2})-(\d{1,2}:\d{2})/g, '$1–$2');
  };

  // Split by semicolon to get segments
  const segments = trimmed.split(';');
  const formattedLines = [];

  for (const segment of segments) {
    const trimmedSegment = segment.trim();
    if (!trimmedSegment) {
      continue;
    }

    let formatted = trimmedSegment;

    // Pattern 1: Day range with time (e.g., "Mo-Fr 09:00-17:00")
    const rangeMatch = trimmedSegment.match(/^([A-Za-z]+)-([A-Za-z]+)\s+(\d{1,2}:\d{2})-(\d{1,2}:\d{2})/);
    if (rangeMatch) {
      const [, startDay, endDay] = rangeMatch;
      const formattedStart = dayMap[startDay] || startDay;
      const formattedEnd = dayMap[endDay] || endDay;
      formatted = trimmedSegment.replace(/^([A-Za-z]+)-([A-Za-z]+)/, `${formattedStart}–${formattedEnd}`);
      formatted = formatTimeDashes(formatted);
      formattedLines.push(formatted);
      continue;
    }

    // Pattern 2: Comma-separated days with time (e.g., "Mo,We,Fr 08:00-23:00" or "Tu,Th,Su 16:00-23:00")
    const commaMatch = trimmedSegment.match(/^([A-Za-z,]+)\s+(\d{1,2}:\d{2})-(\d{1,2}:\d{2})/);
    if (commaMatch) {
      const [, days] = commaMatch;
      const dayList = days.split(',').map(day => {
        const trimmedDay = day.trim();
        return dayMap[trimmedDay] || trimmedDay;
      }).join(', ');
      formatted = trimmedSegment.replace(/^([A-Za-z,]+)/, dayList);
      formatted = formatTimeDashes(formatted);
      formattedLines.push(formatted);
      continue;
    }

    // Pattern 3: Single day with time (e.g., "Mo 08:00-23:00")
    const singleMatch = trimmedSegment.match(/^([A-Za-z]+)\s+(\d{1,2}:\d{2})-(\d{1,2}:\d{2})/);
    if (singleMatch) {
      const [, day] = singleMatch;
      const formattedDay = dayMap[day] || day;
      formatted = trimmedSegment.replace(/^([A-Za-z]+)/, formattedDay);
      formatted = formatTimeDashes(formatted);
      formattedLines.push(formatted);
      continue;
    }

    // Fallback: Expand day abbreviations and format time dashes, keep structure as-is
    formatted = expandDays(trimmedSegment);
    formatted = formatTimeDashes(formatted);
    formattedLines.push(formatted);
  }

  return formattedLines;
}

