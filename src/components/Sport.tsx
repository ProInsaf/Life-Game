import { useState } from 'react';
import { Activity, Calendar, Weight, Zap, BarChart3 } from 'lucide-react';
import { useGameState } from '../hooks/useGameState';
import { format, parseISO } from 'date-fns';
import { ru } from 'date-fns/locale';
import type { SportActivityType } from '../types';

const ACTIVITY_TYPES: { type: SportActivityType; label: string; emoji: string }[] = [
  { type: 'running', label: 'Бег', emoji: '🏃' },
  { type: 'gym', label: 'Тренажёрный зал', emoji: '🏋️' },
  { type: 'pushups', label: 'Отжимания', emoji: '💪' },
  { type: 'pullups', label: 'Подтягивания', emoji: '🤸' },
  { type: 'cardio', label: 'Кардио', emoji: '🚴' },
  { type: 'stretching', label: 'Растяжка', emoji: '🧘' },
  { type: 'yoga', label: 'Йога', emoji: '🧘‍♀️' },
  { type: 'other', label: 'Другое', emoji: '⚽' },
];

export function Sport() {
  const { state, addSportEntry } = useGameState();
  const [newActivity, setNewActivity] = useState<{
    type: SportActivityType;
    duration: number;
    intensity: number;
    reps?: number;
    distance?: number;
    notes?: string;
  }>({
    type: 'gym',
    duration: 30,
    intensity: 3,
  });

  const handleAddActivity = (e: React.FormEvent) => {
    e.preventDefault();
    addSportEntry({
      date: format(new Date(), 'yyyy-MM-dd'),
      type: newActivity.type,
      duration: newActivity.duration,
      intensity: newActivity.intensity,
      reps: newActivity.reps,
      distance: newActivity.distance,
      notes: newActivity.notes,
    });

    setNewActivity({
      type: 'gym',
      duration: 30,
      intensity: 3,
    });
  };

  const todayActivities = state.sportEntries.filter(
    entry => entry.date === format(new Date(), 'yyyy-MM-dd')
  );

  const thisWeekActivities = state.sportEntries.filter(entry => {
    const entryDate = new Date(entry.date);
    const weekAgo = new Date();
    weekAgo.setDate(weekAgo.getDate() - 7);
    return entryDate >= weekAgo;
  });

  const totalMinutesToday = todayActivities.reduce((sum, a) => sum + a.duration, 0);
  const totalMinutesWeek = thisWeekActivities.reduce((sum, a) => sum + a.duration, 0);
  
  const latestWeight = state.bodyMetrics.length > 0
    ? state.bodyMetrics[state.bodyMetrics.length - 1].weight
    : null;

  const weightHistory = state.bodyMetrics.slice(-30); // Last 30 days
  const weightChange = weightHistory.length >= 2
    ? weightHistory[weightHistory.length - 1].weight - weightHistory[0].weight
    : null;

  const avgIntensityToday = todayActivities.length > 0
    ? Math.round(todayActivities.reduce((sum, a) => sum + a.intensity, 0) / todayActivities.length)
    : 0;

  return (
    <div className="space-y-6">
      {/* Stats Grid */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <div className="rounded-lg bg-gradient-to-br from-blue-900/20 to-cyan-900/20 border border-blue-700/30 p-4">
          <div className="flex items-center gap-3 mb-2">
            <Activity className="h-5 w-5 text-blue-400" />
            <span className="text-sm text-gray-400">Сегодня</span>
          </div>
          <p className="text-3xl font-bold text-blue-300">{totalMinutesToday}м</p>
          <p className="text-xs text-gray-500 mt-1">{todayActivities.length} активностей</p>
        </div>

        <div className="rounded-lg bg-gradient-to-br from-purple-900/20 to-pink-900/20 border border-purple-700/30 p-4">
          <div className="flex items-center gap-3 mb-2">
            <Zap className="h-5 w-5 text-purple-400" />
            <span className="text-sm text-gray-400">Интенсивность</span>
          </div>
          <p className="text-3xl font-bold text-purple-300">{avgIntensityToday}/5</p>
          <p className="text-xs text-gray-500 mt-1">Средняя за день</p>
        </div>

        <div className="rounded-lg bg-gradient-to-br from-green-900/20 to-emerald-900/20 border border-green-700/30 p-4">
          <div className="flex items-center gap-3 mb-2">
            <Calendar className="h-5 w-5 text-green-400" />
            <span className="text-sm text-gray-400">Неделя</span>
          </div>
          <p className="text-3xl font-bold text-green-300">{Math.round(totalMinutesWeek / 60)}ч {totalMinutesWeek % 60}м</p>
          <p className="text-xs text-gray-500 mt-1">{thisWeekActivities.length} активностей</p>
        </div>

        <div className="rounded-lg bg-gradient-to-br from-orange-900/20 to-red-900/20 border border-orange-700/30 p-4">
          <div className="flex items-center gap-3 mb-2">
            <Weight className="h-5 w-5 text-orange-400" />
            <span className="text-sm text-gray-400">Вес</span>
          </div>
          <p className="text-3xl font-bold text-orange-300">{latestWeight ? `${latestWeight}кг` : '—'}</p>
          {weightChange !== null && (
            <p className={`text-xs mt-1 ${weightChange <= 0 ? 'text-green-400' : 'text-red-400'}`}>
              {weightChange > 0 ? '+' : ''}{weightChange.toFixed(1)} кг за месяц
            </p>
          )}
        </div>
      </div>

      {/* Add New Activity */}
      <div className="rounded-lg bg-gray-800/50 border border-gray-700 p-6">
        <h3 className="text-lg font-semibold mb-4">Добавить активность</h3>
        <form onSubmit={handleAddActivity} className="space-y-4">
          <div className="grid gap-3">
            <div>
              <label className="block text-sm font-medium text-gray-400 mb-2">Тип активности</label>
              <select
                value={newActivity.type}
                onChange={e => setNewActivity({ ...newActivity, type: e.target.value as SportActivityType })}
                className="w-full rounded-lg bg-gray-700 border border-gray-600 px-4 py-2 text-gray-100 focus:border-purple-500 focus:outline-none"
              >
                {ACTIVITY_TYPES.map(({ type, label, emoji }) => (
                  <option key={type} value={type}>
                    {emoji} {label}
                  </option>
                ))}
              </select>
            </div>

            <div className="grid gap-3 md:grid-cols-3">
              <div>
                <label className="block text-sm font-medium text-gray-400 mb-2">Время (минут)</label>
                <input
                  type="number"
                  min="1"
                  max="480"
                  value={newActivity.duration}
                  onChange={e => setNewActivity({ ...newActivity, duration: parseInt(e.target.value) })}
                  className="w-full rounded-lg bg-gray-700 border border-gray-600 px-3 py-2 text-gray-100 focus:border-purple-500 focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-400 mb-2">Интенсивность (1-5)</label>
                <input
                  type="range"
                  min="1"
                  max="5"
                  value={newActivity.intensity}
                  onChange={e => setNewActivity({ ...newActivity, intensity: parseInt(e.target.value) })}
                  className="w-full accent-purple-500"
                />
                <p className="text-center text-sm text-gray-400 mt-1">{newActivity.intensity}/5</p>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-400 mb-2">Повторения (опционально)</label>
                <input
                  type="number"
                  min="0"
                  value={newActivity.reps || ''}
                  onChange={e => setNewActivity({ ...newActivity, reps: e.target.value ? parseInt(e.target.value) : undefined })}
                  placeholder="Кол-во"
                  className="w-full rounded-lg bg-gray-700 border border-gray-600 px-3 py-2 text-gray-100 focus:border-purple-500 focus:outline-none placeholder-gray-500"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-400 mb-2">Заметки</label>
              <input
                type="text"
                value={newActivity.notes || ''}
                onChange={e => setNewActivity({ ...newActivity, notes: e.target.value })}
                placeholder="Например: отличная тренировка, много энергии..."
                className="w-full rounded-lg bg-gray-700 border border-gray-600 px-3 py-2 text-gray-100 placeholder-gray-500 focus:border-purple-500 focus:outline-none"
              />
            </div>
          </div>

          <button
            type="submit"
            className="w-full rounded-lg bg-gradient-to-r from-purple-600 to-pink-600 hover:shadow-lg hover:shadow-purple-600/30 text-white px-4 py-3 font-semibold transition-all"
          >
            Добавить активность
          </button>
        </form>
      </div>

      {/* Today's Activities */}
      {todayActivities.length > 0 && (
        <div className="rounded-lg bg-gray-800/30 border border-gray-700/50 p-4">
          <h3 className="text-lg font-semibold mb-3">Сегодня ({todayActivities.length})</h3>
          <div className="space-y-2">
            {todayActivities.map(activity => {
              const activityInfo = ACTIVITY_TYPES.find(a => a.type === activity.type);
              return (
                <div key={activity.id} className="flex items-center justify-between rounded-lg bg-gray-900/50 p-3 border border-gray-700/50">
                  <div className="flex items-center gap-3">
                    <span className="text-xl">{activityInfo?.emoji}</span>
                    <div>
                      <p className="font-medium">{activityInfo?.label}</p>
                      <p className="text-xs text-gray-500">
                        {activity.duration}м • Интенсивность: {activity.intensity}/5
                        {activity.reps && ` • ${activity.reps} повторений`}
                      </p>
                    </div>
                  </div>
                  <span className="text-sm text-gray-400">{format(parseISO(activity.date), 'HH:mm')}</span>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Weekly Activity History */}
      <div className="rounded-lg bg-gray-800/30 border border-gray-700/50 p-4">
        <div className="flex items-center gap-2 mb-4">
          <BarChart3 className="h-5 w-5 text-purple-400" />
          <h3 className="text-lg font-semibold">История (7 дней)</h3>
        </div>

        {thisWeekActivities.length > 0 ? (
          <div className="space-y-2">
            {[...thisWeekActivities].reverse().map(activity => {
              const activityInfo = ACTIVITY_TYPES.find(a => a.type === activity.type);
              return (
                <div key={activity.id} className="flex items-center justify-between rounded-lg bg-gray-900/50 p-3 border border-gray-700/50">
                  <div className="flex items-center gap-3">
                    <span className="text-lg">{activityInfo?.emoji}</span>
                    <div>
                      <p className="font-medium text-sm">{activityInfo?.label}</p>
                      <p className="text-xs text-gray-500">
                        {activity.duration}м • Интенсивность: {activity.intensity}/5
                      </p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="text-xs text-gray-400">
                      {format(parseISO(activity.date), 'd MMM', { locale: ru })}
                    </p>
                  </div>
                </div>
              );
            })}
          </div>
        ) : (
          <p className="text-gray-500 text-center py-8">Пока нет активностей за неделю</p>
        )}
      </div>

      {/* Weight History */}
      {weightHistory.length > 0 && (
        <div className="rounded-lg bg-gray-800/30 border border-gray-700/50 p-4">
          <div className="flex items-center gap-2 mb-4">
            <Weight className="h-5 w-5 text-orange-400" />
            <h3 className="text-lg font-semibold">История веса (30 дней)</h3>
          </div>

          <div className="space-y-2">
            {[...weightHistory].reverse().map((metric, idx) => {
              const prevMetric = idx > 0 ? weightHistory[weightHistory.length - idx] : null;
              const change = prevMetric ? metric.weight - prevMetric.weight : null;

              return (
                <div key={metric.id} className="flex items-center justify-between rounded-lg bg-gray-900/50 p-3 border border-gray-700/50">
                  <div>
                    <p className="font-medium">{metric.weight} кг</p>
                    <p className="text-xs text-gray-500">
                      {format(parseISO(metric.date), 'd MMMM yyyy', { locale: ru })}
                    </p>
                  </div>
                  {change !== null && (
                    <span className={`font-bold ${change < 0 ? 'text-green-400' : change > 0 ? 'text-red-400' : 'text-gray-400'}`}>
                      {change > 0 ? '+' : ''}{change.toFixed(1)}
                    </span>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}
