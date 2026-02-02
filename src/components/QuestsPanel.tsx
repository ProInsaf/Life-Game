import { useState } from 'react';
import { Scroll, Plus, CheckCircle, Trash2, Sword, Star, Target } from 'lucide-react';
import type { useGameState } from '../hooks/useGameState';
import type { Stats } from '../types';

interface QuestsPanelProps {
  gameState: ReturnType<typeof useGameState>;
  onQuestComplete?: (title: string, message: string, xpReward: number) => void;
}

const STAT_OPTIONS: { key: keyof Stats; label: string }[] = [
  { key: 'focus', label: 'Фокус' },
  { key: 'discipline', label: 'Дисциплина' },
  { key: 'energy', label: 'Энергия' },
  { key: 'motivation', label: 'Мотивация' },
  { key: 'timeManagement', label: 'Тайм-менеджмент' },
  { key: 'study', label: 'Учёба' },
  { key: 'emotionalStability', label: 'Эмоц. стабильность' }
];

export function QuestsPanel({ gameState, onQuestComplete }: QuestsPanelProps) {
  const { state, addQuest, completeQuest, deleteQuest } = gameState;

  const [showForm, setShowForm] = useState(false);
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [questType, setQuestType] = useState<'daily' | 'weekly' | 'longterm'>('daily');
  const [xpReward, setXpReward] = useState(50);
  const [selectedStat, setSelectedStat] = useState<keyof Stats>('focus');
  const [statValue, setStatValue] = useState(5);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) return;

    addQuest({
      title,
      description,
      type: questType,
      xpReward,
      statEffects: { [selectedStat]: statValue }
    });

    setTitle('');
    setDescription('');
    setXpReward(50);
    setShowForm(false);
  };

  const dailyQuests = state.quests.filter(q => q.type === 'daily');
  const weeklyQuests = state.quests.filter(q => q.type === 'weekly');
  const longtermQuests = state.quests.filter(q => q.type === 'longterm');

  const QuestCard = ({ quest }: { quest: typeof state.quests[0] }) => (
    <div
      className={`rounded-lg p-4 border transition-all ${
        quest.completed
          ? 'bg-green-900/20 border-green-800/50 opacity-60'
          : 'bg-gray-800/50 border-gray-700/50 hover:border-gray-600'
      }`}
    >
      <div className="flex items-start justify-between gap-3">
        <div className="flex-1">
          <div className="flex items-center gap-2">
            {quest.completed && <CheckCircle className="h-4 w-4 text-green-400" />}
            <h4 className={`font-medium ${quest.completed ? 'line-through text-gray-500' : ''}`}>
              {quest.title}
            </h4>
          </div>
          {quest.description && (
            <p className="text-sm text-gray-400 mt-1">{quest.description}</p>
          )}
          <div className="flex items-center gap-3 mt-2">
            <span className="text-sm text-yellow-400">+{quest.xpReward} XP</span>
            {Object.entries(quest.statEffects).map(([stat, value]) => (
              <span key={stat} className="text-xs text-purple-400">
                +{value} {STAT_OPTIONS.find(s => s.key === stat)?.label}
              </span>
            ))}
          </div>
        </div>
        <div className="flex items-center gap-2">
          {!quest.completed && (
            <button
              onClick={() => {
                completeQuest(quest.id);
                if (onQuestComplete) {
                  onQuestComplete(`✅ ${quest.title}`, 'Квест выполнен!', quest.xpReward || 50);
                }
              }}
              className="rounded-lg bg-green-600/20 p-2 text-green-400 hover:bg-green-600/30 transition-all"
            >
              <CheckCircle className="h-4 w-4" />
            </button>
          )}
          <button
            onClick={() => deleteQuest(quest.id)}
            className="rounded-lg bg-red-600/20 p-2 text-red-400 hover:bg-red-600/30 transition-all"
          >
            <Trash2 className="h-4 w-4" />
          </button>
        </div>
      </div>
    </div>
  );

  const QuestSection = ({ 
    title, 
    icon: Icon, 
    quests, 
    color 
  }: { 
    title: string; 
    icon: typeof Sword; 
    quests: typeof state.quests;
    color: string;
  }) => (
    <div className="rounded-xl border border-gray-800 bg-gray-900/50 p-5">
      <h3 className={`flex items-center gap-2 text-lg font-semibold mb-4 ${color}`}>
        <Icon className="h-5 w-5" />
        {title}
        <span className="ml-auto text-sm text-gray-500">
          {quests.filter(q => q.completed).length}/{quests.length}
        </span>
      </h3>
      {quests.length > 0 ? (
        <div className="space-y-3">
          {quests.map(quest => (
            <QuestCard key={quest.id} quest={quest} />
          ))}
        </div>
      ) : (
        <p className="text-gray-500 text-center py-4">Нет квестов</p>
      )}
    </div>
  );

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <h2 className="flex items-center gap-2 text-2xl font-bold">
          <Scroll className="h-6 w-6 text-yellow-400" />
          Квесты
        </h2>
        <button
          onClick={() => setShowForm(!showForm)}
          className="flex items-center gap-2 rounded-lg bg-gradient-to-r from-purple-600 to-indigo-600 px-4 py-2 font-medium text-white shadow-lg shadow-purple-600/30 hover:from-purple-500 hover:to-indigo-500 transition-all"
        >
          <Plus className="h-4 w-4" />
          Новый квест
        </button>
      </div>

      {/* Add Quest Form */}
      {showForm && (
        <div className="rounded-xl border border-purple-900/30 bg-gray-900/50 p-6">
          <h3 className="text-lg font-semibold mb-4">Создать квест</h3>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-400 mb-2">Название</label>
              <input
                type="text"
                value={title}
                onChange={e => setTitle(e.target.value)}
                placeholder="Название квеста"
                className="w-full rounded-lg bg-gray-800 border border-gray-700 px-4 py-3 text-gray-100 placeholder-gray-500 focus:border-purple-500 focus:outline-none focus:ring-1 focus:ring-purple-500"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-400 mb-2">Описание</label>
              <input
                type="text"
                value={description}
                onChange={e => setDescription(e.target.value)}
                placeholder="Описание (необязательно)"
                className="w-full rounded-lg bg-gray-800 border border-gray-700 px-4 py-3 text-gray-100 placeholder-gray-500 focus:border-purple-500 focus:outline-none focus:ring-1 focus:ring-purple-500"
              />
            </div>

            <div className="grid grid-cols-3 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-400 mb-2">Тип</label>
                <select
                  value={questType}
                  onChange={e => setQuestType(e.target.value as typeof questType)}
                  className="w-full rounded-lg bg-gray-800 border border-gray-700 px-4 py-3 text-gray-100 focus:border-purple-500 focus:outline-none focus:ring-1 focus:ring-purple-500"
                >
                  <option value="daily">Ежедневный</option>
                  <option value="weekly">Недельный</option>
                  <option value="longterm">Долгосрочный</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-400 mb-2">XP награда</label>
                <input
                  type="number"
                  min="10"
                  max="1000"
                  value={xpReward}
                  onChange={e => setXpReward(parseInt(e.target.value) || 50)}
                  className="w-full rounded-lg bg-gray-800 border border-gray-700 px-4 py-3 text-gray-100 focus:border-purple-500 focus:outline-none focus:ring-1 focus:ring-purple-500"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-400 mb-2">Бонус к стату</label>
                <input
                  type="number"
                  min="1"
                  max="20"
                  value={statValue}
                  onChange={e => setStatValue(parseInt(e.target.value) || 5)}
                  className="w-full rounded-lg bg-gray-800 border border-gray-700 px-4 py-3 text-gray-100 focus:border-purple-500 focus:outline-none focus:ring-1 focus:ring-purple-500"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-400 mb-2">Какой стат улучшить</label>
              <div className="flex flex-wrap gap-2">
                {STAT_OPTIONS.map(stat => (
                  <button
                    key={stat.key}
                    type="button"
                    onClick={() => setSelectedStat(stat.key)}
                    className={`rounded-lg px-3 py-2 text-sm transition-all ${
                      selectedStat === stat.key
                        ? 'bg-purple-600/30 text-purple-300 border border-purple-600/50'
                        : 'bg-gray-800 text-gray-400 border border-gray-700 hover:bg-gray-700'
                    }`}
                  >
                    {stat.label}
                  </button>
                ))}
              </div>
            </div>

            <div className="flex gap-3">
              <button
                type="submit"
                disabled={!title.trim()}
                className="flex-1 rounded-lg bg-gradient-to-r from-purple-600 to-indigo-600 px-4 py-3 font-semibold text-white shadow-lg shadow-purple-600/30 hover:from-purple-500 hover:to-indigo-500 transition-all disabled:opacity-50"
              >
                Создать квест
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

      {/* Quest Sections */}
      <div className="grid gap-6 lg:grid-cols-3">
        <QuestSection
          title="Ежедневные"
          icon={Sword}
          quests={dailyQuests}
          color="text-yellow-400"
        />
        <QuestSection
          title="Недельные"
          icon={Star}
          quests={weeklyQuests}
          color="text-purple-400"
        />
        <QuestSection
          title="Долгосрочные"
          icon={Target}
          quests={longtermQuests}
          color="text-cyan-400"
        />
      </div>
    </div>
  );
}
