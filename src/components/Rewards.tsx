import { Gift, Coins, Zap, Package, Lock, CheckCircle } from 'lucide-react';
import { SHOP_ITEMS, DAILY_REWARD_SCHEDULE } from '../types';
import type { useGameState } from '../hooks/useGameState';

interface RewardsProps {
  gameState: ReturnType<typeof useGameState>;
  onRewardClaimed?: (xpReward: number) => void;
}

export function Rewards({ gameState, onRewardClaimed }: RewardsProps) {
  const { state, claimDailyReward, canClaimRewardToday } = gameState;

  const getTodayReward = () => {
    const dayInCycle = (state.currentDay % 30) || (state.currentDay % 30 === 0 ? 30 : state.currentDay % 30);
    return DAILY_REWARD_SCHEDULE.find(r => r.dayNumber === dayInCycle);
  };

  const getItemInfo = (itemId?: string) => {
    if (!itemId) return null;
    return SHOP_ITEMS.find(i => i.id === itemId);
  };

  const todayReward = getTodayReward();
  const canClaim = canClaimRewardToday();

  return (
    <div className="space-y-6">
      {/* Daily Reward */}
      <div className="rounded-xl border border-amber-900/30 bg-gradient-to-br from-amber-900/20 to-orange-900/20 p-6">
        <h2 className="flex items-center gap-2 text-2xl font-bold mb-6">
          <Gift className="h-6 w-6 text-amber-400" />
          Ежедневное вознаграждение
        </h2>

        {todayReward ? (
          <div className="space-y-4">
            {/* Reward Info */}
            <div className="bg-gray-900/50 rounded-lg p-6 border border-gray-800">
              <div className="grid gap-4 md:grid-cols-3">
                {/* Gold */}
                <div className="space-y-2">
                  <div className="flex items-center gap-2 text-amber-300">
                    <Coins className="h-5 w-5" />
                    <span className="text-sm font-semibold">Золото</span>
                  </div>
                  <p className="text-3xl font-bold text-amber-400">+{todayReward.goldReward}</p>
                </div>

                {/* XP */}
                <div className="space-y-2">
                  <div className="flex items-center gap-2 text-blue-300">
                    <Zap className="h-5 w-5" />
                    <span className="text-sm font-semibold">Опыт</span>
                  </div>
                  <p className="text-3xl font-bold text-blue-400">+{todayReward.xpReward}</p>
                </div>

                {/* Item */}
                <div className="space-y-2">
                  {todayReward.itemReward ? (
                    <>
                      <div className="flex items-center gap-2 text-purple-300">
                        <Package className="h-5 w-5" />
                        <span className="text-sm font-semibold">Предмет</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <span className="text-2xl">{getItemInfo(todayReward.itemReward)?.icon}</span>
                        <span className="font-semibold text-purple-300 line-clamp-1">
                          {getItemInfo(todayReward.itemReward)?.name}
                        </span>
                      </div>
                    </>
                  ) : (
                    <>
                      <div className="flex items-center gap-2 text-gray-400">
                        <Lock className="h-5 w-5" />
                        <span className="text-sm font-semibold">Предмет</span>
                      </div>
                      <p className="text-gray-500">Нет предмета</p>
                    </>
                  )}
                </div>
              </div>
            </div>

            {/* Claim Button */}
            <button
              onClick={() => {
                claimDailyReward();
                if (onRewardClaimed && todayReward) {
                  onRewardClaimed(todayReward.xpReward);
                }
              }}
              disabled={!canClaim}
              className={`w-full py-3 rounded-lg font-semibold flex items-center justify-center gap-2 transition-all text-lg ${
                canClaim
                  ? 'bg-gradient-to-r from-amber-600 to-orange-600 hover:shadow-lg hover:shadow-amber-600/30 text-white'
                  : 'bg-gray-700 text-gray-500 cursor-not-allowed'
              }`}
            >
              <Gift className="h-5 w-5" />
              {canClaim ? 'Получить награду' : 'Уже получено сегодня'}
            </button>
          </div>
        ) : (
          <p className="text-gray-400">Загрузка награды...</p>
        )}
      </div>

      {/* Inventory */}
      <div className="rounded-xl border border-purple-900/30 bg-gray-900/50 p-6">
        <h3 className="flex items-center gap-2 text-xl font-bold mb-4">
          <Package className="h-5 w-5 text-purple-400" />
          Инвентарь ({state.inventory.length} предметов)
        </h3>

        {state.inventory.length > 0 ? (
          <div className="grid gap-3 md:grid-cols-2">
            {state.inventory.map((invItem, index) => {
              const item = SHOP_ITEMS.find(i => i.id === invItem.itemId);
              if (!item) return null;

              return (
                <div
                  key={index}
                  className="bg-gray-800/50 rounded-lg p-4 border border-gray-700/50 flex items-center justify-between"
                >
                  <div className="flex items-center gap-3 flex-1">
                    <span className="text-3xl">{item.icon}</span>
                    <div className="flex-1">
                      <p className="font-semibold">{item.name}</p>
                      <p className="text-sm text-gray-400">{item.description}</p>
                    </div>
                    <span className="text-lg font-bold text-purple-300 bg-purple-900/30 rounded-lg px-3 py-1">
                      x{invItem.quantity}
                    </span>
                  </div>
                </div>
              );
            })}
          </div>
        ) : (
          <p className="text-gray-400 text-center py-8">
            Ваш инвентарь пуст. Получайте награды или покупайте предметы в магазине!
          </p>
        )}
      </div>

      {/* Reward Schedule */}
      <div className="rounded-xl border border-cyan-900/30 bg-gray-900/50 p-6">
        <h3 className="flex items-center gap-2 text-xl font-bold mb-4">
          <CheckCircle className="h-5 w-5 text-cyan-400" />
          График наград
        </h3>

        <p className="text-sm text-gray-400 mb-4">
          Получайте всё большие награды за последовательные дни входа!
        </p>

        <div className="grid gap-2 md:grid-cols-3 lg:grid-cols-5">
          {DAILY_REWARD_SCHEDULE.slice(0, 15).map(reward => {
            const dayInCycle = (state.currentDay % 30) || (state.currentDay % 30 === 0 ? 30 : state.currentDay % 30);
            const isCurrent = reward.dayNumber === dayInCycle;
            const isClaimed = reward.claimedAt !== undefined;

            return (
              <div
                key={reward.id}
                className={`p-3 rounded-lg border text-center transition-all ${
                  isCurrent
                    ? 'bg-amber-900/30 border-amber-600 shadow-lg shadow-amber-600/20'
                    : isClaimed
                    ? 'bg-gray-800/30 border-gray-700 opacity-60'
                    : 'bg-gray-800 border-gray-700 hover:border-cyan-600'
                }`}
              >
                <p className="text-sm font-semibold text-gray-300">День {reward.dayNumber}</p>
                <div className="flex items-center justify-center gap-1 my-2">
                  <Coins className="h-4 w-4 text-amber-400" />
                  <span className="text-sm font-bold text-amber-300">{reward.goldReward}</span>
                </div>
                <div className="flex items-center justify-center gap-1">
                  <Zap className="h-4 w-4 text-blue-400" />
                  <span className="text-sm font-bold text-blue-300">{reward.xpReward}</span>
                </div>
                {reward.itemReward && (
                  <div className="mt-1 text-lg">
                    {getItemInfo(reward.itemReward)?.icon}
                  </div>
                )}
                {isCurrent && (
                  <p className="text-xs text-amber-300 font-semibold mt-2">Сегодня!</p>
                )}
                {isClaimed && (
                  <p className="text-xs text-gray-400 font-semibold mt-2">✓</p>
                )}
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
