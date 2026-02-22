/**
 * Sankey diagram for visualizing customer journey flows
 * Shows the flow of customers through different channels and touchpoints
 */

import React, { useMemo } from 'react';
import { ResponsiveContainer } from 'recharts';
import { Sankey, Rectangle, Layer, LabelList } from 'recharts';

const SankeyJourneyChart = ({ journeys = [], className = '' }) => {
  const sankeyData = useMemo(() => {
    if (!journeys.length) return { nodes: [], links: [] };

    const nodeMap = new Map();
    const linkMap = new Map();
    let nodeIndex = 0;

    // Add special start and end nodes
    nodeMap.set('START', { 
      id: 'START', 
      name: 'Visitor',
      index: nodeIndex++,
      color: '#6B7280',
      depth: 0 
    });
    nodeMap.set('CONVERSION', { 
      id: 'CONVERSION', 
      name: 'Conversion',
      index: nodeIndex++,
      color: '#10B981',
      depth: 999 
    });

    // Channel colors
    const channelColors = {
      'Meta Ads': '#1877F2',
      'Google Ads': '#EA4335',
      'TikTok Ads': '#000000',
      'Email': '#10B981',
      'Organic Search': '#8B5CF6',
      'Direct': '#F59E0B',
      'Referral': '#EF4444',
      'Social': '#06B6D4'
    };

    // Process journeys to create nodes and links
    journeys.forEach(journey => {
      if (!journey.touchpoints?.length) return;

      let previousNode = 'START';
      const touchpoints = journey.touchpoints;
      const converted = journey.conversions?.length > 0;
      const journeyValue = converted ? journey.conversions.reduce((sum, c) => sum + c.revenue, 0) : 0;

      // Create nodes for each unique channel-position combination
      touchpoints.forEach((touchpoint, index) => {
        const channelKey = `${touchpoint.channel}_${index}`;
        
        if (!nodeMap.has(channelKey)) {
          nodeMap.set(channelKey, {
            id: channelKey,
            name: touchpoint.channel,
            index: nodeIndex++,
            color: channelColors[touchpoint.channel] || '#6B7280',
            depth: index + 1,
            position: index === 0 ? 'first' : index === touchpoints.length - 1 ? 'last' : 'middle'
          });
        }

        // Create link from previous touchpoint
        const linkKey = `${previousNode}->${channelKey}`;
        if (!linkMap.has(linkKey)) {
          linkMap.set(linkKey, {
            source: nodeMap.get(previousNode).index,
            target: nodeMap.get(channelKey).index,
            value: 0,
            revenue: 0
          });
        }

        const link = linkMap.get(linkKey);
        link.value += 1;
        if (converted) {
          link.revenue += journeyValue;
        }

        previousNode = channelKey;
      });

      // Link to conversion if converted
      if (converted) {
        const linkKey = `${previousNode}->CONVERSION`;
        if (!linkMap.has(linkKey)) {
          linkMap.set(linkKey, {
            source: nodeMap.get(previousNode).index,
            target: nodeMap.get('CONVERSION').index,
            value: 0,
            revenue: 0
          });
        }

        const link = linkMap.get(linkKey);
        link.value += 1;
        link.revenue += journeyValue;
      }
    });

    // Sort nodes by depth and filter out unused ones
    const nodes = Array.from(nodeMap.values())
      .filter(node => {
        // Keep START, CONVERSION, and nodes that have links
        if (node.id === 'START' || node.id === 'CONVERSION') return true;
        return Array.from(linkMap.values()).some(link => 
          link.source === node.index || link.target === node.index
        );
      })
      .sort((a, b) => a.depth - b.depth);

    // Update indices after filtering
    nodes.forEach((node, index) => {
      node.index = index;
    });

    // Update link indices
    const links = Array.from(linkMap.values())
      .map(link => ({
        ...link,
        source: nodes.findIndex(n => nodeMap.get(Object.keys(nodeMap)[link.source])?.id === n.id),
        target: nodes.findIndex(n => nodeMap.get(Object.keys(nodeMap)[link.target])?.id === n.id)
      }))
      .filter(link => link.source !== -1 && link.target !== -1)
      .filter(link => link.value > 0);

    return { nodes, links };
  }, [journeys]);

  const CustomNode = ({ payload, ...props }) => {
    const { x, y, width, height } = payload;
    const node = sankeyData.nodes[payload.index];
    
    return (
      <g>
        <Rectangle
          x={x}
          y={y}
          width={width}
          height={height}
          fill={node.color}
          fillOpacity={0.8}
          stroke={node.color}
          strokeWidth={1}
          rx={4}
        />
        <text
          x={x + width / 2}
          y={y + height / 2}
          textAnchor="middle"
          dominantBaseline="middle"
          fontSize={12}
          fontWeight="500"
          fill="white"
        >
          {node.name}
        </text>
        <text
          x={x + width / 2}
          y={y + height + 16}
          textAnchor="middle"
          dominantBaseline="middle"
          fontSize={10}
          fill="var(--color-text-secondary)"
        >
          {payload.value} customers
        </text>
      </g>
    );
  };

  const CustomLink = ({ payload, ...props }) => {
    const link = sankeyData.links.find(l => 
      l.source === payload.source.index && l.target === payload.target.index
    );
    
    const opacity = Math.max(0.2, Math.min(0.8, link.value / 20));
    
    return (
      <path
        d={payload.payload.path}
        stroke={payload.source.color}
        strokeWidth={Math.max(2, Math.min(20, link.value * 2))}
        strokeOpacity={opacity}
        fill="none"
        style={{ cursor: 'pointer' }}
      />
    );
  };

  if (!sankeyData.nodes.length) {
    return (
      <div className={`flex items-center justify-center h-96 ${className}`}>
        <div className="text-center" style={{ color: 'var(--color-text-secondary)' }}>
          <div className="text-6xl mb-4">📊</div>
          <h3 className="text-lg font-medium mb-2">No Journey Data</h3>
          <p className="text-sm">Customer journey data will appear here once you have touchpoints and conversions.</p>
        </div>
      </div>
    );
  }

  return (
    <div className={`w-full ${className}`}>
      {/* Legend */}
      <div className="mb-6 p-4 rounded-lg" style={{ background: 'var(--color-bg-secondary)' }}>
        <h4 className="text-sm font-medium mb-3" style={{ color: 'var(--color-text-primary)' }}>
          Journey Flow Legend
        </h4>
        <div className="flex flex-wrap gap-4 text-xs">
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 rounded" style={{ background: '#6B7280' }}></div>
            <span style={{ color: 'var(--color-text-secondary)' }}>Entry Points</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 rounded" style={{ background: '#10B981' }}></div>
            <span style={{ color: 'var(--color-text-secondary)' }}>Conversions</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-8 h-1 rounded" style={{ background: 'var(--color-text-secondary)', opacity: 0.5 }}></div>
            <span style={{ color: 'var(--color-text-secondary)' }}>Customer Flow (width = volume)</span>
          </div>
        </div>
      </div>

      {/* Sankey Chart */}
      <div style={{ height: '500px' }}>
        <ResponsiveContainer width="100%" height="100%">
          <Sankey
            data={{ nodes: sankeyData.nodes, links: sankeyData.links }}
            nodePadding={20}
            margin={{ top: 20, right: 80, bottom: 20, left: 80 }}
            link={CustomLink}
            node={CustomNode}
            iterations={64}
          >
            <defs>
              <linearGradient id="linkGradient" x1="0%" y1="0%" x2="100%" y2="0%">
                <stop offset="0%" stopOpacity={0.8} />
                <stop offset="100%" stopOpacity={0.3} />
              </linearGradient>
            </defs>
          </Sankey>
        </ResponsiveContainer>
      </div>

      {/* Insights */}
      <div className="mt-6 grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="p-4 rounded-lg" style={{ background: 'var(--color-bg-card)', border: '1px solid var(--color-border)' }}>
          <h4 className="text-sm font-medium mb-2" style={{ color: 'var(--color-text-primary)' }}>
            Most Common Path
          </h4>
          <p className="text-xs" style={{ color: 'var(--color-text-secondary)' }}>
            {sankeyData.links.length > 0 ? 
              `${sankeyData.links.reduce((max, link) => link.value > max.value ? link : max).value} customers follow the dominant path` :
              'No path data available'
            }
          </p>
        </div>
        
        <div className="p-4 rounded-lg" style={{ background: 'var(--color-bg-card)', border: '1px solid var(--color-border)' }}>
          <h4 className="text-sm font-medium mb-2" style={{ color: 'var(--color-text-primary)' }}>
            Conversion Rate
          </h4>
          <p className="text-xs" style={{ color: 'var(--color-text-secondary)' }}>
            {sankeyData.nodes.length > 0 ? 
              `${((sankeyData.nodes.find(n => n.id === 'CONVERSION')?.value || 0) / (sankeyData.nodes.find(n => n.id === 'START')?.value || 1) * 100).toFixed(1)}% of visitors convert` :
              'No conversion data available'
            }
          </p>
        </div>
        
        <div className="p-4 rounded-lg" style={{ background: 'var(--color-bg-card)', border: '1px solid var(--color-border)' }}>
          <h4 className="text-sm font-medium mb-2" style={{ color: 'var(--color-text-primary)' }}>
            Channel Count
          </h4>
          <p className="text-xs" style={{ color: 'var(--color-text-secondary)' }}>
            {sankeyData.nodes.filter(n => n.id !== 'START' && n.id !== 'CONVERSION').length} unique touchpoint channels
          </p>
        </div>
      </div>
    </div>
  );
};

export default SankeyJourneyChart;