import React, { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { ChevronDown, Check } from 'lucide-react';
import { cn } from '../../lib/utils';

export interface DropdownOption {
  id: string;
  label: string;
  sublabel?: string;
  icon?: React.ReactNode;
}

interface DropdownProps {
  options: DropdownOption[];
  value: string;
  onChange: (id: string) => void;
  className?: string;
  placeholder?: string;
}

export default function Dropdown({ 
  options, 
  value, 
  onChange, 
  className,
  placeholder = "Select an option"
}: DropdownProps) {
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const selectedOption = options.find(opt => opt.id === value);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  return (
    <div className={cn("relative", className)} ref={dropdownRef}>
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className={cn(
          "w-full flex items-center justify-between pl-5 pr-5 py-4.5 bg-white/5 border border-dark-border rounded-2xl font-bold text-white focus:ring-2 focus:ring-brand-blue outline-none transition-all cursor-pointer text-left",
          isOpen && "border-brand-blue ring-2 ring-brand-blue/20"
        )}
      >
        <div className="flex items-center gap-3 overflow-hidden">
          {selectedOption?.icon && (
            <div className="flex-shrink-0">
              {selectedOption.icon}
            </div>
          )}
          <div className="truncate">
            {selectedOption ? (
              <>
                <span className="block truncate">{selectedOption.label}</span>
                {selectedOption.sublabel && (
                  <span className="block text-[10px] text-neutral-500 uppercase tracking-widest font-bold mt-0.5">
                    {selectedOption.sublabel}
                  </span>
                )}
              </>
            ) : (
              <span className="text-neutral-600">{placeholder}</span>
            )}
          </div>
        </div>
        <ChevronDown 
          className={cn(
            "w-5 h-5 text-neutral-500 transition-transform duration-300 flex-shrink-0",
            isOpen && "rotate-180 text-white"
          )} 
        />
      </button>

      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: 10, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 10, scale: 0.95 }}
            transition={{ duration: 0.2, ease: "easeOut" }}
            className="absolute z-[100] w-full mt-3 bg-dark-card border border-dark-border rounded-2xl shadow-2xl shadow-black/50 overflow-hidden backdrop-blur-xl"
          >
            <div className="max-h-64 overflow-y-auto py-2 custom-scrollbar">
              {options.map((option) => (
                <button
                  key={option.id}
                  type="button"
                  onClick={() => {
                    onChange(option.id);
                    setIsOpen(false);
                  }}
                  className={cn(
                    "w-full flex items-center justify-between px-5 py-4 text-left transition-all hover:bg-white/5 group",
                    value === option.id ? "bg-brand-blue/10" : ""
                  )}
                >
                  <div className="flex items-center gap-4 overflow-hidden">
                    {option.icon && (
                      <div className={cn(
                        "w-10 h-10 rounded-xl flex items-center justify-center font-bold border border-dark-border transition-colors",
                        value === option.id ? "bg-brand-blue text-white border-brand-blue" : "bg-white/5 text-neutral-400 group-hover:text-white"
                      )}>
                        {option.icon}
                      </div>
                    )}
                    <div className="truncate">
                      <p className={cn(
                        "font-bold transition-colors",
                        value === option.id ? "text-brand-blue" : "text-white"
                      )}>
                        {option.label}
                      </p>
                      {option.sublabel && (
                        <p className="text-[10px] text-neutral-500 uppercase tracking-widest font-bold mt-0.5">
                          {option.sublabel}
                        </p>
                      )}
                    </div>
                  </div>
                  {value === option.id && (
                    <Check className="w-5 h-5 text-brand-blue flex-shrink-0" />
                  )}
                </button>
              ))}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
