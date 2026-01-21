
import React, { useState, useEffect } from 'react';
import { UINode } from '../../types';
import * as LucideIcons from 'lucide-react';
import { AreaChart, Area, BarChart, Bar, LineChart, Line, PieChart, Pie, Cell, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid } from 'recharts';

const DynamicIcon: React.FC<{ name: string; className?: string }> = ({ name, className }) => {
  const IconComponent = (LucideIcons as any)[name] || LucideIcons.HelpCircle;
  return <IconComponent className={className} />;
};

// Helper to enforce A6 airline code for branding consistency
// Replaces any 2-character airline code (e.g., MU, CA) followed by 3-4 digits with 'A6'
const formatFlightText = (text: string) => {
  if (typeof text !== 'string') return text;
  return text.replace(/\b[A-Z0-9]{2}(\d{3,4})\b/g, 'A6$1');
};

/**
 * Enhanced Gantt Chart Component
 * Supports "Aircraft Dimension" (Rows) with "Flight Tasks" (Timeline Bars)
 */
const DynamicGantt: React.FC<{ data: any[] }> = ({ data }) => {
  if (!data || data.length === 0) return null;

  const parseTime = (t: string) => {
      if(!t) return 0;
      // Extract HH:mm safely
      const match = t.match(/(\d{1,2}):(\d{2})/);
      if (!match) return 0;
      const h = parseInt(match[1]);
      const m = parseInt(match[2]);
      return h * 60 + m;
  };
  
  const TOTAL_MINS = 1440; // 24 Hours

  return (
    <div className="flex flex-col gap-2 pt-2 pb-1 w-full">
      {/* Time Legend */}
       <div className="flex pl-11 pr-2 text-[8px] text-slate-300 justify-between select-none font-mono">
          <span>00:00</span><span>08:00</span><span>16:00</span><span>24:00</span>
       </div>

      {data.map((row, idx) => {
        // Support flexible data structure: 
        // 1. row = { label: 'B-1234', tasks: [{start, end, ...}] } (Aircraft Group)
        // 2. row = { label: 'Flight 1', start, end } (Flat List)
        const isGroup = Array.isArray(row.tasks);
        const tasks = isGroup ? row.tasks : [row];
        
        // APPLY FORMATTING TO ROW LABELS HERE
        const rawLabel = row.label || row.name || 'N/A';
        const label = formatFlightText(rawLabel);
        
        const subLabel = row.subLabel || '';

        return (
          <div key={idx} className="flex items-center gap-2">
             {/* Label Column (e.g. Aircraft Reg) */}
             <div className="w-11 flex-shrink-0 flex flex-col items-center justify-center gap-0.5">
                <div className={`w-7 h-7 rounded-full flex items-center justify-center border shadow-sm ${isGroup ? 'bg-blue-50 border-blue-100' : 'bg-slate-50 border-slate-100'}`}>
                    {isGroup 
                        ? <LucideIcons.Plane className="w-3.5 h-3.5 text-blue-500" />
                        : <LucideIcons.Clock className="w-3.5 h-3.5 text-slate-400" />
                    }
                </div>
                <span className="text-[9px] font-bold text-slate-600 truncate w-full text-center leading-tight">{label}</span>
                {subLabel && <span className="text-[8px] text-slate-400 scale-90">{subLabel}</span>}
             </div>

             {/* Timeline Track */}
             <div className="flex-1 h-8 bg-slate-50/50 rounded-lg border border-slate-100 relative overflow-hidden group-hover:bg-slate-50 transition-colors">
                {/* Background Grid Lines (every 8 hours approx) */}
                <div className="absolute left-[33.33%] top-0 bottom-0 w-px bg-slate-200/50 border-l border-dashed border-slate-200"></div>
                <div className="absolute left-[66.66%] top-0 bottom-0 w-px bg-slate-200/50 border-l border-dashed border-slate-200"></div>

                {/* Tasks Bars */}
                {tasks.map((task: any, tIdx: number) => {
                    if (!task.start || !task.end) return null;
                    const startMins = parseTime(task.start);
                    const endMins = parseTime(task.end);
                    // Ensure bar is visible even if short (min 4px)
                    const duration = Math.max(endMins - startMins, 20); 
                    
                    const leftPct = (startMins / TOTAL_MINS) * 100;
                    const widthPct = (duration / TOTAL_MINS) * 100;
                    
                    // Detect status color or default
                    const statusColor = task.statusColor || (task.status === 'delayed' ? 'red' : task.status === 'planning' ? 'orange' : 'blue');
                    const colorClasses: any = {
                        red: 'bg-red-100 border-red-200 text-red-600',
                        orange: 'bg-amber-100 border-amber-200 text-amber-600',
                        blue: 'bg-blue-100 border-blue-200 text-blue-600',
                        green: 'bg-emerald-100 border-emerald-200 text-emerald-600',
                        slate: 'bg-slate-100 border-slate-200 text-slate-500'
                    };
                    const bgClass = colorClasses[statusColor] || colorClasses.blue;

                    const barLabel = task.label || task.flightNo || task.value || '';
                    const formattedLabel = formatFlightText(barLabel);

                    return (
                        <div 
                            key={tIdx}
                            className={`absolute top-1.5 bottom-1.5 rounded-[4px] border flex items-center justify-center shadow-sm z-10 ${bgClass}`}
                            style={{ left: `${leftPct}%`, width: `${widthPct}%` }}
                        >
                            {/* Render text only if bar is wide enough (>10%) */}
                            {widthPct > 10 && (
                                <span className="text-[8px] font-bold leading-none truncate px-1">{formattedLabel}</span>
                            )}
                        </div>
                    );
                })}
             </div>
          </div>
        );
      })}
    </div>
  );
};

const DynamicChart: React.FC<{ type?: string; data: any[] }> = ({ type, data }) => {
  if (!data || data.length === 0) return null;
  const tooltipStyle = { backgroundColor: 'rgba(255, 255, 255, 0.98)', borderRadius: '6px', border: '1px solid #e2e8f0', fontSize: '10px', padding: '2px 6px', color: '#1e293b' };
  
  // 1. Normalize type (handle undefined, casing)
  const chartType = (type || 'bar').toLowerCase();

  // 2. Handle Gantt (Now Enhanced)
  if (chartType === 'gantt') return <DynamicGantt data={data} />;
  
  // 3. Shared Axis Config for Cartesian Charts
  const CartesianAxis = () => (
    <>
      <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
      <XAxis dataKey="name" tick={{fontSize: 9, fill: '#94a3b8'}} axisLine={false} tickLine={false} interval={0} />
      <YAxis tick={{fontSize: 9, fill: '#94a3b8'}} axisLine={false} tickLine={false} width={25} />
      <Tooltip contentStyle={tooltipStyle} cursor={{fill: '#f8fafc', opacity: 0.5}} />
    </>
  );

  // 4. Render Specific Charts
  if (chartType === 'area') {
    return (
      <ResponsiveContainer width="100%" height="100%">
        <AreaChart data={data}>
          <defs><linearGradient id="colorGradient" x1="0" y1="0" x2="0" y2="1"><stop offset="5%" stopColor="#3b82f6" stopOpacity={0.1}/><stop offset="95%" stopColor="#3b82f6" stopOpacity={0}/></linearGradient></defs>
          <CartesianAxis />
          <Area type="monotone" dataKey="value" stroke="#3b82f6" strokeWidth={2} fillOpacity={1} fill="url(#colorGradient)" />
        </AreaChart>
      </ResponsiveContainer>
    );
  }

  if (chartType === 'bar') {
    return (
      <ResponsiveContainer width="100%" height="100%">
        <BarChart data={data} barSize={20}>
           <CartesianAxis />
           <Bar dataKey="value" fill="#3b82f6" radius={[4, 4, 0, 0]} />
        </BarChart>
      </ResponsiveContainer>
    );
  }

  if (chartType === 'pie') {
     const COLORS = ['#3b82f6', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6'];
     return (
      <ResponsiveContainer width="100%" height="100%">
        <PieChart>
          <Pie
            data={data}
            cx="50%"
            cy="50%"
            innerRadius={40}
            outerRadius={70}
            paddingAngle={5}
            dataKey="value"
          >
            {data.map((entry: any, index: number) => (
              <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
            ))}
          </Pie>
          <Tooltip contentStyle={tooltipStyle} />
        </PieChart>
      </ResponsiveContainer>
     );
  }

  // 5. Default Fallback: Line Chart
  return (
       <ResponsiveContainer width="100%" height="100%">
        <LineChart data={data}>
           <CartesianAxis />
           <Line type="monotone" dataKey="value" stroke="#3b82f6" strokeWidth={2} dot={{r: 3, fill:'#3b82f6', strokeWidth:0}} activeDot={{r: 5}} />
        </LineChart>
      </ResponsiveContainer>
  );
};

const RenderNode: React.FC<{ node: UINode; formState: any; setFormState: any; onActionClick?: (displayText: string, hiddenContext?: string) => void }> = ({ node, formState, setFormState, onActionClick }) => {
  if (!node) return null;
  const { type, props = {}, style = {}, children } = node;
  const { className } = style;

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const name = props.name || props.label || 'unnamed';
    setFormState((prev: any) => ({ ...prev, [name]: e.target.value }));
  };

  const commonInputStyles = "w-full bg-slate-50 border border-slate-200 rounded-lg px-3 py-2 text-xs outline-none focus:border-blue-500 focus:bg-white focus:ring-1 focus:ring-blue-100 transition-all placeholder:text-slate-300";

  switch (type) {
    case 'container':
      return (
        <div className={className}>
          {children?.map((child, idx) => (
            <RenderNode key={child.id || idx} node={child} formState={formState} setFormState={setFormState} onActionClick={onActionClick} />
          ))}
        </div>
      );
    case 'text':
      return <div className={className}>{formatFlightText(props.text || '')}{children?.map((child, idx) => (<RenderNode key={child.id || idx} node={child} formState={formState} setFormState={setFormState} onActionClick={onActionClick} />))}</div>;
    case 'button':
      return (
        <button 
            className={`transition-all active:scale-[0.98] duration-200 ${className || 'bg-slate-50 text-slate-700 py-2 px-3 rounded-lg text-xs font-bold border border-slate-200 shadow-sm flex items-center justify-center gap-1.5'}`} 
            onClick={(e) => {
                e.stopPropagation();
                if (onActionClick) {
                  const intent = props.onClickIntent || 'Action';
                  if (intent.toLowerCase().includes('submit') || intent.toLowerCase().includes('report') || intent.toLowerCase().includes('save')) {
                    onActionClick(props.text || '提交', JSON.stringify(formState));
                  } else {
                    onActionClick(props.text || intent);
                  }
                }
            }}
        >
             {props.iconName && <DynamicIcon name={props.iconName} className="w-3.5 h-3.5" />}
             {props.text && <span>{formatFlightText(props.text)}</span>}
        </button>
      );
    case 'input':
      return (
        <div className={`flex items-center gap-2 ${className}`}>
           {props.label && <label className="text-[12px] text-slate-500 min-w-[60px]">{props.label}</label>}
           <input 
              type="text" 
              name={props.name}
              value={formState[props.name || props.label || ''] || ''}
              onChange={handleChange}
              placeholder={props.placeholder}
              className={commonInputStyles}
              onClick={(e) => e.stopPropagation()}
           />
        </div>
      );
    case 'select':
      return (
        <div className={`flex items-center gap-2 ${className}`}>
           {props.label && <label className="text-[12px] text-slate-500 min-w-[60px]">{props.label}</label>}
           <div className="relative flex-1">
             <select 
                value={formState[props.name || props.label || ''] || ''}
                onChange={handleChange}
                className={`${commonInputStyles} appearance-none pr-8`}
                onClick={(e) => e.stopPropagation()}
             >
                <option value="" disabled>{props.placeholder || '请选择'}</option>
                {props.options?.map((opt: any, i: number) => (
                  <option key={i} value={opt.value}>{opt.label}</option>
                ))}
             </select>
             <LucideIcons.ChevronDown className="absolute right-2 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-slate-400 pointer-events-none" />
           </div>
        </div>
      );
    case 'textarea':
      return (
        <div className={`flex flex-col gap-1.5 ${className}`}>
           {props.label && <label className="text-[12px] text-slate-500">{props.label}</label>}
           <textarea 
              rows={props.rows || 3}
              value={formState[props.name || props.label || ''] || ''}
              onChange={handleChange}
              placeholder={props.placeholder}
              className={`${commonInputStyles} resize-none italic text-slate-400`}
              onClick={(e) => e.stopPropagation()}
           />
        </div>
      );
    case 'alert':
      return (
        <div className={`flex items-start gap-2 p-3 bg-blue-50/50 rounded-xl border border-blue-100/50 ${className}`}>
           <LucideIcons.Sparkles className="w-4 h-4 text-blue-500 shrink-0 mt-0.5" />
           <div className="flex flex-col">
              <span className="text-[12px] font-bold text-slate-700">{props.title}</span>
              <span className="text-[11px] text-blue-500 leading-tight">{formatFlightText(props.text || '')}</span>
           </div>
        </div>
      );
    case 'icon': return <DynamicIcon name={props.iconName || 'Circle'} className={className} />;
    case 'divider': return <div className={`h-px bg-slate-100 my-1 ${className}`} />;
    case 'badge': return <span className={className}>{formatFlightText(props.text || '')}</span>;
    case 'chart':
      if (!props.chartData || props.chartData.length === 0) return null;
      // FIX: Gantt charts should grow naturally with content (auto height), others use fixed/prop height
      // This prevents the overlap issue by letting the container expand.
      const isGantt = (props.chartType || '').toLowerCase() === 'gantt';
      return (
        <div 
            className={`w-full ${className || ''}`} 
            style={isGantt ? undefined : { height: props.height || '150px' }}
        >
            <DynamicChart type={props.chartType} data={props.chartData} />
        </div>
      );
    default: return null;
  }
};

const DynamicWidget: React.FC<{ data: UINode; title: string; analysis?: string; onActionClick?: (displayText: string, hiddenContext?: string) => void }> = ({ data, title, analysis, onActionClick }) => {
  const [formState, setFormState] = useState<any>({});

  // Initialize form state if props have default values
  useEffect(() => {
    const initialState: any = {};
    const extractDefaults = (node: UINode) => {
      if (node.props?.name || node.props?.label) {
        initialState[node.props.name || node.props.label || ''] = node.props.value || '';
      }
      node.children?.forEach(extractDefaults);
    };
    if (data) extractDefaults(data);
    setFormState(initialState);
  }, [data]);

  const renderAnalysis = () => {
    if (!analysis) return null;
    return (
        <div className="mt-3 mb-2 bg-indigo-50/50 border border-indigo-100/80 rounded-xl p-3 animate-fade-in-up">
            <div className="flex items-center gap-2 mb-1.5">
                    <div className="bg-indigo-100 p-1 rounded-md">
                    <LucideIcons.Sparkles className="w-3 h-3 text-indigo-600" />
                    </div>
                    <span className="text-[11px] font-bold text-indigo-800">鸿小通分析</span>
            </div>
            <div className="text-[11px] text-slate-600 leading-relaxed text-justify">
                {formatFlightText(analysis)}
            </div>
        </div>
    );
  };

  // Advanced render logic to inject analysis BEFORE the footer actions
  const renderRoot = () => {
     if (!data) return null;
     
     if (data.type === 'container' && data.children && data.children.length > 0) {
         const children = data.children;
         const lastChild = children[children.length - 1];

         // Heuristic: Is the last child a Button or a Container of Buttons?
         const isButton = (node: UINode) => node.type === 'button';
         const isButtonContainer = (node: UINode) => 
            node.type === 'container' && node.children && node.children.some(isButton);
         
         const lastIsAction = isButton(lastChild) || isButtonContainer(lastChild);

         return (
            <div className={data.style?.className}>
                {children.map((child, idx) => {
                    // If last child is action, defer rendering it
                    if (lastIsAction && idx === children.length - 1) return null;
                    return <RenderNode key={idx} node={child} formState={formState} setFormState={setFormState} onActionClick={onActionClick} />;
                })}

                {renderAnalysis()}

                {lastIsAction && (
                    <div className="mt-4 pt-3 border-t border-slate-50 w-full">
                         <RenderNode key={children.length - 1} node={lastChild} formState={formState} setFormState={setFormState} onActionClick={onActionClick} />
                    </div>
                )}
            </div>
         );
     }

     // Fallback: Render analysis at the bottom
     return (
        <div className={data.style?.className}>
            <RenderNode node={data} formState={formState} setFormState={setFormState} onActionClick={onActionClick} />
            {renderAnalysis()}
        </div>
     );
  };

  if (!data) return (
      <div className="w-full bg-slate-50 p-3 rounded-xl border border-slate-100 flex items-center gap-2">
         <LucideIcons.Loader2 className="w-3.5 h-3.5 text-slate-400 animate-spin" />
         <span className="text-[10px] text-slate-400">正在构建界面...</span>
      </div>
  );

  return (
    <div className="w-full bg-white rounded-2xl shadow-sm border border-slate-100 overflow-hidden animate-fade-in-up">
      <div className="bg-slate-50/50 px-4 py-2.5 flex items-center gap-1.5 border-b border-slate-100">
        <LucideIcons.Sparkles className="w-3.5 h-3.5 text-blue-500" />
        <span className="text-slate-800 font-bold text-[13px] tracking-tight">{title}</span>
      </div>
      <div className="p-4">
        {renderRoot()}
      </div>
    </div>
  );
};

export default DynamicWidget;
