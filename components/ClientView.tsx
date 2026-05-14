import React, { useState, useEffect, useRef, useCallback } from 'react';
import { MOCK_PROVIDER } from '../constants';
import { Service } from '../types';
import { ServiceCard } from './ServiceCard';
import { HighlightCard } from './HighlightCard';
import { SmartCart } from './SmartCart';
import { AIChat } from './AIChat';
import { LoyaltyCard } from './LoyaltyCard';
import {
  fetchSlots,
  fetchClientVisits,
  createAppointment,
  getUpcomingDates,
  type TimeSlot,
} from '../services/api';

interface ClientViewProps {
  isDarkMode: boolean;
  toggleTheme: () => void;
}

export const ClientView: React.FC<ClientViewProps> = ({ isDarkMode, toggleTheme }) => {
  const [cart, setCart] = useState<Service[]>([]);
  const [step, setStep] = useState<'services' | 'calendar' | 'identify' | 'success'>('services');
  const [selectedSlot, setSelectedSlot] = useState<TimeSlot | null>(null);
  const scrollContainerRef = useRef<HTMLDivElement>(null);
  const servicesRef = useRef<HTMLDivElement>(null);
  const selectedProfessional = MOCK_PROVIDER.professionals[0];

  // Identity
  const [customerName, setCustomerName] = useState('');
  const [customerPhone, setCustomerPhone] = useState('');

  // Loyalty — fetched from API after booking
  const [visits, setVisits] = useState(0);
  const [rewardUnlocked, setRewardUnlocked] = useState(false);

  // Calendar state
  const upcomingDates = getUpcomingDates(4);
  const [selectedDateIdx, setSelectedDateIdx] = useState(0);
  const selectedDate = upcomingDates[selectedDateIdx]?.value ?? '';

  // Slots from API
  const [slots, setSlots] = useState<TimeSlot[]>([]);
  const [slotsLoading, setSlotsLoading] = useState(false);

  // Booking state
  const [bookingLoading, setBookingLoading] = useState(false);
  const [bookingError, setBookingError] = useState('');

  // Load slots when date changes
  const loadSlots = useCallback(async (date: string) => {
    setSlotsLoading(true);
    setSelectedSlot(null);
    try {
      const data = await fetchSlots(date);
      setSlots(data);
    } catch {
      setSlots([]);
    } finally {
      setSlotsLoading(false);
    }
  }, []);

  useEffect(() => {
    if (step === 'calendar' && selectedDate) {
      loadSlots(selectedDate);
    }
  }, [step, selectedDate, loadSlots]);

  // Slideshow auto-scroll
  useEffect(() => {
    const t1 = setTimeout(() => scrollContainerRef.current?.scrollTo({ left: 0 }), 100);
    const t2 = setTimeout(() => scrollContainerRef.current?.scrollBy({ left: 300, behavior: 'smooth' }), 1500);
    return () => { clearTimeout(t1); clearTimeout(t2); };
  }, []);

  // Back to services if cart empties mid-flow
  useEffect(() => {
    if (cart.length === 0 && step !== 'services' && step !== 'success') setStep('services');
  }, [cart, step]);

  const toggleService = (service: Service) => {
    setCart(prev => prev.find(s => s.id === service.id)
      ? prev.filter(s => s.id !== service.id)
      : [...prev, service]
    );
  };

  const totalDuration = cart.reduce((acc, curr) => acc + curr.duration, 0);
  const initiateBooking = () => { setBookingError(''); setStep('identify'); };

  // Real booking via Worker API
  const completeBooking = async () => {
    if (!customerName || !customerPhone || !selectedSlot) return;
    setBookingLoading(true);
    setBookingError('');

    try {
      // Book each service as a separate appointment (or just the first for now)
      const primary = cart[0];
      await createAppointment({
        clientName: customerName,
        clientPhone: customerPhone,
        serviceId: primary.id,
        serviceName: cart.map(s => s.name).join(' + '),
        servicePrice: cart.reduce((a, c) => a + c.price, 0),
        serviceDuration: totalDuration,
        date: selectedDate,
        time: selectedSlot.time,
      });

      // Fetch real visit count
      const v = await fetchClientVisits(customerPhone);
      setVisits(v);
      if (MOCK_PROVIDER.loyaltyProgram?.enabled && v > 0 && v % MOCK_PROVIDER.loyaltyProgram.threshold === 0) {
        setRewardUnlocked(true);
      }

      setStep('success');
    } catch (e: unknown) {
      setBookingError(e instanceof Error ? e.message : 'Erro ao agendar. Tente novamente.');
    } finally {
      setBookingLoading(false);
    }
  };

  const handlePhoneChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    let value = e.target.value.replace(/\D/g, '');
    if (value.length > 11) value = value.slice(0, 11);
    if (value.length > 2) value = `(${value.slice(0, 2)}) ${value.slice(2)}`;
    if (value.length > 9) value = `${value.slice(0, 10)}-${value.slice(10)}`;
    setCustomerPhone(value);
  };

  const highlights = MOCK_PROVIDER.services.filter(s => s.category === 'Destaques');
  const categories = Array.from(new Set(MOCK_PROVIDER.services.map(s => s.category))).filter(c => c !== 'Destaques');

  if (step === 'success') {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center p-6 text-center animate-fade-in" style={{ backgroundColor: 'var(--bg-app)' }}>
        {/* Logo */}
        <div className="mb-8">
          <img src="/logo-vicky.png" alt="Vicky Sampaio Makeup" className="w-24 h-24 rounded-full object-cover mx-auto opacity-80" style={{ border: '1px solid var(--border-subtle)' }} />
        </div>

        <div className="w-20 h-20 rounded-full flex items-center justify-center mb-6" style={{ backgroundColor: 'rgba(84,56,85,0.1)', border: '1.5px solid var(--brand-amethyst)' }}>
          <svg xmlns="http://www.w3.org/2000/svg" width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ color: 'var(--brand-amethyst)' }}>
            <polyline points="20 6 9 17 4 12"></polyline>
          </svg>
        </div>

        <h1 className="font-display text-4xl font-light mb-2" style={{ color: 'var(--text-primary)' }}>Agendado!</h1>
        <p className="text-sm mb-1 max-w-xs" style={{ color: 'var(--text-secondary)' }}>
          Olá <strong style={{ color: 'var(--text-primary)' }}>{customerName.split(' ')[0]}</strong>! Seu agendamento foi confirmado para hoje às {selectedSlot?.time}.
        </p>
        <p className="text-xs mb-8" style={{ color: 'var(--text-disabled)' }}>
          Com: <span style={{ color: 'var(--text-secondary)' }}>{selectedProfessional.name}</span>
        </p>

        {rewardUnlocked && MOCK_PROVIDER.loyaltyProgram && (
          <div className="w-full max-w-xs rounded-2xl p-4 mb-8" style={{ backgroundColor: 'rgba(84,56,85,0.15)', border: '1px solid rgba(84,56,85,0.4)' }}>
            <h3 className="font-display text-xl font-medium mb-1 flex items-center justify-center gap-2" style={{ color: 'var(--brand-quartz)' }}>
              <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M6 9H4.5a2.5 2.5 0 0 1 0-5H6"/><path d="M18 9h1.5a2.5 2.5 0 0 0 0-5H18"/><path d="M4 22h16"/><path d="M10 14.66V17c0 .55-.47.98-.97 1.21C7.85 18.75 7 20.24 7 22"/><path d="M14 14.66V17c0 .55.47.98.97 1.21C16.15 18.75 17 20.24 17 22"/><path d="M18 2h-4a4 4 0 0 0-4 4v9h12V6a4 4 0 0 0-4-4Z"/></svg>
              Recompensa Desbloqueada!
            </h3>
            <p className="text-sm" style={{ color: 'var(--text-secondary)' }}>
              Você completou {visits} visitas! Um voucher de <strong>{MOCK_PROVIDER.loyaltyProgram.rewardDescription}</strong> foi enviado para seu WhatsApp ({customerPhone}).
            </p>
          </div>
        )}

        <button
          onClick={() => {
            setCart([]);
            setSelectedSlot(null);
            setStep('services');
          }}
          className="btn-brand px-10 py-3 rounded-full text-sm font-medium tracking-widest uppercase transition-all hover:opacity-90 active:scale-95"
        >
          Novo Agendamento
        </button>
      </div>
    );
  }

  if (step === 'identify') {
    return (
      <div className="min-h-screen flex flex-col transition-colors duration-300" style={{ backgroundColor: 'var(--bg-app)' }}>
        {/* Header */}
        <div className="sticky top-0 backdrop-blur-md z-10 p-4 flex items-center gap-4" style={{ backgroundColor: 'var(--bg-surface)', borderBottom: '1px solid var(--border-subtle)', boxShadow: '0 1px 8px rgba(0,0,0,0.06)' }}>
          <button
            onClick={() => setStep('calendar')}
            className="w-10 h-10 rounded-full flex items-center justify-center transition-all hover:opacity-80"
            style={{ backgroundColor: 'var(--bg-surface-hover)', border: '1px solid var(--border-subtle)' }}
          >
            <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ color: 'var(--text-primary)' }}>
              <line x1="19" y1="12" x2="5" y2="12"></line>
              <polyline points="12 19 5 12 12 5"></polyline>
            </svg>
          </button>
          <h2 className="font-display text-xl font-light tracking-wide" style={{ color: 'var(--text-primary)' }}>Identificação</h2>
        </div>

        <div className="p-6 flex-1 flex flex-col max-w-sm mx-auto w-full">
          <div className="mb-8 mt-4 text-center">
            <div className="w-16 h-16 rounded-2xl flex items-center justify-center mx-auto mb-4" style={{ backgroundColor: 'rgba(84,56,85,0.1)', border: '1px solid rgba(84,56,85,0.25)' }}>
              <svg xmlns="http://www.w3.org/2000/svg" width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" style={{ color: 'var(--brand-amethyst)' }}>
                <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"></path>
                <circle cx="12" cy="7" r="4"></circle>
              </svg>
            </div>
            <h2 className="font-display text-3xl font-light mb-2" style={{ color: 'var(--text-primary)' }}>Quem é você?</h2>
            <p className="text-sm leading-relaxed" style={{ color: 'var(--text-secondary)' }}>
              Precisamos do seu WhatsApp para pontuar no programa de fidelidade e enviar a confirmação.
            </p>
          </div>

          <div className="space-y-4">
            <div>
              <label className="block text-xs font-medium uppercase tracking-widest mb-2" style={{ color: 'var(--text-secondary)' }}>Seu Nome</label>
              <input
                type="text"
                value={customerName}
                onChange={(e) => setCustomerName(e.target.value)}
                placeholder="Ex: Maria Silva"
                className="w-full px-4 py-3.5 rounded-xl text-sm transition-all"
                style={{ backgroundColor: 'var(--bg-surface)', border: '1px solid var(--border-subtle)', color: 'var(--text-primary)' }}
              />
            </div>

            <div>
              <label className="block text-xs font-medium uppercase tracking-widest mb-2" style={{ color: 'var(--text-secondary)' }}>WhatsApp</label>
              <div className="relative">
                <input
                  type="tel"
                  value={customerPhone}
                  onChange={handlePhoneChange}
                  placeholder="(00) 00000-0000"
                  className="w-full px-4 py-3.5 rounded-xl text-sm transition-all"
                  style={{ backgroundColor: 'var(--bg-surface)', border: '1px solid var(--border-subtle)', color: 'var(--text-primary)' }}
                />
                <div className="absolute right-4 top-1/2 -translate-y-1/2" style={{ color: 'var(--text-disabled)' }}>
                  <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z"></path></svg>
                </div>
              </div>
            </div>
          </div>

          <div className="mt-8">
            <button
              onClick={completeBooking}
              disabled={!customerName || customerPhone.length < 14 || bookingLoading}
              className="w-full btn-brand font-medium text-sm py-4 rounded-xl tracking-widest uppercase transition-all disabled:opacity-40 disabled:cursor-not-allowed active:scale-[0.98]"
            >
              {bookingLoading ? 'Agendando...' : 'Confirmar Agendamento'}
            </button>
            {bookingError && (
              <p className="text-center text-xs mt-3" style={{ color: '#ef4444' }}>{bookingError}</p>
            )}
            <p className="text-center text-xs mt-4" style={{ color: 'var(--text-disabled)' }}>
              Ao continuar, você concorda em receber mensagens sobre seu agendamento.
            </p>
          </div>
        </div>
      </div>
    );
  }

  if (step === 'calendar') {
    return (
      <div className="min-h-screen pb-32 transition-colors duration-300" style={{ backgroundColor: 'var(--bg-app)' }}>
        {/* Header */}
        <div className="sticky top-0 backdrop-blur-md z-10 p-4 flex items-center gap-4" style={{ backgroundColor: 'var(--bg-surface)', borderBottom: '1px solid var(--border-subtle)', boxShadow: '0 1px 8px rgba(0,0,0,0.06)' }}>
          <button
            onClick={() => setStep('services')}
            className="w-10 h-10 rounded-full flex items-center justify-center transition-all hover:opacity-80"
            style={{ backgroundColor: 'var(--bg-surface-hover)', border: '1px solid var(--border-subtle)' }}
          >
            <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ color: 'var(--text-primary)' }}>
              <line x1="19" y1="12" x2="5" y2="12"></line>
              <polyline points="12 19 5 12 12 5"></polyline>
            </svg>
          </button>
          <h2 className="font-display text-xl font-light tracking-wide" style={{ color: 'var(--text-primary)' }}>Escolha o Horário</h2>
        </div>

        <div className="p-4">
          {/* Day Tabs — real upcoming dates */}
          <div className="mb-6">
            <div className="flex gap-2 overflow-x-auto no-scrollbar pb-2">
              {upcomingDates.map((d, i) => (
                <button
                  key={d.value}
                  onClick={() => setSelectedDateIdx(i)}
                  className="px-5 py-2 rounded-full whitespace-nowrap text-xs font-medium tracking-widest uppercase transition-all"
                  style={i === selectedDateIdx
                    ? { backgroundColor: 'var(--slot-selected-bg)', color: 'var(--slot-selected-text)' }
                    : { backgroundColor: 'var(--bg-surface)', color: 'var(--text-secondary)', border: '1px solid var(--border-subtle)' }
                  }
                >
                  {d.label}
                </button>
              ))}
            </div>
          </div>

          {/* Time Slots Grid — live from API */}
          {slotsLoading ? (
            <div className="grid grid-cols-3 gap-2">
              {Array.from({ length: 10 }).map((_, i) => (
                <div key={i} className="py-4 rounded-lg animate-pulse" style={{ backgroundColor: 'var(--bg-surface)' }} />
              ))}
            </div>
          ) : (
            <div className="grid grid-cols-3 gap-2">
              {slots.map(slot => (
                <button
                  key={slot.id}
                  disabled={!slot.available}
                  onClick={() => setSelectedSlot(slot)}
                  className={`py-4 rounded-lg text-center text-sm font-medium transition-all ${
                    !slot.available ? 'slot-disabled line-through' : selectedSlot?.id === slot.id ? 'slot-selected scale-105 shadow-lg' : 'slot-available hover:scale-[1.02]'
                  }`}
                >
                  {slot.time}
                </button>
              ))}
            </div>
          )}

          {/* Summary Card */}
          <div className="mt-8 rounded-2xl overflow-hidden" style={{ backgroundColor: 'var(--bg-surface)', border: '1px solid var(--border-subtle)' }}>
            <div className="px-4 py-3 flex justify-between items-center" style={{ borderBottom: '1px solid var(--border-subtle)' }}>
              <span className="text-xs font-medium uppercase tracking-widest" style={{ color: 'var(--text-secondary)' }}>Resumo</span>
              <span className="text-xs" style={{ color: 'var(--text-disabled)' }}>{cart.length} {cart.length === 1 ? 'serviço' : 'serviços'}</span>
            </div>

            <div className="p-4 space-y-3">
              {cart.map((item: Service) => (
                <div key={item.id} className="flex justify-between items-start">
                  <div className="flex-1 pr-4">
                    <div className="text-sm font-medium leading-tight mb-0.5" style={{ color: 'var(--text-primary)' }}>{item.name}</div>
                    <div className="text-xs" style={{ color: 'var(--text-disabled)' }}>{item.duration} min</div>
                  </div>
                  <div className="flex items-center gap-3">
                    <span className="text-sm" style={{ color: 'var(--text-secondary)' }}>R$ {item.price}</span>
                    <button
                      onClick={() => toggleService(item)}
                      className="p-1 rounded-full transition-colors hover:opacity-70"
                      style={{ color: 'var(--text-disabled)' }}
                      aria-label="Remover item"
                    >
                      <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="18" y1="6" x2="6" y2="18"></line><line x1="6" y1="6" x2="18" y2="18"></line></svg>
                    </button>
                  </div>
                </div>
              ))}
            </div>

            <div className="h-px mx-4" style={{ backgroundColor: 'var(--border-subtle)' }}></div>

            <div className="p-4">
              <div className="flex justify-between items-center mb-2 text-xs" style={{ color: 'var(--text-secondary)' }}>
                <span>Maquiadora</span>
                <span style={{ color: 'var(--text-primary)' }}>{selectedProfessional.name}</span>
              </div>
              <div className="flex justify-between items-center mb-3 text-xs" style={{ color: 'var(--text-secondary)' }}>
                <span>Duração Total</span>
                <span style={{ color: 'var(--text-primary)' }}>
                  {Math.floor(totalDuration / 60) > 0 ? `${Math.floor(totalDuration / 60)}h ` : ''}
                  {totalDuration % 60 > 0 ? `${totalDuration % 60}min` : ''}
                </span>
              </div>
              <div className="flex justify-between items-center pt-3 font-display text-xl" style={{ borderTop: '1px solid var(--border-subtle)', color: 'var(--text-primary)' }}>
                <span>Total</span>
                <span>R$ {cart.reduce((a: number, c: Service) => a + c.price, 0)}</span>
              </div>
            </div>
          </div>
        </div>

        {selectedSlot && (
          <SmartCart
            cart={cart}
            onContinue={initiateBooking}
            onRemoveItem={toggleService}
            label={`Agendar às ${selectedSlot.time}`}
          />
        )}
      </div>
    );
  }

  // Main services view
  return (
    <div className="min-h-screen pb-32 transition-colors duration-300" style={{ backgroundColor: 'var(--bg-app)' }}>

      {/* ── HERO — logo centered, big ── */}
      <div className="flex flex-col items-center text-center pt-14 pb-6 px-6">
        {/* Logo circle */}
        <div
          className="w-56 h-56 rounded-full mb-5"
          style={{
            backgroundImage: 'url(/logo-vicky.png)',
            backgroundSize: 'cover',
            backgroundRepeat: 'no-repeat',
            backgroundPosition: 'center',
            backgroundColor: '#0a0a0a',
            border: isDarkMode ? '1px solid rgba(196,160,154,0.25)' : '1.5px solid rgba(28,18,16,0.12)',
            boxShadow: isDarkMode ? '0 0 50px rgba(84,56,85,0.3)' : '0 6px 32px rgba(0,0,0,0.15)',
          }}
        />

        <h1 className="font-display text-4xl font-light tracking-wide mb-1" style={{ color: 'var(--text-primary)' }}>
          Vicky Sampaio
        </h1>
        <p className="font-display text-lg italic font-light mb-1" style={{ color: 'var(--text-secondary)' }}>
          Makeup Artist
        </p>
        <p className="text-xs tracking-widest uppercase mb-6" style={{ color: 'var(--text-disabled)' }}>
          Jequié, BA
        </p>

        {/* Action Buttons */}
        <div className="flex gap-3">
          <a
            href="https://www.google.com/maps/place/R.+Valdir+Leite,+164+-+São+José,+Jequié+-+BA/data=!4m2!3m1!1s0x740a8ad2a3682c9:0x6650d02c1f43e67"
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-2 px-4 py-2 rounded-full text-xs font-medium tracking-wide transition-all hover:opacity-80"
            style={{ backgroundColor: 'var(--bg-surface)', border: '1px solid var(--border-subtle)', color: 'var(--text-secondary)' }}
          >
            <svg xmlns="http://www.w3.org/2000/svg" width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"></path><circle cx="12" cy="10" r="3"></circle></svg>
            Como chegar
          </a>
          <a
            href="https://api.whatsapp.com/send?phone=557398040198"
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-2 px-4 py-2 rounded-full text-xs font-medium tracking-wide transition-all hover:opacity-80"
            style={{ backgroundColor: 'var(--bg-surface)', border: '1px solid var(--border-subtle)', color: 'var(--text-secondary)' }}
          >
            <svg xmlns="http://www.w3.org/2000/svg" width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ color: '#25D366' }}><path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z"></path></svg>
            WhatsApp
          </a>
        </div>
      </div>

      {/* ── ABOUT — photo grid + bio ── */}
      <div className="mx-4 mb-6 rounded-2xl overflow-hidden" style={{ backgroundColor: 'var(--bg-surface)', border: '1px solid var(--border-subtle)' }}>

        {/* Photo grid — 2 columns, fixed height rows so images fill */}
        <div className="grid grid-cols-2" style={{ gap: '2px', backgroundColor: 'var(--border-subtle)' }}>
          {['/vicky5.png', '/vicky2.png', '/vicky7.jpg', '/vicky1.png'].map((src, i) => (
            <div key={i} style={{ height: '180px', overflow: 'hidden', backgroundColor: 'var(--bg-surface-hover)' }}>
              <img
                src={src}
                alt={`Vicky Sampaio ${i + 1}`}
                style={{ width: '100%', height: '100%', objectFit: 'cover', objectPosition: 'center 15%', display: 'block' }}
              />
            </div>
          ))}
        </div>

        {/* Bio */}
        <div className="px-5 py-5">
          <p className="text-xs font-semibold uppercase tracking-widest mb-3" style={{ color: 'var(--text-disabled)' }}>Quem sou eu</p>
          <p className="text-sm leading-relaxed mb-5" style={{ color: 'var(--text-secondary)' }}>
            Tenho <strong style={{ color: 'var(--text-primary)' }}>40 anos</strong>, sou mãe de <strong style={{ color: 'var(--text-primary)' }}>três filhas</strong> e dedico minha vida inteiramente à maquiagem — é a única coisa com que trabalho, e faço isso há <strong style={{ color: 'var(--text-primary)' }}>12 anos</strong>. Cada atendimento é único pra mim, porque eu amo de verdade o que faço. ♡
          </p>

          <div className="divider mb-4" />

          <p className="text-xs font-semibold uppercase tracking-widest mb-3" style={{ color: 'var(--text-disabled)' }}>Atendimento</p>
          <div className="space-y-2 text-sm" style={{ color: 'var(--text-secondary)' }}>
            <div className="flex items-start gap-2.5">
              <span style={{ color: 'var(--accent-line)', flexShrink: 0 }}>·</span>
              <span>Procedimento: <strong style={{ color: 'var(--text-primary)' }}>40 min a 1 hora</strong></span>
            </div>
            <div className="flex items-start gap-2.5">
              <span style={{ color: 'var(--accent-line)', flexShrink: 0 }}>·</span>
              <span>Atendimento no <strong style={{ color: 'var(--text-primary)' }}>estúdio</strong> — Jequié, BA</span>
            </div>
            <div className="flex items-start gap-2.5">
              <span style={{ color: 'var(--accent-line)', flexShrink: 0 }}>·</span>
              <span>Pagamento: <strong style={{ color: 'var(--text-primary)' }}>Pix</strong> ou <strong style={{ color: 'var(--text-primary)' }}>dinheiro em espécie</strong></span>
            </div>
          </div>
        </div>
      </div>

      {/* Loyalty Card */}
      {MOCK_PROVIDER.loyaltyProgram && (
        <LoyaltyCard visits={visits} config={MOCK_PROVIDER.loyaltyProgram} />
      )}

      {/* ── CTA BANNER ── */}
      <div className="mx-4 mb-8 rounded-2xl overflow-hidden relative" style={{ height: '200px' }}>
        {/* Background photo */}
        <img
          src="/vickyagendamento.png"
          alt=""
          className="absolute inset-0 w-full h-full object-cover"
          style={{ objectPosition: 'right center' }}
          aria-hidden="true"
        />
        {/* Gradient — dark on left where text is, fades right */}
        <div className="absolute inset-0" style={{ background: 'linear-gradient(to right, rgba(0,0,0,0.88) 40%, rgba(0,0,0,0.15) 100%)' }} />

        {/* Content */}
        <div className="relative z-10 h-full flex flex-col items-start justify-end p-6">
          <p className="font-display text-3xl font-light leading-tight mb-1" style={{ color: '#fff' }}>
            Pronta para se<br />sentir incrível?
          </p>
          <p className="text-xs mb-4" style={{ color: 'rgba(255,255,255,0.55)' }}>
            Escolha um serviço e agende comigo.
          </p>
          <button
            onClick={() => servicesRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' })}
            className="flex items-center gap-2 px-4 py-2 rounded-full text-xs font-semibold tracking-widest uppercase transition-all hover:opacity-90 active:scale-95"
            style={{ backgroundColor: '#fff', color: '#0a0a0a' }}
          >
            <svg xmlns="http://www.w3.org/2000/svg" width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="4" width="18" height="18" rx="2" ry="2"/><line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/></svg>
            Agendar agora
          </button>
        </div>
      </div>

      {/* Destaques Slider — services with photos */}
      {highlights.length > 0 && (
        <div className="mb-8 overflow-hidden">
          <div className="flex items-center gap-3 mb-3 px-6">
            <div className="w-px h-4" style={{ backgroundColor: 'var(--accent-line)' }} />
            <h2 className="text-xs font-semibold uppercase tracking-widest" style={{ color: 'var(--text-primary)' }}>Serviços em Destaque</h2>
          </div>
          <div
            ref={scrollContainerRef}
            className="flex overflow-x-auto gap-4 px-6 pb-6 pt-1 no-scrollbar snap-x scroll-smooth"
          >
            {highlights.map((service: Service) => (
              <HighlightCard
                key={service.id}
                service={service}
                isSelected={cart.some((s: Service) => s.id === service.id)}
                onToggle={toggleService}
              />
            ))}
          </div>
        </div>
      )}

      {/* Services by Category */}
      <div ref={servicesRef}>
      {categories.map(category => {
        const categoryServices = MOCK_PROVIDER.services.filter((s: Service) => s.category === category);
        if (categoryServices.length === 0) return null;
        return (
          <div key={category} className="px-4 mb-8">
            <div className="flex items-center gap-3 mb-3 pl-1">
              <div className="w-px h-4" style={{ backgroundColor: 'var(--accent-line)' }} />
              <h2 className="text-xs font-semibold uppercase tracking-widest" style={{ color: 'var(--text-primary)' }}>{category}</h2>
            </div>
            {categoryServices.map((service: Service) => (
              <ServiceCard
                key={service.id}
                service={service}
                isSelected={cart.some((s: Service) => s.id === service.id)}
                onToggle={toggleService}
              />
            ))}
          </div>
        );
      })}
      </div>

      <SmartCart
        cart={cart}
        onContinue={() => setStep('calendar')}
        onRemoveItem={toggleService}
        label="Agendar agora"
      />
      <AIChat />
    </div>
  );
};