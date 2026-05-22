import { motion } from "framer-motion";
import { CalendarClock, ExternalLink, FileText, MapPin, Target, Users } from "lucide-react";
import { useParams } from "react-router-dom";
import { useEvent } from "../EventContext";
import { CategoryPill } from "../components/CategoryPill";
import { FavoriteButton } from "../components/FavoriteButton";
import { TopBar } from "../components/TopBar";
import { EmptyState } from "../components/EmptyState";
import { accent } from "../lib/color";
import { dayLabelParts, rangeLabel } from "../lib/time";
import { staggerContainer, fadeUp } from "../lib/animations";

export function AKDetailScreen() {
  const { slug, data } = useEvent();
  const { akId } = useParams();
  const ak = data.akById.get(Number(akId));

  if (!ak) {
    return (
      <>
        <TopBar title="Not found" back />
        <EmptyState icon={FileText} title="This AK doesn't exist" />
      </>
    );
  }

  const category = ak.category != null ? data.categoryById.get(ak.category) ?? null : null;
  const owners = ak.owners.map((id) => data.ownerById.get(id)).filter(Boolean);
  const slots = data.slotsByAk.get(ak.id) ?? [];
  const offset = data.offsetMinutes;

  return (
    <>
      <TopBar
        title={ak.short_name || "AK"}
        back
        right={<FavoriteButton slug={slug} akId={ak.id} size="lg" />}
      />

      <main className="px-4 py-4">
        <motion.div
          className="rounded-2xl border border-line bg-bg-card p-4 shadow-soft"
          style={{ borderLeft: `4px solid ${accent(category?.color)}` }}
          variants={fadeUp}
          initial="initial"
          animate="animate"
        >
          <div className="mb-2 flex flex-wrap items-center gap-2">
            {category && <CategoryPill name={category.name} color={category.color} />}
            {ak.reso && (
              <span className="rounded-md bg-fuchsia-500/15 px-2 py-0.5 text-[10px] font-bold uppercase tracking-wide text-fuchsia-300">
                Resolution
              </span>
            )}
            {ak.present && (
              <span className="rounded-md bg-accent/15 px-2 py-0.5 text-[10px] font-bold uppercase tracking-wide text-accent">
                Presented
              </span>
            )}
          </div>
          <h1 className="text-xl font-bold leading-tight">{ak.name}</h1>
          {owners.length > 0 && (
            <p className="mt-2 flex items-start gap-1.5 text-sm text-ink-soft">
              <Users className="mt-0.5 h-4 w-4 shrink-0 text-ink-faint" />
              <span>
                {owners.map((o, i) => (
                  <span key={o!.id}>
                    {i > 0 && ", "}
                    {o!.name}
                    {o!.institution && (
                      <span className="text-ink-faint"> ({o!.institution})</span>
                    )}
                  </span>
                ))}
              </span>
            </p>
          )}
        </motion.div>

        <motion.div
          className="space-y-5"
          variants={staggerContainer}
          initial="initial"
          animate="animate"
        >
          {slots.length > 0 && (
            <Section icon={CalendarClock} title="Scheduled">
              <motion.div className="space-y-2" variants={staggerContainer}>
                {slots.map((rs) => {
                  const p = dayLabelParts(rs.start, offset);
                  return (
                    <motion.div
                      key={rs.slot.id}
                      className="flex items-center justify-between rounded-xl border border-line bg-bg-card px-3 py-2.5"
                      variants={fadeUp}
                    >
                      <div>
                        <p className="text-sm font-semibold">
                          {p.weekday}, {p.month} {p.day}
                        </p>
                        <p className="text-xs text-ink-faint tabular-nums">
                          {rangeLabel(rs.start, rs.end, offset)}
                        </p>
                      </div>
                      {rs.room && (
                        <span className="inline-flex items-center gap-1 rounded-lg bg-bg-elevated px-2.5 py-1 text-sm font-medium text-ink-soft">
                          <MapPin className="h-3.5 w-3.5" />
                          {rs.room.name}
                        </span>
                      )}
                    </motion.div>
                  );
                })}
              </motion.div>
            </Section>
          )}

          {ak.description && (
            <Section icon={FileText} title="Description">
              <motion.p
                className="whitespace-pre-line text-[15px] leading-relaxed text-ink-soft"
                variants={fadeUp}
              >
                {ak.description}
              </motion.p>
            </Section>
          )}

          {ak.goal && (
            <Section icon={Target} title="Goal">
              <motion.p
                className="whitespace-pre-line text-[15px] leading-relaxed text-ink-soft"
                variants={fadeUp}
              >
                {ak.goal}
              </motion.p>
            </Section>
          )}

          {ak.info && (
            <Section icon={FileText} title="Info">
              <motion.p
                className="whitespace-pre-line text-[15px] leading-relaxed text-ink-soft"
                variants={fadeUp}
              >
                {ak.info}
              </motion.p>
            </Section>
          )}

          {(ak.link || ak.protocol_link) && (
            <motion.div className="mt-5 space-y-2" variants={staggerContainer}>
              {ak.link && <LinkRow href={ak.link} label="Wiki / details" />}
              {ak.protocol_link && <LinkRow href={ak.protocol_link} label="Protocol" />}
            </motion.div>
          )}
        </motion.div>
      </main>
    </>
  );
}

function Section({
  icon: Icon,
  title,
  children,
}: {
  icon: typeof FileText;
  title: string;
  children: React.ReactNode;
}) {
  return (
    <section className="mt-5">
      <h2 className="mb-2 flex items-center gap-1.5 text-xs font-semibold uppercase tracking-wide text-ink-faint">
        <Icon className="h-3.5 w-3.5" />
        {title}
      </h2>
      {children}
    </section>
  );
}

function LinkRow({ href, label }: { href: string; label: string }) {
  return (
    <a
      href={href}
      target="_blank"
      rel="noreferrer"
      className="flex items-center justify-between rounded-xl border border-line bg-bg-card px-4 py-3 text-[15px] font-medium text-accent active:bg-bg-elevated"
    >
      {label}
      <ExternalLink className="h-4 w-4" />
    </a>
  );
}
