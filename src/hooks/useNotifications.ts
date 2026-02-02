import { useState, useCallback } from 'react';

export interface Notification {
  id: string;
  type: 'level-up' | 'greeting' | 'achievement' | 'daily-reward' | 'quest-complete' | 'goal-complete' | 'day-end';
  level?: number;
  achievement?: string;
  title?: string;
  message?: string;
  dayQuality?: 'poor' | 'good' | 'excellent';
  xpReward?: number;
}

export function useNotifications() {
  const [notifications, setNotifications] = useState<Notification[]>([]);

  const addLevelUpNotification = useCallback((level: number) => {
    const id = crypto.randomUUID();
    setNotifications(prev => [...prev, {
      id,
      type: 'level-up',
      level
    }]);
  }, []);

  const addGreetingNotification = useCallback(() => {
    const id = crypto.randomUUID();
    setNotifications(prev => [...prev, {
      id,
      type: 'greeting'
    }]);
  }, []);

  const addAchievementNotification = useCallback((achievement: string) => {
    const id = crypto.randomUUID();
    setNotifications(prev => [...prev, {
      id,
      type: 'achievement',
      achievement
    }]);
  }, []);

  const addDailyRewardNotification = useCallback((xpReward: number) => {
    const id = crypto.randomUUID();
    setNotifications(prev => [...prev, {
      id,
      type: 'daily-reward',
      xpReward
    }]);
  }, []);

  const addQuestCompleteNotification = useCallback((title: string, message: string, xpReward: number) => {
    const id = crypto.randomUUID();
    setNotifications(prev => [...prev, {
      id,
      type: 'quest-complete',
      title,
      message,
      xpReward
    }]);
  }, []);

  const addGoalCompleteNotification = useCallback((title: string, message: string, xpReward: number) => {
    const id = crypto.randomUUID();
    setNotifications(prev => [...prev, {
      id,
      type: 'goal-complete',
      title,
      message,
      xpReward
    }]);
  }, []);

  const addDayEndNotification = useCallback((title: string, message: string, dayQuality: 'poor' | 'good' | 'excellent') => {
    const id = crypto.randomUUID();
    setNotifications(prev => [...prev, {
      id,
      type: 'day-end',
      title,
      message,
      dayQuality
    }]);
  }, []);

  const removeNotification = useCallback((id: string) => {
    setNotifications(prev => prev.filter(n => n.id !== id));
  }, []);

  return {
    notifications,
    addLevelUpNotification,
    addGreetingNotification,
    addAchievementNotification,
    addDailyRewardNotification,
    addQuestCompleteNotification,
    addGoalCompleteNotification,
    addDayEndNotification,
    removeNotification
  };
}
