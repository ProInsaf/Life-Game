import { useState, useEffect } from 'react';
import { useGameState, xpForNextLevel, xpForLevel } from './hooks/useGameState';
import { useNotifications } from './hooks/useNotifications';
import { NotificationContext } from './context/NotificationContext';
import { Dashboard } from './components/Dashboard';
import { StudyTracker } from './components/StudyTracker';
import { QuestsPanel } from './components/QuestsPanel';
import { StatsPanel } from './components/StatsPanel';
import { ProgressPanel } from './components/ProgressPanel';
import { GoalsPanel } from './components/GoalsPanel';
import { Shop } from './components/Shop';
import { Rewards } from './components/Rewards';
import { Exam } from './components/Exam';
import { DayHistory } from './components/DayHistory';
import { Sport } from './components/Sport';
import { Notifications } from './components/Notifications';
import {
  Sword,
  BookOpen,
  Target,
  BarChart3,
  Trophy,
  Scroll,
  Shield,
  Flame,
  ShoppingBag,
  Gift,
  Medal,
  Calendar,
  Activity,
  Download,
  Upload
} from 'lucide-react';

type TabType = 'dashboard' | 'study' | 'quests' | 'goals' | 'stats' | 'progress' | 'shop' | 'rewards' | 'exam' | 'history' | 'sport';

export function App() {
  const [activeTab, setActiveTab] = useState<TabType>('dashboard');
  const gameState = useGameState();
  const { state, exportSave, importSave, resetAllData, breakStreak } = gameState;
  const { 
    notifications, 
    addLevelUpNotification, 
    addGreetingNotification, 
    addDailyRewardNotification,
    addQuestCompleteNotification,
    addGoalCompleteNotification,
    addDayEndNotification,
    removeNotification 
  } = useNotifications();
  const [prevLevel, setPrevLevel] = useState(state.level);
  const [hasShownGreeting, setHasShownGreeting] = useState(false);

  // Show level-up notification
  useEffect(() => {
    if (state.level > prevLevel) {
      addLevelUpNotification(state.level);
      setPrevLevel(state.level);
    }
  }, [state.level, prevLevel, addLevelUpNotification]);

  // Show greeting on first mount
  useEffect(() => {
    if (!hasShownGreeting) {
      addGreetingNotification();
      setHasShownGreeting(true);
    }
  }, [hasShownGreeting, addGreetingNotification]);

  const currentLevelXP = xpForLevel(state.level);
  const nextLevelXP = xpForNextLevel(state.level);
  const xpProgress = ((state.xp - currentLevelXP) / (nextLevelXP - currentLevelXP)) * 100;

  const handleExport = () => {
    const saveData = exportSave();
    const element = document.createElement('a');
    element.setAttribute('href', 'data:text/plain;charset=utf-8,' + encodeURIComponent(saveData));
    element.setAttribute('download', `lifequest-save-${new Date().toISOString().split('T')[0]}.json`);
    element.style.display = 'none';
    document.body.appendChild(element);
    element.click();
    document.body.removeChild(element);
  };

  const handleImport = () => {
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = '.json';
    input.onchange = (e: Event) => {
      const file = (e.target as HTMLInputElement).files?.[0];
      if (file) {
        const reader = new FileReader();
        reader.onload = (event) => {
          const content = event.target?.result as string;
          if (importSave(content)) {
            alert('Сохранение успешно загружено!');
            window.location.reload();
          } else {
            alert('Ошибка при загрузке сохранения!');
          }
        };
        reader.readAsText(file);
      }
    };
    input.click();
  };

  const handleReset = () => {
    if (confirm('⚠️ ВНИМАНИЕ! Это удалит ВСЕ данные. Вы уверены?\n\nЭто действие нельзя отменить!')) {
      if (confirm('Подтвердите ещё раз. Все ваши данные будут удалены навсегда.')) {
        resetAllData();
        window.location.reload();
      }
    }
  };

  const tabs = [
    { id: 'dashboard' as TabType, label: 'Сегодня', icon: Sword },
    { id: 'study' as TabType, label: 'Учёба', icon: BookOpen },
    { id: 'quests' as TabType, label: 'Квесты', icon: Scroll },
    { id: 'goals' as TabType, label: 'Цели', icon: Target },
    { id: 'exam' as TabType, label: 'ЕГЭ', icon: Medal },
    { id: 'stats' as TabType, label: 'Статы', icon: BarChart3 },
    { id: 'progress' as TabType, label: 'Прогресс', icon: Trophy },
    { id: 'sport' as TabType, label: 'Спорт', icon: Activity },
    { id: 'shop' as TabType, label: 'Магазин', icon: ShoppingBag },
    { id: 'rewards' as TabType, label: 'Награды', icon: Gift },
    { id: 'history' as TabType, label: 'История', icon: Calendar },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-slate-900 to-gray-950 text-gray-100">
      <Notifications notifications={notifications} onClose={removeNotification} />
      {/* Top Bar */}
      <header className="sticky top-0 z-50 border-b border-purple-900/30 bg-gray-900/80 backdrop-blur-lg">
        <div className="mx-auto max-w-7xl px-4 py-3">
          <div className="flex items-center justify-between">
            {/* Logo & Level */}
            <div className="flex items-center gap-4">
              <div className="flex items-center gap-2">
                <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-gradient-to-br from-purple-600 to-indigo-600 shadow-lg shadow-purple-600/30">
                  <Sword className="h-5 w-5" />
                </div>
                <div>
                  <h1 className="text-lg font-bold bg-gradient-to-r from-purple-400 to-pink-400 bg-clip-text text-transparent">
                    LifeQuest
                  </h1>
                  <p className="text-xs text-gray-500">Геймификация жизни</p>
                </div>
              </div>
            </div>

            {/* Level & XP */}
            <div className="flex items-center gap-4">
              {/* Import/Export Buttons */}
              <div className="flex items-center gap-2">
                <button
                  onClick={handleExport}
                  title="Экспортировать сохранение"
                  className="rounded-lg bg-gray-800 hover:bg-gray-700 p-2 border border-gray-700 transition-all"
                >
                  <Download className="h-4 w-4 text-gray-400" />
                </button>
                <button
                  onClick={handleImport}
                  title="Импортировать сохранение"
                  className="rounded-lg bg-gray-800 hover:bg-gray-700 p-2 border border-gray-700 transition-all"
                >
                  <Upload className="h-4 w-4 text-gray-400" />
                </button>
              </div>

              {/* Iron Mode */}
              {state.ironMode && (
                <div className="flex items-center gap-1.5 rounded-lg bg-red-900/30 px-3 py-1.5 border border-red-700/50">
                  <Shield className="h-4 w-4 text-red-400" />
                  <span className="text-xs font-semibold text-red-400">IRON MODE</span>
                </div>
              )}

              {/* Streak */}
              <div className="flex items-center gap-2">
                <div className="flex items-center gap-1.5">
                  <Flame className="h-5 w-5 text-orange-500" />
                  <span className="font-bold text-orange-400">{state.streak}</span>
                  <span className="text-xs text-gray-500">дней</span>
                </div>
                {state.streak > 0 && (
                  <button
                    onClick={() => {
                      if (confirm('Вы уверены? Серия будет прервана!')) {
                        breakStreak();
                      }
                    }}
                    title="Прервать серию"
                    className="rounded-lg bg-red-900/30 hover:bg-red-900/50 border border-red-700/50 px-2 py-1 text-xs font-medium text-red-400 transition-all"
                  >
                    Прервать
                  </button>
                )}
              </div>

              {/* Level */}
              <div className="flex flex-col items-end">
                <div className="flex items-center gap-2">
                  <span className="text-sm text-gray-400">Уровень</span>
                  <span className="text-2xl font-bold bg-gradient-to-r from-yellow-400 to-amber-500 bg-clip-text text-transparent">
                    {state.level}
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="h-2 w-32 rounded-full bg-gray-800 overflow-hidden">
                    <div
                      className="h-full bg-gradient-to-r from-purple-500 to-pink-500 transition-all duration-500"
                      style={{ width: `${Math.min(100, xpProgress)}%` }}
                    />
                  </div>
                  <span className="text-xs text-gray-500">
                    {state.xp - currentLevelXP}/{nextLevelXP - currentLevelXP} XP
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </header>

      {/* Navigation */}
      <nav className="border-b border-purple-900/20 bg-gray-900/50">
        <div className="mx-auto max-w-7xl px-4">
          <div className="flex gap-1 overflow-x-auto py-2">
            {tabs.map(tab => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex items-center gap-2 rounded-lg px-4 py-2.5 text-sm font-medium transition-all whitespace-nowrap ${
                  activeTab === tab.id
                    ? 'bg-purple-600/20 text-purple-400 shadow-inner'
                    : 'text-gray-400 hover:bg-gray-800 hover:text-gray-300'
                }`}
              >
                <tab.icon className="h-4 w-4" />
                {tab.label}
              </button>
            ))}
          </div>
        </div>
      </nav>

      {/* Main Content */}
      <NotificationContext.Provider value={{ 
        addLevelUpNotification, 
        addAchievementNotification: () => {},
        addDailyRewardNotification,
        addQuestCompleteNotification,
        addGoalCompleteNotification,
        addDayEndNotification
      }}>
        <main className="mx-auto max-w-7xl px-4 py-6">
          {activeTab === 'dashboard' && <Dashboard gameState={gameState} onDayEnd={addDayEndNotification} />}
          {activeTab === 'study' && <StudyTracker gameState={gameState} />}
          {activeTab === 'quests' && <QuestsPanel gameState={gameState} onQuestComplete={addQuestCompleteNotification} />}
        {activeTab === 'goals' && <GoalsPanel gameState={gameState} onGoalComplete={addGoalCompleteNotification} />}
        {activeTab === 'exam' && <Exam gameState={gameState} />}
        {activeTab === 'stats' && <StatsPanel gameState={gameState} />}
        {activeTab === 'progress' && <ProgressPanel gameState={gameState} />}
        {activeTab === 'sport' && <Sport />}
        {activeTab === 'shop' && <Shop gameState={gameState} />}
        {activeTab === 'rewards' && <Rewards gameState={gameState} onRewardClaimed={addDailyRewardNotification} />}
        {activeTab === 'history' && <DayHistory />}
        </main>
      </NotificationContext.Provider>

      {/* Footer with Save Controls */}
      <footer className="border-t border-gray-800 bg-gray-900/50 py-4 mt-8">
        <div className="mx-auto max-w-7xl px-4">
          <div className="flex items-center justify-center gap-3 flex-wrap">
            <button
              onClick={handleExport}
              className="flex items-center gap-2 rounded-lg bg-blue-900/30 border border-blue-700/50 hover:bg-blue-900/50 px-4 py-2 text-sm font-medium text-blue-400 transition-all"
              title="Скачать сохранение"
            >
              <Download className="h-4 w-4" />
              Экспорт
            </button>
            <button
              onClick={handleImport}
              className="flex items-center gap-2 rounded-lg bg-green-900/30 border border-green-700/50 hover:bg-green-900/50 px-4 py-2 text-sm font-medium text-green-400 transition-all"
              title="Загрузить сохранение"
            >
              <Upload className="h-4 w-4" />
              Импорт
            </button>
            <div className="h-6 w-px bg-gray-700" />
            <button
              onClick={handleReset}
              className="flex items-center gap-2 rounded-lg bg-red-900/30 border border-red-700/50 hover:bg-red-900/50 px-4 py-2 text-sm font-medium text-red-400 transition-all"
              title="Удалить все данные и начать заново"
            >
              🔄 Сброс всех данных
            </button>
          </div>
        </div>
      </footer>
    </div>
  );
}
