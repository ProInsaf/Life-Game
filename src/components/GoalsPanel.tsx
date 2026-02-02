import { useState } from 'react';
import { format, addDays, addWeeks, addMonths } from 'date-fns';
import { Target, Plus, CheckCircle, Clock, Calendar } from 'lucide-react';
import type { useGameState } from '../hooks/useGameState';

interface GoalsPanelProps {
  gameState: ReturnType<typeof useGameState>;
  onGoalComplete?: (title: string, message: string, xpReward: number) => void;
}

export function GoalsPanel({ gameState, onGoalComplete }: GoalsPanelProps) {
  const { state, addGoal, updateGoal } = gameState;

  const [showForm, setShowForm] = useState(false);
  const [title, setTitle] = useState('');
  const [goalType, setGoalType] = useState<'daily' | 'weekly' | 'monthly'>('daily');
  const [plannedHours, setPlannedHours] = useState(2);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) return;

    const now = new Date();
    let deadline: Date;
    
    switch (goalType) {
      case 'daily':
        deadline = addDays(now, 1);
        break;
      case 'weekly':
        deadline = addWeeks(now, 1);
        break;
      case 'monthly':
        deadline = addMonths(now, 1);
        break;
    }

    addGoal({
      title,
      type: goalType,
      plannedHours,
      deadline: deadline.toISOString()
    });

    setTitle('');
    setPlannedHours(2);
    setShowForm(false);
  };

  const dailyGoals = state.goals.filter(g => g.type === 'daily');
  const weeklyGoals = state.goals.filter(g => g.type === 'weekly');
  const monthlyGoals = state.goals.filter(g => g.type === 'monthly');

  const GoalCard = ({ goal }: { goal: typeof state.goals[0] }) => {
    const progress = goal.plannedHours > 0 
      ? Math.min(100, (goal.actualHours / goal.plannedHours) * 100) 
      : 0;
    
    const [hours, setHours] = useState(goal.actualHours);

    const handleUpdateHours = () => {
      updateGoal(goal.id, { actualHours: hours });
      if (hours >= goal.plannedHours && !goal.completed) {
        updateGoal(goal.id, { completed: true });
      }
    };

    return (
      <div
        className={`rounded-lg p-4 border transition-all ${
          goal.completed
            ? 'bg-green-900/20 border-green-800/50'
            : 'bg-gray-800/50 border-gray-700/50'
        }`}
      >
        <div className="flex items-start justify-between gap-3 mb-3">
          <div className="flex-1">
            <div className="flex items-center gap-2">
              {goal.completed && <CheckCircle className="h-4 w-4 text-green-400" />}
              <h4 className={`font-medium ${goal.completed ? 'text-green-300' : ''}`}>
                {goal.title}
              </h4>
            </div>
            <div className="flex items-center gap-3 mt-1 text-sm text-gray-400">
              <span className="flex items-center gap-1">
                <Clock className="h-3 w-3" />
                {goal.actualHours}/{goal.plannedHours}ч
              </span>
              <span className="flex items-center gap-1">
                <Calendar className="h-3 w-3" />
                до {format(new Date(goal.deadline), 'dd.MM')}
              </span>
            </div>
          </div>
          {!goal.completed && (
            <button
              onClick={() => {
                updateGoal(goal.id, { completed: true });
                if (onGoalComplete) {
                  const xpReward = goal.type === 'daily' ? 50 : goal.type === 'weekly' ? 200 : 500;
                  onGoalComplete(`🎯 ${goal.title}`, 'Цель достигнута!', xpReward);
                }
              }}
              className="rounded-lg bg-green-600/20 p-2 text-green-400 hover:bg-green-600/30 transition-all"
            >
              <CheckCircle className="h-4 w-4" />
            </button>
          )}
        </div>

        {/* Progress Bar */}
        <div className="mb-3">
          <div className="flex items-center justify-between text-sm mb-1">
            <span className="text-gray-400">Прогресс</span>
            <span className={progress >= 100 ? 'text-green-400' : 'text-gray-400'}>
              {Math.round(progress)}%
            </span>
          </div>
          <div className="h-2 rounded-full bg-gray-700 overflow-hidden">
            <div
              className={`h-full transition-all duration-300 ${
                progress >= 100
                  ? 'bg-gradient-to-r from-green-500 to-emerald-400'
                  : progress >= 50
                  ? 'bg-gradient-to-r from-yellow-500 to-amber-400'
                  : 'bg-gradient-to-r from-purple-500 to-indigo-400'
              }`}
              style={{ width: `${Math.min(100, progress)}%` }}
            />
          </div>
        </div>

        {/* Update Hours */}
        {!goal.completed && (
          <div className="flex items-center gap-2">
            <input
              type="number"
              min="0"
              max={goal.plannedHours * 2}
              step="0.5"
              value={hours}
              onChange={e => setHours(parseFloat(e.target.value) || 0)}
              className="flex-1 rounded-lg bg-gray-700 border border-gray-600 px-3 py-2 text-sm text-gray-100 focus:border-purple-500 focus:outline-none"
            />
            <button
              onClick={handleUpdateHours}
              className="rounded-lg bg-purple-600/30 px-3 py-2 text-sm text-purple-300 border border-purple-600/50 hover:bg-purple-600/40 transition-all"
            >
              Обновить
            </button>
          </div>
        )}
      </div>
    );
  };

  const GoalSection = ({
    title,
    goals,
    color,
    xpReward
  }: {
    title: string;
    goals: typeof state.goals;
    color: string;
    xpReward: number;
  }) => {
    const completed = goals.filter(g => g.completed).length;
    
    return (
      <div className="rounded-xl border border-gray-800 bg-gray-900/50 p-5">
        <h3 className={`flex items-center gap-2 text-lg font-semibold mb-4 ${color}`}>
          <Target className="h-5 w-5" />
          {title}
          <span className="ml-auto text-sm text-gray-500">
            {completed}/{goals.length}
          </span>
        </h3>
        <p className="text-xs text-gray-500 mb-4">+{xpReward} XP за выполнение</p>
        {goals.length > 0 ? (
          <div className="space-y-3">
            {goals.map(goal => (
              <GoalCard key={goal.id} goal={goal} />
            ))}
          </div>
        ) : (
          <p className="text-gray-500 text-center py-4">Нет целей</p>
        )}
      </div>
    );
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <h2 className="flex items-center gap-2 text-2xl font-bold">
          <Target className="h-6 w-6 text-green-400" />
          Цели
        </h2>
        <button
          onClick={() => setShowForm(!showForm)}
          className="flex items-center gap-2 rounded-lg bg-gradient-to-r from-green-600 to-emerald-600 px-4 py-2 font-medium text-white shadow-lg shadow-green-600/30 hover:from-green-500 hover:to-emerald-500 transition-all"
        >
          <Plus className="h-4 w-4" />
          Новая цель
        </button>
      </div>

      {/* Add Goal Form */}
      {showForm && (
        <div className="rounded-xl border border-green-900/30 bg-gray-900/50 p-6">
          <h3 className="text-lg font-semibold mb-4">Создать цель</h3>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-400 mb-2">Название</label>
              <input
                type="text"
                value={title}
                onChange={e => setTitle(e.target.value)}
                placeholder="Например: Изучить React хуки"
                className="w-full rounded-lg bg-gray-800 border border-gray-700 px-4 py-3 text-gray-100 placeholder-gray-500 focus:border-green-500 focus:outline-none focus:ring-1 focus:ring-green-500"
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-400 mb-2">Тип</label>
                <select
                  value={goalType}
                  onChange={e => setGoalType(e.target.value as typeof goalType)}
                  className="w-full rounded-lg bg-gray-800 border border-gray-700 px-4 py-3 text-gray-100 focus:border-green-500 focus:outline-none focus:ring-1 focus:ring-green-500"
                >
                  <option value="daily">На день</option>
                  <option value="weekly">На неделю</option>
                  <option value="monthly">На месяц</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-400 mb-2">Планируемые часы</label>
                <input
                  type="number"
                  min="0.5"
                  max="100"
                  step="0.5"
                  value={plannedHours}
                  onChange={e => setPlannedHours(parseFloat(e.target.value) || 1)}
                  className="w-full rounded-lg bg-gray-800 border border-gray-700 px-4 py-3 text-gray-100 focus:border-green-500 focus:outline-none focus:ring-1 focus:ring-green-500"
                />
              </div>
            </div>

            <div className="flex gap-3">
              <button
                type="submit"
                disabled={!title.trim()}
                className="flex-1 rounded-lg bg-gradient-to-r from-green-600 to-emerald-600 px-4 py-3 font-semibold text-white shadow-lg shadow-green-600/30 hover:from-green-500 hover:to-emerald-500 transition-all disabled:opacity-50"
              >
                Создать цель
              </button>
              <button
                type="button"
                onClick={() => setShowForm(false)}
                className="rounded-lg bg-gray-800 px-4 py-3 text-gray-300 border border-gray-700 hover:bg-gray-700 transition-all"
              >
                Отмена
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Goal Sections */}
      <div className="grid gap-6 lg:grid-cols-3">
        <GoalSection
          title="На день"
          goals={dailyGoals}
          color="text-yellow-400"
          xpReward={50}
        />
        <GoalSection
          title="На неделю"
          goals={weeklyGoals}
          color="text-purple-400"
          xpReward={200}
        />
        <GoalSection
          title="На месяц"
          goals={monthlyGoals}
          color="text-cyan-400"
          xpReward={500}
        />
      </div>
    </div>
  );
}
