export function normalizeCourtSearchValue(value = '') {
  return String(value || '')
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .trim()
    .toLowerCase();
}

export function matchesCourtSearch(court, search = '') {
  const normalizedSearch = normalizeCourtSearchValue(search);
  if (!normalizedSearch) {
    return true;
  }

  const haystack = [
    court?.name,
    court?.description,
    court?.sport,
    ...(Array.isArray(court?.features) ? court.features : []),
  ]
    .map(normalizeCourtSearchValue)
    .join(' ');

  return haystack.includes(normalizedSearch);
}

export function buildCourtsEndpoint(complexId, filters = {}) {
  const params = new URLSearchParams();
  params.set('complexId', complexId);
  params.set('clientVisible', 'true');

  if (Array.isArray(filters.features) && filters.features.length > 0) {
    params.set('features', filters.features.join(','));
  }

  if (filters.date) {
    params.set('date', filters.date);
  }

  if (filters.startTime) {
    params.set('startTime', filters.startTime);
  }

  if (filters.availableOnly && filters.date) {
    params.set('availableOnly', 'true');
  }

  return `/courts?${params.toString()}`;
}

export function buildCourtAvailabilityLabel(summary = {}) {
  if (!summary?.date) {
    return 'Consulta disponibilidad por fecha';
  }

  if (!summary.hasAvailability) {
    return summary.startTime
      ? `No disponible a las ${summary.startTime}`
      : 'Sin turnos para esa fecha';
  }

  if (summary.startTime) {
    return `Disponible a las ${summary.startTime}`;
  }

  return `${summary.availableHoursCount} horarios libres`;
}

export function buildCourtAvailabilityHint(summary = {}) {
  if (!summary?.date) {
    return 'Filtra por fecha, horario y caracteristicas para comparar mejor.';
  }

  if (!summary.hasAvailability) {
    return summary.nextAvailableTime
      ? `Proximo horario con lugar: ${summary.nextAvailableTime}.`
      : 'Prueba otra fecha u horario.';
  }

  if (summary.startTime) {
    return 'La cancha queda libre para el horario que filtraste.';
  }

  return summary.nextAvailableTime
    ? `Primer turno libre: ${summary.nextAvailableTime}.`
    : 'Tiene lugar disponible para reservar.';
}
