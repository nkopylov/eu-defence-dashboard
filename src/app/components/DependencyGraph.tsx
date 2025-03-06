'use client';

import * as d3 from 'd3';
import { useEffect, useRef, useState } from 'react';
import { getStockData } from '../services/stockService';
import { DateRange, DependencyNetwork, NetworkLink, NetworkNode, StockData } from '../types';
import StockChart from './StockChart';

// Extend NetworkNode to include D3 simulation properties
interface SimulationNetworkNode extends NetworkNode, d3.SimulationNodeDatum {
  x?: number;
  y?: number;
  fx?: number | null;
  fy?: number | null;
}

// Define a new interface for D3 links instead of extending NetworkLink
interface SimulationNetworkLink {
  source: SimulationNetworkNode | string;
  target: SimulationNetworkNode | string;
  value: number;
  description: string;
}


interface DependencyGraphProps {
  data: DependencyNetwork;
  dateRange: DateRange;
  onNodeClick?: (node: NetworkNode) => void;
  highlightedNode?: string | null;
  height?: number;
}

export default function DependencyGraph({ data, dateRange, onNodeClick, highlightedNode, height = 600 }: DependencyGraphProps) {
  const svgRef = useRef<SVGSVGElement>(null);
  const [tooltipVisible, setTooltipVisible] = useState(false);
  const [tooltipPosition, setTooltipPosition] = useState({ x: 0, y: 0 });
  const tooltipRef = useRef<HTMLDivElement>(null);
  const [tooltipContent, setTooltipContent] = useState<{
    type: 'node' | 'link';
    data: NetworkNode | NetworkLink;
    stockData?: StockData[];
    isLoading?: boolean;
  } | null>(null);

  // Extract the tooltipRef dependency to a separate variable to fix the warning
  const tooltipWidth = tooltipRef.current ? tooltipRef.current.offsetWidth : 0;

  // Effect to adjust tooltip position if it goes off-screen
  useEffect(() => {
    if (!tooltipVisible || !tooltipRef.current) return;
    
    const tooltipRect = tooltipRef.current.getBoundingClientRect();
    const svgRect = svgRef.current?.getBoundingClientRect();
    
    if (!svgRect) return;
    
    const margin = 10;
    let newX = tooltipPosition.x;
    let newY = tooltipPosition.y;
    
    // Check if tooltip goes beyond right edge
    if (newX + tooltipRect.width > svgRect.right - margin) {
      newX = svgRect.right - tooltipRect.width - margin;
    }
    
    // Check if tooltip goes beyond bottom edge
    if (newY + tooltipRect.height > svgRect.bottom - margin) {
      newY = svgRect.bottom - tooltipRect.height - margin;
    }
    
    // Check if tooltip goes beyond top edge
    if (newY < svgRect.top + margin) {
      newY = svgRect.top + margin;
    }
    
    // If tooltip is positioned by an event, center it vertically
    if (tooltipRef.current) {
      const eventY = tooltipPosition.y;
      newY = Math.max(margin, eventY - (tooltipRect.height / 2));
    }
    
    // Update position
    setTooltipPosition({ x: newX, y: newY });
  }, [tooltipVisible, tooltipPosition.x, tooltipPosition.y, tooltipWidth]);

  useEffect(() => {
    if (!svgRef.current || !data.nodes.length) return;

    const width = 1000;
    // Use the height prop

    // Clear previous graph
    d3.select(svgRef.current).selectAll("*").remove();

    const svg = d3.select(svgRef.current)
      .attr("width", width)
      .attr("height", height)
      .attr("viewBox", [0, 0, width, height])
      .style("max-width", "100%")
      .style("height", "auto")
      .style("color", "var(--foreground)"); // Ensure text inherits the theme color

    const container = svg.append("g");

    // Add zoom functionality
    const zoom = d3.zoom<SVGSVGElement, unknown>()
      .scaleExtent([0.5, 3])
      .on("zoom", (event) => {
        container.attr("transform", event.transform);
      });

    svg.call(zoom);

    // Define node colors based on type - brighter colors for better visibility
    const nodeColors = {
      producer: "#ff5252", // Bright red for end producers
      supplier: "#4dabf7", // Bright blue for suppliers
      material: "#69db7c"  // Bright green for material providers
    };

    // Create a force simulation
    const simulation = d3.forceSimulation(data.nodes as SimulationNetworkNode[])
      .force("link", d3.forceLink(data.links)
        .id((d: d3.SimulationNodeDatum) => (d as SimulationNetworkNode).id)
        .distance(100)
        .strength(0.8))
      .force("charge", d3.forceManyBody().strength(-500))
      .force("center", d3.forceCenter(width / 2, height / 2))
      .force("x", d3.forceX(width / 2).strength(0.1))
      .force("y", d3.forceY(height / 2).strength(0.1));

    // Draw the links with varying thickness based on value
    const link = container.append("g")
      .selectAll("line")
      .data(data.links)
      .join("line")
      .attr("stroke", "var(--text-color, #999)")
      .attr("stroke-opacity", 0.6)
      .attr("stroke-width", d => Math.sqrt(d.value) * 1.5)
      .on("mouseover", function(event, d) {
        d3.select(this)
          .attr("stroke", "var(--highlight-color, #ddd)")
          .attr("stroke-opacity", 1);
        
        // Just capture the initial mouse position - the positioning effect will handle the rest
        setTooltipPosition({ x: event.pageX, y: event.pageY });
        
        // Process link data to ensure it has the correct format
        const linkToDisplay: NetworkLink = {
          source: typeof d.source === 'string' ? d.source : (d.source?.id || ''),
          target: typeof d.target === 'string' ? d.target : (d.target?.id || ''),
          value: d.value,
          description: d.description
        };
        
        setTooltipContent({ 
          type: 'link',
          data: linkToDisplay
        });
        setTooltipVisible(true);
      })
      .on("mouseout", function() {
        d3.select(this)
          .attr("stroke", "var(--text-color, #999)")
          .attr("stroke-opacity", 0.6);
        
        setTooltipVisible(false);
      });

    // Draw the nodes
    const node = container.append("g")
      .selectAll("g")
      .data(data.nodes)
      .join("g")
      .attr("class", d => `node ${d.type}${highlightedNode === d.ticker ? ' highlighted' : ''}`)
      .call(drag(simulation) as any) // Use type assertion to avoid complex typing issues
      .on("click", (event, d) => {
        if (onNodeClick) onNodeClick(d);
      });

    // Add circles for the nodes
    node.append("circle")
      .attr("r", d => {
        // Make highlighted nodes larger
        const baseSize = (4 - d.level) * 5; // Base size based on level
        return highlightedNode === d.ticker ? baseSize * 1.3 : baseSize; // 30% larger for highlighted node
      })
      .attr("fill", d => nodeColors[d.type as keyof typeof nodeColors])
      .attr("stroke", d => highlightedNode === d.ticker ? "#ff9800" : "#fff") // Orange border for highlighted node
      .attr("stroke-width", d => highlightedNode === d.ticker ? 3 : 1.5) // Thicker border for highlighted node
      .attr("filter", d => highlightedNode === d.ticker ? "drop-shadow(0 0 5px rgba(255, 152, 0, 0.7))" : "none") // Add glow effect to highlighted node
      .attr("class", "filter-none cursor-pointer"); // Ensure visibility in dark mode and show cursor pointer

    // Add labels for the nodes
    node.append("text")
      .attr("dx", 12)
      .attr("dy", ".35em")
      .text(d => d.name)
      .attr("font-size", "12px")
      .attr("font-weight", d => d.level === 0 ? "bold" : "normal")
      .attr("fill", "var(--foreground)")
      .attr("class", "filter-none") // Ensure visibility in both modes

    // Handle node events
    node.on("mouseover", async function(event, d) {
      // Highlight the hovered node
      d3.select(this).select("circle")
        .attr("stroke", "#ffffff")
        .attr("stroke-width", 3)
        .attr("filter", "brightness(1.2)");
      
      // Find connected nodes and links
      const connectedNodeIds = new Set<string>();
      const connectedLinks = new Set<string>();
      
      // Add the current node
      connectedNodeIds.add(d.id);
      
      // Find all links connected to this node
      data.links.forEach(link => {
        const sourceId = typeof link.source === 'string' ? link.source : link.source.id;
        const targetId = typeof link.target === 'string' ? link.target : link.target.id;
        
        // If this node is either the source or target of the link
        if (sourceId === d.id || targetId === d.id) {
          // Add the connected node to our set
          if (sourceId === d.id) {
            connectedNodeIds.add(targetId);
          } else {
            connectedNodeIds.add(sourceId);
          }
          
          // Add the link to our set
          connectedLinks.add(`${sourceId}-${targetId}`);
        }
      });
      
      // Highlight all connected nodes
      node.filter(node => connectedNodeIds.has(node.id) && node.id !== d.id)
        .select("circle")
        .attr("stroke", "#ffcc00")
        .attr("stroke-width", 2)
        .attr("filter", "brightness(1.1)");
      
      // Highlight all connected links
      link.filter(link => {
        const sourceId = typeof link.source === 'string' ? link.source : link.source.id;
        const targetId = typeof link.target === 'string' ? link.target : link.target.id;
        return connectedLinks.has(`${sourceId}-${targetId}`);
      })
        .attr("stroke", "#ffcc00")
        .attr("stroke-opacity", 1)
        .attr("stroke-width", l => Math.sqrt(l.value) * 2);
      
      // Just capture the initial mouse position - the positioning effect will handle the rest
      setTooltipPosition({ x: event.pageX, y: event.pageY });
      
      // For public companies, fetch stock data
      if (!d.ticker.startsWith("PRIVATE:")) {
        setTooltipContent({ 
          type: 'node',
          data: d,
          isLoading: true
        });
        setTooltipVisible(true);
        
        const stockData = await getStockData(d.ticker, dateRange);
        setTooltipContent({
          type: 'node',
          data: d,
          stockData,
          isLoading: false
        });
      } else {
        setTooltipContent({ 
          type: 'node',
          data: d,
          isLoading: false
        });
        setTooltipVisible(true);
      }
    })
    .on("mouseout", function(event, d) {
      // Reset the hovered node
      d3.select(this).select("circle")
        .attr("stroke", highlightedNode === d.ticker ? "#ff9800" : "#fff")
        .attr("stroke-width", highlightedNode === d.ticker ? 3 : 1.5)
        .attr("filter", highlightedNode === d.ticker ? "drop-shadow(0 0 5px rgba(255, 152, 0, 0.7))" : "none");
      
      // Reset all nodes to their default state
      node.select("circle")
        .attr("stroke", n => highlightedNode === n.ticker ? "#ff9800" : "#fff")
        .attr("stroke-width", n => highlightedNode === n.ticker ? 3 : 1.5)
        .attr("filter", n => highlightedNode === n.ticker ? "drop-shadow(0 0 5px rgba(255, 152, 0, 0.7))" : "none");
      
      // Reset all links to their default state
      link
        .attr("stroke", "var(--text-color, #999)")
        .attr("stroke-opacity", 0.6)
        .attr("stroke-width", l => Math.sqrt(l.value) * 1.5);
      
      setTooltipVisible(false);
    });

    // Define the drag behavior
    function drag(simulation: d3.Simulation<SimulationNetworkNode, undefined>) {
      function dragstarted(event: d3.D3DragEvent<SVGGElement, SimulationNetworkNode, SimulationNetworkNode>) {
        if (!event.active) simulation.alphaTarget(0.3).restart();
        event.subject.fx = event.subject.x;
        event.subject.fy = event.subject.y;
      }
      
      function dragged(event: d3.D3DragEvent<SVGGElement, SimulationNetworkNode, SimulationNetworkNode>) {
        event.subject.fx = event.x;
        event.subject.fy = event.y;
      }
      
      function dragended(event: d3.D3DragEvent<SVGGElement, SimulationNetworkNode, SimulationNetworkNode>) {
        if (!event.active) simulation.alphaTarget(0);
        event.subject.fx = null;
        event.subject.fy = null;
      }
      
      return d3.drag<SVGGElement, SimulationNetworkNode>()
        .on("start", dragstarted)
        .on("drag", dragged)
        .on("end", dragended);
    }

    // Update positions on simulation tick
    simulation.on("tick", () => {
      link
        .attr("x1", (d: SimulationNetworkLink) => {
          const source = typeof d.source === 'string' ? null : d.source;
          return source?.x || 0;
        })
        .attr("y1", (d: SimulationNetworkLink) => {
          const source = typeof d.source === 'string' ? null : d.source;
          return source?.y || 0;
        })
        .attr("x2", (d: SimulationNetworkLink) => {
          const target = typeof d.target === 'string' ? null : d.target;
          return target?.x || 0;
        })
        .attr("y2", (d: SimulationNetworkLink) => {
          const target = typeof d.target === 'string' ? null : d.target;
          return target?.y || 0;
        });

      node.attr("transform", (d: SimulationNetworkNode) => `translate(${d.x || 0},${d.y || 0})`);
    });

    // Add legend
    const legend = svg.append("g")
      .attr("transform", "translate(20, 20)");

    const types = [
      { type: "producer", label: "End Producers" },
      { type: "supplier", label: "Suppliers" },
      { type: "material", label: "Material Providers" }
    ];

    types.forEach((type, i) => {
      const legendRow = legend.append("g")
        .attr("transform", `translate(0, ${i * 25})`);
      
      legendRow.append("circle")
        .attr("r", 6)
        .attr("fill", nodeColors[type.type as keyof typeof nodeColors]);
      
      legendRow.append("text")
        .attr("x", 15)
        .attr("y", 5)
        .text(type.label)
        .attr("font-size", "12px")
        .attr("fill", "currentColor"); // Support dark mode
    });

    // Legend for link strength
    const linkLegend = svg.append("g")
      .attr("transform", `translate(200, 20)`);

    linkLegend.append("text")
      .text("Link thickness = Dependency strength")
      .attr("font-size", "12px")
      .attr("fill", "currentColor"); // Support dark mode

    return () => {
      simulation.stop();
    };
  }, [data, dateRange, height, highlightedNode, onNodeClick]);

  return (
    <div className="relative">
      <div className="w-full overflow-hidden bg-white dark:bg-gray-800 rounded-lg">
        <svg ref={svgRef} className="w-full text-gray-900 dark:text-gray-100" style={{ height: `${height}px` }}></svg>
      </div>
      
      {tooltipVisible && tooltipContent && (
        <div 
          ref={tooltipRef}
          className="absolute z-50 bg-white dark:bg-gray-800 p-2 rounded shadow-lg text-gray-900 dark:text-gray-100"
          style={{ 
            left: tooltipPosition.x + 10, 
            top: tooltipPosition.y + 10,
            width: tooltipContent.type === 'node' ? '240px' : '220px',
            maxHeight: '300px',
            overflow: 'auto',
            pointerEvents: "none",
            border: "1px solid var(--text-color)"
          }}
        >
          {tooltipContent.type === 'node' && (
            <div className="text-xs">
              <h3 className="text-base font-bold mb-1 truncate">{(tooltipContent.data as NetworkNode).name}</h3>
              <p className="mb-0.5"><strong>Country:</strong> {(tooltipContent.data as NetworkNode).country}</p>
              <p className="mb-0.5 line-clamp-2"><strong>Products:</strong> {(tooltipContent.data as NetworkNode).products}</p>
              <p className="mb-0.5"><strong>Sector:</strong> {(tooltipContent.data as NetworkNode).sector}</p>
              
              {(tooltipContent.data as NetworkNode).description && (
                <p className="mb-1 line-clamp-2 text-opacity-80 italic">
                  {(tooltipContent.data as NetworkNode).description}
                </p>
              )}
              
              {!((tooltipContent.data as NetworkNode).ticker.startsWith("PRIVATE:")) && (
                <div className="mt-1" style={{ height: '60px', width: '100%' }}>
                  <StockChart
                    data={tooltipContent.stockData || []}
                    companyName={(tooltipContent.data as NetworkNode).name}
                    isLoading={tooltipContent.isLoading || false}
                    miniVersion={true}
                    dateRange={dateRange}
                  />
                </div>
              )}
            </div>
          )}
          
          {tooltipContent.type === 'link' && (
            <div className="text-xs">
              <p className="font-bold mb-1 text-sm">Dependency</p>
              <p className="mb-0.5 truncate">
                <strong>From:</strong> {
                  // Try to find the source node
                  (() => {
                    const link = (tooltipContent.data as NetworkLink);
                    // Check if source is already a node object
                    if (typeof link.source !== 'string' && link.source?.name) {
                      return link.source.name;
                    }
                    // Otherwise find the node by ID
                    const sourceId = typeof link.source === 'string' ? link.source : link.source?.id;
                    return data.nodes.find(n => n.id === sourceId)?.name || 'Unknown';
                  })()
                }
              </p>
              <p className="mb-0.5 truncate">
                <strong>To:</strong> {
                  // Try to find the target node
                  (() => {
                    const link = (tooltipContent.data as NetworkLink);
                    // Check if target is already a node object
                    if (typeof link.target !== 'string' && link.target?.name) {
                      return link.target.name;
                    }
                    // Otherwise find the node by ID
                    const targetId = typeof link.target === 'string' ? link.target : link.target?.id;
                    return data.nodes.find(n => n.id === targetId)?.name || 'Unknown';
                  })()
                }
              </p>
              <p className="mb-0.5">
                <strong>Strength:</strong> {(tooltipContent.data as NetworkLink).value}/10
              </p>
              <p className="line-clamp-3">
                <strong>Details:</strong> {(tooltipContent.data as NetworkLink).description}
              </p>
            </div>
          )}
        </div>
      )}

      <div className="mt-4 text-sm text-gray-800 dark:text-gray-200">
        <p><strong>How to use:</strong> Drag nodes to rearrange | Hover for details | Zoom with mouse wheel | Click and drag background to pan</p>
        <ul className="mt-2 list-disc list-inside">
          <li><span className="text-red-500 filter-none">●</span> End Producers: Companies that manufacture final defense products</li>
          <li><span className="text-blue-500 filter-none">●</span> Suppliers: Companies that provide components and systems</li>
          <li><span className="text-green-500 filter-none">●</span> Material Providers: Companies that provide raw or processed materials</li>
        </ul>
      </div>
    </div>
  );
}