import React, { useState, useEffect } from 'react';

// Utility for live clocks
function useLiveTime(offset = 0) {
  const [time, setTime] = useState(() => {
    const now = new Date();
    now.setHours(now.getHours() + offset);
    return now;
  });

  useEffect(() => {
    const timer = setInterval(() => {
      const now = new Date();
      now.setHours(now.getHours() + offset);
      setTime(now);
    }, 1000);

    return () => clearInterval(timer);
  }, [offset]);

  return time;
}

// World Clock Component
const worldClocks = [
  { city: 'SCL', offset: -3, icon: '☀️' },
  { city: 'BCN', offset: 1, icon: '🌙' },
  { city: 'SFO', offset: -8, icon: '☀️' },
  { city: 'HAN', offset: 7, icon: '🌳' },
];

// Calendar Component with integrated World Clock and Timer
function Calendar() {
  const [currentDate, setCurrentDate] = useState(new Date());
  const [timerRunning, setTimerRunning] = useState(false);
  const [timerMode, setTimerMode] = useState<'FOCUS' | 'BREAK' | 'DEBRIEF'>('FOCUS');
  const [timeLeft, setTimeLeft] = useState(25 * 60); // 25 minutes in seconds
  
  const daysInMonth = new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 0).getDate();
  const firstDayOfMonth = new Date(currentDate.getFullYear(), currentDate.getMonth(), 1).getDay();
  
  const monthNames = [
    'JAN', 'FEB', 'MAR', 'APR', 'MAY', 'JUN',
    'JUL', 'AUG', 'SEP', 'OCT', 'NOV', 'DEC'
  ];

  // Timer functionality
  useEffect(() => {
    let interval: number;
    
    if (timerRunning && timeLeft > 0) {
      interval = window.setInterval(() => {
        setTimeLeft((prev) => {
          if (prev <= 1) {
            setTimerRunning(false);
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    }
    
    return () => {
      if (interval) window.clearInterval(interval);
    };
  }, [timerRunning, timeLeft]);

  const startTimer = () => {
    setTimerRunning(true);
  };

  const stopTimer = () => {
    setTimerRunning(false);
  };

  const resetTimer = () => {
    setTimerRunning(false);
    setTimeLeft(25 * 60);
  };

  const changeTimerMode = (mode: 'FOCUS' | 'BREAK' | 'DEBRIEF') => {
    setTimerMode(mode);
    setTimerRunning(false);
    if (mode === 'FOCUS') {
      setTimeLeft(25 * 60);
    } else if (mode === 'BREAK') {
      setTimeLeft(5 * 60);
    } else if (mode === 'DEBRIEF') {
      setTimeLeft(3 * 60);
    }
  };

  const formatTime = (seconds: number) => {
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    return `${minutes} : ${remainingSeconds.toString().padStart(2, '0')}`;
  };

  const navigateMonth = (direction: number) => {
    setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() + direction, 1));
  };

  const days = [];
  for (let i = 0; i < firstDayOfMonth; i++) {
    days.push(<div key={`empty-${i}`} className="h-6"></div>);
  }
  
  for (let day = 1; day <= daysInMonth; day++) {
    const isToday = day === currentDate.getDate() && 
                   currentDate.getMonth() === new Date().getMonth() &&
                   currentDate.getFullYear() === new Date().getFullYear();
    const hasEvent = [7, 8, 11].includes(day); // Mock events
    
    days.push(
      <div key={day} className={`h-6 flex items-center justify-center text-xs font-mono relative ${
        isToday ? 'bg-red-600 text-white' : 'text-gray-300'
      }`}>
        {day}
        {hasEvent && (
          <div className="absolute bottom-0 left-1/2 transform -translate-x-1/2">
            <div className="w-1 h-1 bg-green-400"></div>
          </div>
        )}
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* Calendar Header */}
      <div className="flex items-center justify-between">
        <button onClick={() => navigateMonth(-1)} className="text-gray-400 hover:text-white">
          <svg className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
            <path d="m15 18-6-6 6-6"></path>
          </svg>
        </button>
        <h3 className="text-sm font-bold text-white font-mono">
          {monthNames[currentDate.getMonth()]} {currentDate.getFullYear()}
        </h3>
        <button onClick={() => navigateMonth(1)} className="text-gray-400 hover:text-white">
          <svg className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
            <path d="m9 18 6-6-6-6"></path>
          </svg>
        </button>
      </div>

      {/* Calendar Days Header */}
      <div className="grid grid-cols-7 gap-1">
        {['S', 'M', 'T', 'W', 'T', 'F', 'S'].map(day => (
          <div key={day} className="h-6 flex items-center justify-center text-xs font-mono text-gray-400">
            {day}
          </div>
        ))}
      </div>

      {/* Calendar Days */}
      <div className="grid grid-cols-7 gap-1">
        {days}
      </div>

      {/* Bottom Row with 3 Columns */}
      <div className="grid grid-cols-3 gap-4 pt-4 border-t border-gray-800">
        {/* Upcoming Events */}
        <div className="space-y-2">
          <h4 className="text-xs font-bold text-gray-400 font-mono">UPCOMING</h4>
          <div className="text-xs text-gray-500 font-mono">No upcoming events</div>
        </div>

        {/* Tactical Timer */}
        <div className="space-y-2">
          <div className="flex items-center gap-2">
            <svg className="h-4 w-4 text-orange-500" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
              <circle cx="12" cy="12" r="10"></circle>
              <polyline points="12 6 12 12 16 14"></polyline>
            </svg>
            <h4 className="text-xs font-bold text-gray-400 font-mono">TACTICAL TIMER</h4>
          </div>
          <div className="text-xs text-white font-mono">{timerMode}</div>
          <div className="flex items-center gap-2">
            <div className="flex gap-1">
              {formatTime(timeLeft).split(' : ').map((part, index) => (
                <div key={index} className="w-8 h-8 bg-gray-800 flex items-center justify-center text-sm font-mono text-white">
                  {part}
                </div>
              ))}
            </div>
            <div className="flex gap-1">
              <button 
                onClick={timerRunning ? stopTimer : startTimer}
                className={`transition-colors ${
                  timerRunning ? 'text-red-400 hover:text-red-300' : 'text-green-400 hover:text-green-300'
                }`}
              >
                {timerRunning ? (
                  <svg className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
                    <rect x="6" y="4" width="4" height="16"></rect>
                    <rect x="14" y="4" width="4" height="16"></rect>
                  </svg>
                ) : (
                  <svg className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
                    <polygon points="5 3 19 12 5 21 5 3"></polygon>
                  </svg>
                )}
              </button>
              <button 
                onClick={resetTimer}
                className="text-gray-400 hover:text-gray-300 transition-colors"
              >
                <svg className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
                  <path d="M3 12a9 9 0 1 0 9-9 9.75 9.75 0 0 0-6.74 2.74L3 8"></path>
                  <path d="M3 3v5h5"></path>
                </svg>
              </button>
            </div>
          </div>
          <div className="flex gap-1">
            {(['FOCUS', 'BREAK', 'DEBRIEF'] as const).map((mode) => (
              <button
                key={mode}
                onClick={() => changeTimerMode(mode)}
                className={`flex-1 text-xs font-mono px-2 py-1 ${
                  timerMode === mode 
                    ? 'bg-orange-500 text-white' 
                    : 'bg-gray-800 text-gray-400 hover:text-gray-300'
                }`}
              >
                {mode}
              </button>
            ))}
          </div>
        </div>

        {/* World Clock */}
        <div className="space-y-2">
          <div className="flex items-center gap-2">
            <svg className="h-4 w-4 text-blue-500" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
              <circle cx="12" cy="12" r="10"></circle>
              <polyline points="12 6 12 12 16 14"></polyline>
            </svg>
            <h4 className="text-xs font-bold text-gray-400 font-mono">WORLD CLOCK</h4>
          </div>
          <div className="space-y-1">
            {worldClocks.map((clock) => {
              const time = useLiveTime(clock.offset);
              return (
                <div key={clock.city} className="flex items-center justify-between text-xs font-mono">
                  <span className="text-gray-400">{clock.city}:</span>
                  <div className="flex items-center gap-1">
                    <span className="text-white font-bold">{time.toLocaleTimeString('en-US', { 
                      hour12: false, 
                      hour: '2-digit', 
                      minute: '2-digit', 
                      second: '2-digit' 
                    })}</span>
                    <span className="text-gray-500">{clock.icon}</span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
}

// Todo Component
type Todo = {
  id: number;
  title: string;
  description: string;
  agent: string;
  dueDate: string;
  priority: string;
  completed: boolean;
};

const AGENT_OPTIONS = [
  { label: 'Ghost', value: 'Ghost', color: 'text-purple-400', bg: 'bg-gray-800' },
  { label: 'CEO', value: 'CEO', color: 'text-green-400', bg: 'bg-gray-800' },
];
const PRIORITY_OPTIONS = [
  { label: 'LOW', value: 'LOW', color: 'bg-green-400/10 text-green-400' },
  { label: 'MEDIUM', value: 'MEDIUM', color: 'bg-yellow-400/10 text-yellow-400' },
  { label: 'HIGH', value: 'HIGH', color: 'bg-red-400/10 text-red-400' },
];

const PRIORITY_ORDER = { 'HIGH': 3, 'MEDIUM': 2, 'LOW': 1 };

function getLocalTodos(): Todo[] {
  try {
    return JSON.parse(localStorage.getItem('vhq_todos') || '[]');
  } catch {
    return [];
  }
}
function setLocalTodos(todos: Todo[]) {
  localStorage.setItem('vhq_todos', JSON.stringify(todos));
}

function formatDate(input: string): string {
  const digits = input.replace(/\D/g, '');
  if (digits.length === 0) return '';
  if (digits.length === 1) return digits;
  if (digits.length === 2) return digits;
  if (digits.length === 3) return `${digits.slice(0, 2)}/${digits.slice(2)}`;
  if (digits.length >= 4) return `${digits.slice(0, 2)}/${digits.slice(2, 4)}`;
  return input;
}

function isValidDate(dateStr: string): boolean {
  if (!dateStr || dateStr.length < 4) return false;
  const [day, month] = dateStr.split('/');
  const dayNum = parseInt(day);
  const monthNum = parseInt(month);
  if (isNaN(dayNum) || isNaN(monthNum)) return false;
  if (monthNum < 1 || monthNum > 12) return false;
  if (dayNum < 1 || dayNum > 31) return false;
  const now = new Date();
  const currentYear = now.getFullYear();
  const inputDate = new Date(currentYear, monthNum - 1, dayNum);
  const today = new Date(currentYear, now.getMonth(), now.getDate());
  return inputDate >= today;
}

function renderTextWithAgents(text: string) {
  const parts = text.split(/(@Ghost|@CEO|@ghost|@ceo)/gi);
  return parts.map((part, index) => {
    const agentMatch = part.match(/@(Ghost|CEO|ghost|ceo)/i);
    if (agentMatch) {
      const agentName = agentMatch[1].toUpperCase();
      const agent = AGENT_OPTIONS.find(a => a.value.toUpperCase() === agentName);
      if (agent) {
        return (
          <span key={index} className={`inline-flex items-center gap-1 px-1 rounded ${agent.color} ${agent.bg}`}>
            {agent.value === 'Ghost' && (
              <svg className="h-3 w-3" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
                <path d="M9 10h.01"></path>
                <path d="M15 10h.01"></path>
                <path d="M12 2a8 8 0 0 0-8 8v12l3-3 2.5 2.5L12 19l2.5 2.5L17 19l3 3V10a8 8 0 0 0-8-8z"></path>
              </svg>
            )}
            {agent.value === 'CEO' && (
              <svg className="h-3 w-3" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
                <circle cx="12" cy="12" r="10"></circle>
                <path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2"></path>
                <circle cx="9" cy="7" r="4"></circle>
              </svg>
            )}
            <span className="text-xs font-mono">{agent.value}</span>
          </span>
        );
      }
    }
    return part;
  });
}

function PersonalTodo() {
  const [todos, setTodos] = useState<Todo[]>([]);
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [dueDate, setDueDate] = useState("");
  const [priority, setPriority] = useState("LOW");
  const [showDetails, setShowDetails] = useState(false);

  useEffect(() => {
    setTodos(getLocalTodos());
  }, []);
  useEffect(() => {
    setLocalTodos(todos);
  }, [todos]);

  function addTodo() {
    if (!title.trim()) return;
    if (dueDate && !isValidDate(dueDate)) {
      alert('Please enter a valid future date (DD/MM format)');
      return;
    }
    
    setTodos([
      {
        id: Date.now(),
        title: title.trim(),
        description: description.trim(),
        agent: "",
        dueDate,
        priority,
        completed: false,
      },
      ...todos,
    ]);
    setTitle("");
    setDescription("");
    setDueDate("");
    setPriority("LOW");
    setShowDetails(false);
  }

  function handleDateChange(value: string) {
    const formatted = formatDate(value);
    setDueDate(formatted);
  }

  function handleKeyDown(e: React.KeyboardEvent) {
    if (e.key === 'Enter' && e.ctrlKey) {
      e.preventDefault();
      addTodo();
    }
  }

  function toggleTodo(id: number) {
    setTodos(todos.map(t => t.id === id ? { ...t, completed: !t.completed } : t));
  }
  function deleteTodo(id: number) {
    setTodos(todos.filter(t => t.id !== id));
  }
  
  const pending = todos
    .filter(t => !t.completed)
    .sort((a, b) => {
      const priorityDiff = (PRIORITY_ORDER[b.priority as keyof typeof PRIORITY_ORDER] || 0) - 
                          (PRIORITY_ORDER[a.priority as keyof typeof PRIORITY_ORDER] || 0);
      if (priorityDiff !== 0) return priorityDiff;
      return b.id - a.id;
    });
  const completed = todos.filter(t => t.completed);

  return (
    <div className="bg-gradient-to-b from-gray-900 to-black border border-gray-800 p-2 h-[460px] flex flex-col overflow-hidden">
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center space-x-2">
          <svg className="h-5 w-5 text-green-600" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
            <path d="M21 10.656V19a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h12.344"></path>
            <path d="m9 11 3 3L22 4"></path>
          </svg>
          <h2 className="text-lg font-bold text-white font-mono">PERSONAL TODO</h2>
        </div>
        <div className="text-xs text-gray-400 font-mono">{pending.length} PENDING</div>
      </div>
      
      <div className="space-y-2 mb-2">
        <div className="flex gap-2">
          <input 
            className="flex-1 h-8 px-2 bg-gray-800 border border-gray-700 text-white font-mono text-sm placeholder-gray-500" 
            placeholder="Task title... @Ghost @CEO (Ctrl+Enter)" 
            type="text" 
            value={title} 
            onChange={e => setTitle(e.target.value)} 
            onKeyDown={handleKeyDown}
          />
          <button 
            className="inline-flex items-center justify-center whitespace-nowrap text-sm font-medium transition-all disabled:pointer-events-none disabled:opacity-50 [&_svg]:pointer-events-none [&_svg:not([class*='size-'])]:size-4 shrink-0 [&_svg]:shrink-0 outline-none focus-visible:border-ring focus-visible:ring-ring/50 focus-visible:ring-[3px] aria-invalid:ring-destructive/20 dark:aria-invalid:ring-destructive/40 aria-invalid:border-destructive shadow-sm h-8 gap-1.5 px-3 has-[&>svg]:px-2.5 bg-green-600 hover:bg-green-700 text-white font-mono min-h-[32px]" 
            onClick={addTodo}
          >
            <svg className="h-4 w-4 mr-1" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
              <path d="M5 12h14"></path>
              <path d="M12 5v14"></path>
            </svg>ADD
          </button>
        </div>
        
        <div className="flex items-center justify-between">
          <button 
            className="flex items-center gap-1 text-xs text-gray-400 hover:text-gray-300 transition-colors font-mono" 
            onClick={() => setShowDetails(!showDetails)}
          >
            <svg className="h-3 w-3" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
              <path d="m9 18 6-6-6-6"></path>
            </svg>
            {showDetails ? 'Hide Details' : 'Add Details'}
          </button>
          <div className="text-xs text-gray-500 font-mono">
            Use @Ghost or @CEO (any case) to tag agents
          </div>
        </div>
        
        {showDetails && (
          <div className="space-y-3 p-2 bg-gray-800/30 rounded border border-gray-700/50">
            <div className="flex gap-3">
              <div className="flex items-center gap-2">
                <span className="text-xs text-gray-400 font-mono">Priority:</span>
                <select 
                  className="w-20 h-6 px-1 bg-gray-800 border border-gray-700 text-white font-mono text-xs text-center" 
                  value={priority} 
                  onChange={e => setPriority(e.target.value)}
                >
                  {PRIORITY_OPTIONS.map(p => <option key={p.value} value={p.value}>{p.label}</option>)}
                </select>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-xs text-gray-400 font-mono">Due:</span>
                <input 
                  className="w-16 h-6 px-2 bg-gray-800 border border-gray-700 text-white font-mono text-xs text-center" 
                  placeholder="DD/MM" 
                  type="text" 
                  value={dueDate} 
                  onChange={e => handleDateChange(e.target.value)}
                  maxLength={5}
                />
              </div>
            </div>
            
            <div className="space-y-1">
              <span className="text-xs text-gray-400 font-mono">Description:</span>
              <textarea 
                className="w-full h-16 px-2 py-1 bg-gray-800 border border-gray-700 text-white font-mono text-xs placeholder-gray-500 resize-none" 
                placeholder="Add detailed description..." 
                value={description} 
                onChange={e => setDescription(e.target.value)}
              />
            </div>
          </div>
        )}
      </div>
      
      <div className="flex-1 flex flex-col min-h-0 overflow-hidden">
        <h3 className="text-sm font-bold text-gray-400 font-mono mb-2 flex-shrink-0">PENDING ({pending.length})</h3>
        <div className="flex-1 overflow-y-auto space-y-1 pr-1 min-h-0">
          {pending.map(todo => (
            <div key={todo.id} className="border border-gray-800 rounded p-2 hover:bg-gray-800/30 transition-colors">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-3 flex-1 min-w-0">
                  <button className="text-gray-400 hover:text-green-400 transition-colors flex-shrink-0" onClick={() => toggleTodo(todo.id)}>
                    <svg className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
                      <rect width="18" height="18" x="3" y="3" rx="2"></rect>
                    </svg>
                  </button>
                  <div className="flex-1 min-w-0">
                    <div className="text-sm text-white font-mono break-words">
                      {renderTextWithAgents(todo.title)}
                    </div>
                    {todo.description && (
                      <div className="text-xs text-gray-400 font-mono break-words mt-1 italic">
                        {todo.description}
                      </div>
                    )}
                    <div className="flex items-center gap-3 mt-1">
                      {todo.dueDate && (
                        <div className="flex items-center gap-1 text-xs text-gray-400 font-mono">
                          <svg className="h-3 w-3" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
                            <path d="M8 2v4"></path>
                            <path d="M16 2v4"></path>
                            <rect width="18" height="18" x="3" y="4" rx="2"></rect>
                            <path d="M3 10h18"></path>
                          </svg> {todo.dueDate}
                        </div>
                      )}
                      {todo.priority && (
                        <div className={`flex items-center gap-1 text-xs font-mono px-2 py-1 rounded ${PRIORITY_OPTIONS.find(p => p.value === todo.priority)?.color || ''}`}>
                          <svg className="h-3 w-3" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
                            <circle cx="12" cy="12" r="10"></circle>
                            <polyline points="12 6 12 12 16 14"></polyline>
                          </svg>{todo.priority}
                        </div>
                      )}
                    </div>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <button className="text-red-400 hover:text-red-200 transition-colors flex-shrink-0" onClick={() => deleteTodo(todo.id)}>
                    <svg className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
                      <path d="M18 6 6 18"></path>
                      <path d="m6 6 12 12"></path>
                    </svg>
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
      <div className="mt-2 pt-2 border-t border-gray-800">
        <button className="flex items-center justify-between w-full text-sm font-bold text-gray-400 font-mono mb-2 hover:text-gray-300 transition-colors">
          <span>COMPLETED ({completed.length})</span>
          <svg className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
            <path d="m9 18 6-6-6-6"></path>
          </svg>
        </button>
        <div className="flex items-center justify-between p-2 opacity-60 bg-gray-800/30 rounded flex-wrap">
          {completed.length === 0 && <div className="text-gray-500 font-mono">No completed todos</div>}
          {completed.map(todo => (
            <div key={todo.id} className="flex items-center space-x-3 flex-1 min-w-0 mb-2">
              <svg className="h-4 w-4 text-green-400 flex-shrink-0" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
                <path d="M21 10.656V19a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h12.344"></path>
                <path d="m9 11 3 3L22 4"></path>
              </svg>
              <div className="flex-1 min-w-0">
                <div className="text-sm text-gray-400 font-mono line-through break-words">
                  {renderTextWithAgents(todo.title)}
                </div>
                {todo.description && (
                  <div className="text-xs text-gray-500 font-mono line-through break-words mt-1 italic">
                    {todo.description}
                  </div>
                )}
              </div>
              <button className="text-blue-400 hover:text-blue-200 transition-colors flex-shrink-0" title="Restore task" onClick={() => toggleTodo(todo.id)}>
                <svg className="h-3 w-3" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
                  <path d="M3 12a9 9 0 1 0 9-9 9.75 9.75 0 0 0-6.74 2.74L3 8"></path>
                  <path d="M3 3v5h5"></path>
                </svg>
              </button>
              <button className="text-red-400 hover:text-red-200 transition-colors flex-shrink-0" title="Delete task" onClick={() => deleteTodo(todo.id)}>
                <svg className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
                  <path d="M18 6 6 18"></path>
                  <path d="m6 6 12 12"></path>
                </svg>
              </button>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

// Navigation Component with Collapsible Drawer
// Navigation component removed - now handled globally by Layout component

// Main Dashboard Component
export default function Dashboard() {
  return (
    <div className="h-screen bg-black text-white overflow-hidden w-full">
      {/* Main Dashboard Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-1 h-[calc(100vh-4rem)] p-1 w-full">
        {/* Left Column */}
        <div className="flex flex-col gap-1">
          {/* Calendar Card with integrated World Clock and Timer */}
          <div className="bg-gradient-to-b from-gray-900 to-black border border-gray-800 p-3 h-[460px] flex flex-col overflow-hidden">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center space-x-2">
                <svg className="h-5 w-5 text-blue-600" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
                  <path d="M8 2v4"></path>
                  <path d="M16 2v4"></path>
                  <rect width="18" height="18" x="3" y="4" rx="2"></rect>
                  <path d="M3 10h18"></path>
                </svg>
                <h2 className="text-lg font-bold text-white font-mono">CALENDAR & SYSTEM</h2>
              </div>
            </div>
            <Calendar />
          </div>

          {/* Personal TODO */}
          <PersonalTodo />
        </div>

        {/* Right Column */}
        <div className="flex flex-col gap-1">
          {/* Task Queue */}
          <div className="bg-gradient-to-b from-gray-900 to-black border border-gray-800 p-3 h-[460px] flex flex-col overflow-hidden">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center space-x-2">
                <svg className="h-5 w-5 text-red-600" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
                  <path d="M21 10.656V19a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h12.344"></path>
                  <path d="m9 11 3 3L22 4"></path>
                </svg>
                <h2 className="text-lg font-bold text-white font-mono">TASK QUEUE</h2>
              </div>
              <button className="inline-flex items-center justify-center whitespace-nowrap text-sm font-medium transition-all disabled:pointer-events-none disabled:opacity-50 [&_svg]:pointer-events-none [&_svg:not([class*='size-'])]:size-4 shrink-0 [&_svg]:shrink-0 outline-none focus-visible:border-ring focus-visible:ring-ring/50 focus-visible:ring-[3px] aria-invalid:ring-destructive/20 dark:aria-invalid:ring-destructive/40 aria-invalid:border-destructive shadow-sm h-8 gap-1.5 px-3 has-[&>svg]:px-2.5 bg-red-600 hover:bg-red-700 text-white font-mono min-h-[32px]">
                <svg className="h-4 w-4 mr-1" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
                  <path d="M5 12h14"></path>
                  <path d="M12 5v14"></path>
                </svg>ADD
              </button>
            </div>
            <div className="space-y-3 mb-6">
              <h3 className="text-sm font-bold text-gray-400 font-mono">PENDING (4)</h3>
              <div className="space-y-2">
                <div className="border border-gray-800 p-2">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-3">
                      <div className="w-2 h-2 bg-red-400"></div>
                      <span className="text-sm text-white font-mono">Process audio files</span>
                    </div>
                    <span className="text-xs text-gray-400 font-mono">HIGH</span>
                  </div>
                </div>
                <div className="border border-gray-800 p-2">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-3">
                      <div className="w-2 h-2 bg-yellow-400"></div>
                      <span className="text-sm text-white font-mono">Generate content</span>
                    </div>
                    <span className="text-xs text-gray-400 font-mono">MEDIUM</span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Project Timeline */}
          <div className="bg-gradient-to-b from-gray-900 to-black border border-gray-800 p-3 h-[460px] flex flex-col overflow-hidden">
            <div className="flex items-center space-x-2 mb-4">
              <svg className="h-5 w-5 text-red-600" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
                <circle cx="12" cy="12" r="10"></circle>
                <polyline points="12 6 12 12 16 14"></polyline>
              </svg>
              <h2 className="text-lg font-bold text-white font-mono">PROJECT TIMELINE</h2>
            </div>
            <div className="space-y-4">
              <div className="space-y-2">
                <h3 className="text-sm font-bold text-gray-400 font-mono">CURRENT</h3>
                <div className="border border-gray-800 p-2">
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-white font-mono">VHQ Dashboard Development</span>
                    <span className="text-xs text-green-400 font-mono">75%</span>
                  </div>
                  <div className="w-full bg-gray-800 h-1 mt-2">
                    <div className="bg-green-400 h-1" style={{ width: '75%' }}></div>
                  </div>
                </div>
              </div>
              <div className="space-y-2">
                <h3 className="text-sm font-bold text-gray-400 font-mono">UPCOMING</h3>
                <div className="border border-gray-800 p-2">
                  <span className="text-sm text-white font-mono">Agent Integration</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
} 