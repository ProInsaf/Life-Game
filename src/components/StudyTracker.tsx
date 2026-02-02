import { useState } from 'react';
import { format } from 'date-fns';
import { BookOpen, Clock, Plus, BookMarked, Code, Sparkles } from 'lucide-react';
import { SUBJECTS } from '../types';
import type { useGameState } from '../hooks/useGameState';

interface StudyTrackerProps {
  gameState: ReturnType<typeof useGameState>;
}

export function StudyTracker({ gameState }: StudyTrackerProps) {
  const { state, addStudyEntry, getTodayStudyTime, getWeekStudyTime, getMonthStudyTime } = gameState;

  const [subject, setSubject] = useState(SUBJECTS[0]);
  const [type, setType] = useState<'theory' | 'practice'>('theory');
  const [hours, setHours] = useState(0);
  const [minutes, setMinutes] = useState(30);
  const [comment, setComment] = useState('');
  const [quality, setQuality] = useState(3); // 1-5
  const [focus, setFocus] = useState(3); // 1-5
  const [efficiency, setEfficiency] = useState(3); // 1-5
  const [lastXP, setLastXP] = useState<number | null>(null);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (hours === 0 && minutes === 0) return;

    const xpEarned = addStudyEntry({
      date: format(new Date(), 'yyyy-MM-dd'),
      subject,
      type,
      hours,
      minutes,
      comment: comment || undefined,
      quality,
      focus,
      efficiency
    });

    setLastXP(xpEarned);
    setHours(0);
    setMinutes(30);
    setComment('');
    setQuality(3);
    setFocus(3);
    setEfficiency(3);

    setTimeout(() => setLastXP(null), 3000);
  };

  const todayMinutes = getTodayStudyTime();
  const weekMinutes = getWeekStudyTime();
  const monthMinutes = getMonthStudyTime();

  const formatTime = (mins: number) => {
    const h = Math.floor(mins / 60);
    const m = mins % 60;
    return `${h}ч ${m}м`;
  };

  // Get today's entries
  const today = format(new Date(), 'yyyy-MM-dd');
  const todayEntries = state.studyEntries.filter(e => e.date === today);

  // Subject stats
  const subjectStats = SUBJECTS.map(sub => {
    const entries = state.studyEntries.filter(e => e.subject === sub);
    const totalMins = entries.reduce((sum, e) => sum + e.hours * 60 + e.minutes, 0);
    return { subject: sub, totalMins, count: entries.length };
  }).filter(s => s.count > 0).sort((a, b) => b.totalMins - a.totalMins);

  return (
    <div className="space-y-6">
      {/* Stats Cards */}
      <div className="grid gap-4 md:grid-cols-3">
        <div className="rounded-xl border border-cyan-900/30 bg-gradient-to-br from-cyan-900/20 to-blue-900/20 p-5">
          <div className="flex items-center gap-3">
            <Clock className="h-8 w-8 text-cyan-400" />
            <div>
              <p className="text-sm text-gray-400">Сегодня</p>
              <p className="text-2xl font-bold text-cyan-300">{formatTime(todayMinutes)}</p>
            </div>
          </div>
        </div>

        <div className="rounded-xl border border-purple-900/30 bg-gradient-to-br from-purple-900/20 to-indigo-900/20 p-5">
          <div className="flex items-center gap-3">
            <Clock className="h-8 w-8 text-purple-400" />
            <div>
              <p className="text-sm text-gray-400">За неделю</p>
              <p className="text-2xl font-bold text-purple-300">{formatTime(weekMinutes)}</p>
            </div>
          </div>
        </div>

        <div className="rounded-xl border border-green-900/30 bg-gradient-to-br from-green-900/20 to-emerald-900/20 p-5">
          <div className="flex items-center gap-3">
            <Clock className="h-8 w-8 text-green-400" />
            <div>
              <p className="text-sm text-gray-400">За месяц</p>
              <p className="text-2xl font-bold text-green-300">{formatTime(monthMinutes)}</p>
            </div>
          </div>
        </div>
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        {/* Add Study Entry */}
        <div className="rounded-xl border border-gray-800 bg-gray-900/50 p-6">
          <h2 className="flex items-center gap-2 text-xl font-semibold mb-6">
            <Plus className="h-5 w-5 text-green-400" />
            Добавить запись
          </h2>

          {lastXP && (
            <div className="mb-4 flex items-center justify-center gap-2 rounded-lg bg-green-900/30 p-3 border border-green-700/50 animate-pulse">
              <Sparkles className="h-5 w-5 text-green-400" />
              <span className="font-bold text-green-400">+{lastXP} XP!</span>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Subject */}
            <div>
              <label className="block text-sm font-medium text-gray-400 mb-2">Предмет</label>
              <select
                value={subject}
                onChange={e => setSubject(e.target.value)}
                className="w-full rounded-lg bg-gray-800 border border-gray-700 px-4 py-3 text-gray-100 focus:border-purple-500 focus:outline-none focus:ring-1 focus:ring-purple-500"
              >
                {SUBJECTS.map(s => (
                  <option key={s} value={s}>{s}</option>
                ))}
              </select>
            </div>

            {/* Type */}
            <div>
              <label className="block text-sm font-medium text-gray-400 mb-2">Тип</label>
              <div className="grid grid-cols-2 gap-2">
                <button
                  type="button"
                  onClick={() => setType('theory')}
                  className={`flex items-center justify-center gap-2 rounded-lg px-4 py-3 transition-all ${
                    type === 'theory'
                      ? 'bg-blue-600/30 text-blue-300 border border-blue-600/50'
                      : 'bg-gray-800 text-gray-400 border border-gray-700 hover:bg-gray-700'
                  }`}
                >
                  <BookMarked className="h-4 w-4" />
                  Теория
                </button>
                <button
                  type="button"
                  onClick={() => setType('practice')}
                  className={`flex items-center justify-center gap-2 rounded-lg px-4 py-3 transition-all ${
                    type === 'practice'
                      ? 'bg-green-600/30 text-green-300 border border-green-600/50'
                      : 'bg-gray-800 text-gray-400 border border-gray-700 hover:bg-gray-700'
                  }`}
                >
                  <Code className="h-4 w-4" />
                  Практика (+25% XP)
                </button>
              </div>
            </div>

            {/* Time */}
            <div>
              <label className="block text-sm font-medium text-gray-400 mb-2">Время</label>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <div className="flex items-center gap-2">
                    <input
                      type="number"
                      min="0"
                      max="23"
                      value={hours}
                      onChange={e => setHours(Math.max(0, parseInt(e.target.value) || 0))}
                      className="w-full rounded-lg bg-gray-800 border border-gray-700 px-4 py-3 text-gray-100 focus:border-purple-500 focus:outline-none focus:ring-1 focus:ring-purple-500"
                    />
                    <span className="text-gray-400">часов</span>
                  </div>
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <input
                      type="number"
                      min="0"
                      max="59"
                      value={minutes}
                      onChange={e => setMinutes(Math.max(0, Math.min(59, parseInt(e.target.value) || 0)))}
                      className="w-full rounded-lg bg-gray-800 border border-gray-700 px-4 py-3 text-gray-100 focus:border-purple-500 focus:outline-none focus:ring-1 focus:ring-purple-500"
                    />
                    <span className="text-gray-400">минут</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Quality Metrics */}
            <div className="space-y-4 bg-gray-800/30 rounded-lg p-4 border border-gray-700/50">
              <h3 className="text-sm font-semibold text-gray-300 mb-3">Качество учёбы</h3>
              
              {/* Quality */}
              <div>
                <div className="flex items-center justify-between mb-2">
                  <label className="text-sm text-gray-400">Качество: {quality}/5</label>
                  <span className="text-xs px-2 py-1 rounded bg-purple-600/30 text-purple-300">
                    {quality === 1 ? '😔 Низкое' : quality === 2 ? '😐 Слабое' : quality === 3 ? '😊 Среднее' : quality === 4 ? '😄 Хорошее' : '🤩 Отличное'}
                  </span>
                </div>
                <input
                  type="range"
                  min="1"
                  max="5"
                  value={quality}
                  onChange={e => setQuality(parseInt(e.target.value))}
                  className="w-full cursor-pointer"
                />
              </div>

              {/* Focus */}
              <div>
                <div className="flex items-center justify-between mb-2">
                  <label className="text-sm text-gray-400">Фокус: {focus}/5</label>
                  <span className="text-xs px-2 py-1 rounded bg-blue-600/30 text-blue-300">
                    {focus === 1 ? '🤯 Отвлёкся' : focus === 2 ? '😕 Слабый' : focus === 3 ? '🧐 Нормально' : focus === 4 ? '🎯 Сфокусирован' : '⚡ Суперфокус'}
                  </span>
                </div>
                <input
                  type="range"
                  min="1"
                  max="5"
                  value={focus}
                  onChange={e => setFocus(parseInt(e.target.value))}
                  className="w-full cursor-pointer"
                />
              </div>

              {/* Efficiency */}
              <div>
                <div className="flex items-center justify-between mb-2">
                  <label className="text-sm text-gray-400">Продуктивность: {efficiency}/5</label>
                  <span className="text-xs px-2 py-1 rounded bg-green-600/30 text-green-300">
                    {efficiency === 1 ? '🐢 Очень слабо' : efficiency === 2 ? '🚶 Медленно' : efficiency === 3 ? '🚴 Нормально' : efficiency === 4 ? '🏃 Быстро' : '⚡ Молния'}
                  </span>
                </div>
                <input
                  type="range"
                  min="1"
                  max="5"
                  value={efficiency}
                  onChange={e => setEfficiency(parseInt(e.target.value))}
                  className="w-full cursor-pointer"
                />
              </div>
            </div>

            {/* Comment */}
            <div>
              <label className="block text-sm font-medium text-gray-400 mb-2">Комментарий (необязательно)</label>
              <input
                type="text"
                value={comment}
                onChange={e => setComment(e.target.value)}
                placeholder="Что изучал..."
                className="w-full rounded-lg bg-gray-800 border border-gray-700 px-4 py-3 text-gray-100 placeholder-gray-500 focus:border-purple-500 focus:outline-none focus:ring-1 focus:ring-purple-500"
              />
            </div>

            <button
              type="submit"
              disabled={hours === 0 && minutes === 0}
              className="w-full rounded-lg bg-gradient-to-r from-purple-600 to-indigo-600 px-4 py-3 font-semibold text-white shadow-lg shadow-purple-600/30 hover:from-purple-500 hover:to-indigo-500 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Добавить запись
            </button>
          </form>
        </div>

        {/* Today's Entries */}
        <div className="space-y-4">
          <div className="rounded-xl border border-gray-800 bg-gray-900/50 p-6">
            <h2 className="flex items-center gap-2 text-xl font-semibold mb-4">
              <BookOpen className="h-5 w-5 text-blue-400" />
              Сегодняшние записи
            </h2>

            {todayEntries.length > 0 ? (
              <div className="space-y-3">
                {todayEntries.map(entry => (
                  <div
                    key={entry.id}
                    className="rounded-lg bg-gray-800/50 p-4 border border-gray-700/50"
                  >
                    <div className="flex items-start justify-between">
                      <div>
                        <p className="font-medium">{entry.subject}</p>
                        <p className="text-sm text-gray-400">
                          {entry.type === 'theory' ? '📖 Теория' : '💻 Практика'} • {entry.hours}ч {entry.minutes}м
                        </p>
                        {entry.comment && (
                          <p className="text-sm text-gray-500 mt-1">{entry.comment}</p>
                        )}
                      </div>
                      <span className="text-sm font-semibold text-green-400">+{entry.xpEarned} XP</span>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-gray-500 text-center py-8">Нет записей за сегодня</p>
            )}
          </div>

          {/* Subject Stats */}
          <div className="rounded-xl border border-gray-800 bg-gray-900/50 p-6">
            <h2 className="text-xl font-semibold mb-4">Статистика по предметам</h2>
            {subjectStats.length > 0 ? (
              <div className="space-y-3">
                {subjectStats.slice(0, 5).map((stat, i) => (
                  <div key={stat.subject}>
                    <div className="flex items-center justify-between mb-1">
                      <span className="text-sm">{stat.subject}</span>
                      <span className="text-sm text-gray-400">{formatTime(stat.totalMins)}</span>
                    </div>
                    <div className="h-2 rounded-full bg-gray-700 overflow-hidden">
                      <div
                        className={`h-full transition-all ${
                          i === 0 ? 'bg-gradient-to-r from-yellow-500 to-amber-500' :
                          i === 1 ? 'bg-gradient-to-r from-gray-400 to-gray-500' :
                          i === 2 ? 'bg-gradient-to-r from-amber-600 to-amber-700' :
                          'bg-gradient-to-r from-purple-500 to-indigo-500'
                        }`}
                        style={{ width: `${(stat.totalMins / subjectStats[0].totalMins) * 100}%` }}
                      />
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-gray-500 text-center py-4">Начните учиться, чтобы видеть статистику</p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
