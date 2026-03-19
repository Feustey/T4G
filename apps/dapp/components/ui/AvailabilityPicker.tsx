import React, { useState, useEffect, useRef } from 'react';
import { TimeSlot } from '../../services/apiClient';

export type AvailabilityMode = 'recurring' | 'manual' | 'on_demand';

interface RecurringRule {
  day: number; // JS day: 0=Dim, 1=Lun, …, 6=Sam
  hour: number;
  minute: number;
}

const DAY_ENTRIES: { js: number; label: string }[] = [
  { js: 1, label: 'Lun' },
  { js: 2, label: 'Mar' },
  { js: 3, label: 'Mer' },
  { js: 4, label: 'Jeu' },
  { js: 5, label: 'Ven' },
  { js: 6, label: 'Sam' },
  { js: 0, label: 'Dim' },
];

// Offset from Monday (Mon=0 … Sun=6)
const dayOffset = (jsDay: number) => (jsDay === 0 ? 6 : jsDay - 1);

function generateFromRules(
  rules: RecurringRule[],
  durationMinutes: number,
  weeksAhead: number,
  minLeadHours: number
): TimeSlot[] {
  if (rules.length === 0) return [];
  const now = new Date();
  const cutoff = new Date(now.getTime() + minLeadHours * 60 * 60 * 1000);

  // Monday 00:00 of current week
  const mon = new Date(now);
  const dow = mon.getDay();
  mon.setDate(mon.getDate() - (dow === 0 ? 6 : dow - 1));
  mon.setHours(0, 0, 0, 0);

  const slots: TimeSlot[] = [];
  for (let w = 0; w < weeksAhead; w++) {
    for (const rule of rules) {
      const d = new Date(mon);
      d.setDate(d.getDate() + w * 7 + dayOffset(rule.day));
      d.setHours(rule.hour, rule.minute, 0, 0);
      if (d > cutoff) {
        slots.push({ date: d.toISOString(), duration_minutes: durationMinutes });
      }
    }
  }
  return slots.sort((a, b) => +new Date(a.date) - +new Date(b.date));
}

function defaultManualSlots(durationMinutes: number): TimeSlot[] {
  return [1, 3, 7].map((d) => {
    const date = new Date();
    date.setDate(date.getDate() + d);
    date.setHours(14, 0, 0, 0);
    return { date: date.toISOString(), duration_minutes: durationMinutes };
  });
}

export interface AvailabilityPickerProps {
  durationMinutes: number;
  onChange: (slots: TimeSlot[], mode: AvailabilityMode) => void;
}

export const AvailabilityPicker: React.FC<AvailabilityPickerProps> = ({
  durationMinutes,
  onChange,
}) => {
  const [mode, setMode] = useState<AvailabilityMode>('recurring');
  const [rules, setRules] = useState<RecurringRule[]>([{ day: 1, hour: 18, minute: 0 }]);
  const [minLeadHours, setMinLeadHours] = useState(24);
  const [weeksAhead, setWeeksAhead] = useState(4);
  const [manualSlots, setManualSlots] = useState<TimeSlot[]>(() =>
    defaultManualSlots(durationMinutes)
  );

  // Stable ref to avoid stale closure in useEffect
  const onChangeRef = useRef(onChange);
  useEffect(() => { onChangeRef.current = onChange; });

  // Emit derived slots on any state change
  useEffect(() => {
    if (mode === 'on_demand') {
      onChangeRef.current([], 'on_demand');
    } else if (mode === 'manual') {
      onChangeRef.current(manualSlots, 'manual');
    } else {
      onChangeRef.current(
        generateFromRules(rules, durationMinutes, weeksAhead, minLeadHours),
        'recurring'
      );
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [mode, rules, minLeadHours, weeksAhead, manualSlots, durationMinutes]);

  const toggleDay = (jsDay: number) => {
    setRules((prev) => {
      const exists = prev.some((r) => r.day === jsDay);
      const next = exists
        ? prev.filter((r) => r.day !== jsDay)
        : [...prev, { day: jsDay, hour: 18, minute: 0 }];
      return next.sort((a, b) => dayOffset(a.day) - dayOffset(b.day));
    });
  };

  const updateRuleTime = (jsDay: number, hour: number, minute: number) =>
    setRules((prev) => prev.map((r) => (r.day === jsDay ? { ...r, hour, minute } : r)));

  const derivedSlots =
    mode === 'recurring'
      ? generateFromRules(rules, durationMinutes, weeksAhead, minLeadHours)
      : mode === 'manual'
      ? manualSlots
      : [];

  const pill: React.CSSProperties = {
    padding: '6px 14px',
    borderRadius: '0.5rem',
    cursor: 'pointer',
    fontSize: 13,
    border: '2px solid transparent',
    transition: 'all 0.15s',
  };

  return (
    <div>
      {/* ── Mode selector ── */}
      <div style={{ display: 'flex', gap: 8, marginBottom: 16, flexWrap: 'wrap' }}>
        {(
          [
            { value: 'recurring' as const, label: '🔁 Récurrent' },
            { value: 'manual'    as const, label: '📅 Dates fixes' },
            { value: 'on_demand' as const, label: '💬 Sur demande' },
          ]
        ).map(({ value, label }) => (
          <button
            key={value}
            type="button"
            onClick={() => setMode(value)}
            style={{
              ...pill,
              borderColor: mode === value ? 'var(--color-primary, #2563eb)' : 'var(--color-border, #e2e8f0)',
              background: mode === value ? 'var(--color-primary-light, #eff6ff)' : 'transparent',
              color: mode === value ? 'var(--color-primary, #2563eb)' : 'inherit',
              fontWeight: mode === value ? 600 : 400,
            }}
          >
            {label}
          </button>
        ))}
      </div>

      {/* ── Recurring ── */}
      {mode === 'recurring' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
          {/* Day bubbles */}
          <div>
            <p style={{ fontSize: 12, fontWeight: 600, margin: '0 0 8px', color: 'var(--color-text-secondary, #64748b)' }}>
              Jours disponibles
            </p>
            <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
              {DAY_ENTRIES.map(({ js, label }) => {
                const active = rules.some((r) => r.day === js);
                return (
                  <button
                    key={js}
                    type="button"
                    onClick={() => toggleDay(js)}
                    style={{
                      width: 42, height: 42, borderRadius: '50%', cursor: 'pointer',
                      border: `2px solid ${active ? 'var(--color-primary, #2563eb)' : 'var(--color-border, #e2e8f0)'}`,
                      background: active ? 'var(--color-primary, #2563eb)' : 'transparent',
                      color: active ? '#fff' : 'inherit',
                      fontWeight: active ? 700 : 400,
                      fontSize: 12, transition: 'all 0.15s',
                    }}
                  >
                    {label}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Time per selected day */}
          {rules.length > 0 && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
              <p style={{ fontSize: 12, fontWeight: 600, margin: 0, color: 'var(--color-text-secondary, #64748b)' }}>
                Horaires de début
              </p>
              {rules.map((rule) => {
                const entry = DAY_ENTRIES.find((d) => d.js === rule.day);
                const timeVal = `${String(rule.hour).padStart(2, '0')}:${String(rule.minute).padStart(2, '0')}`;
                return (
                  <div key={rule.day} style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                    <span style={{ width: 32, fontSize: 13, fontWeight: 600, color: 'var(--color-text-secondary, #64748b)', flexShrink: 0 }}>
                      {entry?.label}
                    </span>
                    <input
                      type="time"
                      value={timeVal}
                      onChange={(e) => {
                        const [h, m] = e.target.value.split(':').map(Number);
                        updateRuleTime(rule.day, h, m);
                      }}
                      style={{
                        padding: '5px 10px', borderRadius: '0.375rem',
                        border: '1.5px solid var(--color-border, #e2e8f0)', fontSize: 13,
                      }}
                    />
                  </div>
                );
              })}
            </div>
          )}

          {rules.length === 0 && (
            <p style={{ fontSize: 13, color: 'var(--color-text-secondary, #64748b)', margin: 0 }}>
              Sélectionne au moins un jour.
            </p>
          )}

          {/* Config */}
          <div style={{ display: 'flex', gap: 20, flexWrap: 'wrap' }}>
            <label style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
              <span style={{ fontSize: 12, color: 'var(--color-text-secondary, #64748b)' }}>
                Délai min. avant réservation
              </span>
              <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                <input
                  type="number" min={1} max={168} value={minLeadHours}
                  onChange={(e) => setMinLeadHours(Number(e.target.value))}
                  style={{ width: 60, padding: '4px 8px', borderRadius: '0.375rem', border: '1.5px solid var(--color-border, #e2e8f0)', fontSize: 13 }}
                />
                <span style={{ fontSize: 12, color: 'var(--color-text-secondary, #64748b)' }}>h</span>
              </div>
            </label>
            <label style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
              <span style={{ fontSize: 12, color: 'var(--color-text-secondary, #64748b)' }}>
                Générer sur
              </span>
              <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                <input
                  type="number" min={1} max={8} value={weeksAhead}
                  onChange={(e) => setWeeksAhead(Number(e.target.value))}
                  style={{ width: 60, padding: '4px 8px', borderRadius: '0.375rem', border: '1.5px solid var(--color-border, #e2e8f0)', fontSize: 13 }}
                />
                <span style={{ fontSize: 12, color: 'var(--color-text-secondary, #64748b)' }}>semaines</span>
              </div>
            </label>
          </div>

          {/* Preview */}
          {derivedSlots.length > 0 && (
            <SlotPreview slots={derivedSlots} />
          )}
        </div>
      )}

      {/* ── Manual ── */}
      {mode === 'manual' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
          {manualSlots.map((slot, i) => (
            <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
              <input
                type="datetime-local"
                value={slot.date.slice(0, 16)}
                onChange={(e) => {
                  const updated = [...manualSlots];
                  updated[i] = { ...updated[i], date: new Date(e.target.value).toISOString() };
                  setManualSlots(updated);
                }}
                style={{
                  flex: 1, padding: '6px 10px', borderRadius: '0.375rem',
                  border: '1.5px solid var(--color-border, #e2e8f0)', fontSize: 13,
                }}
              />
              <button
                type="button"
                onClick={() => setManualSlots(manualSlots.filter((_, j) => j !== i))}
                style={{ color: 'var(--color-error, #d32f2f)', background: 'none', border: 'none', cursor: 'pointer', fontSize: 20, padding: '0 4px', lineHeight: 1 }}
                aria-label="Supprimer ce créneau"
              >×</button>
            </div>
          ))}
          <button
            type="button"
            onClick={() => {
              const d = new Date();
              d.setDate(d.getDate() + 1);
              d.setHours(14, 0, 0, 0);
              setManualSlots([...manualSlots, { date: d.toISOString(), duration_minutes: durationMinutes }]);
            }}
            style={{
              alignSelf: 'flex-start', padding: '6px 14px', borderRadius: '0.375rem',
              border: '1.5px dashed var(--color-border, #e2e8f0)',
              background: 'none', cursor: 'pointer', fontSize: 13,
              color: 'var(--color-primary, #2563eb)',
            }}
          >
            + Ajouter un créneau
          </button>
          {derivedSlots.length > 0 && <SlotPreview slots={derivedSlots} />}
        </div>
      )}

      {/* ── On demand ── */}
      {mode === 'on_demand' && (
        <p style={{ fontSize: 14, color: 'var(--color-text-secondary, #64748b)', margin: 0, padding: '4px 0' }}>
          Le mentee te contactera pour convenir d&apos;un horaire. Aucun créneau n&apos;est réservé à l&apos;avance.
        </p>
      )}
    </div>
  );
};

// ── Sous-composant preview ────────────────────────────────────────────────────

const SlotPreview: React.FC<{ slots: TimeSlot[] }> = ({ slots }) => (
  <div
    style={{
      background: 'var(--color-surface-secondary, #f8fafc)',
      borderRadius: '0.5rem',
      padding: '10px 14px',
    }}
  >
    <p style={{ margin: '0 0 8px', fontSize: 13, fontWeight: 600 }}>
      {slots.length} créneau{slots.length > 1 ? 'x' : ''} généré{slots.length > 1 ? 's' : ''}
    </p>
    <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6 }}>
      {slots.slice(0, 8).map((s, i) => (
        <span
          key={i}
          style={{
            fontSize: 11, padding: '3px 10px', borderRadius: 999,
            background: 'var(--color-primary-light, #eff6ff)',
            color: 'var(--color-primary, #2563eb)',
          }}
        >
          {new Date(s.date).toLocaleDateString('fr-FR', {
            weekday: 'short', day: 'numeric', month: 'short',
          })}{' '}
          {new Date(s.date).toLocaleTimeString('fr-FR', {
            hour: '2-digit', minute: '2-digit',
          })}
        </span>
      ))}
      {slots.length > 8 && (
        <span style={{ fontSize: 11, padding: '3px 8px', color: 'var(--color-text-secondary, #64748b)' }}>
          +{slots.length - 8} autres
        </span>
      )}
    </div>
  </div>
);
