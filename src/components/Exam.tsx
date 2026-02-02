import { useState } from 'react';
import { Zap, TrendingUp, LineChart, Plus, Trophy } from 'lucide-react';
import { format } from 'date-fns';
import { ru } from 'date-fns/locale';
import type { useGameState } from '../hooks/useGameState';

interface ExamProps {
  gameState: ReturnType<typeof useGameState>;
}

type Subject = 'Русский язык' | 'Математика' | 'Информатика';

const SUBJECTS_LIST: Subject[] = ['Русский язык', 'Математика', 'Информатика'];

const SUBJECT_COLORS: Record<Subject, string> = {
  'Русский язык': 'bg-red-900/20 border-red-800/50 text-red-300',
  'Математика': 'bg-blue-900/20 border-blue-800/50 text-blue-300',
  'Информатика': 'bg-purple-900/20 border-purple-800/50 text-purple-300'
};

const SUBJECT_ICONS: Record<Subject, string> = {
  'Русский язык': '📚',
  'Математика': '🔢',
  'Информатика': '💻'
};

const MAX_SCORES: Record<Subject, number> = {
  'Русский язык': 100,
  'Математика': 100,
  'Информатика': 100
};

export function Exam({ gameState }: ExamProps) {
  const { state, addExamResult, getEGEProgress } = gameState;
  const [subject, setSubject] = useState<Subject>('Русский язык');
  const [testName, setTestName] = useState('');
  const [score, setScore] = useState(50);
  const [notification, setNotification] = useState<{ text: string; type: 'success' | 'error' } | null>(null);

  const egeProgress = getEGEProgress();
  const subjects: Subject[] = SUBJECTS_LIST;

  const handleAddResult = (e: React.FormEvent) => {
    e.preventDefault();
    if (!testName || score < 0) return;

    const maxScore = MAX_SCORES[subject];
    addExamResult({
      subject,
      date: format(new Date(), 'yyyy-MM-dd'),
      score: Math.min(score, maxScore),
      maxScore,
      testName
    });

    setNotification({ text: `Результат ${testName} добавлен!`, type: 'success' });
    setTestName('');
    setScore(50);
    setTimeout(() => setNotification(null), 3000);
  };

  const getScoreColor = (score: number, max: number) => {
    const percentage = (score / max) * 100;
    if (percentage >= 80) return 'text-green-400';
    if (percentage >= 60) return 'text-yellow-400';
    if (percentage >= 40) return 'text-orange-400';
    return 'text-red-400';
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="rounded-xl border border-yellow-900/30 bg-gradient-to-r from-yellow-900/20 to-orange-900/20 p-6">
        <h2 className="flex items-center gap-2 text-2xl font-bold mb-2">
          <Trophy className="h-6 w-6 text-yellow-400" />
          Подготовка к ЕГЭ
        </h2>
        <p className="text-gray-400">Отслеживайте результаты пробников и прогресс по каждому предмету</p>
      </div>

      {/* Notification */}
      {notification && (
        <div className={`rounded-lg p-4 border flex items-center gap-3 ${
          notification.type === 'success'
            ? 'bg-green-900/30 border-green-800/50 text-green-300'
            : 'bg-red-900/30 border-red-800/50 text-red-300'
        }`}>
          <Zap className="h-5 w-5" />
          {notification.text}
        </div>
      )}

      <div className="grid gap-6 lg:grid-cols-3">
        {/* Add Result Form */}
        <div className="lg:col-span-1 rounded-xl border border-gray-800 bg-gray-900/50 p-6">
          <h3 className="flex items-center gap-2 text-lg font-semibold mb-4">
            <Plus className="h-5 w-5 text-green-400" />
            Добавить результат
          </h3>

          <form onSubmit={handleAddResult} className="space-y-4">
            {/* Subject */}
            <div>
              <label className="block text-sm font-medium text-gray-400 mb-2">Предмет</label>
              <select
                value={subject}
                onChange={e => setSubject(e.target.value as any)}
                className="w-full rounded-lg bg-gray-800 border border-gray-700 px-4 py-3 text-gray-100 focus:border-purple-500 focus:outline-none"
              >
                {subjects.map(s => (
                  <option key={s} value={s}>
                    {SUBJECT_ICONS[s]} {s}
                  </option>
                ))}
              </select>
            </div>

            {/* Test Name */}
            <div>
              <label className="block text-sm font-medium text-gray-400 mb-2">Название пробника</label>
              <input
                type="text"
                value={testName}
                onChange={e => setTestName(e.target.value)}
                placeholder="Например: Пробник 1"
                className="w-full rounded-lg bg-gray-800 border border-gray-700 px-4 py-3 text-gray-100 placeholder-gray-500 focus:border-purple-500 focus:outline-none"
              />
            </div>

            {/* Score */}
            <div>
              <div className="flex items-center justify-between mb-2">
                <label className="text-sm font-medium text-gray-400">Баллы: {score}/{MAX_SCORES[subject]}</label>
                <span className={`text-sm font-bold ${getScoreColor(score, MAX_SCORES[subject])}`}>
                  {Math.round((score / MAX_SCORES[subject]) * 100)}%
                </span>
              </div>
              <input
                type="range"
                min="0"
                max={MAX_SCORES[subject]}
                value={score}
                onChange={e => setScore(parseInt(e.target.value))}
                className="w-full cursor-pointer"
              />
              <div className="flex justify-between text-xs text-gray-500 mt-1">
                <span>0</span>
                <span>{MAX_SCORES[subject]}</span>
              </div>
            </div>

            <button
              type="submit"
              disabled={!testName || score < 0}
              className="w-full rounded-lg bg-gradient-to-r from-green-600 to-emerald-600 px-4 py-3 font-semibold text-white hover:shadow-lg hover:shadow-green-600/30 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Добавить результат
            </button>
          </form>
        </div>

        {/* Progress by Subject */}
        <div className="lg:col-span-2 space-y-4">
          {subjects.map(subj => {
            const progress = egeProgress[subj];
            const avgScore = progress?.averageScore || 0;
            const maxScore = MAX_SCORES[subj];
            const percentage = (avgScore / maxScore) * 100;
            const results = progress?.results || [];

            return (
              <div
                key={subj}
                className={`rounded-xl border p-6 ${SUBJECT_COLORS[subj]}`}
              >
                <div className="space-y-4">
                  {/* Header */}
                  <div className="flex items-center justify-between">
                    <h3 className="flex items-center gap-2 text-lg font-semibold">
                      <span className="text-2xl">{SUBJECT_ICONS[subj]}</span>
                      {subj}
                    </h3>
                    <div className="text-right">
                      <p className="text-3xl font-bold">{Math.round(avgScore)}</p>
                      <p className="text-xs opacity-75">Среднее</p>
                    </div>
                  </div>

                  {/* Progress bar */}
                  <div className="space-y-2">
                    <div className="h-3 rounded-full bg-gray-900/40 overflow-hidden">
                      <div
                        className="h-full bg-gradient-to-r from-cyan-500 to-blue-500 transition-all duration-500"
                        style={{ width: `${Math.min(100, percentage)}%` }}
                      />
                    </div>
                    <p className="text-xs opacity-75">{Math.round(percentage)}% достижения</p>
                  </div>

                  {/* Results */}
                  {results.length > 0 ? (
                    <div className="space-y-2">
                      <p className="text-sm font-medium opacity-75">Результаты ({results.length})</p>
                      <div className="space-y-1 max-h-32 overflow-y-auto">
                        {results.map((result: any) => (
                          <div
                            key={result.id}
                            className="flex items-center justify-between bg-black/20 rounded px-3 py-2 text-sm"
                          >
                            <div>
                              <span className="font-medium">{result.testName}</span>
                              <span className="text-xs opacity-60 ml-2">
                                {format(new Date(result.date), 'd MMM yyyy', { locale: ru })}
                              </span>
                            </div>
                            <span className={`font-bold ${getScoreColor(result.score, result.maxScore)}`}>
                              {result.score}/{result.maxScore}
                            </span>
                          </div>
                        ))}
                      </div>
                    </div>
                  ) : (
                    <p className="text-sm opacity-60 italic">Нет результатов</p>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Overall Stats */}
      <div className="rounded-xl border border-cyan-900/30 bg-gradient-to-br from-cyan-900/20 to-blue-900/20 p-6">
        <h3 className="flex items-center gap-2 text-lg font-semibold mb-4">
          <LineChart className="h-5 w-5 text-cyan-400" />
          Общая статистика
        </h3>

        <div className="grid gap-4 md:grid-cols-3">
          {subjects.map(subj => {
            const results = state.examResults.filter(r => r.subject === subj);
            const maxScore = MAX_SCORES[subj];
            const averageScore = results.length > 0
              ? Math.round(results.reduce((sum, r) => sum + r.score, 0) / results.length)
              : 0;
            const lastScore = results.length > 0 ? results[results.length - 1].score : 0;
            const improvement = results.length > 1
              ? lastScore - results[0].score
              : 0;

            return (
              <div
                key={subj}
                className={`rounded-lg border p-4 ${SUBJECT_COLORS[subj]}`}
              >
                <p className="text-sm font-medium opacity-75 mb-2">{SUBJECT_ICONS[subj]} {subj}</p>
                <div className="space-y-1">
                  <div className="flex items-center justify-between">
                    <span className="text-xs opacity-60">Среднее</span>
                    <span className="text-lg font-bold">{averageScore}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-xs opacity-60">Последний</span>
                    <span className={`text-lg font-bold ${getScoreColor(lastScore, maxScore)}`}>{lastScore}</span>
                  </div>
                  {improvement !== 0 && (
                    <div className="flex items-center justify-between">
                      <span className="text-xs opacity-60">Прогресс</span>
                      <span className={`text-sm font-bold flex items-center gap-1 ${improvement >= 0 ? 'text-green-400' : 'text-red-400'}`}>
                        <TrendingUp className="h-4 w-4" />
                        {improvement > 0 ? '+' : ''}{improvement}
                      </span>
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
