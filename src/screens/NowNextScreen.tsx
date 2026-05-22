import { motion } from "framer-motion";
import { CalendarCheck, Coffee, Moon } from "lucide-react";
import { useMemo } from "react";
import { useEvent } from "../EventContext";
import { SlotCard } from "../components/SlotCard";
import { TopBar } from "../components/TopBar";
import { EmptyState } from "../components/EmptyState";
import { useNow } from "../hooks/useNow";
import { recents } from "../lib/favorites";
import { dayLabelParts, relativeLabel } from "../lib/time";
import { staggerContainer, listItem, fadeUp } from "../lib/animations";

export function NowNextScreen() {
  const { slug, data } = useEvent();
  const now = useNow();
  const title = recents.nameFor(slug) ?? slug;
  const offset = data.offsetMinutes;

  const { live, upcoming, beforeStart, afterEnd } = useMemo(() => {
    const slots = data.resolvedSlots;
    const live = slots.filter((rs) => rs.start <= now && now < rs.end);
    const upcoming = slots.filter((rs) => rs.start > now).slice(0, 12);
    const beforeStart = slots.length > 0 && now < slots[0].start;
    const afterEnd =
      slots.length > 0 && now > slots[slots.length - 1].end && live.length === 0;
    return { live, upcoming, beforeStart, afterEnd };
  }, [data.resolvedSlots, now]);

  const nextStart = upcoming[0]?.start;

  return (
    <>
      <TopBar title={title} subtitle="Happening now" back="/" />
      <main className="space-y-6 px-4 py-4">
        <motion.section variants={fadeUp} initial="initial" animate="animate">
          <SectionHeader title="Now" badge={live.length || undefined} />
          {live.length > 0 ? (
            <motion.div
              className="space-y-3"
              variants={staggerContainer}
              initial="initial"
              animate="animate"
            >
              {live.map((rs) => (
                <motion.div key={rs.slot.id} variants={listItem}>
                  <SlotCard
                    slug={slug}
                    rs={rs}
                    offsetMinutes={offset}
                    now={now}
                  />
                </motion.div>
              ))}
            </motion.div>
          ) : (
            <motion.div
              className="rounded-2xl border border-line bg-bg-card p-5 text-center"
              variants={fadeUp}
              initial="initial"
              animate="animate"
            >
              {beforeStart ? (
                <Idle
                  icon={CalendarCheck}
                  text={`Starts ${nextStart ? relativeLabel(nextStart, now) : "soon"}`}
                />
              ) : afterEnd ? (
                <Idle icon={Moon} text="That's a wrap — see you next time" />
              ) : (
                <Idle
                  icon={Coffee}
                  text={
                    nextStart
                      ? `Break — next session ${relativeLabel(nextStart, now)}`
                      : "Nothing scheduled right now"
                  }
                />
              )}
            </motion.div>
          )}
        </motion.section>

        <motion.section variants={fadeUp} initial="initial" animate="animate">
          <SectionHeader title="Up next" />
          {upcoming.length > 0 ? (
            <motion.div
              className="space-y-3"
              variants={staggerContainer}
              initial="initial"
              animate="animate"
            >
              {upcoming.map((rs, i) => {
                const prev = upcoming[i - 1];
                const newDay =
                  !prev ||
                  dayLabelParts(prev.start, offset).day !==
                    dayLabelParts(rs.start, offset).day;
                return (
                  <motion.div key={rs.slot.id} variants={listItem}>
                    {newDay && (
                      <p className="mb-2 mt-1 text-xs font-semibold uppercase tracking-wide text-ink-faint">
                        {labelDay(rs.start, offset)}
                      </p>
                    )}
                    <SlotCard
                      slug={slug}
                      rs={rs}
                      offsetMinutes={offset}
                      now={now}
                    />
                  </motion.div>
                );
              })}
            </motion.div>
          ) : (
            <EmptyState icon={Moon} title="No upcoming sessions" />
          )}
        </motion.section>
      </main>
    </>
  );
}

function labelDay(date: Date, offset: number): string {
  const p = dayLabelParts(date, offset);
  return `${p.weekday}, ${p.month} ${p.day}`;
}

function SectionHeader({ title, badge }: { title: string; badge?: number }) {
  return (
    <div className="mb-3 flex items-center gap-2">
      <h2 className="text-lg font-bold tracking-tight">{title}</h2>
      {badge != null && (
        <span className="rounded-full bg-emerald-500/15 px-2 py-0.5 text-xs font-bold text-emerald-300">
          {badge}
        </span>
      )}
    </div>
  );
}

function Idle({ icon: Icon, text }: { icon: typeof Coffee; text: string }) {
  return (
    <div className="flex flex-col items-center gap-2 py-2 text-ink-soft">
      <Icon className="h-7 w-7 text-ink-faint" />
      <p className="text-sm">{text}</p>
    </div>
  );
}
