import rawCompetitions from '../data/competitions.json';
import rawCompletedCompetitions from '../data/completed_competitions.json';

export interface Competition {
  id: string;
  title: string;
  date: string; // YYYY-MM-DD
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

export interface CompetitionWithStatus extends Competition {
  computedStatus: ComputedCompetitionStatus;
  statusLabel: string;
  isPast: boolean;
  formattedDate: string;
}

export function formatCompetitionDate(dateStr: string): string {
  try {
    const [year, month, day] = dateStr.split('-').map(Number);
    const d = new Date(Date.UTC(year, month - 1, day));
    return d.toLocaleDateString('en-AU', {
      weekday: 'long',
      day: 'numeric',
      month: 'long',
      year: 'numeric',
      timeZone: 'UTC'
    });
  } catch {
    return dateStr;
  }
}

export function getCompetitionStatus(
  comp: Competition,
  referenceDate: Date = new Date()
): { status: ComputedCompetitionStatus; label: string; isPast: boolean } {
  if (comp.statusOverride) {
    const isPast = comp.statusOverride === 'completed';
    const labelMap: Record<ComputedCompetitionStatus, string> = {
      completed: 'Completed',
      cancelled: 'Cancelled',
      registration_open: 'Registration Open',
      scheduled: 'Scheduled',
    };
    return {
      status: comp.statusOverride as ComputedCompetitionStatus,
      label: labelMap[comp.statusOverride as ComputedCompetitionStatus] || 'Scheduled',
      isPast,
    };
  }

  const refIso = referenceDate.toISOString().split('T')[0];
  const isPast = comp.date < refIso;

  if (isPast) {
    return { status: 'completed', label: 'Completed', isPast: true };
  }

  if (comp.registrationUrl && comp.registrationCloseDate) {
    if (comp.registrationCloseDate >= refIso) {
      return { status: 'registration_open', label: 'Registration Open', isPast: false };
    }
  }

  return { status: 'scheduled', label: 'Scheduled', isPast: false };
}

export function getCompetitionsWithStatus(referenceDate: Date = new Date()): {
  upcoming: CompetitionWithStatus[];
  past: CompetitionWithStatus[];
  all: CompetitionWithStatus[];
  activeRegistration: CompetitionWithStatus | null;
  nextScheduled: CompetitionWithStatus | null;
} {
  // Combine both sources, de-duplicating by ID (completed competitions take precedence for completed events)
  const compMap = new Map<string, Competition>();

  (rawCompetitions as Competition[]).forEach((c) => compMap.set(c.id, c));
  (rawCompletedCompetitions as Competition[]).forEach((c) => compMap.set(c.id, c));

  const all: CompetitionWithStatus[] = Array.from(compMap.values()).map((comp) => {
    const { status, label, isPast } = getCompetitionStatus(comp, referenceDate);
    return {
      ...comp,
      computedStatus: status,
      statusLabel: label,
      isPast,
      formattedDate: formatCompetitionDate(comp.date),
    };
  });

  const upcoming = all
    .filter((c) => !c.isPast)
    .sort((a, b) => a.date.localeCompare(b.date));

  const past = all
    .filter((c) => c.isPast)
    .sort((a, b) => b.date.localeCompare(a.date));

  const activeRegistration = upcoming.find((c) => c.computedStatus === 'registration_open') || null;
  const nextScheduled = upcoming.length > 0 ? upcoming[0] : null;

  return {
    upcoming,
    past,
    all,
    activeRegistration,
    nextScheduled,
  };
}
