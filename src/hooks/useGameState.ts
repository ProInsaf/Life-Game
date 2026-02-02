import { useState, useEffect, useCallback } from 'react';
import { format, differenceInDays, startOfDay, parseISO } from 'date-fns';
import {
  GameState,
  Stats,
  StudyEntry,
  Goal,
  Quest,
  DEFAULT_STATS,
  DEFAULT_BUFFS,
  DEFAULT_DEBUFFS,
  DEFAULT_ACHIEVEMENTS,
  DEFAULT_QUESTS,
  SHOP_ITEMS,
  DAILY_REWARD_SCHEDULE,
  ShopItem,
  InventoryItem,
  DailyReward,
  ExamResult,
  DayRecord
} from '../types';

const STORAGE_KEY = 'lifequest_gamestate';

const getInitialState = (): GameState => {
  const today = format(new Date(), 'yyyy-MM-dd');
  return {
    currentDay: 1,
    streak: 1,
    seasonStartDate: today,
    lastActiveDate: today,
    xp: 0,
    level: 1,
    ironMode: false,
    gold: 500,
    stats: DEFAULT_STATS,
    studyEntries: [],
    goals: [],
    quests: DEFAULT_QUESTS,
    buffs: DEFAULT_BUFFS,
    debuffs: DEFAULT_DEBUFFS,
    achievements: DEFAULT_ACHIEVEMENTS,
    seasonHistory: [],
    inventory: [],
    dailyRewards: DAILY_REWARD_SCHEDULE,
    examResults: [],
    dayRecords: [],
    sportEntries: [],
    bodyMetrics: []
  };
};

export const calculateLevel = (xp: number): number => {
  // Formula: level = floor(sqrt(xp / 100)) + 1
  return Math.floor(Math.sqrt(xp / 100)) + 1;
};

export const xpForLevel = (level: number): number => {
  return (level - 1) * (level - 1) * 100;
};

export const xpForNextLevel = (level: number): number => {
  return level * level * 100;
};

export function useGameState() {
  const [state, setState] = useState<GameState>(() => {
    const saved = localStorage.getItem(STORAGE_KEY);
    if (saved) {
      try {
        const parsed = JSON.parse(saved) as GameState;
        // Recalculate level based on current XP to ensure it's always correct
        const correctLevel = calculateLevel(parsed.xp || 50);
        // Ensure new fields exist
        return {
          ...parsed,
          level: correctLevel,
          examResults: parsed.examResults || [],
          dayRecords: parsed.dayRecords || [],
          inventory: parsed.inventory || [],
          dailyRewards: parsed.dailyRewards || DAILY_REWARD_SCHEDULE,
          quests: parsed.quests && parsed.quests.length > 0 ? parsed.quests : DEFAULT_QUESTS,
          sportEntries: parsed.sportEntries || [],
          bodyMetrics: parsed.bodyMetrics || []
        };
      } catch {
        return getInitialState();
      }
    }
    return getInitialState();
  });

  // Save to localStorage whenever state changes
  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
  }, [state]);

  // Check for new day on mount
  useEffect(() => {
    const today = format(new Date(), 'yyyy-MM-dd');
    const lastActive = state.lastActiveDate;
    
    if (lastActive !== today) {
      const lastDate = parseISO(lastActive);
      const todayDate = startOfDay(new Date());
      const daysDiff = differenceInDays(todayDate, startOfDay(lastDate));
      
      setState(prev => {
        const newStreak = daysDiff === 1 ? prev.streak + 1 : (daysDiff > 1 ? 0 : prev.streak);
        const newDay = prev.currentDay + daysDiff;
        
        // Check for missed day debuff
        const updatedDebuffs = prev.debuffs.map(d => 
          d.id === 'missed' ? { ...d, active: daysDiff > 1 } : d
        );
        
        // Update discipline stat for missed days
        const disciplinePenalty = daysDiff > 1 ? Math.min(15 * (daysDiff - 1), 30) : 0;
        
        return {
          ...prev,
          currentDay: newDay,
          streak: newStreak,
          lastActiveDate: today,
          debuffs: updatedDebuffs,
          stats: {
            ...prev.stats,
            discipline: Math.max(0, prev.stats.discipline - disciplinePenalty)
          }
        };
      });
    }
  }, []);

  const addXP = useCallback((amount: number) => {
    setState(prev => {
      // Apply buff multipliers
      let finalAmount = amount;
      prev.buffs.forEach(buff => {
        if (buff.active) {
          finalAmount *= buff.multiplier;
        }
      });
      
      // Apply debuff penalties
      prev.debuffs.forEach(debuff => {
        if (debuff.active && debuff.penalty > 0) {
          finalAmount *= debuff.penalty;
        }
      });
      
      const newXP = prev.xp + Math.round(finalAmount);
      const newLevel = calculateLevel(newXP);
      
      return {
        ...prev,
        xp: newXP,
        level: newLevel
      };
    });
  }, []);

  const updateStats = useCallback((changes: Partial<Stats>) => {
    setState(prev => ({
      ...prev,
      stats: Object.keys(changes).reduce((acc, key) => ({
        ...acc,
        [key]: Math.max(0, Math.min(100, (prev.stats[key as keyof Stats] || 0) + (changes[key as keyof Stats] || 0)))
      }), prev.stats)
    }));
  }, []);

  const addStudyEntry = useCallback((entry: Omit<StudyEntry, 'id' | 'xpEarned'>) => {
    const totalMinutes = entry.hours * 60 + entry.minutes;
    // Apply quality multiplier to XP calculation
    const qualityMultiplier = entry.quality / 3; // 1-5 scale normalized
    const baseXP = Math.round(totalMinutes * 2 * qualityMultiplier);
    const bonusXP = entry.type === 'practice' ? Math.round(baseXP * 0.25) : 0;
    const xpEarned = baseXP + bonusXP;
    
    const newEntry: StudyEntry = {
      ...entry,
      id: crypto.randomUUID(),
      xpEarned
    };
    
    setState(prev => ({
      ...prev,
      studyEntries: [...prev.studyEntries, newEntry]
    }));
    
    addXP(xpEarned);
    
    // Update stats based on study quality - add bonuses for high quality, penalties for low
    const studyBoost = Math.min(5, Math.round(totalMinutes / 30));
    const focusBoost = Math.round((entry.focus - 3) * 2); // -4 to +4
    const qualityPenalty = Math.round((3 - entry.quality) * 3); // Negative if quality < 3
    const efficiencyBoost = entry.efficiency > 3 ? 2 : (entry.efficiency < 3 ? -2 : 0);
    
    updateStats({
      study: studyBoost,
      focus: focusBoost,
      discipline: entry.quality > 3 ? Math.round(entry.quality / 2) : -Math.round((4 - entry.quality) * 2),
      emotionalStability: efficiencyBoost
    });
    
    // Check for deep focus buff (2+ hours)
    if (totalMinutes >= 120 && entry.focus >= 4) {
      setState(prev => ({
        ...prev,
        buffs: prev.buffs.map(b => b.id === 'focus' ? { ...b, active: true } : b)
      }));
    }
    
    return xpEarned;
  }, [addXP, updateStats]);

  const addGoal = useCallback((goal: Omit<Goal, 'id' | 'actualHours' | 'completed' | 'createdAt'>) => {
    const newGoal: Goal = {
      ...goal,
      id: crypto.randomUUID(),
      actualHours: 0,
      completed: false,
      createdAt: new Date().toISOString()
    };
    
    setState(prev => ({
      ...prev,
      goals: [...prev.goals, newGoal]
    }));
  }, []);

  const updateGoal = useCallback((id: string, updates: Partial<Goal>) => {
    setState(prev => ({
      ...prev,
      goals: prev.goals.map(g => g.id === id ? { ...g, ...updates } : g)
    }));
    
    // If goal completed, give XP
    if (updates.completed) {
      const goal = state.goals.find(g => g.id === id);
      if (goal) {
        const xpReward = goal.type === 'daily' ? 50 : goal.type === 'weekly' ? 200 : 500;
        addXP(xpReward);
        updateStats({ motivation: 3, discipline: 2 });
      }
    }
  }, [state.goals, addXP, updateStats]);

  const addQuest = useCallback((quest: Omit<Quest, 'id' | 'completed' | 'createdAt'>) => {
    const newQuest: Quest = {
      ...quest,
      id: crypto.randomUUID(),
      completed: false,
      createdAt: new Date().toISOString()
    };
    
    setState(prev => ({
      ...prev,
      quests: [...prev.quests, newQuest]
    }));
  }, []);

  const completeQuest = useCallback((id: string) => {
    const quest = state.quests.find(q => q.id === id);
    if (!quest || quest.completed) return;
    
    setState(prev => ({
      ...prev,
      quests: prev.quests.map(q => q.id === id ? { ...q, completed: true } : q)
    }));
    
    addXP(quest.xpReward);
    updateStats(quest.statEffects);
  }, [state.quests, addXP, updateStats]);

  const deleteQuest = useCallback((id: string) => {
    setState(prev => ({
      ...prev,
      quests: prev.quests.filter(q => q.id !== id)
    }));
  }, []);

  const toggleBuff = useCallback((id: string) => {
    setState(prev => ({
      ...prev,
      buffs: prev.buffs.map(b => b.id === id ? { ...b, active: !b.active } : b)
    }));
  }, []);

  const toggleDebuff = useCallback((id: string) => {
    setState(prev => ({
      ...prev,
      debuffs: prev.debuffs.map(d => d.id === id ? { ...d, active: !d.active } : d)
    }));
  }, []);

  const toggleIronMode = useCallback(() => {
    setState(prev => ({
      ...prev,
      ironMode: !prev.ironMode
    }));
  }, []);

  const startNewSeason = useCallback(() => {
    const today = format(new Date(), 'yyyy-MM-dd');
    const totalStudyHours = state.studyEntries.reduce((sum, e) => sum + e.hours + e.minutes / 60, 0);
    
    const seasonRecord = {
      id: crypto.randomUUID(),
      startDate: state.seasonStartDate,
      endDate: today,
      totalDays: state.currentDay,
      maxStreak: state.streak,
      totalXp: state.xp,
      finalLevel: state.level,
      totalStudyHours: Math.round(totalStudyHours * 10) / 10
    };
    
    setState(prev => ({
      ...getInitialState(),
      seasonHistory: [...prev.seasonHistory, seasonRecord],
      achievements: prev.achievements // Keep achievements
    }));
  }, [state]);

  const checkAchievements = useCallback(() => {
    const totalStudyHours = state.studyEntries.reduce((sum, e) => sum + e.hours + e.minutes / 60, 0);
    const completedQuests = state.quests.filter(q => q.completed).length;
    const allStatsAbove70 = Object.values(state.stats).every(s => s >= 70);
    
    const achievementChecks: Record<string, boolean> = {
      'first_day': state.currentDay >= 1,
      'week_streak': state.streak >= 7,
      'month_streak': state.streak >= 30,
      'study_10h': totalStudyHours >= 10,
      'study_50h': totalStudyHours >= 50,
      'study_100h': totalStudyHours >= 100,
      'level_5': state.level >= 5,
      'level_10': state.level >= 10,
      'level_25': state.level >= 25,
      'quest_10': completedQuests >= 10,
      'iron_week': state.ironMode && state.streak >= 7,
      'all_stats_70': allStatsAbove70
    };
    
    let xpGained = 0;
    
    setState(prev => ({
      ...prev,
      achievements: prev.achievements.map(a => {
        if (!a.unlocked && achievementChecks[a.id]) {
          xpGained += a.xpReward;
          return { ...a, unlocked: true, unlockedAt: new Date().toISOString() };
        }
        return a;
      })
    }));
    
    if (xpGained > 0) {
      addXP(xpGained);
    }
  }, [state, addXP]);

  // Check achievements periodically
  useEffect(() => {
    checkAchievements();
  }, [state.streak, state.level, state.studyEntries.length, state.quests]);

  // Helper functions
  const getTodayStudyTime = useCallback(() => {
    const today = format(new Date(), 'yyyy-MM-dd');
    return state.studyEntries
      .filter(e => e.date === today)
      .reduce((sum, e) => sum + e.hours * 60 + e.minutes, 0);
  }, [state.studyEntries]);

  const getWeekStudyTime = useCallback(() => {
    const now = new Date();
    const weekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
    return state.studyEntries
      .filter(e => new Date(e.date) >= weekAgo)
      .reduce((sum, e) => sum + e.hours * 60 + e.minutes, 0);
  }, [state.studyEntries]);

  const getMonthStudyTime = useCallback(() => {
    const now = new Date();
    const monthAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
    return state.studyEntries
      .filter(e => new Date(e.date) >= monthAgo)
      .reduce((sum, e) => sum + e.hours * 60 + e.minutes, 0);
  }, [state.studyEntries]);

  const buyItem = useCallback((itemId: string) => {
    const item = SHOP_ITEMS.find(i => i.id === itemId);
    if (!item || state.gold < item.price) return false;

    setState(prev => {
      const existingItem = prev.inventory.find(inv => inv.itemId === itemId);
      const newInventory = existingItem
        ? prev.inventory.map(inv =>
            inv.itemId === itemId ? { ...inv, quantity: inv.quantity + 1 } : inv
          )
        : [...prev.inventory, { itemId, quantity: 1, acquiredAt: new Date().toISOString() }];

      return {
        ...prev,
        gold: prev.gold - item.price,
        inventory: newInventory
      };
    });

    return true;
  }, [state.gold]);

  const useItem = useCallback((inventoryIndex: number) => {
    const item = state.inventory[inventoryIndex];
    if (!item) return;

    const shopItem = SHOP_ITEMS.find(i => i.id === item.itemId);
    if (!shopItem || !shopItem.buffEffect) return;

    // Apply the item's effect
    updateStats(shopItem.buffEffect.statBoost);

    // If it has a multiplier, create a temporary buff
    if (shopItem.buffEffect.multiplier && shopItem.buffEffect.multiplier !== 1) {
      setState(prev => ({
        ...prev,
        buffs: [
          ...prev.buffs,
          {
            id: `item_${item.itemId}_${Date.now()}`,
            name: shopItem.name,
            icon: shopItem.icon,
            effect: shopItem.effect,
            active: true,
            multiplier: shopItem.buffEffect?.multiplier || 1
          }
        ]
      }));
    }

    // Remove item from inventory
    setState(prev => ({
      ...prev,
      inventory: prev.inventory
        .map((inv, i) => i === inventoryIndex ? { ...inv, quantity: inv.quantity - 1 } : inv)
        .filter(inv => inv.quantity > 0)
    }));
  }, [state.inventory, updateStats]);

  const claimDailyReward = useCallback(() => {
    const today = format(new Date(), 'yyyy-MM-dd');
    if (state.lastRewardClaimDate === today) return false;

    const currentDayReward = state.dailyRewards.find(r => r.dayNumber === (state.currentDay % 30) || state.currentDay % 30 === 0 ? 30 : state.currentDay % 30);
    if (!currentDayReward) return false;

    setState(prev => ({
      ...prev,
      gold: prev.gold + currentDayReward.goldReward,
      lastRewardClaimDate: today,
      dailyRewards: prev.dailyRewards.map(r =>
        r.id === currentDayReward.id ? { ...r, claimedAt: today } : r
      )
    }));

    addXP(currentDayReward.xpReward);

    // Add item if available
    if (currentDayReward.itemReward) {
      setState(prev => {
        const existingItem = prev.inventory.find(inv => inv.itemId === currentDayReward.itemReward);
        const newInventory = existingItem
          ? prev.inventory.map(inv =>
              inv.itemId === currentDayReward.itemReward ? { ...inv, quantity: inv.quantity + 1 } : inv
            )
          : [...prev.inventory, { itemId: currentDayReward.itemReward!, quantity: 1, acquiredAt: new Date().toISOString() }];

        return {
          ...prev,
          inventory: newInventory
        };
      });
    }

    return true;
  }, [state.currentDay, state.lastRewardClaimDate, state.dailyRewards, addXP]);

  const getTodayReward = useCallback(() => {
    const dayInCycle = (state.currentDay % 30) || (state.currentDay % 30 === 0 ? 30 : state.currentDay % 30);
    return state.dailyRewards.find(r => r.dayNumber === dayInCycle);
  }, [state.currentDay, state.dailyRewards]);

  const canClaimRewardToday = useCallback(() => {
    const today = format(new Date(), 'yyyy-MM-dd');
    return state.lastRewardClaimDate !== today;
  }, [state.lastRewardClaimDate]);

  const addExamResult = useCallback((result: Omit<ExamResult, 'id'>) => {
    const newResult: ExamResult = {
      ...result,
      id: crypto.randomUUID()
    };

    setState(prev => ({
      ...prev,
      examResults: [...prev.examResults, newResult]
    }));

    // Award XP based on score
    const scorePercentage = result.score / result.maxScore;
    const xpReward = Math.round(100 * scorePercentage);
    addXP(xpReward);

    return xpReward;
  }, [addXP]);

  const getEGEProgress = useCallback((): Record<string, { subject: string; results: ExamResult[]; averageScore: number; lastScore: number }> => {
    const subjects = ['Русский язык', 'Математика', 'Информатика'];
    const progress: Record<string, { subject: string; results: ExamResult[]; averageScore: number; lastScore: number }> = {};
    const examResults = state.examResults || [];

    subjects.forEach(subject => {
      const subjectResults = examResults.filter(r => r.subject === subject);
      const averageScore = subjectResults.length > 0
        ? Math.round(subjectResults.reduce((sum, r) => sum + r.score, 0) / subjectResults.length)
        : 0;
      const lastScore = subjectResults.length > 0 ? subjectResults[subjectResults.length - 1].score : 0;

      progress[subject] = {
        subject,
        results: subjectResults,
        averageScore,
        lastScore
      };
    });

    return progress;
  }, [state.examResults]);

  const getSubjectProgress = useCallback((subject: string) => {
    return (state.examResults || []).filter(r => r.subject === subject);
  }, [state.examResults]);

  const endDay = useCallback((impressions: string, dailyState: Stats, weight?: number) => {
    const today = format(new Date(), 'yyyy-MM-dd');
    const previousDayRecord = state.dayRecords.length > 0 ? state.dayRecords[state.dayRecords.length - 1] : null;
    const previousStats = previousDayRecord?.statsSummary || DEFAULT_STATS;
    
    // Calculate average between current stats and daily state
    const averagedStats: Stats = {
      focus: Math.round((state.stats.focus + dailyState.focus) / 2),
      discipline: Math.round((state.stats.discipline + dailyState.discipline) / 2),
      energy: Math.round((state.stats.energy + dailyState.energy) / 2),
      motivation: Math.round((state.stats.motivation + dailyState.motivation) / 2),
      timeManagement: Math.round((state.stats.timeManagement + dailyState.timeManagement) / 2),
      study: Math.round((state.stats.study + dailyState.study) / 2),
      emotionalStability: Math.round((state.stats.emotionalStability + dailyState.emotionalStability) / 2),
      sport: Math.round((state.stats.sport + dailyState.sport) / 2),
    };
    
    const todayStudyTime = getTodayStudyTime();
    const todayQuests = state.quests.filter(q => q.type === 'daily' && q.completed);
    const todayGoals = state.goals.filter(g => g.type === 'daily' && g.completed);

    const newDayRecord: DayRecord = {
      id: crypto.randomUUID(),
      date: today,
      dayNumber: state.currentDay,
      statsSummary: averagedStats,
      previousStats,
      dailyState,
      impressions,
      weight,
      totalStudyHours: Math.round(todayStudyTime / 60 * 10) / 10,
      completedQuests: todayQuests.length,
      completedGoals: todayGoals.length,
      createdAt: new Date().toISOString()
    };

    // Update state stats to the averaged values
    setState(prev => {
      const updatedState: GameState = {
        ...prev,
        stats: averagedStats,
        dayRecords: [...prev.dayRecords, newDayRecord],
        lastDayCompletedDate: today,
      };

      // Update body metrics if weight was provided
      if (weight) {
        updatedState.bodyMetrics = [...prev.bodyMetrics, {
          id: crypto.randomUUID(),
          date: today,
          weight,
          height: (prev.bodyMetrics[0]?.height || 170),
          createdAt: new Date().toISOString()
        }];
      }

      return updatedState;
    });

    return newDayRecord;
  }, [state.dayRecords, state.currentDay, state.stats, state.quests, state.goals, state.bodyMetrics, getTodayStudyTime]);

  const canCompleteDay = useCallback((): boolean => {
    const today = format(new Date(), 'yyyy-MM-dd');
    return state.lastDayCompletedDate !== today;
  }, [state.lastDayCompletedDate]);

  const getWeeklyStatsAverage = useCallback((): Stats => {
    const today = new Date();
    const weekAgo = new Date(today.getTime() - 7 * 24 * 60 * 60 * 1000);
    
    const weekRecords = state.dayRecords.filter(record => {
      const recordDate = new Date(record.date);
      return recordDate >= weekAgo && recordDate <= today;
    });

    if (weekRecords.length === 0) return DEFAULT_STATS;

    const sum = weekRecords.reduce((acc, record) => ({
      focus: acc.focus + record.statsSummary.focus,
      discipline: acc.discipline + record.statsSummary.discipline,
      energy: acc.energy + record.statsSummary.energy,
      motivation: acc.motivation + record.statsSummary.motivation,
      timeManagement: acc.timeManagement + record.statsSummary.timeManagement,
      study: acc.study + record.statsSummary.study,
      emotionalStability: acc.emotionalStability + record.statsSummary.emotionalStability,
      sport: acc.sport + record.statsSummary.sport,
    }), {
      focus: 0,
      discipline: 0,
      energy: 0,
      motivation: 0,
      timeManagement: 0,
      study: 0,
      emotionalStability: 0,
      sport: 0,
    });

    return {
      focus: Math.round(sum.focus / weekRecords.length),
      discipline: Math.round(sum.discipline / weekRecords.length),
      energy: Math.round(sum.energy / weekRecords.length),
      motivation: Math.round(sum.motivation / weekRecords.length),
      timeManagement: Math.round(sum.timeManagement / weekRecords.length),
      study: Math.round(sum.study / weekRecords.length),
      emotionalStability: Math.round(sum.emotionalStability / weekRecords.length),
      sport: Math.round(sum.sport / weekRecords.length),
    };
  }, [state.dayRecords]);

  const addSportEntry = useCallback((entry: Omit<SportEntry, 'id' | 'createdAt'>) => {
    const newEntry: SportEntry = {
      ...entry,
      id: crypto.randomUUID(),
      createdAt: new Date().toISOString()
    };

    setState(prev => ({
      ...prev,
      sportEntries: [...prev.sportEntries, newEntry]
    }));

    return newEntry;
  }, []);

  const breakStreak = useCallback(() => {
    setState(prev => ({
      ...prev,
      streak: 0
    }));
  }, []);

  const exportSave = useCallback((): string => {
    return JSON.stringify(state, null, 2);
  }, [state]);

  const importSave = useCallback((jsonString: string) => {
    try {
      const imported = JSON.parse(jsonString) as GameState;
      setState(imported);
      localStorage.setItem(STORAGE_KEY, JSON.stringify(imported));
      return true;
    } catch {
      return false;
    }
  }, []);

  const resetAllData = useCallback(() => {
    setState(getInitialState());
    localStorage.removeItem(STORAGE_KEY);
  }, []);

  return {
    state,
    addXP,
    updateStats,
    addStudyEntry,
    addGoal,
    updateGoal,
    addQuest,
    completeQuest,
    deleteQuest,
    toggleBuff,
    toggleDebuff,
    toggleIronMode,
    startNewSeason,
    getTodayStudyTime,
    getWeekStudyTime,
    getMonthStudyTime,
    buyItem,
    useItem,
    claimDailyReward,
    getTodayReward,
    canClaimRewardToday,
    addExamResult,
    getEGEProgress,
    getSubjectProgress,
    endDay,
    canCompleteDay,
    getWeeklyStatsAverage,
    addSportEntry,
    breakStreak,
    exportSave,
    importSave,
    resetAllData,
    xpForNextLevel: xpForNextLevel(state.level),
    xpForCurrentLevel: xpForLevel(state.level)
  };
}
