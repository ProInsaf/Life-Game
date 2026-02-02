import { createContext, useContext } from 'react';

interface NotificationContextType {
  addAchievementNotification: (achievement: string) => void;
  addLevelUpNotification: (level: number) => void;
  addDailyRewardNotification: (xpReward: number) => void;
  addQuestCompleteNotification: (title: string, message: string, xpReward: number) => void;
  addGoalCompleteNotification: (title: string, message: string, xpReward: number) => void;
  addDayEndNotification: (title: string, message: string, dayQuality: 'poor' | 'good' | 'excellent') => void;
}

const NotificationContext = createContext<NotificationContextType | undefined>(undefined);

export function useNotificationContext() {
  const context = useContext(NotificationContext);
  if (!context) {
    throw new Error('useNotificationContext must be used within NotificationProvider');
  }
  return context;
}

export { NotificationContext };
