import { useState } from 'react';
import { ShoppingBag, Coins, Sparkles, AlertCircle } from 'lucide-react';
import { SHOP_ITEMS } from '../types';
import type { useGameState } from '../hooks/useGameState';

interface ShopProps {
  gameState: ReturnType<typeof useGameState>;
}

const RARITY_COLORS = {
  common: 'border-gray-500 bg-gray-500/10 text-gray-400',
  rare: 'border-blue-500 bg-blue-500/10 text-blue-300',
  epic: 'border-purple-500 bg-purple-500/10 text-purple-300',
  legendary: 'border-yellow-500 bg-yellow-500/10 text-yellow-300'
};

const RARITY_LABELS = {
  common: 'Обычный',
  rare: 'Редкий',
  epic: 'Эпический',
  legendary: 'Легендарный'
};

const CATEGORY_FILTER = {
  all: 'Все',
  consumable: 'Расходники',
  gear: 'Снаряжение',
  cosmetic: 'Косметика',
  buff: 'Бафы'
};

export function Shop({ gameState }: ShopProps) {
  const { state, buyItem } = gameState;
  const [selectedCategory, setSelectedCategory] = useState<'all' | 'consumable' | 'gear' | 'cosmetic' | 'buff'>('all');
  const [notification, setNotification] = useState<{ text: string; type: 'success' | 'error' } | null>(null);

  const filteredItems = selectedCategory === 'all'
    ? SHOP_ITEMS
    : SHOP_ITEMS.filter(item => item.category === selectedCategory);

  const handleBuyItem = (itemId: string) => {
    const item = SHOP_ITEMS.find(i => i.id === itemId);
    if (!item) return;

    if (state.gold < item.price) {
      setNotification({ text: `Недостаточно золота! Нужно ${item.price}, у вас ${state.gold}`, type: 'error' });
      setTimeout(() => setNotification(null), 3000);
      return;
    }

    const success = buyItem(itemId);
    if (success) {
      setNotification({ text: `${item.name} куплен(а)!`, type: 'success' });
      setTimeout(() => setNotification(null), 2000);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="rounded-xl border border-yellow-900/30 bg-gradient-to-r from-yellow-900/20 to-amber-900/20 p-6">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="flex items-center gap-2 text-2xl font-bold mb-2">
              <ShoppingBag className="h-6 w-6 text-yellow-400" />
              Магазин
            </h2>
            <p className="text-gray-400">Покупайте предметы для улучшения своих возможностей</p>
          </div>
          <div className="flex items-center gap-3 bg-gray-900/50 rounded-lg px-6 py-3 border border-yellow-800/30">
            <Coins className="h-5 w-5 text-yellow-400" />
            <div>
              <p className="text-sm text-gray-400">Золото</p>
              <p className="text-3xl font-bold text-yellow-300">{state.gold}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Notification */}
      {notification && (
        <div className={`rounded-lg p-4 border flex items-center gap-3 ${
          notification.type === 'success'
            ? 'bg-green-900/30 border-green-800/50 text-green-300'
            : 'bg-red-900/30 border-red-800/50 text-red-300'
        }`}>
          <AlertCircle className="h-5 w-5" />
          {notification.text}
        </div>
      )}

      {/* Category Filter */}
      <div className="flex gap-2 overflow-x-auto pb-2">
        {Object.entries(CATEGORY_FILTER).map(([key, label]) => (
          <button
            key={key}
            onClick={() => setSelectedCategory(key as any)}
            className={`px-4 py-2 rounded-lg whitespace-nowrap font-medium transition-all ${
              selectedCategory === key
                ? 'bg-purple-600 text-white shadow-lg shadow-purple-600/30'
                : 'bg-gray-800 text-gray-400 hover:bg-gray-700 hover:text-gray-300'
            }`}
          >
            {label}
          </button>
        ))}
      </div>

      {/* Items Grid */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {filteredItems.map(item => (
          <div
            key={item.id}
            className={`rounded-lg border p-4 transition-all hover:shadow-lg ${RARITY_COLORS[item.rarity]}`}
          >
            <div className="space-y-3">
              {/* Header */}
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-1">
                    <span className="text-3xl">{item.icon}</span>
                    <div>
                      <h3 className="font-semibold">{item.name}</h3>
                      <span className={`text-xs px-2 py-1 rounded border ${RARITY_COLORS[item.rarity]}`}>
                        {RARITY_LABELS[item.rarity]}
                      </span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Description */}
              <p className="text-sm text-gray-300 line-clamp-2">
                {item.description}
              </p>

              {/* Effect */}
              <div className="flex items-center gap-2 text-sm bg-gray-900/50 rounded px-3 py-2 border border-gray-700/50">
                <Sparkles className="h-4 w-4 text-amber-400" />
                <span>{item.effect}</span>
              </div>

              {/* Price and Button */}
              <button
                onClick={() => handleBuyItem(item.id)}
                disabled={state.gold < item.price}
                className={`w-full py-2 rounded-lg font-semibold flex items-center justify-center gap-2 transition-all ${
                  state.gold >= item.price
                    ? 'bg-gradient-to-r from-yellow-600 to-amber-600 hover:shadow-lg hover:shadow-yellow-600/30 text-white'
                    : 'bg-gray-700 text-gray-500 cursor-not-allowed'
                }`}
              >
                <Coins className="h-4 w-4" />
                {item.price}
              </button>
            </div>
          </div>
        ))}
      </div>

      {filteredItems.length === 0 && (
        <div className="text-center py-12">
          <p className="text-gray-400 text-lg">Нет предметов в этой категории</p>
        </div>
      )}
    </div>
  );
}
