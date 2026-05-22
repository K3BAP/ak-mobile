import { createContext, useContext } from "react";
import type { EventData } from "./hooks/useEventData";

interface EventCtx {
  slug: string;
  data: EventData;
}

export const EventContext = createContext<EventCtx | null>(null);

export function useEvent(): EventCtx {
  const ctx = useContext(EventContext);
  if (!ctx) throw new Error("useEvent must be used inside an event route");
  return ctx;
}
