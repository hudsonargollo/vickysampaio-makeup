import React, { useState } from 'react';
import { Service } from '../types';

interface ServiceCardProps {
  service: Service;
  isSelected: boolean;
  onToggle: (service: Service) => void;
  isHighlight?: boolean;
}

export const ServiceCard: React.FC<ServiceCardProps> = ({ service, isSelected, onToggle }) => {
  const [expanded, setExpanded] = useState(false);

  return (
    <div
      className="relative p-4 mb-3 rounded-2xl transition-all duration-300 cursor-pointer"
      style={{
        backgroundColor: 'var(--bg-surface)',
        border: isSelected ? '1.5px solid var(--text-primary)' : '1px solid var(--border-subtle)',
        boxShadow: isSelected ? '0 2px 16px rgba(0,0,0,0.1)' : '0 1px 4px rgba(0,0,0,0.04)',
      }}
      onClick={() => onToggle(service)}
    >
      <div className="flex justify-between items-start">
        {/* Thumbnail */}
        {service.imageUrl && (
          <div className="w-16 h-16 rounded-xl overflow-hidden flex-shrink-0 mr-3 mt-0.5">
            <img
              src={service.imageUrl}
              alt={service.name}
              className="w-full h-full object-cover"
            />
          </div>
        )}
        <div className="flex-1 pr-4">
          <h3
            className="font-display text-xl font-light leading-tight mb-1.5"
            style={{ color: 'var(--text-primary)' }}
          >
            {service.name}
          </h3>

          <div className="flex items-center gap-3 text-xs mb-2" style={{ color: 'var(--text-secondary)' }}>
            <div className="flex items-center gap-1">
              <svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"></circle><polyline points="12 6 12 12 16 14"></polyline></svg>
              {service.duration} min
            </div>
            <span>·</span>
            <span className="font-semibold text-sm" style={{ color: 'var(--text-primary)' }}>R$ {service.price}</span>
          </div>

          {/* Expandable description */}
          <div className={`grid transition-[grid-template-rows] duration-300 ease-out ${expanded ? 'grid-rows-[1fr]' : 'grid-rows-[0fr]'}`}>
            <div className="overflow-hidden">
              <div className="text-xs pb-3 leading-relaxed" style={{ color: 'var(--text-secondary)' }}>
                {service.description}
              </div>
            </div>
          </div>

          <button
            onClick={(e) => { e.stopPropagation(); setExpanded(!expanded); }}
            className="text-xs font-medium flex items-center gap-1 transition-opacity hover:opacity-60"
            style={{ color: 'var(--text-secondary)' }}
          >
            {expanded ? 'Menos' : 'Mais info'}
            <svg
              xmlns="http://www.w3.org/2000/svg"
              width="11"
              height="11"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2.5"
              strokeLinecap="round"
              strokeLinejoin="round"
              className={`transition-transform duration-300 ${expanded ? 'rotate-180' : ''}`}
            >
              <polyline points="6 9 12 15 18 9"></polyline>
            </svg>
          </button>
        </div>

        {/* Toggle button */}
        <div className="flex items-center justify-center pt-1">
          <button
            className="w-10 h-10 rounded-full flex items-center justify-center transition-all duration-300"
            style={isSelected
              ? {
                  backgroundColor: 'var(--text-primary)',
                  color: 'var(--bg-app)',
                  transform: 'scale(1.05)',
                }
              : {
                  backgroundColor: 'var(--bg-surface-hover)',
                  color: 'var(--text-disabled)',
                  border: '1px solid var(--border-subtle)',
                }
            }
          >
            {isSelected ? (
              <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                <polyline points="20 6 9 17 4 12"></polyline>
              </svg>
            ) : (
              <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <line x1="12" y1="5" x2="12" y2="19"></line>
                <line x1="5" y1="12" x2="19" y2="12"></line>
              </svg>
            )}
          </button>
        </div>
      </div>
    </div>
  );
};
