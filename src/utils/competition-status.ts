export interface Competition {
  id: string;
  title: string;
  date: string; // YYYY-MM-DD
  timeZone: string;
  time?: string;
  location: string;
  venue: string;
  registrationUrl?: string | null;
  registrationCloseDate?: string | null;
  statusOverride?: 'cancelled' | 'completed' | 'scheduled' | 'registration_open' | null;
  sanctioned: boolean;
  sanctioningBody?: string;
  description?: string;
  resultsUrl?: string | null;
}

export type ComputedCompetitionStatus = 'completed' | 'cancelled' | 'registration_open' | 'scheduled';

export function getVenueDate(referenceDate: Date, timeZone: string): string {
  const parts = new Intl.DateTimeFormat('en-AU', {
    timeZone, year: 'numeric', month: '2-digit', day: '2-digit',
  }).formatToParts(referenceDate);
  const part = (type: string) => parts.find((p) => p.type === type)!.value;
  return `${part('year')}-${part('month')}-${part('day')}`;
}

export function getNextVenueMidnight(referenceDate: Date, timeZone: string): number {
  const [year, month, day] = getVenueDate(referenceDate, timeZone).split('-').map(Number);
  const target = Date.UTC(year, month - 1, day + 1);
  const formatter = new Intl.DateTimeFormat('en-AU', {
    timeZone, year: 'numeric', month: '2-digit', day: '2-digit',
    hour: '2-digit', minute: '2-digit', second: '2-digit', hourCycle: 'h23',
  });
  let midnight = target;
  // Resolve the offset at the target midnight, including daylight-saving changes.
  for (let i = 0; i < 3; i++) {
    const parts = formatter.formatToParts(new Date(midnight));
    const part = (type: string) => Number(parts.find((p) => p.type === type)!.value);
    const local = Date.UTC(part('year'), part('month') - 1, part('day'),
      part('hour'), part('minute'), part('second'));
    const adjusted = target - (local - midnight);
    if (adjusted === midnight) break;
    midnight = adjusted;
  }
  return midnight;
}

export function getCompetitionStatus(
  comp: Competition,
  referenceDate: Date = new Date()
): { status: ComputedCompetitionStatus; label: string; isPast: boolean } {
  const today = getVenueDate(referenceDate, comp.timeZone);
  const isPast = comp.date < today || comp.statusOverride === 'completed';

  if (comp.statusOverride === 'cancelled') {
    return { status: 'cancelled', label: 'Cancelled', isPast };
  }
  if (isPast) {
    return { status: 'completed', label: 'Completed', isPast: true };
  }
  if (comp.statusOverride !== 'scheduled' && comp.registrationUrl &&
    ((comp.registrationCloseDate && comp.registrationCloseDate >= today) ||
      (!comp.registrationCloseDate && comp.statusOverride === 'registration_open'))) {
    return { status: 'registration_open', label: 'Registration Open', isPast: false };
  }
  return { status: 'scheduled', label: 'Scheduled', isPast: false };
}
