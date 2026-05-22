// Mirrors the AKPlanning REST API (per-event, read-only JSON arrays).

export interface AK {
  id: number;
  name: string;
  short_name: string;
  description: string;
  goal: string;
  info: string;
  link: string;
  protocol_link: string;
  reso: boolean;
  present: boolean;
  notes: string;
  interest: number;
  interest_counter: number;
  category: number | null;
  track: number | null;
  event: number;
  owners: number[];
  types: number[];
  requirements: number[];
  conflicts: number[];
  prerequisites: number[];
}

export interface AKSlot {
  id: number;
  start: string; // ISO 8601 with timezone offset
  duration: string; // decimal hours, e.g. "5.50"
  fixed: boolean;
  updated: string;
  ak: number | null;
  room: number | null;
  event: number;
}

export interface Room {
  id: number;
  name: string;
  location: string;
  capacity: number;
  event: number;
  properties: number[];
}

export interface Category {
  id: number;
  name: string;
  color: string;
  description: string;
  present_by_default: boolean;
  event: number;
}

export interface Owner {
  id: number;
  name: string;
  slug: string;
  institution: string;
  link: string;
  event: number;
}

export interface Track {
  id: number;
  name: string;
  color: string;
  event: number;
}

// Discovered from the dashboard HTML (no API endpoint exists for this).
export interface EventInfo {
  slug: string;
  name: string;
  location: string;
  when: string;
}

// A slot joined with its related AK / room / category for rendering.
export interface ResolvedSlot {
  slot: AKSlot;
  ak: AK | null;
  room: Room | null;
  category: Category | null;
  start: Date;
  end: Date;
}
