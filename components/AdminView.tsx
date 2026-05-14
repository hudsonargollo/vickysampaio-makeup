import React, { useState, useEffect } from 'react';
import { MOCK_PROVIDER } from '../constants';
import { Service } from '../types';
import {
  fetchAppointments,
  updateAppointmentStatus,
  getUpcomingDates,
  type Appointment,
} from '../services/api';

// ── Types ──────────────────────────────────────────────────────────────────
interface BusinessHours {
  day: string;
  label: string;
  open: boolean;
  start: string;
  end: string;
}

const DEFAULT_HOURS: BusinessHours[] = [
  { day: 'seg', label: 'Segunda', open: true,  start: '08:00', end: '18:00' },
  { day: 'ter', label: 'Terça',   open: true,  start: '08:00', end: '18:00' },
  { day: 'qua', label: 'Quarta',  open: true,  start: '08:00', end: '18:00' },
  { day: 'qui', label: 'Quinta',  open: true,  start: '08:00', end: '18:00' },
  { day: 'sex', label: 'Sexta',   open: true,  start: '08:00', end: '18:00' },
  { day: 'sab', label: 'Sábado',  open: true,  start: '08:00', end: '14:00' },
  { day: 'dom', label: 'Domingo', open: false, start: '09:00', end: '13:00' },
];

const statusConfig: Record<string, { label: string; color: string; bg: string }> = {
  confirmed: { label: 'Confirmado', color: '#22c55e',              bg: 'rgba(34,197,94,0.12)'   },
  pending:   { label: 'Pendente',   color: '#f59e0b',              bg: 'rgba(245,158,11,0.12)'  },
  done:      { label: 'Concluído',  color: 'var(--text-disabled)', bg: 'var(--bg-surface-hover)'},
  cancelled: { label: 'Cancelado',  color: '#ef4444',              bg: 'rgba(239,68,68,0.1)'    },
};

const SectionHeader: React.FC<{ title: string }> = ({ title }) => (
  <div className="flex items-center gap-3 mb-3 px-1">
    <div className="w-px h-4" style={{ backgroundColor: 'var(--accent-line)' }} />
    <h2 className="text-xs font-semibold uppercase tracking-widest" style={{ color: 'var(--text-primary)' }}>{title}</h2>
  </div>
);

// ── Format ISO date to readable label ──────────────────────────────────────
function formatDateLabel(iso: string): string {
  const today = new Date(); today.setHours(0,0,0,0);
  const d = new Date(iso + 'T00:00:00');
  const diff = Math.round((d.getTime() - today.getTime()) / 86400000);
  if (diff === 0) return 'Hoje';
  if (diff === 1) return 'Amanhã';
  return d.toLocaleDateString('pt-BR', { weekday: 'short', day: 'numeric', month: 'short' });
}

// ── Main component ─────────────────────────────────────────────────────────
export const AdminView: React.FC = () => {
  const [tab, setTab] = useState<'dashboard' | 'appointments' | 'services' | 'hours'>('dashboard');
  const [hours, setHours] = useState<BusinessHours[]>(DEFAULT_HOURS);
  const [services] = useState<Service[]>(MOCK_PROVIDER.services.filter(s => s.category === 'Serviços'));
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [loading, setLoading] = useState(true);

  const todayDate = getUpcomingDates(1)[0]?.value ?? '';

  useEffect(() => {
    setLoading(true);
    fetchAppointments()
      .then(data => setAppointments(data))
      .catch(() => setAppointments([]))
      .finally(() => setLoading(false));
  }, []);

  const handleStatus = async (id: string, status: string) => {
    await updateAppointmentStatus(id, status);
    setAppointments(prev =>
      prev.map(a => a.id === id ? { ...a, status: status as Appointment['status'] } : a)
    );
  };

  const todayAppts   = appointments.filter(a => a.date === todayDate);
  const pendingAppts = appointments.filter(a => a.status === 'pending');

  const tabs = [
    { id: 'dashboard',    label: 'Início'   },
    { id: 'appointments', label: 'Agenda'   },
    { id: 'services',     label: 'Serviços' },
    { id: 'hours',        label: 'Horários' },
  ] as const;

  return (
    <div className="min-h-screen pb-24 transition-colors duration-300" style={{ backgroundColor: 'var(--bg-app)', color: 'var(--text-primary)' }}>

      {/* Header */}
      <div className="sticky top-0 z-20 px-4 pt-12 pb-3 backdrop-blur-md" style={{ backgroundColor: 'var(--bg-surface)', borderBottom: '1px solid var(--border-subtle)' }}>
        <div className="flex items-center justify-between mb-3">
          <div>
            <h1 className="font-display text-2xl font-light">Painel</h1>
            <p className="text-xs" style={{ color: 'var(--text-disabled)' }}>
              {new Date().toLocaleDateString('pt-BR', { weekday: 'long', day: 'numeric', month: 'long' })}
            </p>
          </div>
          <div className="w-9 h-9 rounded-full" style={{ backgroundImage: 'url(/logo-vicky.png)', backgroundSize: 'cover', backgroundPosition: 'center', backgroundColor: '#0a0a0a', border: '1px solid var(--border-subtle)' }} />
        </div>
        <div className="flex gap-1">
          {tabs.map(t => (
            <button key={t.id} onClick={() => setTab(t.id)}
              className="flex-1 py-2 rounded-xl text-xs font-medium transition-all"
              style={tab === t.id
                ? { backgroundColor: 'var(--text-primary)', color: 'var(--bg-app)' }
                : { backgroundColor: 'var(--bg-surface-hover)', color: 'var(--text-secondary)' }
              }
            >{t.label}</button>
          ))}
        </div>
      </div>

      <div className="p-4 space-y-6 animate-fade-in">

        {/* ── DASHBOARD ─────────────────────────────────────────────────── */}
        {tab === 'dashboard' && (
          <>
            <div className="grid grid-cols-2 gap-3">
              {[
                { label: 'Hoje',       value: loading ? '…' : todayAppts.length,   sub: 'agendamentos' },
                { label: 'Pendentes',  value: loading ? '…' : pendingAppts.length, sub: 'aguardando'   },
                { label: 'Serviços',   value: services.length,                     sub: 'ativos'       },
                { label: 'Fidelidade', value: MOCK_PROVIDER.loyaltyProgram?.threshold ?? '—', sub: 'visitas p/ prêmio' },
              ].map(kpi => (
                <div key={kpi.label} className="p-4 rounded-2xl" style={{ backgroundColor: 'var(--bg-surface)', border: '1px solid var(--border-subtle)' }}>
                  <p className="text-[10px] uppercase tracking-widest mb-1" style={{ color: 'var(--text-disabled)' }}>{kpi.label}</p>
                  <p className="font-display text-3xl font-light" style={{ color: 'var(--text-primary)' }}>{kpi.value}</p>
                  <p className="text-xs mt-0.5" style={{ color: 'var(--text-secondary)' }}>{kpi.sub}</p>
                </div>
              ))}
            </div>

            <div>
              <SectionHeader title="Hoje" />
              {loading ? (
                <p className="text-sm px-1" style={{ color: 'var(--text-disabled)' }}>Carregando…</p>
              ) : todayAppts.length === 0 ? (
                <p className="text-sm px-1" style={{ color: 'var(--text-disabled)' }}>Nenhum agendamento hoje.</p>
              ) : (
                <div className="space-y-2">
                  {todayAppts.map(a => {
                    const s = statusConfig[a.status] ?? statusConfig.pending;
                    return (
                      <div key={a.id} className="flex items-center justify-between p-3 rounded-xl" style={{ backgroundColor: 'var(--bg-surface)', border: '1px solid var(--border-subtle)' }}>
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 rounded-full flex items-center justify-center text-xs font-medium" style={{ backgroundColor: 'var(--bg-surface-hover)', color: 'var(--text-primary)' }}>
                            {a.time}
                          </div>
                          <div>
                            <p className="text-sm font-medium" style={{ color: 'var(--text-primary)' }}>{a.client_name}</p>
                            <p className="text-xs" style={{ color: 'var(--text-secondary)' }}>{a.service_name}</p>
                          </div>
                        </div>
                        <span className="text-[10px] font-semibold px-2 py-1 rounded-full" style={{ backgroundColor: s.bg, color: s.color }}>{s.label}</span>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>

            <div>
              <SectionHeader title="Tabela de Preços" />
              <div className="rounded-2xl overflow-hidden" style={{ backgroundColor: 'var(--bg-surface)', border: '1px solid var(--border-subtle)' }}>
                {services.map((svc, i) => (
                  <div key={svc.id} className="flex items-center justify-between px-4 py-3" style={{ borderBottom: i < services.length - 1 ? '1px solid var(--border-subtle)' : undefined }}>
                    <div>
                      <p className="text-sm font-medium" style={{ color: 'var(--text-primary)' }}>{svc.name}</p>
                      <p className="text-xs" style={{ color: 'var(--text-disabled)' }}>{svc.duration} min</p>
                    </div>
                    <span className="font-display text-lg font-light" style={{ color: 'var(--text-primary)' }}>R$ {svc.price}</span>
                  </div>
                ))}
              </div>
            </div>
          </>
        )}

        {/* ── APPOINTMENTS ──────────────────────────────────────────────── */}
        {tab === 'appointments' && (
          <>
            <SectionHeader title="Todos os Agendamentos" />
            {loading ? (
              <p className="text-sm px-1" style={{ color: 'var(--text-disabled)' }}>Carregando…</p>
            ) : appointments.length === 0 ? (
              <p className="text-sm px-1" style={{ color: 'var(--text-disabled)' }}>Nenhum agendamento ainda.</p>
            ) : (
              <div className="space-y-2">
                {appointments.map(a => {
                  const s = statusConfig[a.status] ?? statusConfig.pending;
                  return (
                    <div key={a.id} className="p-4 rounded-2xl" style={{ backgroundColor: 'var(--bg-surface)', border: '1px solid var(--border-subtle)' }}>
                      <div className="flex items-start justify-between mb-2">
                        <div>
                          <p className="text-sm font-semibold" style={{ color: 'var(--text-primary)' }}>{a.client_name}</p>
                          <p className="text-xs" style={{ color: 'var(--text-secondary)' }}>{a.service_name}</p>
                        </div>
                        <span className="text-[10px] font-semibold px-2 py-1 rounded-full" style={{ backgroundColor: s.bg, color: s.color }}>{s.label}</span>
                      </div>
                      <div className="flex items-center gap-3 text-xs mb-1" style={{ color: 'var(--text-disabled)' }}>
                        <span>{formatDateLabel(a.date)}</span>
                        <span>·</span>
                        <span>{a.time}</span>
                        <span>·</span>
                        <span>R$ {a.service_price}</span>
                      </div>
                      <p className="text-xs mb-3" style={{ color: 'var(--text-disabled)' }}>{a.client_phone}</p>

                      {a.status === 'pending' && (
                        <div className="flex gap-2">
                          <button onClick={() => handleStatus(a.id, 'confirmed')}
                            className="flex-1 py-2 rounded-xl text-xs font-medium transition-all"
                            style={{ backgroundColor: 'var(--text-primary)', color: 'var(--bg-app)' }}>
                            Confirmar
                          </button>
                          <button onClick={() => handleStatus(a.id, 'cancelled')}
                            className="flex-1 py-2 rounded-xl text-xs font-medium transition-all"
                            style={{ backgroundColor: 'var(--bg-surface-hover)', color: 'var(--text-secondary)', border: '1px solid var(--border-subtle)' }}>
                            Cancelar
                          </button>
                        </div>
                      )}
                      {a.status === 'confirmed' && (
                        <button onClick={() => handleStatus(a.id, 'done')}
                          className="w-full py-2 rounded-xl text-xs font-medium transition-all"
                          style={{ backgroundColor: 'var(--bg-surface-hover)', color: 'var(--text-secondary)', border: '1px solid var(--border-subtle)' }}>
                          Marcar como Concluído
                        </button>
                      )}
                    </div>
                  );
                })}
              </div>
            )}
          </>
        )}

        {/* ── SERVICES ──────────────────────────────────────────────────── */}
        {tab === 'services' && (
          <>
            <SectionHeader title="Serviços" />
            <div className="space-y-3">
              {services.map(svc => (
                <div key={svc.id} className="p-4 rounded-2xl" style={{ backgroundColor: 'var(--bg-surface)', border: '1px solid var(--border-subtle)' }}>
                  <h3 className="font-display text-lg font-light mb-1" style={{ color: 'var(--text-primary)' }}>{svc.name}</h3>
                  <p className="text-xs mb-3 leading-relaxed" style={{ color: 'var(--text-secondary)' }}>{svc.description}</p>
                  <div className="grid grid-cols-2 gap-2">
                    <div className="p-2.5 rounded-xl text-center" style={{ backgroundColor: 'var(--bg-surface-hover)', border: '1px solid var(--border-subtle)' }}>
                      <p className="text-[10px] uppercase tracking-widest mb-0.5" style={{ color: 'var(--text-disabled)' }}>Duração</p>
                      <p className="text-sm font-medium" style={{ color: 'var(--text-primary)' }}>{svc.duration} min</p>
                    </div>
                    <div className="p-2.5 rounded-xl text-center" style={{ backgroundColor: 'var(--bg-surface-hover)', border: '1px solid var(--border-subtle)' }}>
                      <p className="text-[10px] uppercase tracking-widest mb-0.5" style={{ color: 'var(--text-disabled)' }}>Valor</p>
                      <p className="font-display text-base font-light" style={{ color: 'var(--text-primary)' }}>R$ {svc.price}</p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </>
        )}

        {/* ── HOURS ─────────────────────────────────────────────────────── */}
        {tab === 'hours' && (
          <>
            <SectionHeader title="Horário de Funcionamento" />
            <div className="rounded-2xl overflow-hidden" style={{ backgroundColor: 'var(--bg-surface)', border: '1px solid var(--border-subtle)' }}>
              {hours.map((h, i) => (
                <div key={h.day} className="px-4 py-3 flex items-center gap-3"
                  style={{ borderBottom: i < hours.length - 1 ? '1px solid var(--border-subtle)' : undefined }}>
                  <button
                    onClick={() => setHours(prev => prev.map(x => x.day === h.day ? { ...x, open: !x.open } : x))}
                    className="relative w-10 h-5 rounded-full transition-all flex-shrink-0"
                    style={{ backgroundColor: h.open ? 'var(--text-primary)' : 'var(--border-subtle)' }}
                  >
                    <div className="absolute top-0.5 w-4 h-4 rounded-full transition-all"
                      style={{ backgroundColor: h.open ? 'var(--bg-app)' : 'var(--text-disabled)', left: h.open ? '22px' : '2px' }} />
                  </button>
                  <span className="text-sm w-16 flex-shrink-0" style={{ color: h.open ? 'var(--text-primary)' : 'var(--text-disabled)' }}>{h.label}</span>
                  {h.open ? (
                    <div className="flex items-center gap-2 flex-1">
                      <input type="time" value={h.start}
                        onChange={e => setHours(prev => prev.map(x => x.day === h.day ? { ...x, start: e.target.value } : x))}
                        className="flex-1 px-2 py-1 rounded-lg text-xs text-center"
                        style={{ backgroundColor: 'var(--bg-surface-hover)', border: '1px solid var(--border-subtle)', color: 'var(--text-primary)' }} />
                      <span className="text-xs" style={{ color: 'var(--text-disabled)' }}>–</span>
                      <input type="time" value={h.end}
                        onChange={e => setHours(prev => prev.map(x => x.day === h.day ? { ...x, end: e.target.value } : x))}
                        className="flex-1 px-2 py-1 rounded-lg text-xs text-center"
                        style={{ backgroundColor: 'var(--bg-surface-hover)', border: '1px solid var(--border-subtle)', color: 'var(--text-primary)' }} />
                    </div>
                  ) : (
                    <span className="text-xs flex-1" style={{ color: 'var(--text-disabled)' }}>Fechado</span>
                  )}
                </div>
              ))}
            </div>
            <button className="w-full py-3.5 rounded-xl text-sm font-medium tracking-widest uppercase transition-all btn-brand">
              Salvar Horários
            </button>
          </>
        )}

      </div>
    </div>
  );
};
