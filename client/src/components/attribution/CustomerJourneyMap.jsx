import React, { useState, useMemo } from 'react';
import { useTheme } from '../../contexts/ThemeContext';
import { formatCurrency, formatNumber } from '../../utils/formatters';
import { COLORS } from '../../utils/colors';

const CHANNEL_COLORS = {
  'Meta': '#1877F2',
  'Google': '#EA4335',
  'Email': '#34D399',
  'Organic': '#8B5CF6',
  'Direct': '#F59E0B',
  'Referral': '#EF4444',
  'SMS': '#06B6D4',
  'TikTok': '#FE2C55',
  'Pinterest': '#E60023',
  'YouTube': '#FF0000'
};

// Individual customer journey component
function CustomerJourneyCard({ journey, colors, onSelect, isSelected }) {
  const pathString = journey.touchpoints.map(tp => tp.channel).join(' → ');
  const totalRevenue = journey.conversions.reduce((sum, conv) => sum + conv.revenue, 0);
  const conversionRate = journey.touchpoints.length > 0 ? (journey.conversions.length / journey.touchpoints.length) * 100 : 0;
  
  return (
    <div 
      className={`rounded-xl p-4 cursor-pointer transition-all duration-200 ${isSelected ? 'ring-2' : ''}`}
      style={{ 
        background: colors.bgCard, 
        border: `1px solid ${colors.border}`,
        ringColor: isSelected ? COLORS.BLUE[500] : 'transparent'
      }}
      onClick={() => onSelect(journey)}
    >
      <div className="flex justify-between items-start mb-3">
        <div>
          <div className="text-xs font-semibold mb-1" style={{ color: colors.textSecondary }}>
            Customer #{journey.customerId.slice(-6).toUpperCase()}
          </div>
          <div className="text-lg font-bold" style={{ color: colors.text }}>
            {formatCurrency(totalRevenue)}
          </div>
        </div>
        <div className="text-right">
          <div className="text-xs" style={{ color: colors.textSecondary }}>
            {journey.touchpoints.length} touches
          </div>
          <div className="text-xs" style={{ color: colors.textSecondary }}>
            {journey.conversions.length} conversions
          </div>
        </div>
      </div>
      
      {/* Journey Path */}
      <div className="flex items-center gap-1 mb-3 flex-wrap">
        {journey.touchpoints.slice(0, 8).map((tp, i) => (
          <React.Fragment key={i}>
            <div 
              className="w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold text-white"
              style={{ backgroundColor: CHANNEL_COLORS[tp.channel] || COLORS.GRAY[500] }}
              title={`${tp.channel} - ${new Date(tp.timestamp).toLocaleDateString()}`}
            >
              {tp.channel.charAt(0)}
            </div>
            {i < Math.min(journey.touchpoints.length - 1, 7) && (
              <div className="w-1 h-0.5 rounded" style={{ backgroundColor: colors.border }}></div>
            )}
          </React.Fragment>
        ))}
        {journey.touchpoints.length > 8 && (
          <span className="text-xs px-1" style={{ color: colors.textSecondary }}>
            +{journey.touchpoints.length - 8}
          </span>
        )}
      </div>
      
      {/* Metrics */}
      <div className="grid grid-cols-3 gap-2 text-xs">
        <div>
          <div style={{ color: colors.textSecondary }}>Path Length</div>
          <div className="font-semibold" style={{ color: colors.text }}>{journey.touchpoints.length}</div>
        </div>
        <div>
          <div style={{ color: colors.textSecondary }}>Time to Convert</div>
          <div className="font-semibold" style={{ color: colors.text }}>
            {journey.timeToConversion > 0 ? `${Math.round(journey.timeToConversion)}d` : '-'}
          </div>
        </div>
        <div>
          <div style={{ color: colors.textSecondary }}>Conv Rate</div>
          <div className="font-semibold" style={{ color: colors.text }}>
            {conversionRate.toFixed(1)}%
          </div>
        </div>
      </div>
    </div>
  );
}

// Detailed journey timeline
function JourneyTimeline({ journey, colors }) {
  const allEvents = [
    ...journey.touchpoints.map(tp => ({ ...tp, type: 'touchpoint' })),
    ...journey.conversions.map(conv => ({ ...conv, type: 'conversion' }))
  ].sort((a, b) => new Date(a.timestamp) - new Date(b.timestamp));

  return (
    <div className="rounded-xl p-6" style={{ background: colors.bgCard, border: `1px solid ${colors.border}` }}>
      <h3 className="text-lg font-semibold mb-4" style={{ color: colors.text }}>
        Customer Journey Timeline
      </h3>
      
      <div className="space-y-3">
        {allEvents.map((event, i) => (
          <div key={i} className="flex items-start gap-3">
            <div className="flex-shrink-0 mt-1">
              {event.type === 'touchpoint' ? (
                <div 
                  className="w-3 h-3 rounded-full"
                  style={{ backgroundColor: CHANNEL_COLORS[event.channel] || COLORS.GRAY[500] }}
                ></div>
              ) : (
                <div className="w-3 h-3 rounded-full bg-green-500 flex items-center justify-center">
                  <div className="w-1.5 h-1.5 bg-white rounded-full"></div>
                </div>
              )}
            </div>
            
            <div className="flex-grow min-w-0">
              <div className="flex items-center gap-2 mb-1">
                <span className="text-sm font-medium" style={{ color: colors.text }}>
                  {event.type === 'touchpoint' ? 
                    `${event.channel} ${event.touchpointType}` : 
                    `Conversion - ${formatCurrency(event.revenue)}`
                  }
                </span>
                <span className="text-xs px-2 py-0.5 rounded-md" 
                      style={{ 
                        backgroundColor: event.type === 'touchpoint' ? 
                          CHANNEL_COLORS[event.channel] + '20' : 'rgba(34,197,94,0.12)',
                        color: event.type === 'touchpoint' ? 
                          CHANNEL_COLORS[event.channel] : COLORS.GREEN[600]
                      }}>
                  {event.type === 'touchpoint' ? event.touchpointType : 'Purchase'}
                </span>
              </div>
              
              <div className="text-xs" style={{ color: colors.textSecondary }}>
                {new Date(event.timestamp).toLocaleString()}
                {event.campaign && ` • ${event.campaign}`}
                {event.cost && ` • Cost: ${formatCurrency(event.cost)}`}
              </div>
              
              {event.keyword && (
                <div className="text-xs mt-1 px-2 py-1 rounded" 
                     style={{ backgroundColor: colors.theme === 'light' ? 'rgba(0,0,0,0.05)' : 'rgba(255,255,255,0.05)' }}>
                  <span style={{ color: colors.textSecondary }}>Keyword: </span>
                  <span style={{ color: colors.text }}>{event.keyword}</span>
                </div>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

// Journey pattern analysis
function JourneyPatternAnalysis({ journeys, colors }) {
  const patterns = useMemo(() => {
    const pathMap = {};
    const channelPairs = {};
    
    journeys.forEach(journey => {
      if (journey.conversions.length > 0) {
        // Analyze path patterns
        const pathString = journey.touchpoints.map(tp => tp.channel).join(' → ');
        if (!pathMap[pathString]) {
          pathMap[pathString] = { 
            path: pathString, 
            count: 0, 
            revenue: 0,
            avgPathLength: 0,
            channels: journey.touchpoints.map(tp => tp.channel)
          };
        }
        pathMap[pathString].count++;
        pathMap[pathString].revenue += journey.conversions.reduce((sum, conv) => sum + conv.revenue, 0);
        
        // Analyze channel transitions
        for (let i = 0; i < journey.touchpoints.length - 1; i++) {
          const from = journey.touchpoints[i].channel;
          const to = journey.touchpoints[i + 1].channel;
          const pairKey = `${from}_to_${to}`;
          
          if (!channelPairs[pairKey]) {
            channelPairs[pairKey] = { from, to, count: 0, revenue: 0 };
          }
          channelPairs[pairKey].count++;
          channelPairs[pairKey].revenue += journey.journeyValue;
        }
      }
    });
    
    const sortedPaths = Object.values(pathMap)
      .sort((a, b) => b.revenue - a.revenue)
      .slice(0, 10);
      
    const sortedTransitions = Object.values(channelPairs)
      .sort((a, b) => b.count - a.count)
      .slice(0, 8);
    
    return { paths: sortedPaths, transitions: sortedTransitions };
  }, [journeys]);

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
      {/* Top Converting Paths */}
      <div className="rounded-xl p-6" style={{ background: colors.bgCard, border: `1px solid ${colors.border}` }}>
        <h3 className="text-lg font-semibold mb-4" style={{ color: colors.text }}>
          Top Converting Paths
        </h3>
        
        <div className="space-y-3">
          {patterns.paths.map((path, i) => (
            <div key={i} className="flex items-center justify-between p-3 rounded-lg"
                 style={{ backgroundColor: colors.theme === 'light' ? 'rgba(0,0,0,0.02)' : 'rgba(255,255,255,0.02)' }}>
              <div className="flex items-center gap-2 flex-1 min-w-0">
                <span className="text-xs font-bold px-2 py-1 rounded-full flex-shrink-0"
                      style={{ backgroundColor: COLORS.BLUE[500], color: 'white' }}>
                  {i + 1}
                </span>
                <div className="flex items-center gap-1 flex-wrap min-w-0">
                  {path.channels.map((channel, j) => (
                    <React.Fragment key={j}>
                      <span className="px-2 py-1 rounded-md text-xs font-medium flex-shrink-0"
                            style={{ 
                              backgroundColor: CHANNEL_COLORS[channel] + '20',
                              color: CHANNEL_COLORS[channel] || colors.text
                            }}>
                        {channel}
                      </span>
                      {j < path.channels.length - 1 && (
                        <span className="text-xs flex-shrink-0" style={{ color: colors.textSecondary }}>→</span>
                      )}
                    </React.Fragment>
                  ))}
                </div>
              </div>
              <div className="text-right flex-shrink-0 ml-2">
                <div className="text-sm font-semibold" style={{ color: colors.text }}>
                  {formatCurrency(path.revenue)}
                </div>
                <div className="text-xs" style={{ color: colors.textSecondary }}>
                  {path.count} paths
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
      
      {/* Channel Transitions */}
      <div className="rounded-xl p-6" style={{ background: colors.bgCard, border: `1px solid ${colors.border}` }}>
        <h3 className="text-lg font-semibold mb-4" style={{ color: colors.text }}>
          Common Channel Transitions
        </h3>
        
        <div className="space-y-3">
          {patterns.transitions.map((transition, i) => (
            <div key={i} className="flex items-center justify-between p-3 rounded-lg"
                 style={{ backgroundColor: colors.theme === 'light' ? 'rgba(0,0,0,0.02)' : 'rgba(255,255,255,0.02)' }}>
              <div className="flex items-center gap-3">
                <div className="flex items-center gap-2">
                  <div className="w-4 h-4 rounded-full" 
                       style={{ backgroundColor: CHANNEL_COLORS[transition.from] || COLORS.GRAY[500] }}></div>
                  <span className="text-sm font-medium" style={{ color: colors.text }}>{transition.from}</span>
                </div>
                <div className="text-lg" style={{ color: colors.textSecondary }}>→</div>
                <div className="flex items-center gap-2">
                  <div className="w-4 h-4 rounded-full" 
                       style={{ backgroundColor: CHANNEL_COLORS[transition.to] || COLORS.GRAY[500] }}></div>
                  <span className="text-sm font-medium" style={{ color: colors.text }}>{transition.to}</span>
                </div>
              </div>
              <div className="text-right">
                <div className="text-sm font-semibold" style={{ color: colors.text }}>
                  {transition.count}
                </div>
                <div className="text-xs" style={{ color: colors.textSecondary }}>
                  transitions
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

// Main Customer Journey Map component
export default function CustomerJourneyMap({ journeys = [] }) {
  const { colors } = useTheme();
  const [selectedJourney, setSelectedJourney] = useState(null);
  const [viewMode, setViewMode] = useState('grid'); // 'grid', 'timeline', 'patterns'
  const [sortBy, setSortBy] = useState('revenue'); // 'revenue', 'length', 'time'

  const sortedJourneys = useMemo(() => {
    const convertingJourneys = journeys.filter(j => j.conversions.length > 0);
    
    return convertingJourneys.sort((a, b) => {
      switch (sortBy) {
        case 'revenue':
          return b.journeyValue - a.journeyValue;
        case 'length':
          return b.pathLength - a.pathLength;
        case 'time':
          return b.timeToConversion - a.timeToConversion;
        default:
          return b.journeyValue - a.journeyValue;
      }
    });
  }, [journeys, sortBy]);

  const stats = useMemo(() => {
    const convertingJourneys = journeys.filter(j => j.conversions.length > 0);
    const totalRevenue = convertingJourneys.reduce((sum, j) => sum + j.journeyValue, 0);
    const avgPathLength = convertingJourneys.length > 0 ? 
      convertingJourneys.reduce((sum, j) => sum + j.pathLength, 0) / convertingJourneys.length : 0;
    const avgTimeToConvert = convertingJourneys.length > 0 ?
      convertingJourneys.reduce((sum, j) => sum + j.timeToConversion, 0) / convertingJourneys.length : 0;
    
    return {
      totalJourneys: convertingJourneys.length,
      totalRevenue,
      avgPathLength,
      avgTimeToConvert
    };
  }, [journeys]);

  return (
    <div className="space-y-6">
      {/* Header with Controls */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold" style={{ color: colors.text }}>
            Customer Journey Mapping
          </h2>
          <p className="text-sm mt-1" style={{ color: colors.textSecondary }}>
            Visualize individual customer paths to conversion
          </p>
        </div>
        
        <div className="flex gap-2">
          <select 
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value)}
            className="px-3 py-2 rounded-lg border text-sm"
            style={{ 
              background: colors.bgCard,
              borderColor: colors.border,
              color: colors.text
            }}
          >
            <option value="revenue">Sort by Revenue</option>
            <option value="length">Sort by Path Length</option>
            <option value="time">Sort by Time to Convert</option>
          </select>
          
          <div className="flex rounded-lg p-1" style={{ background: colors.theme === 'light' ? 'rgba(0,0,0,0.06)' : 'rgba(255,255,255,0.06)' }}>
            {[
              { key: 'grid', label: '⊞ Grid', tooltip: 'Journey cards' },
              { key: 'patterns', label: '📊 Patterns', tooltip: 'Path analysis' }
            ].map(mode => (
              <button
                key={mode.key}
                onClick={() => setViewMode(mode.key)}
                className={`px-3 py-1 rounded-md text-sm font-medium transition-all ${
                  viewMode === mode.key ? 'shadow-sm' : ''
                }`}
                style={{
                  background: viewMode === mode.key ? colors.bgCard : 'transparent',
                  color: viewMode === mode.key ? colors.text : colors.textSecondary
                }}
                title={mode.tooltip}
              >
                {mode.label}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Stats Summary */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <div className="rounded-xl p-4" style={{ background: colors.bgCard, border: `1px solid ${colors.border}` }}>
          <div className="text-sm mb-1" style={{ color: colors.textSecondary }}>Total Journeys</div>
          <div className="text-xl font-bold" style={{ color: COLORS.BLUE[500] }}>
            {formatNumber(stats.totalJourneys)}
          </div>
        </div>
        <div className="rounded-xl p-4" style={{ background: colors.bgCard, border: `1px solid ${colors.border}` }}>
          <div className="text-sm mb-1" style={{ color: colors.textSecondary }}>Total Revenue</div>
          <div className="text-xl font-bold" style={{ color: COLORS.GREEN[500] }}>
            {formatCurrency(stats.totalRevenue)}
          </div>
        </div>
        <div className="rounded-xl p-4" style={{ background: colors.bgCard, border: `1px solid ${colors.border}` }}>
          <div className="text-sm mb-1" style={{ color: colors.textSecondary }}>Avg Path Length</div>
          <div className="text-xl font-bold" style={{ color: COLORS.PURPLE[500] }}>
            {stats.avgPathLength.toFixed(1)} touches
          </div>
        </div>
        <div className="rounded-xl p-4" style={{ background: colors.bgCard, border: `1px solid ${colors.border}` }}>
          <div className="text-sm mb-1" style={{ color: colors.textSecondary }}>Avg Time to Convert</div>
          <div className="text-xl font-bold" style={{ color: COLORS.ORANGE[500] }}>
            {stats.avgTimeToConvert.toFixed(1)} days
          </div>
        </div>
      </div>

      {/* Main Content */}
      {viewMode === 'grid' && (
        <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-4">
          {sortedJourneys.slice(0, 12).map((journey) => (
            <CustomerJourneyCard
              key={journey.customerId}
              journey={journey}
              colors={colors}
              onSelect={setSelectedJourney}
              isSelected={selectedJourney?.customerId === journey.customerId}
            />
          ))}
        </div>
      )}

      {viewMode === 'patterns' && (
        <JourneyPatternAnalysis journeys={journeys} colors={colors} />
      )}

      {/* Selected Journey Timeline */}
      {selectedJourney && viewMode === 'grid' && (
        <JourneyTimeline journey={selectedJourney} colors={colors} />
      )}
    </div>
  );
}