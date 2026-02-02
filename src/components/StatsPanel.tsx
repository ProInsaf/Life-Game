import { 
  Brain, 
  Target, 
  Zap, 
  Heart, 
  Clock, 
  BookOpen, 
  Smile,
  Sparkles,
  AlertTriangle,
  Trophy,
  Activity
} from 'lucide-react';
import type { useGameState } from '../hooks/useGameState';
import type { Stats } from '../types';

interface StatsPanelProps {
  gameState: ReturnType<typeof useGameState>;
}

const STAT_CONFIG: { key: keyof Stats; label: string; icon: typeof Brain; color: string; bgColor: string }[] = [
  { key: 'focus', label: 'Фокус', icon: Target, color: 'text-blue-400', bgColor: 'from-blue-600/30 to-blue-700/30' },
  { key: 'discipline', label: 'Дисциплина', icon: Brain, color: 'text-purple-400', bgColor: 'from-purple-600/30 to-purple-700/30' },
  { key: 'energy', label: 'Энергия', icon: Zap, color: 'text-yellow-400', bgColor: 'from-yellow-600/30 to-yellow-700/30' },
  { key: 'motivation', label: 'Мотивация', icon: Heart, color: 'text-red-400', bgColor: 'from-red-600/30 to-red-700/30' },
  { key: 'timeManagement', label: 'Тайм-менеджмент', icon: Clock, color: 'text-cyan-400', bgColor: 'from-cyan-600/30 to-cyan-700/30' },
  { key: 'study', label: 'Учёба', icon: BookOpen, color: 'text-green-400', bgColor: 'from-green-600/30 to-green-700/30' },
  { key: 'emotionalStability', label: 'Эмоц. стабильность', icon: Smile, color: 'text-pink-400', bgColor: 'from-pink-600/30 to-pink-700/30' },
  { key: 'sport', label: 'Спорт', icon: Activity, color: 'text-orange-400', bgColor: 'from-orange-600/30 to-orange-700/30' }
];

export function StatsPanel({ gameState }: StatsPanelProps) {
  const { state, toggleBuff, toggleDebuff } = gameState;
  const { stats, buffs, debuffs, achievements } = state;

  const getStatLevel = (value: number): string => {
    if (value >= 90) return 'Легендарный';
    if (value >= 75) return 'Отличный';
    if (value >= 60) return 'Хороший';
    if (value >= 40) return 'Средний';
    if (value >= 20) return 'Низкий';
    return 'Критический';
  };

  const getStatColor = (value: number): string => {
    if (value >= 75) return 'from-green-500 to-emerald-400';
    if (value >= 50) return 'from-yellow-500 to-amber-400';
    if (value >= 25) return 'from-orange-500 to-red-400';
    return 'from-red-600 to-red-500';
  };

  const averageStat = Math.round(Object.values(stats).reduce((a, b) => a + b, 0) / 8);

  return (
    <div className="space-y-6">
      {/* Overall Stats */}
      <div className="rounded-xl border border-purple-900/30 bg-gradient-to-br from-purple-900/20 to-indigo-900/20 p-6">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xl font-semibold">Общий уровень характеристик</h2>
          <div className="flex items-center gap-2">
            <span className="text-3xl font-bold bg-gradient-to-r from-purple-400 to-pink-400 bg-clip-text text-transparent">
              {averageStat}
            </span>
            <span className="text-gray-400">/100</span>
          </div>
        </div>
        <div className="h-4 rounded-full bg-gray-800 overflow-hidden">
          <div
            className={`h-full bg-gradient-to-r ${getStatColor(averageStat)} transition-all duration-500`}
            style={{ width: `${averageStat}%` }}
          />
        </div>
        <p className="mt-2 text-sm text-gray-400">
          Уровень: <span className={averageStat >= 60 ? 'text-green-400' : averageStat >= 40 ? 'text-yellow-400' : 'text-red-400'}>
            {getStatLevel(averageStat)}
          </span>
        </p>
      </div>

      {/* Individual Stats */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
        {STAT_CONFIG.map(({ key, label, icon: Icon, color, bgColor }) => {
          const value = stats[key];
          return (
            <div
              key={key}
              className={`rounded-xl border border-gray-800 bg-gradient-to-br ${bgColor} p-5`}
            >
              <div className="flex items-center gap-3 mb-3">
                <div className={`flex h-10 w-10 items-center justify-center rounded-lg bg-gray-800/50 ${color}`}>
                  <Icon className="h-5 w-5" />
                </div>
                <div>
                  <p className="text-sm text-gray-400">{label}</p>
                  <p className={`text-2xl font-bold ${color}`}>{value}</p>
                </div>
              </div>
              <div className="h-2 rounded-full bg-gray-800 overflow-hidden">
                <div
                  className={`h-full bg-gradient-to-r ${getStatColor(value)} transition-all duration-500`}
                  style={{ width: `${value}%` }}
                />
              </div>
              <p className="mt-2 text-xs text-gray-500">{getStatLevel(value)}</p>
            </div>
          );
        })}
      </div>

      {/* Buffs & Debuffs */}
      <div className="grid gap-6 lg:grid-cols-2">
        {/* Buffs */}
        <div className="rounded-xl border border-green-900/30 bg-gray-900/50 p-6">
          <h3 className="flex items-center gap-2 text-lg font-semibold mb-4 text-green-400">
            <Sparkles className="h-5 w-5" />
            Бафы
          </h3>
          <p className="text-sm text-gray-500 mb-4">Нажмите, чтобы активировать/деактивировать</p>
          <div className="grid gap-3">
            {buffs.map(buff => (
              <button
                key={buff.id}
                onClick={() => toggleBuff(buff.id)}
                className={`flex items-center gap-3 rounded-lg p-4 border text-left transition-all ${
                  buff.active
                    ? 'bg-green-900/30 border-green-700/50 shadow-lg shadow-green-900/20'
                    : 'bg-gray-800/50 border-gray-700/50 opacity-60 hover:opacity-80'
                }`}
              >
                <span className="text-2xl">{buff.icon}</span>
                <div className="flex-1">
                  <p className={`font-medium ${buff.active ? 'text-green-300' : 'text-gray-400'}`}>
                    {buff.name}
                  </p>
                  <p className="text-xs text-gray-500">{buff.effect}</p>
                </div>
                <div className={`h-3 w-3 rounded-full ${buff.active ? 'bg-green-500' : 'bg-gray-600'}`} />
              </button>
            ))}
          </div>
        </div>

        {/* Debuffs */}
        <div className="rounded-xl border border-red-900/30 bg-gray-900/50 p-6">
          <h3 className="flex items-center gap-2 text-lg font-semibold mb-4 text-red-400">
            <AlertTriangle className="h-5 w-5" />
            Дебафы
          </h3>
          <p className="text-sm text-gray-500 mb-4">Нажмите, чтобы активировать/деактивировать</p>
          <div className="grid gap-3">
            {debuffs.map(debuff => (
              <button
                key={debuff.id}
                onClick={() => toggleDebuff(debuff.id)}
                className={`flex items-center gap-3 rounded-lg p-4 border text-left transition-all ${
                  debuff.active
                    ? 'bg-red-900/30 border-red-700/50 shadow-lg shadow-red-900/20'
                    : 'bg-gray-800/50 border-gray-700/50 opacity-60 hover:opacity-80'
                }`}
              >
                <span className="text-2xl">{debuff.icon}</span>
                <div className="flex-1">
                  <p className={`font-medium ${debuff.active ? 'text-red-300' : 'text-gray-400'}`}>
                    {debuff.name}
                  </p>
                  <p className="text-xs text-gray-500">{debuff.effect}</p>
                </div>
                <div className={`h-3 w-3 rounded-full ${debuff.active ? 'bg-red-500' : 'bg-gray-600'}`} />
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Achievements */}
      <div className="rounded-xl border border-yellow-900/30 bg-gray-900/50 p-6">
        <h3 className="flex items-center gap-2 text-lg font-semibold mb-4 text-yellow-400">
          <Trophy className="h-5 w-5" />
          Достижения
          <span className="ml-auto text-sm text-gray-500">
            {achievements.filter(a => a.unlocked).length}/{achievements.length}
          </span>
        </h3>
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {achievements.map(achievement => (
            <div
              key={achievement.id}
              className={`rounded-lg p-4 border transition-all ${
                achievement.unlocked
                  ? 'bg-yellow-900/20 border-yellow-800/50'
                  : 'bg-gray-800/30 border-gray-700/50 opacity-50'
              }`}
            >
              <div className="flex items-center gap-3">
                <span className={`text-2xl ${achievement.unlocked ? '' : 'grayscale'}`}>
                  {achievement.icon}
                </span>
                <div>
                  <p className={`font-medium ${achievement.unlocked ? 'text-yellow-300' : 'text-gray-500'}`}>
                    {achievement.title}
                  </p>
                  <p className="text-xs text-gray-500">{achievement.description}</p>
                  <p className="text-xs text-yellow-500 mt-1">+{achievement.xpReward} XP</p>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
