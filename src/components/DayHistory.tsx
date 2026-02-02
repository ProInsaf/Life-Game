import { Calendar, TrendingDown, TrendingUp, BookOpen, CheckCircle } from 'lucide-react';
import { useGameState } from '../hooks/useGameState';
import { format } from 'date-fns';
import { ru } from 'date-fns/locale';

export function DayHistory() {
  const { state } = useGameState();

  if (state.dayRecords.length === 0) {
    return (
      <div className="rounded-lg bg-gray-800/30 border border-gray-700/50 p-8 text-center">
        <Calendar className="h-12 w-12 text-gray-600 mx-auto mb-4" />
        <p className="text-gray-400 text-lg">Нет записей о завершённых днях</p>
        <p className="text-gray-500 text-sm mt-2">Нажми "Конец дня" после учёбы, чтобы начать отслеживать свой прогресс</p>
      </div>
    );
  }

  const sortedRecords = [...state.dayRecords].sort((a, b) =>
    new Date(b.date).getTime() - new Date(a.date).getTime()
  );

  return (
    <div className="space-y-4">
      {sortedRecords.map((record) => {
        const hasImproved = Object.entries(record.statsSummary).some(
          ([key, value]) => value > (record.previousStats[key as keyof typeof record.previousStats] ?? 0)
        );

        return (
          <div
            key={record.id}
            className="rounded-lg bg-gray-800/30 border border-gray-700/50 p-5 hover:bg-gray-800/50 transition-all"
          >
            {/* Header with date and mood indicator */}
            <div className="flex items-start justify-between mb-4">
              <div>
                <div className="flex items-center gap-2">
                  <Calendar className="h-4 w-4 text-purple-400" />
                  <h3 className="text-lg font-bold">
                    День #{record.dayNumber}
                  </h3>
                </div>
                <p className="text-xs text-gray-500 mt-1">
                  {format(new Date(record.date), 'eeee, d MMMM yyyy', { locale: ru })}
                </p>
              </div>
              <div className={`rounded-lg px-3 py-2 ${hasImproved ? 'bg-green-900/30 border border-green-700/50' : 'bg-orange-900/30 border border-orange-700/50'}`}>
                {hasImproved ? (
                  <TrendingUp className="h-5 w-5 text-green-400" />
                ) : (
                  <TrendingDown className="h-5 w-5 text-orange-400" />
                )}
              </div>
            </div>

            {/* Stats changes with daily state comparison */}
            <div className="mb-4 space-y-3">
              <div className="p-3 rounded-lg bg-purple-900/20 border border-purple-700/30">
                <p className="text-xs text-purple-400 uppercase font-semibold mb-2">Твоё самочувствие за день</p>
                <div className="grid gap-2 md:grid-cols-2">
                  {Object.entries(record.dailyState || record.statsSummary).map(([key]) => {
                    const dailyValue = record.dailyState?.[key as keyof typeof record.dailyState] ?? record.statsSummary[key as keyof typeof record.statsSummary];
                    
                    return (
                      <div key={key} className="flex items-center justify-between text-sm">
                        <span className="text-gray-400 capitalize">{key}</span>
                        <div className="flex items-center gap-2">
                          <div className="h-1.5 w-24 rounded-full bg-gray-700 overflow-hidden">
                            <div
                              className="h-full bg-gradient-to-r from-purple-500 to-pink-500"
                              style={{ width: `${dailyValue}%` }}
                            />
                          </div>
                          <span className="text-xs font-semibold text-purple-300 w-8 text-right">{dailyValue}</span>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>

              <div className="p-3 rounded-lg bg-gray-900/30">
                <p className="text-xs text-gray-500 uppercase font-semibold mb-2">Итоговые статы (среднее)</p>
                <div className="grid gap-2 md:grid-cols-2">
                  {Object.entries(record.statsSummary).map(([key, value]) => {
                    const prevValue = record.previousStats[key as keyof typeof record.previousStats] ?? 0;
                    const change = value - prevValue;
                    const isPositive = change >= 0;

                    return (
                      <div key={key} className="flex items-center justify-between text-sm">
                        <span className="text-gray-400 capitalize">{key}</span>
                        <div className="flex items-center gap-2">
                          <span className="text-xs text-gray-500">
                            {prevValue} → <span className="text-gray-300 font-semibold">{value}</span>
                          </span>
                          <span className={`font-bold ${isPositive ? 'text-green-400' : 'text-red-400'}`}>
                            {isPositive && '+'}
                            {change}
                          </span>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>

            {/* Study and activity summary */}
            <div className="grid gap-2 md:grid-cols-3 mb-4">
              <div className="flex items-center gap-2 text-sm">
                <BookOpen className="h-4 w-4 text-cyan-400" />
                <span className="text-gray-400">Учёба:</span>
                <span className="font-semibold">{record.totalStudyHours}ч</span>
              </div>
              {record.completedQuests > 0 && (
                <div className="flex items-center gap-2 text-sm">
                  <CheckCircle className="h-4 w-4 text-yellow-400" />
                  <span className="text-gray-400">Квесты:</span>
                  <span className="font-semibold">{record.completedQuests}</span>
                </div>
              )}
              {record.completedGoals > 0 && (
                <div className="flex items-center gap-2 text-sm">
                  <CheckCircle className="h-4 w-4 text-purple-400" />
                  <span className="text-gray-400">Цели:</span>
                  <span className="font-semibold">{record.completedGoals}</span>
                </div>
              )}
            </div>

            {/* Impressions */}
            {record.impressions && (
              <div className="rounded-lg bg-gray-900/50 border border-gray-700/30 p-3">
                <p className="text-xs text-gray-500 mb-2 uppercase tracking-wider">Впечатления</p>
                <p className="text-sm text-gray-300 leading-relaxed italic">{record.impressions}</p>
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
}
