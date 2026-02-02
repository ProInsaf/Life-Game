import { useState } from 'react';
import { format } from 'date-fns';
import { ru } from 'date-fns/locale';
import {
  Calendar,
  Clock,
  Flame,
  Zap,
  Trophy,
  TrendingUp,
  CheckCircle2,
  AlertTriangle,
  Sparkles,
  RotateCcw,
  Gift,
  Sunset
} from 'lucide-react';
import type { useGameState } from '../hooks/useGameState';
import { EndOfDayDialog } from './EndOfDayDialog';

interface DashboardProps {
  gameState: ReturnType<typeof useGameState>;
  onDayEnd?: (title: string, message: string, dayQuality: 'poor' | 'good' | 'excellent') => void;
}

export function Dashboard({ gameState, onDayEnd }: DashboardProps) {
  const { state, getTodayStudyTime, getWeekStudyTime, toggleIronMode, startNewSeason, claimDailyReward, canClaimRewardToday, canCompleteDay } = gameState;
  const [showEndDayDialog, setShowEndDayDialog] = useState(false);

  const todayMinutes = getTodayStudyTime();
  const weekMinutes = getWeekStudyTime();
  const todayHours = Math.floor(todayMinutes / 60);
  const todayMins = todayMinutes % 60;
  const weekHours = Math.floor(weekMinutes / 60);

  const activeBuffs = state.buffs.filter(b => b.active);
  const activeDebuffs = state.debuffs.filter(d => d.active);
  const recentAchievements = state.achievements.filter(a => a.unlocked).slice(-3);

  const todayQuests = state.quests.filter(q => q.type === 'daily' && !q.completed);
  const todayGoals = state.goals.filter(g => g.type === 'daily' && !g.completed);

  return (
    <div className="space-y-6">
      {/* Day Info */}
      <div className="grid gap-4 md:grid-cols-4">
        <div className="rounded-xl border border-purple-900/30 bg-gradient-to-br from-purple-900/20 to-indigo-900/20 p-5">
          <div className="flex items-center gap-3">
            <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-purple-600/30">
              <Calendar className="h-6 w-6 text-purple-400" />
            </div>
            <div>
              <p className="text-sm text-gray-400">День</p>
              <p className="text-3xl font-bold text-purple-300">{state.currentDay}</p>
            </div>
          </div>
          <p className="mt-3 text-xs text-gray-500">
            {format(new Date(), 'd MMMM yyyy', { locale: ru })}
          </p>
        </div>

        <div className="rounded-xl border border-orange-900/30 bg-gradient-to-br from-orange-900/20 to-red-900/20 p-5">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-orange-600/30">
                <Flame className="h-6 w-6 text-orange-400" />
              </div>
              <div>
                <p className="text-sm text-gray-400">Серия</p>
                <p className="text-3xl font-bold text-orange-300">{state.streak}</p>
              </div>
            </div>
          </div>
          <p className="mt-3 text-xs text-gray-500">
            {state.streak > 0 ? `${state.streak} дней подряд!` : 'Начни серию сегодня'}
          </p>
        </div>

        <div className="rounded-xl border border-cyan-900/30 bg-gradient-to-br from-cyan-900/20 to-blue-900/20 p-5">
          <div className="flex items-center gap-3">
            <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-cyan-600/30">
              <Clock className="h-6 w-6 text-cyan-400" />
            </div>
            <div>
              <p className="text-sm text-gray-400">Сегодня</p>
              <p className="text-3xl font-bold text-cyan-300">
                {todayHours}ч {todayMins}м
              </p>
            </div>
          </div>
          <p className="mt-3 text-xs text-gray-500">Время учёбы</p>
        </div>

        <div className="rounded-xl border border-green-900/30 bg-gradient-to-br from-green-900/20 to-emerald-900/20 p-5">
          <div className="flex items-center gap-3">
            <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-green-600/30">
              <TrendingUp className="h-6 w-6 text-green-400" />
            </div>
            <div>
              <p className="text-sm text-gray-400">Неделя</p>
              <p className="text-3xl font-bold text-green-300">{weekHours}ч</p>
            </div>
          </div>
          <p className="mt-3 text-xs text-gray-500">Всего за неделю</p>
        </div>
      </div>

      {/* Daily Reward Button */}
      {canClaimRewardToday() && (
        <div className="rounded-xl border border-amber-900/30 bg-gradient-to-r from-amber-900/20 to-orange-900/20 p-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Gift className="h-6 w-6 text-amber-400" />
              <div>
                <h3 className="text-lg font-semibold text-amber-300">Ежедневная награда готова!</h3>
                <p className="text-sm text-gray-400">Получите награду за вход сегодня</p>
              </div>
            </div>
            <button
              onClick={() => claimDailyReward()}
              className="bg-gradient-to-r from-amber-600 to-orange-600 hover:shadow-lg hover:shadow-amber-600/30 text-white px-6 py-2 rounded-lg font-semibold transition-all"
            >
              Получить награду
            </button>
          </div>
        </div>
      )}

      {/* End of Day Button */}
      {canCompleteDay() && (
        <button
          onClick={() => setShowEndDayDialog(true)}
          className="w-full rounded-xl border border-orange-900/30 bg-gradient-to-r from-orange-900/20 to-red-900/20 p-6 hover:from-orange-900/40 hover:to-red-900/40 transition-all"
        >
          <div className="flex items-center justify-center gap-3 text-lg font-semibold">
            <Sunset className="h-6 w-6 text-orange-400" />
            <span>Завершить день</span>
          </div>
          <p className="text-sm text-gray-400 mt-2">Подведи итоги дня и поделись впечатлениями</p>
        </button>
      )}
      {!canCompleteDay() && (
        <div className="w-full rounded-xl border border-gray-700 bg-gray-800/30 p-6 text-center">
          <div className="flex items-center justify-center gap-3 text-lg font-semibold text-gray-500 mb-2">
            <Sunset className="h-6 w-6 text-gray-600" />
            <span>День уже завершён</span>
          </div>
          <p className="text-sm text-gray-500">Вернись завтра, чтобы завершить новый день</p>
        </div>
      )}

      <div className="grid gap-6 lg:grid-cols-3">
        {/* Today's Quests & Goals */}
        <div className="lg:col-span-2 space-y-4">
          {/* Daily Quests */}
          <div className="rounded-xl border border-gray-800 bg-gray-900/50 p-5">
            <h3 className="flex items-center gap-2 text-lg font-semibold mb-4">
              <Zap className="h-5 w-5 text-yellow-400" />
              Квесты на сегодня
            </h3>
            {todayQuests.length > 0 ? (
              <div className="space-y-2">
                {todayQuests.map(quest => (
                  <div
                    key={quest.id}
                    className="flex items-center justify-between rounded-lg bg-gray-800/50 p-3 border border-gray-700/50"
                  >
                    <div className="flex items-center gap-3">
                      <div className="h-2 w-2 rounded-full bg-yellow-500" />
                      <span>{quest.title}</span>
                    </div>
                    <span className="text-sm text-yellow-400">+{quest.xpReward} XP</span>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-gray-500 text-sm">Нет активных квестов. Добавьте во вкладке «Квесты»</p>
            )}
          </div>

          {/* Daily Goals */}
          <div className="rounded-xl border border-gray-800 bg-gray-900/50 p-5">
            <h3 className="flex items-center gap-2 text-lg font-semibold mb-4">
              <CheckCircle2 className="h-5 w-5 text-green-400" />
              Цели на сегодня
            </h3>
            {todayGoals.length > 0 ? (
              <div className="space-y-3">
                {todayGoals.map(goal => {
                  const progress = goal.plannedHours > 0 
                    ? Math.min(100, (goal.actualHours / goal.plannedHours) * 100) 
                    : 0;
                  return (
                    <div key={goal.id} className="rounded-lg bg-gray-800/50 p-3 border border-gray-700/50">
                      <div className="flex items-center justify-between mb-2">
                        <span>{goal.title}</span>
                        <span className="text-sm text-gray-400">
                          {goal.actualHours}/{goal.plannedHours}ч
                        </span>
                      </div>
                      <div className="h-2 rounded-full bg-gray-700 overflow-hidden">
                        <div
                          className="h-full bg-gradient-to-r from-green-500 to-emerald-400 transition-all"
                          style={{ width: `${progress}%` }}
                        />
                      </div>
                    </div>
                  );
                })}
              </div>
            ) : (
              <p className="text-gray-500 text-sm">Нет активных целей. Добавьте во вкладке «Цели»</p>
            )}
          </div>
        </div>

        {/* Buffs, Debuffs & Achievements */}
        <div className="space-y-4">
          {/* Active Buffs */}
          <div className="rounded-xl border border-green-900/30 bg-gray-900/50 p-5">
            <h3 className="flex items-center gap-2 text-lg font-semibold mb-4 text-green-400">
              <Sparkles className="h-5 w-5" />
              Активные бафы
            </h3>
            {activeBuffs.length > 0 ? (
              <div className="space-y-2">
                {activeBuffs.map(buff => (
                  <div
                    key={buff.id}
                    className="flex items-center gap-3 rounded-lg bg-green-900/20 p-3 border border-green-800/30"
                  >
                    <span className="text-xl">{buff.icon}</span>
                    <div>
                      <p className="font-medium text-green-300">{buff.name}</p>
                      <p className="text-xs text-green-500">{buff.effect}</p>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-gray-500 text-sm">Нет активных бафов</p>
            )}
          </div>

          {/* Active Debuffs */}
          <div className="rounded-xl border border-red-900/30 bg-gray-900/50 p-5">
            <h3 className="flex items-center gap-2 text-lg font-semibold mb-4 text-red-400">
              <AlertTriangle className="h-5 w-5" />
              Дебафы
            </h3>
            {activeDebuffs.length > 0 ? (
              <div className="space-y-2">
                {activeDebuffs.map(debuff => (
                  <div
                    key={debuff.id}
                    className="flex items-center gap-3 rounded-lg bg-red-900/20 p-3 border border-red-800/30"
                  >
                    <span className="text-xl">{debuff.icon}</span>
                    <div>
                      <p className="font-medium text-red-300">{debuff.name}</p>
                      <p className="text-xs text-red-500">{debuff.effect}</p>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-gray-500 text-sm">Нет активных дебафов 🎉</p>
            )}
          </div>

          {/* Recent Achievements */}
          <div className="rounded-xl border border-yellow-900/30 bg-gray-900/50 p-5">
            <h3 className="flex items-center gap-2 text-lg font-semibold mb-4 text-yellow-400">
              <Trophy className="h-5 w-5" />
              Достижения
            </h3>
            {recentAchievements.length > 0 ? (
              <div className="space-y-2">
                {recentAchievements.map(achievement => (
                  <div
                    key={achievement.id}
                    className="flex items-center gap-3 rounded-lg bg-yellow-900/20 p-3 border border-yellow-800/30"
                  >
                    <span className="text-xl">{achievement.icon}</span>
                    <div>
                      <p className="font-medium text-yellow-300">{achievement.title}</p>
                      <p className="text-xs text-yellow-500">{achievement.description}</p>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-gray-500 text-sm">Разблокируйте первое достижение!</p>
            )}
          </div>

          {/* Quick Actions */}
          <div className="rounded-xl border border-gray-800 bg-gray-900/50 p-5">
            <h3 className="text-lg font-semibold mb-4">Быстрые действия</h3>
            <div className="space-y-2">
              <button
                onClick={toggleIronMode}
                className={`w-full rounded-lg px-4 py-3 text-sm font-medium transition-all ${
                  state.ironMode
                    ? 'bg-red-600/30 text-red-300 border border-red-600/50'
                    : 'bg-gray-800 text-gray-300 border border-gray-700 hover:bg-gray-700'
                }`}
              >
                {state.ironMode ? '🛡️ Отключить Iron Mode' : '🛡️ Включить Iron Mode'}
              </button>
              <button
                onClick={() => {
                  if (confirm('Начать новый сезон? Текущий прогресс будет сохранён в историю.')) {
                    startNewSeason();
                  }
                }}
                className="w-full flex items-center justify-center gap-2 rounded-lg bg-gray-800 px-4 py-3 text-sm font-medium text-gray-300 border border-gray-700 hover:bg-gray-700 transition-all"
              >
                <RotateCcw className="h-4 w-4" />
                Начать новый сезон
              </button>
            </div>
          </div>
        </div>
      </div>

      <EndOfDayDialog
        gameState={gameState}
        isOpen={showEndDayDialog}
        onClose={() => setShowEndDayDialog(false)}
        onDayEnd={onDayEnd}
      />
    </div>
  );
}
