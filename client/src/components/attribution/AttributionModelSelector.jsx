import React, { useState } from 'react';
import { 
  ChevronDownIcon, 
  InformationCircleIcon,
  CheckIcon
} from '@heroicons/react/24/outline';

const AttributionModelSelector = ({ selected, onChange }) => {
  const [isOpen, setIsOpen] = useState(false);

  const models = [
    {
      id: 'data-driven',
      name: 'Data-Driven',
      description: 'Uses machine learning to distribute credit based on actual conversion patterns',
      icon: '🤖',
      recommended: true
    },
    {
      id: 'first-click',
      name: 'First-Click',
      description: 'Gives 100% credit to the first touchpoint in the customer journey',
      icon: '🥇',
      recommended: false
    },
    {
      id: 'last-click',
      name: 'Last-Click',
      description: 'Gives 100% credit to the last touchpoint before conversion',
      icon: '🏁',
      recommended: false
    },
    {
      id: 'linear',
      name: 'Linear',
      description: 'Distributes credit equally across all touchpoints',
      icon: '📊',
      recommended: false
    },
    {
      id: 'time-decay',
      name: 'Time Decay',
      description: 'Gives more credit to touchpoints closer to conversion',
      icon: '⏰',
      recommended: false
    },
    {
      id: 'position-based',
      name: 'Position-Based',
      description: '40% to first, 40% to last, 20% distributed among middle touchpoints',
      icon: '⚖️',
      recommended: false
    }
  ];

  const selectedModel = models.find(model => model.id === selected);

  return (
    <div className="relative">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center gap-3 px-4 py-2 rounded-xl text-sm font-medium border-0 focus:ring-2 focus:ring-blue-500 transition-all hover:scale-105 min-w-[200px]"
        style={{ 
          background: 'var(--color-bg-card)',
          color: 'var(--color-text-primary)',
          border: '1px solid var(--color-border)'
        }}
      >
        <span className="text-lg">{selectedModel?.icon}</span>
        <span className="flex-1 text-left">{selectedModel?.name}</span>
        <ChevronDownIcon 
          className={`h-4 w-4 transition-transform ${isOpen ? 'rotate-180' : ''}`}
          style={{ color: 'var(--color-text-secondary)' }}
        />
      </button>

      {isOpen && (
        <>
          {/* Backdrop */}
          <div 
            className="fixed inset-0 z-10" 
            onClick={() => setIsOpen(false)}
          />
          
          {/* Dropdown */}
          <div 
            className="absolute top-full left-0 right-0 mt-2 rounded-2xl border shadow-xl z-20 overflow-hidden"
            style={{ 
              background: 'var(--color-bg-card)',
              border: '1px solid var(--color-border)',
              boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.3), 0 10px 10px -5px rgba(0, 0, 0, 0.1)'
            }}
          >
            <div className="py-2">
              {models.map((model) => (
                <button
                  key={model.id}
                  onClick={() => {
                    onChange(model.id);
                    setIsOpen(false);
                  }}
                  className="w-full flex items-start gap-3 px-4 py-3 hover:bg-opacity-50 transition-colors text-left"
                  style={{ 
                    background: selected === model.id ? 'var(--color-bg-hover)' : 'transparent'
                  }}
                >
                  <div className="flex-shrink-0">
                    <div className="text-lg">{model.icon}</div>
                  </div>
                  
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      <span className="font-medium" style={{ color: 'var(--color-text-primary)' }}>
                        {model.name}
                      </span>
                      {model.recommended && (
                        <span 
                          className="px-2 py-1 rounded-lg text-xs font-medium"
                          style={{ 
                            background: 'var(--color-green)' + '20',
                            color: 'var(--color-green)'
                          }}
                        >
                          Recommended
                        </span>
                      )}
                    </div>
                    <p className="text-sm leading-relaxed" style={{ color: 'var(--color-text-secondary)' }}>
                      {model.description}
                    </p>
                  </div>

                  {selected === model.id && (
                    <div className="flex-shrink-0">
                      <CheckIcon 
                        className="h-5 w-5" 
                        style={{ color: 'var(--color-green)' }}
                      />
                    </div>
                  )}
                </button>
              ))}
            </div>

            {/* Footer */}
            <div 
              className="px-4 py-3 border-t"
              style={{ 
                background: 'var(--color-bg-secondary)',
                borderTop: '1px solid var(--color-border)'
              }}
            >
              <div className="flex items-center gap-2 text-xs" style={{ color: 'var(--color-text-secondary)' }}>
                <InformationCircleIcon className="h-4 w-4" />
                <span>Different models show how credit is distributed across your marketing touchpoints</span>
              </div>
            </div>
          </div>
        </>
      )}
    </div>
  );
};

export default AttributionModelSelector;