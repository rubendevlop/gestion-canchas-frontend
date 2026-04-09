const DEFAULT_START_HOUR = 8;
const DEFAULT_SLOT_COUNT = 16;
export const BOOKING_TIME_ZONE = 'America/Argentina/Buenos_Aires';

export const DEFAULT_BOOKING_HOURS = Array.from({ length: DEFAULT_SLOT_COUNT }, (_, index) =>
  `${String(DEFAULT_START_HOUR + index).padStart(2, '0')}:00`,
);

const HOUR_PATTERN = /^(?:[01]\d|2[0-3]):00$/;
const DATE_PATTERN = /^\d{4}-\d{2}-\d{2}$/;

function getDateTimePartsInTimeZone(date = new Date(), timeZone = BOOKING_TIME_ZONE) {
  const formatter = new Intl.DateTimeFormat('en-GB', {
    timeZone,
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
    hourCycle: 'h23',
  });

  const parts = formatter.formatToParts(date).reduce((accumulator, part) => {
    if (part.type !== 'literal') {
      accumulator[part.type] = part.value;
    }
    return accumulator;
  }, {});

  return {
    date: `${parts.year}-${parts.month}-${parts.day}`,
    time: `${parts.hour}:${parts.minute}`,
  };
}

export function normalizeBookingHours(value) {
  const normalized = Array.isArray(value)
    ? value
        .map((hour) => String(hour || '').trim())
        .filter((hour) => HOUR_PATTERN.test(hour))
    : [];

  const uniqueSorted = [...new Set(normalized)].sort((left, right) => left.localeCompare(right));
  return uniqueSorted.length > 0 ? uniqueSorted : [...DEFAULT_BOOKING_HOURS];
}

export function formatBookingHourRange(hours) {
  const normalized = normalizeBookingHours(hours);
  if (normalized.length === 0) {
    return 'Sin horarios';
  }

  if (normalized.length === 1) {
    return normalized[0];
  }

  return `${normalized[0]} - ${normalized[normalized.length - 1]}`;
}

export function normalizeBookingDate(value = '') {
  const normalized = String(value || '').trim();
  if (!DATE_PATTERN.test(normalized)) {
    return '';
  }

  const [year, month, day] = normalized.split('-').map(Number);
  const candidate = new Date(Date.UTC(year, month - 1, day));
  if (
    candidate.getUTCFullYear() !== year ||
    candidate.getUTCMonth() !== month - 1 ||
    candidate.getUTCDate() !== day
  ) {
    return '';
  }

  return normalized;
}

export function getTodayBookingDate(options = {}) {
  return getDateTimePartsInTimeZone(options.now, options.timeZone).date;
}

export function getPastBookingHoursForDate(bookingHours, bookingDate, options = {}) {
  const normalizedDate = normalizeBookingDate(bookingDate);
  if (!normalizedDate) {
    return [];
  }

  const normalizedHours = normalizeBookingHours(bookingHours);
  const current = getDateTimePartsInTimeZone(options.now, options.timeZone);

  if (normalizedDate < current.date) {
    return normalizedHours;
  }

  if (normalizedDate > current.date) {
    return [];
  }

  return normalizedHours.filter((hour) => hour <= current.time);
}
