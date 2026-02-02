import { useState } from 'react';
import { Sunset, X } from 'lucide-react';
import type { useGameState } from '../hooks/useGameState';
import type { Stats } from '../types';

interface EndOfDayDialogProps {
  gameState: ReturnType<typeof useGameState>;
  isOpen: boolean;
  onClose: () => void;
  onDayEnd?: (title: string, message: string, dayQuality: 'poor' | 'good' | 'excellent') => void;
}

const STAT_LABELS: Record<keyof Stats, string> = {
  focus: '🎯 Фокус',
  discipline: '💪 Дисциплина',
  energy: '⚡ Энергия',
  motivation: '🔥 Мотивация',
  timeManagement: '⏰ Тайм-менеджмент',
  study: '📚 Учёба',
  emotionalStability: '😊 Эмоциональность',
  sport: '🏃 Спорт'
};

export function EndOfDayDialog({ gameState, isOpen, onClose, onDayEnd }: EndOfDayDialogProps) {
  const { state, endDay, getTodayStudyTime } = gameState;
  const [impressions, setImpressions] = useState('');
  const [weight, setWeight] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [dailyState, setDailyState] = useState<Stats>({ ...state.stats });

  const todayMinutes = getTodayStudyTime();
  const todayHours = Math.floor(todayMinutes / 60);
  const todayMins = todayMinutes % 60;

  const handleStatChange = (stat: keyof Stats, value: number) => {
    setDailyState(prev => ({
      ...prev,
      [stat]: Math.max(0, Math.min(100, value))
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!impressions.trim()) return;

    setIsSubmitting(true);
    try {
      endDay(impressions, dailyState, weight ? parseFloat(weight) : undefined);
      
      // Determine day quality based on stats
      const avgDailyState = Object.values(dailyState).reduce((a, b) => a + b, 0) / Object.keys(dailyState).length;
      let dayQuality: 'poor' | 'good' | 'excellent' = 'good';
      
      if (avgDailyState < 40) {
        dayQuality = 'poor';
      } else if (avgDailyState >= 70) {
        dayQuality = 'excellent';
      }

      // Show day end notification
      if (onDayEnd) {
        const titles = {
          poor: 'Сложный день',
          good: 'Хороший день',
          excellent: 'Отличный день!'
        };
        onDayEnd(titles[dayQuality], '', dayQuality);
      }

      setImpressions('');
      setWeight('');
      setDailyState({ ...state.stats });
      onClose();
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-gray-900 rounded-xl border border-gray-800 max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="sticky top-0 flex items-center justify-between bg-red-900 border-b border-gray-800 p-6">
          <div className="flex items-center gap-3">
            <Sunset className="h-6 w-6 text-orange-400" />
            <h2 className="text-2xl font-bold">Итоги дня #{state.currentDay}</h2>
          </div>
          <button
            onClick={onClose}
            className="rounded-lg p-2 hover:bg-gray-800 transition-all"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 space-y-6">
          {/* Statistics */}
          <div className="grid gap-4 md:grid-cols-2">
            <div className="rounded-lg bg-gray-800/50 border border-gray-700/50 p-4">
              <p className="text-sm text-gray-400 mb-2">Время учёбы</p>
              <p className="text-3xl font-bold text-cyan-300">{todayHours}ч {todayMins}м</p>
            </div>
            <div className="rounded-lg bg-gray-800/50 border border-gray-700/50 p-4">
              <p className="text-sm text-gray-400 mb-2">Уровень</p>
              <p className="text-3xl font-bold text-purple-300">{state.level}</p>
            </div>
            <div className="rounded-lg bg-gray-800/50 border border-gray-700/50 p-4">
              <p className="text-sm text-gray-400 mb-2">Опыт</p>
              <p className="text-3xl font-bold text-yellow-300">{state.xp}</p>
            </div>
            <div className="rounded-lg bg-gray-800/50 border border-gray-700/50 p-4">
              <p className="text-sm text-gray-400 mb-2">Золото</p>
              <p className="text-3xl font-bold text-yellow-400">{state.gold}</p>
            </div>
          </div>

          {/* Daily State Selection - Как ты себя чувствовал сегодня */}
          <div className="rounded-lg bg-gray-800/30 border border-gray-700/50 p-4">
            <h3 className="text-lg font-semibold mb-4">Твоё состояние сегодня</h3>
            <p className="text-xs text-gray-500 mb-4">Оцени своё самочувствие за день (полосы показывают среднее между твоим состоянием и общей статистикой)</p>
            <div className="grid gap-4">
              {Object.entries(STAT_LABELS).map(([key, label]) => {
                const dailyValue = dailyState[key as keyof Stats];
                const currentValue = state.stats[key as keyof Stats];
                const averaged = Math.round((dailyValue + currentValue) / 2);
                
                return (
                  <div key={key} className="space-y-2">
                    <div className="flex items-center justify-between">
                      <label className="text-sm font-medium text-gray-400">{label}</label>
                      <div className="flex items-center gap-2">
                        <span className="text-xs text-gray-500">Было: {currentValue}</span>
                        <span className="text-sm font-bold text-purple-300">Сегодня: {dailyValue}</span>
                        <span className="text-xs text-gray-500">→ Среднее: {averaged}</span>
                      </div>
                    </div>
                    <input
                      type="range"
                      min="0"
                      max="100"
                      value={dailyValue}
                      onChange={e => handleStatChange(key as keyof Stats, parseInt(e.target.value))}
                      className="w-full h-2 bg-gray-700 rounded-lg appearance-none cursor-pointer accent-purple-500"
                    />
                  </div>
                );
              })}
            </div>
          </div>

          {/* Stats Summary */}
          <div className="rounded-lg bg-gray-800/30 border border-gray-700/50 p-4">
            <h3 className="text-lg font-semibold mb-4">Текущая статистика</h3>
            <div className="grid gap-3">
              {Object.entries(state.stats).map(([key, value]) => (
                <div key={key} className="flex items-center justify-between">
                  <span className="capitalize text-gray-400">{key}</span>
                  <div className="flex items-center gap-3">
                    <div className="h-2 w-32 rounded-full bg-gray-700 overflow-hidden">
                      <div
                        className="h-full bg-gradient-to-r from-blue-500 to-purple-500"
                        style={{ width: `${value}%` }}
                      />
                    </div>
                    <span className="text-sm font-bold text-gray-300 w-8">{value}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Impressions */}
          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Weight */}
            <div>
              <label className="block text-sm font-medium text-gray-400 mb-2">
                Твой вес (кг) 💪
              </label>
              <input
                type="number"
                step="0.1"
                value={weight}
                onChange={e => setWeight(e.target.value)}
                placeholder="Введи свой вес сегодня"
                className="w-full rounded-lg bg-gray-800 border border-gray-700 px-4 py-2 text-gray-100 placeholder-gray-500 focus:border-purple-500 focus:outline-none focus:ring-1 focus:ring-purple-500"
              />
              <p className="text-xs text-gray-500 mt-1">Пригодится для отслеживания прогресса в спорте</p>
            </div>

            {/* Impressions */}
            <div>
              <label className="block text-sm font-medium text-gray-400 mb-3">
                Впечатления о дне
              </label>
              <textarea
                value={impressions}
                onChange={e => setImpressions(e.target.value)}
                placeholder="Как прошёл твой день? Чего ты достиг? Что было сложного? Как себя чувствуешь?..."
                className="w-full rounded-lg bg-gray-800 border border-gray-700 px-4 py-3 text-gray-100 placeholder-gray-500 focus:border-purple-500 focus:outline-none focus:ring-1 focus:ring-purple-500 resize-none h-32"
              />
              <p className="text-xs text-gray-500 mt-2">Минимум несколько слов</p>
            </div>

            <div className="flex gap-3">
              <button
                type="button"
                onClick={onClose}
                className="flex-1 rounded-lg bg-gray-800 hover:bg-gray-700 text-gray-300 px-4 py-3 font-semibold transition-all"
              >
                Отмена
              </button>
              <button
                type="submit"
                disabled={!impressions.trim() || isSubmitting}
                className="flex-1 rounded-lg bg-gradient-to-r from-orange-600 to-red-600 hover:shadow-lg hover:shadow-orange-600/30 text-white px-4 py-3 font-semibold transition-all disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isSubmitting ? 'Сохраняю...' : 'Завершить день'}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
