import { useMemo } from 'react';
import { format, subDays, parseISO } from 'date-fns';
import { ru } from 'date-fns/locale';
import { 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  Tooltip, 
  ResponsiveContainer,
  LineChart,
  Line,
  PieChart,
  Pie,
  Cell
} from 'recharts';
import { TrendingUp, Calendar, Clock, Trophy, History } from 'lucide-react';
import type { useGameState } from '../hooks/useGameState';

interface ProgressPanelProps {
  gameState: ReturnType<typeof useGameState>;
}

const COLORS = ['#8b5cf6', '#06b6d4', '#10b981', '#f59e0b', '#ef4444', '#ec4899', '#6366f1'];

export function ProgressPanel({ gameState }: ProgressPanelProps) {
  const { state, getMonthStudyTime } = gameState;

  // Last 7 days study data
  const weekData = useMemo(() => {
    const today = new Date();
    const days: { date: string; label: string; hours: number }[] = [];
    
    for (let i = 6; i >= 0; i--) {
      const date = subDays(today, i);
      const dateStr = format(date, 'yyyy-MM-dd');
      const dayEntries = state.studyEntries.filter(e => e.date === dateStr);
      const totalMins = dayEntries.reduce((sum, e) => sum + e.hours * 60 + e.minutes, 0);
      
      days.push({
        date: dateStr,
        label: format(date, 'EEE', { locale: ru }),
        hours: Math.round(totalMins / 60 * 10) / 10
      });
    }
    
    return days;
  }, [state.studyEntries]);

  // Subject distribution for pie chart
  const subjectData = useMemo(() => {
    const subjectMap: Record<string, number> = {};
    
    state.studyEntries.forEach(entry => {
      const mins = entry.hours * 60 + entry.minutes;
      subjectMap[entry.subject] = (subjectMap[entry.subject] || 0) + mins;
    });
    
    return Object.entries(subjectMap)
      .map(([name, value]) => ({ name, value: Math.round(value / 60 * 10) / 10 }))
      .sort((a, b) => b.value - a.value)
      .slice(0, 7);
  }, [state.studyEntries]);

  // XP progress over time
  const xpData = useMemo(() => {
    const today = new Date();
    const days: { date: string; label: string; xp: number }[] = [];
    let cumulativeXP = 0;
    
    // Get all unique dates and sort them
    const dateSet = new Set<string>();
    state.studyEntries.forEach(e => dateSet.add(e.date));
    state.quests.filter(q => q.completed).forEach(q => {
      const date = format(parseISO(q.createdAt), 'yyyy-MM-dd');
      dateSet.add(date);
    });
    
    // Calculate cumulative XP for last 14 days
    for (let i = 13; i >= 0; i--) {
      const date = subDays(today, i);
      const dateStr = format(date, 'yyyy-MM-dd');
      
      const dayStudyXP = state.studyEntries
        .filter(e => e.date === dateStr)
        .reduce((sum, e) => sum + e.xpEarned, 0);
      
      cumulativeXP += dayStudyXP;
      
      days.push({
        date: dateStr,
        label: format(date, 'd MMM', { locale: ru }),
        xp: cumulativeXP
      });
    }
    
    return days;
  }, [state.studyEntries, state.quests]);

  const totalStudyHours = Math.round(getMonthStudyTime() / 60 * 10) / 10;
  const completedQuests = state.quests.filter(q => q.completed).length;
  const unlockedAchievements = state.achievements.filter(a => a.unlocked).length;

  return (
    <div className="space-y-6">
      {/* Summary Cards */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <div className="rounded-xl border border-purple-900/30 bg-gradient-to-br from-purple-900/20 to-indigo-900/20 p-5">
          <div className="flex items-center gap-3">
            <TrendingUp className="h-8 w-8 text-purple-400" />
            <div>
              <p className="text-sm text-gray-400">Уровень</p>
              <p className="text-3xl font-bold text-purple-300">{state.level}</p>
            </div>
          </div>
        </div>

        <div className="rounded-xl border border-cyan-900/30 bg-gradient-to-br from-cyan-900/20 to-blue-900/20 p-5">
          <div className="flex items-center gap-3">
            <Clock className="h-8 w-8 text-cyan-400" />
            <div>
              <p className="text-sm text-gray-400">Часов учёбы</p>
              <p className="text-3xl font-bold text-cyan-300">{totalStudyHours}</p>
            </div>
          </div>
        </div>

        <div className="rounded-xl border border-green-900/30 bg-gradient-to-br from-green-900/20 to-emerald-900/20 p-5">
          <div className="flex items-center gap-3">
            <Calendar className="h-8 w-8 text-green-400" />
            <div>
              <p className="text-sm text-gray-400">Квестов выполнено</p>
              <p className="text-3xl font-bold text-green-300">{completedQuests}</p>
            </div>
          </div>
        </div>

        <div className="rounded-xl border border-yellow-900/30 bg-gradient-to-br from-yellow-900/20 to-amber-900/20 p-5">
          <div className="flex items-center gap-3">
            <Trophy className="h-8 w-8 text-yellow-400" />
            <div>
              <p className="text-sm text-gray-400">Достижений</p>
              <p className="text-3xl font-bold text-yellow-300">
                {unlockedAchievements}/{state.achievements.length}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Charts */}
      <div className="grid gap-6 lg:grid-cols-2">
        {/* Weekly Study Chart */}
        <div className="rounded-xl border border-gray-800 bg-gray-900/50 p-6">
          <h3 className="text-lg font-semibold mb-4">Учёба за неделю (часы)</h3>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={weekData}>
                <XAxis 
                  dataKey="label" 
                  stroke="#6b7280" 
                  fontSize={12}
                  tickLine={false}
                />
                <YAxis 
                  stroke="#6b7280" 
                  fontSize={12}
                  tickLine={false}
                  axisLine={false}
                />
                <Tooltip
                  contentStyle={{
                    backgroundColor: '#1f2937',
                    border: '1px solid #374151',
                    borderRadius: '8px'
                  }}
                  labelStyle={{ color: '#9ca3af' }}
                />
                <Bar 
                  dataKey="hours" 
                  fill="url(#purpleGradient)" 
                  radius={[4, 4, 0, 0]}
                />
                <defs>
                  <linearGradient id="purpleGradient" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="#8b5cf6" />
                    <stop offset="100%" stopColor="#6366f1" />
                  </linearGradient>
                </defs>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* XP Progress Chart */}
        <div className="rounded-xl border border-gray-800 bg-gray-900/50 p-6">
          <h3 className="text-lg font-semibold mb-4">Прогресс XP (14 дней)</h3>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={xpData}>
                <XAxis 
                  dataKey="label" 
                  stroke="#6b7280" 
                  fontSize={10}
                  tickLine={false}
                />
                <YAxis 
                  stroke="#6b7280" 
                  fontSize={12}
                  tickLine={false}
                  axisLine={false}
                />
                <Tooltip
                  contentStyle={{
                    backgroundColor: '#1f2937',
                    border: '1px solid #374151',
                    borderRadius: '8px'
                  }}
                  labelStyle={{ color: '#9ca3af' }}
                />
                <Line 
                  type="monotone" 
                  dataKey="xp" 
                  stroke="#10b981" 
                  strokeWidth={2}
                  dot={{ fill: '#10b981', strokeWidth: 0, r: 4 }}
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Subject Distribution */}
        <div className="rounded-xl border border-gray-800 bg-gray-900/50 p-6">
          <h3 className="text-lg font-semibold mb-4">Распределение по предметам</h3>
          {subjectData.length > 0 ? (
            <div className="h-64 flex items-center">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={subjectData}
                    cx="50%"
                    cy="50%"
                    innerRadius={60}
                    outerRadius={80}
                    paddingAngle={5}
                    dataKey="value"
                  >
                    {subjectData.map((_, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip
                    contentStyle={{
                      backgroundColor: '#1f2937',
                      border: '1px solid #374151',
                      borderRadius: '8px'
                    }}
                    formatter={(value) => [`${value}ч`, '']}
                  />
                </PieChart>
              </ResponsiveContainer>
              <div className="space-y-2 min-w-32">
                {subjectData.map((item, index) => (
                  <div key={item.name} className="flex items-center gap-2 text-sm">
                    <div 
                      className="h-3 w-3 rounded-full" 
                      style={{ backgroundColor: COLORS[index % COLORS.length] }}
                    />
                    <span className="text-gray-400 truncate">{item.name}</span>
                    <span className="text-gray-500 ml-auto">{item.value}ч</span>
                  </div>
                ))}
              </div>
            </div>
          ) : (
            <div className="h-64 flex items-center justify-center text-gray-500">
              Нет данных
            </div>
          )}
        </div>

        {/* Season History */}
        <div className="rounded-xl border border-gray-800 bg-gray-900/50 p-6">
          <h3 className="flex items-center gap-2 text-lg font-semibold mb-4">
            <History className="h-5 w-5 text-gray-400" />
            История сезонов
          </h3>
          {state.seasonHistory.length > 0 ? (
            <div className="space-y-3 max-h-64 overflow-y-auto">
              {state.seasonHistory.map((season, index) => (
                <div
                  key={season.id}
                  className="rounded-lg bg-gray-800/50 p-4 border border-gray-700/50"
                >
                  <div className="flex items-center justify-between mb-2">
                    <span className="font-medium">Сезон {index + 1}</span>
                    <span className="text-sm text-gray-400">
                      {format(parseISO(season.startDate), 'd MMM', { locale: ru })} — {format(parseISO(season.endDate), 'd MMM yyyy', { locale: ru })}
                    </span>
                  </div>
                  <div className="grid grid-cols-4 gap-4 text-center">
                    <div>
                      <p className="text-xl font-bold text-purple-400">{season.finalLevel}</p>
                      <p className="text-xs text-gray-500">Уровень</p>
                    </div>
                    <div>
                      <p className="text-xl font-bold text-green-400">{season.totalDays}</p>
                      <p className="text-xs text-gray-500">Дней</p>
                    </div>
                    <div>
                      <p className="text-xl font-bold text-orange-400">{season.maxStreak}</p>
                      <p className="text-xs text-gray-500">Серия</p>
                    </div>
                    <div>
                      <p className="text-xl font-bold text-cyan-400">{season.totalStudyHours}ч</p>
                      <p className="text-xs text-gray-500">Учёба</p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="h-48 flex items-center justify-center text-gray-500">
              Это ваш первый сезон
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
