export interface StudyEntry {
  id: string;
  date: string;
  subject: string;
  type: 'theory' | 'practice';
  hours: number;
  minutes: number;
  comment?: string;
  xpEarned: number;
  quality: number; // 1-5: how well focused and productive
  focus: number; // 1-5: concentration level
  efficiency: number; // 1-5: how efficient the session was
}

export interface Goal {
  id: string;
  title: string;
  type: 'daily' | 'weekly' | 'monthly';
  plannedHours: number;
  actualHours: number;
  completed: boolean;
  createdAt: string;
  deadline: string;
}

export interface Quest {
  id: string;
  title: string;
  description: string;
  type: 'daily' | 'weekly' | 'longterm';
  xpReward: number;
  statEffects: Partial<Stats>;
  completed: boolean;
  createdAt: string;
  deadline?: string;
}

export interface Stats {
  focus: number;
  discipline: number;
  energy: number;
  motivation: number;
  timeManagement: number;
  study: number;
  emotionalStability: number;
  sport: number;
}

export interface Buff {
  id: string;
  name: string;
  icon: string;
  effect: string;
  active: boolean;
  multiplier: number;
}

export interface Debuff {
  id: string;
  name: string;
  icon: string;
  effect: string;
  active: boolean;
  penalty: number;
}

export interface Achievement {
  id: string;
  title: string;
  description: string;
  icon: string;
  unlocked: boolean;
  unlockedAt?: string;
  xpReward: number;
}

export interface GameState {
  currentDay: number;
  streak: number;
  seasonStartDate: string;
  lastActiveDate: string;
  xp: number;
  level: number;
  ironMode: boolean;
  stats: Stats;
  studyEntries: StudyEntry[];
  goals: Goal[];
  quests: Quest[];
  buffs: Buff[];
  debuffs: Debuff[];
  achievements: Achievement[];
  seasonHistory: SeasonRecord[];
}

export interface SeasonRecord {
  id: string;
  startDate: string;
  endDate: string;
  totalDays: number;
  maxStreak: number;
  totalXp: number;
  finalLevel: number;
  totalStudyHours: number;
}

export interface ShopItem {
  id: string;
  name: string;
  description: string;
  icon: string;
  price: number;
  rarity: 'common' | 'rare' | 'epic' | 'legendary';
  effect: string;
  category: 'buff' | 'gear' | 'cosmetic' | 'consumable';
  buffEffect?: {
    statBoost: Partial<Stats>;
    duration: number; // days
    multiplier?: number;
  };
}

export interface InventoryItem {
  itemId: string;
  quantity: number;
  acquiredAt: string;
  expiresAt?: string;
}

export interface DailyReward {
  id: string;
  dayNumber: number;
  goldReward: number;
  xpReward: number;
  itemReward?: string;
  claimedAt?: string;
}

export interface ExamResult {
  id: string;
  subject: string;
  date: string;
  score: number;
  maxScore: number;
  testName: string; // "пробник 1", "пробник 2" итд
  notes?: string;
}

export type SportActivityType = 'running' | 'gym' | 'pushups' | 'pullups' | 'cardio' | 'stretching' | 'yoga' | 'other';

export interface SportEntry {
  id: string;
  date: string;
  type: SportActivityType;
  duration: number; // minutes
  intensity: number; // 1-5 scale
  reps?: number; // for strength training
  distance?: number; // km, for running
  notes?: string;
  createdAt: string;
}

export interface BodyMetrics {
  id: string;
  date: string;
  weight: number; // kg
  height: number; // cm (set once)
  createdAt: string;
}

export interface DayRecord {
  id: string;
  date: string;
  dayNumber: number;
  statsSummary: Stats; // Итоговые статы после усреднения
  previousStats: Stats; // Статы на начало дня
  dailyState: Stats; // Твое самочувствие за день (выбранное в конце дня)
  impressions: string; // Впечатления о дне
  weight?: number; // weight measured at end of day
  totalStudyHours: number;
  completedQuests: number;
  completedGoals: number;
  createdAt: string;
}

export interface EGEProgress {
  subject: string;
  targetScore: number;
  currentScore: number;
  results: ExamResult[];
  averageScore: number;
}

export interface GameState {
  currentDay: number;
  streak: number;
  seasonStartDate: string;
  lastActiveDate: string;
  xp: number;
  level: number;
  ironMode: boolean;
  gold: number;
  stats: Stats;
  studyEntries: StudyEntry[];
  goals: Goal[];
  quests: Quest[];
  buffs: Buff[];
  debuffs: Debuff[];
  achievements: Achievement[];
  seasonHistory: SeasonRecord[];
  inventory: InventoryItem[];
  dailyRewards: DailyReward[];
  lastRewardClaimDate?: string;
  lastDayCompletedDate?: string; // Last date when end of day was completed
  examResults: ExamResult[];
  dayRecords: DayRecord[];
  sportEntries: SportEntry[];
  bodyMetrics: BodyMetrics[];
}

export const SUBJECTS = [
  'Русский язык',
  'Математика',
  'Информатика'
];

export const DEFAULT_STATS: Stats = {
  focus: 50,
  discipline: 50,
  energy: 50,
  motivation: 50,
  timeManagement: 50,
  study: 50,
  emotionalStability: 50,
  sport: 50
};

export const DEFAULT_BUFFS: Buff[] = [
  { id: 'streak', name: 'Серия дней', icon: '🔥', effect: '+10% XP за каждые 7 дней серии', active: false, multiplier: 1.1 },
  { id: 'focus', name: 'Глубокий фокус', icon: '🎯', effect: '+25% XP за сессии более 2 часов', active: false, multiplier: 1.25 },
  { id: 'sport', name: 'Активный образ жизни', icon: '💪', effect: '+15% к энергии', active: false, multiplier: 1.15 },
  { id: 'morning', name: 'Ранняя птица', icon: '🌅', effect: '+20% XP до 10:00', active: false, multiplier: 1.2 }
];

export const DEFAULT_DEBUFFS: Debuff[] = [
  { id: 'procrastination', name: 'Прокрастинация', icon: '😴', effect: '-20% XP', active: false, penalty: 0.8 },
  { id: 'overload', name: 'Перегруз', icon: '🤯', effect: '-30% к фокусу', active: false, penalty: 0.7 },
  { id: 'missed', name: 'Пропуск дня', icon: '❌', effect: 'Сброс серии', active: false, penalty: 0 },
  { id: 'burnout', name: 'Выгорание', icon: '🔻', effect: '-25% ко всем статам', active: false, penalty: 0.75 }
];

export const DEFAULT_ACHIEVEMENTS: Achievement[] = [
  { id: 'first_day', title: 'Первый шаг', description: 'Начни свой путь', icon: '🎮', unlocked: false, xpReward: 50 },
  { id: 'week_streak', title: 'Неделя дисциплины', description: 'Серия 7 дней', icon: '📅', unlocked: false, xpReward: 200 },
  { id: 'month_streak', title: 'Месяц силы воли', description: 'Серия 30 дней', icon: '🏆', unlocked: false, xpReward: 1000 },
  { id: 'study_10h', title: 'Ученик', description: 'Научись 10 часов', icon: '📚', unlocked: false, xpReward: 100 },
  { id: 'study_50h', title: 'Студент', description: 'Научись 50 часов', icon: '🎓', unlocked: false, xpReward: 500 },
  { id: 'study_100h', title: 'Мастер знаний', description: 'Научись 100 часов', icon: '🧠', unlocked: false, xpReward: 1500 },
  { id: 'level_5', title: 'Новичок+', description: 'Достигни 5 уровня', icon: '⬆️', unlocked: false, xpReward: 150 },
  { id: 'level_10', title: 'Опытный', description: 'Достигни 10 уровня', icon: '🌟', unlocked: false, xpReward: 400 },
  { id: 'level_25', title: 'Ветеран', description: 'Достигни 25 уровня', icon: '👑', unlocked: false, xpReward: 2000 },
  { id: 'quest_10', title: 'Квестоман', description: 'Выполни 10 квестов', icon: '⚔️', unlocked: false, xpReward: 300 },
  { id: 'iron_week', title: 'Железная воля', description: 'Неделя в Iron Mode', icon: '🛡️', unlocked: false, xpReward: 500 },
  { id: 'all_stats_70', title: 'Баланс', description: 'Все статы выше 70', icon: '⚖️', unlocked: false, xpReward: 800 }
];

export const SHOP_ITEMS: ShopItem[] = [
  {
    id: 'focus_potion',
    name: 'Зелье фокуса',
    description: 'Временно повышает концентрацию на 25%',
    icon: '🧪',
    price: 100,
    rarity: 'common',
    effect: '+25% к фокусу на 1 день',
    category: 'consumable',
    buffEffect: {
      statBoost: { focus: 25 },
      duration: 1,
      multiplier: 1.25
    }
  },
  {
    id: 'energy_drink',
    name: 'Энергетический напиток',
    description: 'Восстанавливает энергию на 20 пунктов',
    icon: '⚡',
    price: 80,
    rarity: 'common',
    effect: '+20 энергии',
    category: 'consumable',
    buffEffect: {
      statBoost: { energy: 20 },
      duration: 0
    }
  },
  {
    id: 'discipline_book',
    name: 'Книга дисциплины',
    description: 'Повышает дисциплину на 15 пунктов',
    icon: '📖',
    price: 150,
    rarity: 'rare',
    effect: '+15 дисциплины',
    category: 'consumable',
    buffEffect: {
      statBoost: { discipline: 15 },
      duration: 0
    }
  },
  {
    id: 'meditation_scroll',
    name: 'Свиток медитации',
    description: 'Улучшает эмоциональную стабильность на 20 пунктов',
    icon: '🧘',
    price: 120,
    rarity: 'rare',
    effect: '+20 эмоциональной стабильности',
    category: 'consumable',
    buffEffect: {
      statBoost: { emotionalStability: 20 },
      duration: 0
    }
  },
  {
    id: 'scholar_crown',
    name: 'Корона учёного',
    description: 'Легендарное снаряжение. +20% к XP от учёбы',
    icon: '👑',
    price: 500,
    rarity: 'legendary',
    effect: '+20% XP от учёбы',
    category: 'gear',
    buffEffect: {
      statBoost: { study: 10 },
      duration: 999,
      multiplier: 1.2
    }
  },
  {
    id: 'time_crystal',
    name: 'Кристалл времени',
    description: 'Эпическое снаряжение. +15% ко всем XP на 3 дня',
    icon: '💎',
    price: 300,
    rarity: 'epic',
    effect: '+15% ко всем XP на 3 дня',
    category: 'gear',
    buffEffect: {
      statBoost: { timeManagement: 10 },
      duration: 3,
      multiplier: 1.15
    }
  },
  {
    id: 'willpower_amulet',
    name: 'Амулет воли',
    description: 'Эпическое снаряжение. Повышает мотивацию на 25 пунктов',
    icon: '🔮',
    price: 250,
    rarity: 'epic',
    effect: '+25 мотивации',
    category: 'gear',
    buffEffect: {
      statBoost: { motivation: 25 },
      duration: 0
    }
  },
  {
    id: 'gold_star',
    name: 'Золотая звезда',
    description: 'Редкое снаряжение. Немного улучшает все статы',
    icon: '⭐',
    price: 180,
    rarity: 'rare',
    effect: '+5 ко всем статам',
    category: 'gear',
    buffEffect: {
      statBoost: { 
        focus: 5, 
        discipline: 5, 
        energy: 5, 
        motivation: 5, 
        timeManagement: 5, 
        study: 5, 
        emotionalStability: 5 
      },
      duration: 0
    }
  },
  {
    id: 'phoenix_feather',
    name: 'Перо Феникса',
    description: 'Легендарная косметика. Показывает вашу грацию',
    icon: '🔥',
    price: 400,
    rarity: 'legendary',
    effect: 'Статус, эффект внешний',
    category: 'cosmetic'
  },
  {
    id: 'scholar_badge',
    name: 'Медаль учёного',
    description: 'Редкая косметика. Показывает вашу учёность',
    icon: '🎖️',
    price: 200,
    rarity: 'rare',
    effect: 'Статус, эффект внешний',
    category: 'cosmetic'
  }
];

export const DEFAULT_QUESTS: Quest[] = [
  {
    id: 'study_today',
    title: 'Учись 1 час',
    description: 'Добавь 1 час учёбы',
    type: 'daily',
    xpReward: 100,
    statEffects: { study: 10, focus: 5 },
    completed: false,
    createdAt: new Date().toISOString(),
    deadline: new Date().toISOString().split('T')[0]
  },
  {
    id: 'focus_session',
    title: 'Глубокий фокус',
    description: 'Сессия 2+ часов с качеством 4+',
    type: 'daily',
    xpReward: 150,
    statEffects: { focus: 15, study: 10 },
    completed: false,
    createdAt: new Date().toISOString(),
    deadline: new Date().toISOString().split('T')[0]
  },
  {
    id: 'sport_today',
    title: 'Тренировка дня',
    description: 'Добавь тренировку (30+ минут)',
    type: 'daily',
    xpReward: 120,
    statEffects: { sport: 15, energy: 10 },
    completed: false,
    createdAt: new Date().toISOString(),
    deadline: new Date().toISOString().split('T')[0]
  },
  {
    id: 'morning_routine',
    title: 'Утренний рутин',
    description: 'Выполни занятия до 9:00',
    type: 'daily',
    xpReward: 80,
    statEffects: { discipline: 5, motivation: 10 },
    completed: false,
    createdAt: new Date().toISOString(),
    deadline: new Date().toISOString().split('T')[0]
  },
  {
    id: 'three_exams',
    title: 'Триплет знаний',
    description: 'Добавь пробники по всем 3 предметам',
    type: 'weekly',
    xpReward: 300,
    statEffects: { study: 20, focus: 15 },
    completed: false,
    createdAt: new Date().toISOString()
  },
  {
    id: 'consistent_week',
    title: 'Постоянство',
    description: 'Учись 7 дней подряд',
    type: 'longterm',
    xpReward: 500,
    statEffects: { discipline: 25, motivation: 20 },
    completed: false,
    createdAt: new Date().toISOString()
  },
  {
    id: 'level_up',
    title: 'Повышение уровня',
    description: 'Достигни нового уровня',
    type: 'longterm',
    xpReward: 200,
    statEffects: { motivation: 15 },
    completed: false,
    createdAt: new Date().toISOString()
  },
  {
    id: 'russian_progress',
    title: 'Русский мастер',
    description: 'Набери 80+ баллов по русскому',
    type: 'longterm',
    xpReward: 250,
    statEffects: { study: 10 },
    completed: false,
    createdAt: new Date().toISOString()
  },
  {
    id: 'math_progress',
    title: 'Математический гений',
    description: 'Набери 80+ баллов по математике',
    type: 'longterm',
    xpReward: 250,
    statEffects: { study: 10 },
    completed: false,
    createdAt: new Date().toISOString()
  },
  {
    id: 'tech_progress',
    title: 'IT специалист',
    description: 'Набери 80+ баллов по информатике',
    type: 'longterm',
    xpReward: 250,
    statEffects: { study: 10 },
    completed: false,
    createdAt: new Date().toISOString()
  }
];

export const DAILY_REWARD_SCHEDULE: DailyReward[] = Array.from({ length: 30 }, (_, i) => ({
  id: `day_${i + 1}`,
  dayNumber: i + 1,
  goldReward: 50 + (i * 10),
  xpReward: 100 + (i * 25),
  itemReward: i % 7 === 6 ? 'focus_potion' : undefined,
  claimedAt: undefined
}));
