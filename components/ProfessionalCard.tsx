import React, { useState } from 'react';
import { Professional } from '../types';

interface ProfessionalCardProps {
  professional: Professional;
  isSelected: boolean;
  onSelect: (pro: Professional) => void;
}

export const ProfessionalCard: React.FC<ProfessionalCardProps> = ({ professional, isSelected, onSelect }) => {
  return (
    <div 
      className={`relative p-4 mb-3 rounded-2xl transition-all duration-300 border cursor-pointer flex items-center gap-4 ${
        isSelected 
          ? 'bg-zinc-50 dark:bg-zinc-900 border-red-500 shadow-[0_0_15px_rgba(239,68,68,0.2)]' 
          : 'bg-white dark:bg-zinc-900 border-zinc-200 dark:border-zinc-800 hover:border-zinc-300 dark:hover:border-zinc-700 shadow-sm'
      }`}
      onClick={() => onSelect(professional)}
    >
      <div className="w-14 h-14 rounded-full overflow-hidden border-2 border-zinc-100 dark:border-zinc-800 shrink-0">
        <img src={professional.avatarUrl} alt={professional.name} className="w-full h-full object-cover" />
      </div>
      
      <div className="flex-1">
        <h3 className={`font-semibold text-lg ${isSelected ? 'text-red-600 dark:text-red-400' : 'text-zinc-900 dark:text-zinc-100'}`}>
          {professional.name}
        </h3>
        <p className="text-sm text-zinc-500">{professional.role}</p>
      </div>

      <div className="flex items-center justify-center">
        <div className={`w-6 h-6 rounded-full border-2 flex items-center justify-center transition-colors ${
          isSelected ? 'border-red-500 bg-red-600' : 'border-zinc-200 dark:border-zinc-700'
        }`}>
          {isSelected && (
            <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="4" strokeLinecap="round" strokeLinejoin="round">
              <polyline points="20 6 9 17 4 12"></polyline>
            </svg>
          )}
        </div>
      </div>
    </div>
  );
};