import { useEffect, useState } from 'react';
import { Trophy, Zap, Star, Gift } from 'lucide-react';

interface Notification {
  id: string;
  type: 'level-up' | 'greeting' | 'achievement' | 'daily-reward' | 'quest-complete' | 'goal-complete' | 'day-end';
  level?: number;
  achievement?: string;
  timeOfDay?: string;
  title?: string;
  message?: string;
  dayQuality?: 'poor' | 'good' | 'excellent';
  xpReward?: number;
}

interface NotificationsProps {
  notifications: Notification[];
  onClose: (id: string) => void;
}

export function Notifications({ notifications, onClose }: NotificationsProps) {
  const getTimeOfDay = (): string => {
    const hour = new Date().getHours();
    if (hour >= 5 && hour < 12) return 'Добрый день';
    if (hour >= 12 && hour < 17) return 'Добрый день';
    if (hour >= 17 && hour < 21) return 'Добрый вечер';
    return 'Добрый ночь';
  };

  return (
    <div className="fixed inset-0 z-[9999] pointer-events-none">
      {notifications.map((notif) => (
        <NotificationItem
          key={notif.id}
          notification={notif}
          onClose={() => onClose(notif.id)}
          timeOfDay={getTimeOfDay()}
        />
      ))}
    </div>
  );
}

interface NotificationItemProps {
  notification: Notification;
  onClose: () => void;
  timeOfDay: string;
}

function NotificationItem({ notification, onClose, timeOfDay }: NotificationItemProps) {
  const [isActive, setIsActive] = useState(false);

  useEffect(() => {
    setIsActive(true);
    const timer = setTimeout(() => {
      setIsActive(false);
      setTimeout(onClose, 600);
    }, 4000);
    return () => clearTimeout(timer);
  }, [onClose]);

  if (notification.type === 'level-up') {
    return (
      <div
        className={`fixed inset-0 flex items-center justify-center pointer-events-auto transition-all duration-500 ${
          isActive ? 'opacity-100' : 'opacity-0'
        }`}
      >
        <div
          className={`fixed inset-0 bg-black/60 backdrop-blur-sm transition-all duration-500 ${
            isActive ? 'opacity-100' : 'opacity-0'
          }`}
          onClick={onClose}
        />
        <div
          className={`relative text-center transform transition-all duration-700 ${
            isActive
              ? 'scale-100 opacity-100 translate-y-0'
              : 'scale-0 opacity-0 translate-y-8'
          }`}
        >
          <div className="mb-6 animate-bounce">
            <div className="relative w-32 h-32 mx-auto">
              <div className="absolute inset-0 bg-gradient-to-r from-yellow-400 to-amber-500 rounded-full blur-3xl opacity-75 animate-pulse" />
              <div className="relative flex items-center justify-center w-32 h-32 bg-gradient-to-br from-yellow-400 to-amber-600 rounded-full shadow-2xl">
                <Zap className="w-16 h-16 text-amber-900" />
              </div>
            </div>
          </div>

          <h1 className="text-5xl font-black mb-2 text-transparent bg-clip-text bg-gradient-to-r from-yellow-300 via-amber-400 to-orange-500 animate-pulse">
            УРОВЕНЬ {notification.level}!
          </h1>
          <p className="text-2xl font-bold text-amber-300 mb-6">🎉 Поздравляем! 🎉</p>
          <p className="text-lg text-gray-300 mb-2">Вы достигли нового уровня</p>
          <p className="text-sm text-gray-400">Получайте новые награды и возможности</p>

          <div className="mt-8 flex gap-3 justify-center">
            <div className="px-6 py-2 bg-gradient-to-r from-yellow-500 to-amber-600 rounded-lg text-white font-semibold hover:shadow-lg hover:shadow-yellow-500/50 cursor-pointer transition-all">
              Продолжить
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (notification.type === 'greeting') {
    return (
      <div
        className={`fixed inset-0 flex items-center justify-center pointer-events-auto transition-all duration-500 ${
          isActive ? 'opacity-100' : 'opacity-0'
        }`}
      >
        <div
          className={`fixed inset-0 bg-gradient-to-b from-purple-900/60 via-indigo-900/60 to-slate-900/60 backdrop-blur-md transition-all duration-500 ${
            isActive ? 'opacity-100' : 'opacity-0'
          }`}
          onClick={onClose}
        />
        <div
          className={`relative text-center transform transition-all duration-700 ${
            isActive
              ? 'scale-100 opacity-100 translate-y-0'
              : 'scale-0 opacity-0 translate-y-8'
          }`}
        >
          <div className="mb-8">
            <div className="text-8xl mb-4 animate-bounce" style={{ animationDuration: '1.5s' }}>
              ✨
            </div>
          </div>

          <h1 className="text-6xl font-black mb-4 text-transparent bg-clip-text bg-gradient-to-r from-purple-300 via-pink-300 to-indigo-300">
            {timeOfDay}!
          </h1>
          <p className="text-3xl font-bold text-purple-200 mb-4">LifeQuest</p>
          <p className="text-lg text-gray-300 mb-2">Добро пожаловать в игру жизни</p>
          <p className="text-sm text-gray-400">Новый день - новые возможности</p>

          <div className="mt-8 flex gap-3 justify-center">
            <div className="px-8 py-3 bg-gradient-to-r from-purple-600 to-indigo-600 rounded-lg text-white font-semibold hover:shadow-lg hover:shadow-purple-500/50 cursor-pointer transition-all">
              Начнём!
            </div>
          </div>

          <div className="mt-12 flex justify-center gap-6">
            <div className="w-2 h-2 rounded-full bg-purple-400 animate-pulse" />
            <div className="w-2 h-2 rounded-full bg-pink-400 animate-pulse" style={{ animationDelay: '0.2s' }} />
            <div className="w-2 h-2 rounded-full bg-indigo-400 animate-pulse" style={{ animationDelay: '0.4s' }} />
          </div>
        </div>
      </div>
    );
  }

  if (notification.type === 'achievement') {
    return (
      <div
        className={`fixed inset-0 flex items-end justify-end pointer-events-auto p-6 transition-all duration-500 ${
          isActive ? 'opacity-100' : 'opacity-0'
        }`}
      >
        <div
          className={`transform transition-all duration-700 origin-bottom-right ${
            isActive
              ? 'scale-100 opacity-100 translate-x-0 translate-y-0'
              : 'scale-0 opacity-0 translate-x-8 translate-y-8'
          }`}
        >
          <div className="bg-gradient-to-br from-emerald-900 to-teal-900 border border-emerald-500/50 rounded-xl p-6 shadow-2xl max-w-sm">
            <div className="flex items-start gap-4">
              <div className="flex-shrink-0 mt-1">
                <div className="flex items-center justify-center h-12 w-12 rounded-lg bg-emerald-600/30">
                  <Trophy className="h-6 w-6 text-emerald-400" />
                </div>
              </div>
              <div className="flex-1 min-w-0">
                <h3 className="text-lg font-bold text-emerald-300">Достижение разблокировано!</h3>
                <p className="text-sm text-emerald-200 mt-1">{notification.achievement}</p>
                <div className="mt-3 flex items-center gap-2">
                  <Star className="h-4 w-4 text-yellow-400" />
                  <span className="text-sm text-yellow-300 font-semibold">+100 XP</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (notification.type === 'daily-reward') {
    return (
      <div
        className={`fixed inset-0 flex items-center justify-center pointer-events-auto transition-all duration-500 ${
          isActive ? 'opacity-100' : 'opacity-0'
        }`}
      >
        <div
          className={`fixed inset-0 bg-black/60 backdrop-blur-sm transition-all duration-500 ${
            isActive ? 'opacity-100' : 'opacity-0'
          }`}
          onClick={onClose}
        />
        <div
          className={`relative text-center transform transition-all duration-700 ${
            isActive
              ? 'scale-100 opacity-100 translate-y-0'
              : 'scale-0 opacity-0 translate-y-8'
          }`}
        >
          <div className="mb-6">
            <div className="relative w-28 h-28 mx-auto">
              <div className="absolute inset-0 bg-gradient-to-r from-amber-400 to-yellow-500 rounded-full blur-2xl opacity-75 animate-pulse" />
              <div className="relative flex items-center justify-center w-28 h-28 bg-gradient-to-br from-amber-400 to-yellow-600 rounded-full shadow-2xl animate-bounce">
                <Gift className="w-14 h-14 text-yellow-900" />
              </div>
            </div>
          </div>

          <h1 className="text-4xl font-black mb-2 text-transparent bg-clip-text bg-gradient-to-r from-amber-300 to-yellow-400 animate-pulse">
            Ежедневная награда!
          </h1>
          <p className="text-xl font-bold text-amber-300 mb-4">🎁 +{notification.xpReward || 50} XP</p>
          <p className="text-lg text-gray-300 mb-2">Приходи завтра за новой наградой</p>
        </div>
      </div>
    );
  }

  if (notification.type === 'quest-complete') {
    return (
      <div
        className={`fixed inset-0 flex items-end justify-center pointer-events-auto p-6 transition-all duration-500 ${
          isActive ? 'opacity-100' : 'opacity-0'
        }`}
      >
        <div
          className={`transform transition-all duration-700 origin-bottom ${
            isActive
              ? 'scale-100 opacity-100 translate-y-0'
              : 'scale-0 opacity-0 translate-y-8'
          }`}
        >
          <div className="bg-gradient-to-br from-blue-900 to-cyan-900 border border-blue-500/50 rounded-xl p-6 shadow-2xl max-w-sm">
            <div className="flex items-start gap-4">
              <div className="flex-shrink-0 mt-1">
                <div className="flex items-center justify-center h-12 w-12 rounded-lg bg-blue-600/30">
                  <Zap className="h-6 w-6 text-blue-400" />
                </div>
              </div>
              <div className="flex-1 min-w-0">
                <h3 className="text-lg font-bold text-blue-300">{notification.title || 'Квест выполнен!'}</h3>
                <p className="text-sm text-blue-200 mt-1">{notification.message}</p>
                <div className="mt-3 flex items-center gap-2">
                  <Star className="h-4 w-4 text-yellow-400" />
                  <span className="text-sm text-yellow-300 font-semibold">+{notification.xpReward || 50} XP</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (notification.type === 'goal-complete') {
    return (
      <div
        className={`fixed inset-0 flex items-end justify-center pointer-events-auto p-6 transition-all duration-500 ${
          isActive ? 'opacity-100' : 'opacity-0'
        }`}
      >
        <div
          className={`transform transition-all duration-700 origin-bottom ${
            isActive
              ? 'scale-100 opacity-100 translate-y-0'
              : 'scale-0 opacity-0 translate-y-8'
          }`}
        >
          <div className="bg-gradient-to-br from-purple-900 to-indigo-900 border border-purple-500/50 rounded-xl p-6 shadow-2xl max-w-sm">
            <div className="flex items-start gap-4">
              <div className="flex-shrink-0 mt-1">
                <div className="flex items-center justify-center h-12 w-12 rounded-lg bg-purple-600/30">
                  <Trophy className="h-6 w-6 text-purple-400" />
                </div>
              </div>
              <div className="flex-1 min-w-0">
                <h3 className="text-lg font-bold text-purple-300">{notification.title || 'Цель достигнута!'}</h3>
                <p className="text-sm text-purple-200 mt-1">{notification.message}</p>
                <div className="mt-3 flex items-center gap-2">
                  <Star className="h-4 w-4 text-yellow-400" />
                  <span className="text-sm text-yellow-300 font-semibold">+{notification.xpReward || 100} XP</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (notification.type === 'day-end') {
    const isPoorDay = notification.dayQuality === 'poor';
    const isExcellentDay = notification.dayQuality === 'excellent';
    
    return (
      <div
        className={`fixed inset-0 flex items-center justify-center pointer-events-auto transition-all duration-500 ${
          isActive ? 'opacity-100' : 'opacity-0'
        }`}
      >
        <div
          className={`fixed inset-0 backdrop-blur-sm transition-all duration-500 ${
            isActive ? 'opacity-100' : 'opacity-0'
          } ${isPoorDay ? 'bg-red-900/40' : isExcellentDay ? 'bg-green-900/40' : 'bg-blue-900/40'}`}
          onClick={onClose}
        />
        <div
          className={`relative text-center transform transition-all duration-700 max-w-xl ${
            isActive
              ? 'scale-100 opacity-100 translate-y-0'
              : 'scale-0 opacity-0 translate-y-8'
          }`}
        >
          <div className="mb-6">
            <div className="relative w-32 h-32 mx-auto">
              <div className={`absolute inset-0 rounded-full blur-3xl opacity-75 animate-pulse ${
                isPoorDay 
                  ? 'bg-red-600' 
                  : isExcellentDay 
                  ? 'bg-green-500' 
                  : 'bg-yellow-500'
              }`} />
              <div className={`relative flex items-center justify-center w-32 h-32 rounded-full shadow-2xl ${
                isPoorDay
                  ? 'bg-gradient-to-br from-red-500 to-red-700'
                  : isExcellentDay
                  ? 'bg-gradient-to-br from-green-500 to-emerald-600'
                  : 'bg-gradient-to-br from-yellow-400 to-amber-600'
              }`}>
                <span className="text-5xl">{isPoorDay ? '😓' : isExcellentDay ? '🎉' : '😊'}</span>
              </div>
            </div>
          </div>

          <h1 className={`text-5xl font-black mb-4 text-transparent bg-clip-text animate-pulse ${
            isPoorDay
              ? 'bg-gradient-to-r from-red-300 to-red-500'
              : isExcellentDay
              ? 'bg-gradient-to-r from-green-300 to-emerald-500'
              : 'bg-gradient-to-r from-yellow-300 to-amber-500'
          }`}>
            {notification.title}
          </h1>

          <p className="text-2xl font-bold mb-6 text-gray-200">{notification.message}</p>

          <div className={`p-6 rounded-lg border-2 mb-6 ${
            isPoorDay
              ? 'bg-red-900/30 border-red-500/50'
              : isExcellentDay
              ? 'bg-green-900/30 border-green-500/50'
              : 'bg-yellow-900/30 border-yellow-500/50'
          }`}>
            <p className={`text-lg font-semibold ${
              isPoorDay
                ? 'text-red-300'
                : isExcellentDay
                ? 'text-green-300'
                : 'text-yellow-300'
            }`}>
              {isPoorDay
                ? '💪 Занимайтесь побольше! У вас всё получится!'
                : isExcellentDay
                ? '⭐ Отличный день! Продолжайте в том же духе!'
                : '👍 Неплохой день! Завтра будет ещё лучше!'}
            </p>
          </div>

          <div className="flex gap-3 justify-center">
            <div className={`px-6 py-2 rounded-lg text-white font-semibold hover:shadow-lg cursor-pointer transition-all ${
              isPoorDay
                ? 'bg-gradient-to-r from-red-600 to-red-700 hover:shadow-red-500/50'
                : isExcellentDay
                ? 'bg-gradient-to-r from-green-600 to-emerald-700 hover:shadow-green-500/50'
                : 'bg-gradient-to-r from-yellow-600 to-amber-700 hover:shadow-yellow-500/50'
            }`}>
              До завтра!
            </div>
          </div>
        </div>
      </div>
    );
  }

  return null;
}
