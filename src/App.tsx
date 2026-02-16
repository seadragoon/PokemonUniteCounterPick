import { useState, useEffect, useCallback } from 'react';
import { css } from '@linaria/core';
import {
  DndContext,
  type DragEndEvent,
  DragOverlay,
  type DragStartEvent,
  PointerSensor,
  TouchSensor,
  useSensor,
  useSensors,
  pointerWithin,
} from '@dnd-kit/core';
import { arrayMove } from '@dnd-kit/sortable';
import type { Set, Pokemon } from './types';
import { samplePokemons } from './data/pokemon';
import { SetComponent } from './components/SetComponent';
import { SetViewComponent } from './components/SetViewComponent';
import { PokemonImage } from './components/PokemonImage';

const STORAGE_KEY = 'pokemon-unite-counter-pick';

const appContainer = css`
  min-height: 100vh;
  padding: 20px;
  padding-top: 90px; /* ヘッダーの高さ分のスペースを確保 */
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', 'Roboto', 'Oxygen',
    'Ubuntu', 'Cantarell', 'Fira Sans', 'Droid Sans', 'Helvetica Neue',
    sans-serif;
`;

const viewModeContainer = css`
  max-width: 1400px;
  margin: 0 auto;
  column-count: 1;
  column-gap: 20px;
  padding: 0 10px;

  @media (min-width: 768px) {
    column-count: 2;
  }

  @media (min-width: 1200px) {
    column-count: 3;
    padding: 0;
  }
`;

const toggleButtonGroup = css`
  display: flex;
  background: rgba(255, 255, 255, 0.2);
  padding: 4px;
  border-radius: 8px;
  gap: 4px;
`;

const toggleButton = css`
  padding: 8px 16px;
  border: none;
  border-radius: 6px;
  font-size: 0.9rem;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s;
  background: transparent;
  color: rgba(255, 255, 255, 0.8);

  &:hover {
    color: white;
    background: rgba(255, 255, 255, 0.1);
  }
`;

const activeToggleButton = css`
  background: white;
  color: #667eea;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);

  &:hover {
    background: white;
    color: #667eea;
  }
`;

const header = css`
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  z-index: 1000;
  max-width: 1200px;
  margin: 0 auto;
  padding: 10px;
  display: flex;
  justify-content: space-between;
  align-items: center;
  flex-wrap: wrap;
  gap: 15px;
  background: rgba(102, 126, 234, 0.95);
  backdrop-filter: blur(10px);
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
`;

const title = css`
  color: white;
  font-size: 2rem;
  font-weight: bold;
  margin: 0;
  text-shadow: 2px 2px 4px rgba(0, 0, 0, 0.3);
`;

const buttonGroup = css`
  display: flex;
  gap: 10px;
  flex-wrap: wrap;
`;



const addButton = css`
  padding: 10px 20px;
  border: none;
  border-radius: 8px;
  font-size: 1rem;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.2);

  &:hover {
    transform: translateY(-2px);
    box-shadow: 0 4px 8px rgba(0, 0, 0, 0.3);
  }

  &:active {
    transform: translateY(0);
  }

  background: #4caf50;
  color: white;

  &:hover {
    background: #45a049;
    transform: translateY(-2px);
    box-shadow: 0 4px 8px rgba(0, 0, 0, 0.3);
  }
`;

const resetButton = css`
  padding: 10px 20px;
  border: none;
  border-radius: 8px;
  font-size: 1rem;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.2);

  &:hover {
    transform: translateY(-2px);
    box-shadow: 0 4px 8px rgba(0, 0, 0, 0.3);
  }

  &:active {
    transform: translateY(0);
  }

  background: #f44336;
  color: white;

  &:hover {
    background: #da190b;
    transform: translateY(-2px);
    box-shadow: 0 4px 8px rgba(0, 0, 0, 0.3);
  }
`;

const setsContainer = css`
  max-width: 1200px;
  margin: 0 auto;
  display: flex;
  flex-direction: column;
  gap: 20px;
`;

const emptyState = css`
  text-align: center;
  color: white;
  padding: 40px;
  background: rgba(255, 255, 255, 0.1);
  border-radius: 12px;
  backdrop-filter: blur(10px);
`;

function App() {
  const [sets, setSets] = useState<Set[]>([]);
  const [activeId, setActiveId] = useState<string | null>(null);
  const [selectedPokemon, setSelectedPokemon] = useState<{
    setId: string;
    pokemon: Pokemon;
  } | null>(null);
  // モード管理: 'edit' | 'view'
  const [viewMode, setViewMode] = useState<'edit' | 'view'>('edit');

  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 5, // 5px移動したらドラッグ開始（クリックと区別）
      },
    }),
    useSensor(TouchSensor, {
      activationConstraint: {
        delay: 250,
        tolerance: 5,
      },
    })
  );

  useEffect(() => {
    const saved = localStorage.getItem(STORAGE_KEY);
    if (saved) {
      try {
        setSets(JSON.parse(saved));
      } catch (e) {
        console.error('Failed to load saved data:', e);
      }
    } else {
      // 初期データ
      const initialSet: Set = {
        id: 'set_1',
        items: [
          { id: 'item_1', name: 'ターゲット', pokemons: [] },
          { id: 'item_2', name: '有利', pokemons: [] },
        ],
        pool: [...samplePokemons],
        isPoolOpen: false,
      };
      setSets([initialSet]);
    }
  }, []);

  useEffect(() => {
    if (sets.length > 0) {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(sets));
    }
  }, [sets]);

  const handleAddSet = () => {
    const ts = Date.now();
    const newSet: Set = {
      id: `set_${ts}`,
      items: [
        { id: `item_${ts}_1`, name: 'ターゲット', pokemons: [] },
        { id: `item_${ts}_2`, name: '有利', pokemons: [] },
      ],
      pool: [...samplePokemons],
      isPoolOpen: false,
    };
    setSets([...sets, newSet]);
  };

  const handleReset = () => {
    if (window.confirm('すべてのデータを削除しますか？')) {
      localStorage.removeItem(STORAGE_KEY);
      setSets([]);
      setSelectedPokemon(null);
    }
  };

  const handleDragStart = (event: DragStartEvent) => {
    console.log("Drag Start: " + event.active.id);
    setActiveId(event.active.id as string);
  };

  // ID解析ヘルパー
  const parseDragId = (id: string) => {
    if (id.startsWith('drop:')) {
      // drop:{setId}:{itemId}
      const parts = id.split(':');
      return { type: 'item-zone', setId: parts[1], itemId: parts[2] } as const;
    }
    if (id.startsWith('pool-drop-')) {
      // pool-drop-{setId}
      const setId = id.replace('pool-drop-', '');
      return { type: 'pool-zone', setId } as const;
    }
    if (id.startsWith('pool-')) {
      // pool-{setId}-{pokemonId}
      // "pool-" を除いた残りを "-" で分割
      // setIdにハイフンが含まれる場合（set_timestampなど）を考慮し、最初の要素だけを取り出すのではなく、
      // id構造が fixed prefix なので、pokemonIdが最後であると仮定するか、setIdの構造に依存する。
      // 現在の実装では setId = `set_${ts}` (アンダースコア) なのでハイフンは安全だが、
      // 将来的にsetIdにハイフンが入ると壊れる。
      // ただし `pool-drop-` と区別が必要。
      // ここでは `pool-` プレフィックスの後、最初のハイフン区切り...ではなく、
      // `pool-{setId}-{pokemonId}`.
      // 既存コードでは `id` は `set_...` なのでハイフンは無い。
      // もし `uuid` だとハイフンが入る。
      // 安全策: pokemonIdは末尾。
      // しかし pokemonId も文字列。
      // ここでは簡易的に split('-') で3分割 (pool, setId, pokemonId) とする。
      // setIdにハイフンを含めない運用前提とする。
      const parts = id.split('-');
      if (parts.length >= 3) {
        // pool-set_123-pikachu
        return { type: 'pool-poke', setId: parts[1], pokemonId: parts.slice(2).join('-') } as const;
      }
      return null;
    }
    if (id.includes('-')) {
      // {setId}-{itemId}-{pokemonId}
      const parts = id.split('-');
      if (parts.length >= 3) {
        return { type: 'item-poke', setId: parts[0], itemId: parts[1], pokemonId: parts.slice(2).join('-') } as const;
      }
    }
    return null;
  };

  const handleDragEnd = (event: DragEndEvent) => {
    console.log("Drag End: " + event.active.id);
    const { active, over } = event;
    console.log("Active: ", active);
    console.log("Over: ", over);
    setActiveId(null);

    // 同じ場所にドロップした場合は何もしない
    if (active.id === over?.id) {
      return;
    }

    const activeData = parseDragId(active.id as string);
    const overData = over ? parseDragId(over.id as string) : null;

    if (!activeData) return;

    // E. 項目 -> 範囲外 (Remove / Return to Pool)
    // ドロップ先がない、または無効な場所にドロップした場合、かつ元が項目内のポケモンであればプールに戻す
    if (activeData.type === 'item-poke' && !overData) {
      const setId = activeData.setId;
      const pokemonId = activeData.pokemonId;
      const sourceItemId = activeData.itemId;

      const setIndex = sets.findIndex((s) => s.id === setId);
      if (setIndex === -1) return;

      const set = sets[setIndex];
      const sourceItem = set.items.find(i => i.id === sourceItemId);
      if (!sourceItem) return;
      const pokemon = sourceItem.pokemons.find(p => p.id === pokemonId);
      if (!pokemon) return;

      const newSets = [...sets];
      const itemIndex = newSets[setIndex].items.findIndex((i) => i.id === sourceItemId);
      if (itemIndex === -1) return;

      // 項目から削除
      newSets[setIndex].items[itemIndex].pokemons = newSets[setIndex].items[
        itemIndex
      ].pokemons.filter((p) => p.id !== pokemonId);

      // プールに戻す（重複チェック）
      if (!newSets[setIndex].pool.some(p => p.id === pokemonId)) {
        newSets[setIndex].pool.push(pokemon);
        // 元の順序に並び替え
        newSets[setIndex].pool.sort((a, b) => {
          const indexA = samplePokemons.findIndex(p => p.id === a.id);
          const indexB = samplePokemons.findIndex(p => p.id === b.id);
          return indexA - indexB;
        });
      }

      setSets(newSets);
      setSelectedPokemon(null);
      return;
    }

    if (!overData) return;

    // A. セット内並び替え (Item -> Same Item)
    if (
      activeData.type === 'item-poke' &&
      overData.type === 'item-poke' &&
      activeData.setId === overData.setId &&
      activeData.itemId === overData.itemId
    ) {
      const setIndex = sets.findIndex((s) => s.id === activeData.setId);
      if (setIndex === -1) return;

      const set = sets[setIndex];
      const itemIndex = set.items.findIndex((i) => i.id === activeData.itemId);
      if (itemIndex === -1) return;

      const item = set.items[itemIndex];
      const oldIndex = item.pokemons.findIndex((p) => p.id === activeData.pokemonId);
      const newIndex = item.pokemons.findIndex((p) => p.id === overData.pokemonId);

      if (oldIndex !== -1 && newIndex !== -1) {
        const newSets = [...sets];
        newSets[setIndex].items[itemIndex].pokemons = arrayMove(
          item.pokemons,
          oldIndex,
          newIndex
        );
        setSets(newSets);
      }
      return;
    }

    // B. プール -> 項目 (Add)
    if (
      activeData.type === 'pool-poke' &&
      (overData.type === 'item-zone' || overData.type === 'item-poke')
    ) {
      // 同一セットか確認
      if (activeData.setId !== overData.setId) return;

      const setId = activeData.setId;
      const pokemonId = activeData.pokemonId;
      const targetItemId = overData.itemId;

      const setIndex = sets.findIndex((s) => s.id === setId);
      if (setIndex === -1) return;

      const pokemon = samplePokemons.find((p) => p.id === pokemonId);
      if (!pokemon) return;

      const newSets = [...sets];
      const itemIndex = newSets[setIndex].items.findIndex((i) => i.id === targetItemId);
      if (itemIndex === -1) return;

      // 既に存在する場合は削除（重複防止）
      newSets[setIndex].items[itemIndex].pokemons = newSets[setIndex].items[
        itemIndex
      ].pokemons.filter((p) => p.id !== pokemonId);

      // 追加
      newSets[setIndex].items[itemIndex].pokemons.push(pokemon);

      // プールから削除
      newSets[setIndex].pool = newSets[setIndex].pool.filter(p => p.id !== pokemonId);

      setSets(newSets);
      setSelectedPokemon(null);
      return;
    }

    // C. 項目 -> プール (Remove)
    if (
      activeData.type === 'item-poke' &&
      (overData.type === 'pool-zone' || overData.type === 'pool-poke')
    ) {
      // 同一セットか確認
      if (activeData.setId !== overData.setId) return;

      const setId = activeData.setId;
      const pokemonId = activeData.pokemonId;
      const sourceItemId = activeData.itemId;

      const setIndex = sets.findIndex((s) => s.id === setId);
      if (setIndex === -1) return;

      const set = sets[setIndex];
      const sourceItem = set.items.find(i => i.id === sourceItemId);
      if (!sourceItem) return;
      const pokemon = sourceItem.pokemons.find(p => p.id === pokemonId);
      if (!pokemon) return;

      const newSets = [...sets];
      const itemIndex = newSets[setIndex].items.findIndex((i) => i.id === sourceItemId);
      if (itemIndex === -1) return;

      // 項目から削除
      newSets[setIndex].items[itemIndex].pokemons = newSets[setIndex].items[
        itemIndex
      ].pokemons.filter((p) => p.id !== pokemonId);

      // プールに戻す（重複チェック）
      if (!newSets[setIndex].pool.some(p => p.id === pokemonId)) {
        newSets[setIndex].pool.push(pokemon);
        // 元の順序に並び替え
        newSets[setIndex].pool.sort((a, b) => {
          const indexA = samplePokemons.findIndex(p => p.id === a.id);
          const indexB = samplePokemons.findIndex(p => p.id === b.id);
          return indexA - indexB;
        });
      }

      setSets(newSets);
      setSelectedPokemon(null);
      return;
    }

    // D. 項目 -> 項目 (Move)
    if (
      activeData.type === 'item-poke' &&
      (overData.type === 'item-zone' || overData.type === 'item-poke') &&
      activeData.itemId !== overData.itemId
    ) {
      // 同一セットか確認
      if (activeData.setId !== overData.setId) return;

      const setId = activeData.setId;
      const pokemonId = activeData.pokemonId;
      const sourceItemId = activeData.itemId;
      const targetItemId = overData.itemId;

      const setIndex = sets.findIndex((s) => s.id === setId);
      if (setIndex === -1) return;

      const sourceItem = sets[setIndex].items.find(i => i.id === sourceItemId);
      if (!sourceItem) return;

      const pokemon = sourceItem.pokemons.find(p => p.id === pokemonId);
      if (!pokemon) return;

      const newSets = [...sets];

      // 元の項目から削除
      const sourceItemIndex = newSets[setIndex].items.findIndex(i => i.id === sourceItemId);
      if (sourceItemIndex !== -1) {
        newSets[setIndex].items[sourceItemIndex].pokemons =
          newSets[setIndex].items[sourceItemIndex].pokemons.filter(p => p.id !== pokemonId);
      }

      // ターゲット項目に追加
      const targetItemIndex = newSets[setIndex].items.findIndex(i => i.id === targetItemId);
      if (targetItemIndex !== -1) {
        newSets[setIndex].items[targetItemIndex].pokemons.push(pokemon);
      }

      setSets(newSets);
      setSelectedPokemon(null);
    }
  };

  const handleSetMove = useCallback((setId: string, direction: 'up' | 'down') => {
    setSets((prevSets) => {
      const setIndex = prevSets.findIndex((s) => s.id === setId);
      if (setIndex === -1) return prevSets;

      if (direction === 'up' && setIndex > 0) {
        return arrayMove(prevSets, setIndex, setIndex - 1);
      } else if (direction === 'down' && setIndex < prevSets.length - 1) {
        return arrayMove(prevSets, setIndex, setIndex + 1);
      }
      return prevSets;
    });
  }, []);

  const handleSetDelete = useCallback((setId: string) => {
    if (window.confirm('このセットを削除しますか？')) {
      setSets((prevSets) => prevSets.filter((s) => s.id !== setId));
    }
  }, []);

  const handleSetUpdate = useCallback((setId: string, updatedSet: Set) => {
    setSets((prevSets) => prevSets.map((s) => (s.id === setId ? updatedSet : s)));
  }, []);

  const handlePokemonClick = useCallback((setId: string, pokemon: Pokemon) => {
    setSelectedPokemon((prev) => {
      if (prev?.setId === setId && prev?.pokemon.id === pokemon.id) {
        return null;
      }
      return { setId, pokemon };
    });
  }, []);

  const handleItemClick = useCallback((setId: string, itemId: string) => {
    setSelectedPokemon((prevSelectedPokemon) => {
      if (!prevSelectedPokemon) return prevSelectedPokemon;

      setSets((prevSets) => {
        const setIndex = prevSets.findIndex((s) => s.id === setId);
        if (setIndex === -1) return prevSets;

        const sourceItem = prevSets[setIndex].items.find((i) =>
          i.pokemons.some((p) => p.id === prevSelectedPokemon.pokemon.id)
        );
        if (!sourceItem) return prevSets;

        const newSets = [...prevSets];
        // 元の項目から削除
        const sourceItemIndex = newSets[setIndex].items.findIndex(
          (i) => i.id === sourceItem.id
        );
        if (sourceItemIndex !== -1) {
          newSets[setIndex].items[sourceItemIndex].pokemons = newSets[setIndex].items[
            sourceItemIndex
          ].pokemons.filter((p) => p.id !== prevSelectedPokemon.pokemon.id);
        }

        // ターゲット項目に追加
        const targetItemIndex = newSets[setIndex].items.findIndex((i) => i.id === itemId);
        if (targetItemIndex !== -1) {
          newSets[setIndex].items[targetItemIndex].pokemons.push(
            prevSelectedPokemon.pokemon
          );
        }

        return newSets;
      });

      return null;
    });
  }, []);

  const activePokemon = activeId
    ? (() => {
      const data = parseDragId(activeId as string);
      if (!data) return null;

      if (data.type === 'pool-poke') {
        // pool-{setId}-{pokemonId}
        return samplePokemons.find((p) => p.id === data.pokemonId);
      }

      if (data.type === 'item-poke') {
        // {setId}-{itemId}-{pokemonId}
        const set = sets.find(s => s.id === data.setId);
        return set?.items.find(i => i.id === data.itemId)?.pokemons.find(p => p.id === data.pokemonId);
      }

      return null;
    })()
    : null;

  return (
    <div className={appContainer}>
      <header className={header}>
        <h1 className={title}>Pokemon Unite Counter Pick</h1>

        {/* モード切り替えボタン */}
        <div className={toggleButtonGroup}>
          <button
            className={`${toggleButton} ${viewMode === 'edit' ? activeToggleButton : ''}`}
            onClick={() => setViewMode('edit')}
          >
            編集モード
          </button>
          <button
            className={`${toggleButton} ${viewMode === 'view' ? activeToggleButton : ''}`}
            onClick={() => setViewMode('view')}
          >
            表示モード
          </button>
        </div>

        <div
          className={buttonGroup}
          style={{ visibility: viewMode === 'edit' ? 'visible' : 'hidden' }}
        >
          <button className={addButton} onClick={handleAddSet}>
            + セット追加
          </button>
          <button className={resetButton} onClick={handleReset}>
            Reset
          </button>
        </div>
      </header>

      {viewMode === 'view' ? (
        <div className={viewModeContainer}>
          {sets.length === 0 ? (
            <div className={emptyState}>
              <p>セットがありません。編集モードでセットを作成してください。</p>
            </div>
          ) : (
            sets.map((set, index) => (
              <SetViewComponent
                key={set.id}
                set={set}
                index={index}
              />
            ))
          )}
        </div>
      ) : (
        <DndContext
          sensors={sensors}
          collisionDetection={pointerWithin}
          onDragStart={handleDragStart}
          onDragEnd={handleDragEnd}
        >
          <div className={setsContainer}>
            {sets.length === 0 ? (
              <div className={emptyState}>
                <p>セットがありません。+ セット追加ボタンで新しいセットを作成してください。</p>
              </div>
            ) : (
              sets.map((set, index) => (
                <SetComponent
                  key={set.id}
                  set={set}
                  index={index}
                  isFirst={index === 0}
                  isLast={index === sets.length - 1}
                  onUpdate={(updatedSet) => handleSetUpdate(set.id, updatedSet)}
                  onMoveUp={() => handleSetMove(set.id, 'up')}
                  onMoveDown={() => handleSetMove(set.id, 'down')}
                  onDelete={() => handleSetDelete(set.id)}
                  selectedPokemon={
                    selectedPokemon?.setId === set.id ? selectedPokemon.pokemon : null
                  }
                  onPokemonClick={(pokemon) => handlePokemonClick(set.id, pokemon)}
                  onItemClick={(itemId) => handleItemClick(set.id, itemId)}
                />
              ))
            )}
          </div>
          <DragOverlay>
            {activePokemon ? <PokemonImage pokemon={activePokemon} isDragging /> : null}
          </DragOverlay>
        </DndContext>
      )}
    </div>
  );
}

export default App;
