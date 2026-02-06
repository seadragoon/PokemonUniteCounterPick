import { useState, useEffect } from 'react';
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
  closestCenter,
} from '@dnd-kit/core';
import { arrayMove } from '@dnd-kit/sortable';
import type { Set, Pokemon } from './types';
import { samplePokemons } from './data/pokemon';
import { SetComponent } from './components/SetComponent';
import { PokemonImage } from './components/PokemonImage';

const STORAGE_KEY = 'pokemon-unite-counter-pick';

const appContainer = css`
  min-height: 100vh;
  padding: 20px;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', 'Roboto', 'Oxygen',
    'Ubuntu', 'Cantarell', 'Fira Sans', 'Droid Sans', 'Helvetica Neue',
    sans-serif;
`;

const header = css`
  max-width: 1200px;
  margin: 0 auto 30px;
  display: flex;
  justify-content: space-between;
  align-items: center;
  flex-wrap: wrap;
  gap: 15px;
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

const button = css`
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
`;

const addButton = css`
  ${button}
  background: #4caf50;
  color: white;

  &:hover {
    background: #45a049;
  }
`;

const resetButton = css`
  ${button}
  background: #f44336;
  color: white;

  &:hover {
    background: #da190b;
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

  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 8,
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
    setActiveId(event.active.id as string);
  };

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;
    setActiveId(null);

    if (!over || active.id === over.id) {
      return;
    }

    const activeId = active.id as string;
    const overId = over.id as string;

    // ドロップゾーン overId のパース (形式: "drop:setId:itemId")
    const overParts = overId.startsWith('drop:') ? overId.split(':') : null;
    const overSetIdFromDrop = overParts ? overParts[1] : null;
    const overItemIdFromDrop = overParts ? overParts[2] : null;

    // 項目/ポケモンIDのパース (形式: "setId-itemId-pokemonId" または "pool-pokemonId")
    const activeParts = activeId.split('-');
    const overPartsNormal = overId.includes('-') && !overId.startsWith('drop:') ? overId.split('-') : null;
    const activeSetId = activeId.startsWith('pool-') ? '' : activeParts[0];
    const activeItemId = activeId.startsWith('pool-') ? '' : activeParts[1];
    const activePokemonId = activeId.startsWith('pool-') ? activeId.replace('pool-', '') : (activeParts[2] ?? '');
    const overSetId = overSetIdFromDrop ?? (overPartsNormal ? overPartsNormal[0] : '');
    const overItemId = overItemIdFromDrop ?? (overPartsNormal ? overPartsNormal[1] : '');
    const overPokemonId = overPartsNormal && overPartsNormal[2] ? overPartsNormal[2] : '';

    // セット内の並び替え（同一項目内のポケモン並び替え）
    if (activeSetId === overSetId && activeItemId === overItemId && overPokemonId) {
      const setIndex = sets.findIndex((s) => s.id === activeSetId);
      if (setIndex === -1) return;

      const set = sets[setIndex];
      const itemIndex = set.items.findIndex((i) => i.id === activeItemId);
      if (itemIndex === -1) return;

      const item = set.items[itemIndex];
      const oldIndex = item.pokemons.findIndex((p) => p.id === activePokemonId);
      const newIndex = item.pokemons.findIndex((p) => p.id === overPokemonId);

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

    // プールから項目への移動（同じセット内のみ）
    if (activeId.startsWith('pool-') && overId.startsWith('drop:')) {
      const pokemonId = activeId.replace('pool-', '');
      const setId = overSetIdFromDrop ?? '';
      const itemId = overItemIdFromDrop ?? '';

      // プールがどのセットに属するか確認
      const setIndex = sets.findIndex((s) => 
        s.pool.some((p) => p.id === pokemonId) && s.id === setId
      );
      if (setIndex === -1) return; // セット間の移動は禁止

      const pokemon = samplePokemons.find((p) => p.id === pokemonId);
      if (!pokemon) return;

      const newSets = [...sets];
      const itemIndex = newSets[setIndex].items.findIndex((i) => i.id === itemId);
      if (itemIndex === -1) return;

      // 既に存在する場合は削除
      newSets[setIndex].items[itemIndex].pokemons = newSets[setIndex].items[
        itemIndex
      ].pokemons.filter((p) => p.id !== pokemonId);

      // 追加
      newSets[setIndex].items[itemIndex].pokemons.push(pokemon);
      setSets(newSets);
      setSelectedPokemon(null);
      return;
    }

    // 項目からプールへの移動
    if (!activeId.startsWith('pool-') && activePokemonId && overId.startsWith('pool-drop-')) {
      const setId = activeSetId;
      const itemId = activeItemId;
      const pokemonId = activeParts[2] ?? activePokemonId;

      const setIndex = sets.findIndex((s) => s.id === setId);
      if (setIndex === -1) return;

      const newSets = [...sets];
      const itemIndex = newSets[setIndex].items.findIndex((i) => i.id === itemId);
      if (itemIndex === -1) return;

      newSets[setIndex].items[itemIndex].pokemons = newSets[setIndex].items[
        itemIndex
      ].pokemons.filter((p) => p.id !== pokemonId);
      setSets(newSets);
      setSelectedPokemon(null);
      return;
    }

    // 項目間の移動（同じセット内のみ・別の項目へ）
    const targetItemIdFromDrop = overItemIdFromDrop ?? '';
    if (
      activeSetId === overSetId &&
      activeItemId &&
      targetItemIdFromDrop &&
      overId.startsWith('drop:') &&
      activeItemId !== targetItemIdFromDrop
    ) {
      const setId = activeSetId;
      const sourceItemId = activeItemId;
      const targetItemId = targetItemIdFromDrop;
      const pokemonId = activePokemonId;

      const setIndex = sets.findIndex((s) => s.id === setId);
      if (setIndex === -1) return;

      const pokemon = sets[setIndex].items
        .find((i) => i.id === sourceItemId)
        ?.pokemons.find((p) => p.id === pokemonId);
      if (!pokemon) return;

      const newSets = [...sets];
      // 元の項目から削除
      const sourceItemIndex = newSets[setIndex].items.findIndex(
        (i) => i.id === sourceItemId
      );
      if (sourceItemIndex !== -1) {
        newSets[setIndex].items[sourceItemIndex].pokemons = newSets[setIndex].items[
          sourceItemIndex
        ].pokemons.filter((p) => p.id !== pokemonId);
      }

      // ターゲット項目に追加
      const targetItemIndex = newSets[setIndex].items.findIndex(
        (i) => i.id === targetItemId
      );
      if (targetItemIndex !== -1) {
        newSets[setIndex].items[targetItemIndex].pokemons.push(pokemon);
      }

      setSets(newSets);
      setSelectedPokemon(null);
    }
  };

  const handleSetMove = (setId: string, direction: 'up' | 'down') => {
    const setIndex = sets.findIndex((s) => s.id === setId);
    if (setIndex === -1) return;

    if (direction === 'up' && setIndex > 0) {
      setSets(arrayMove(sets, setIndex, setIndex - 1));
    } else if (direction === 'down' && setIndex < sets.length - 1) {
      setSets(arrayMove(sets, setIndex, setIndex + 1));
    }
  };

  const handleSetDelete = (setId: string) => {
    if (window.confirm('このセットを削除しますか？')) {
      setSets(sets.filter((s) => s.id !== setId));
    }
  };

  const handleSetUpdate = (setId: string, updatedSet: Set) => {
    setSets(sets.map((s) => (s.id === setId ? updatedSet : s)));
  };

  const handlePokemonClick = (setId: string, pokemon: Pokemon) => {
    if (selectedPokemon?.setId === setId && selectedPokemon?.pokemon.id === pokemon.id) {
      setSelectedPokemon(null);
    } else {
      setSelectedPokemon({ setId, pokemon });
    }
  };

  const handleItemClick = (setId: string, itemId: string) => {
    if (selectedPokemon) {
      const setIndex = sets.findIndex((s) => s.id === setId);
      if (setIndex === -1) return;

      const sourceItem = sets[setIndex].items.find((i) =>
        i.pokemons.some((p) => p.id === selectedPokemon.pokemon.id)
      );
      if (!sourceItem) return;

      const newSets = [...sets];
      // 元の項目から削除
      const sourceItemIndex = newSets[setIndex].items.findIndex(
        (i) => i.id === sourceItem.id
      );
      if (sourceItemIndex !== -1) {
        newSets[setIndex].items[sourceItemIndex].pokemons = newSets[setIndex].items[
          sourceItemIndex
        ].pokemons.filter((p) => p.id !== selectedPokemon.pokemon.id);
      }

      // ターゲット項目に追加
      const targetItemIndex = newSets[setIndex].items.findIndex((i) => i.id === itemId);
      if (targetItemIndex !== -1) {
        newSets[setIndex].items[targetItemIndex].pokemons.push(
          selectedPokemon.pokemon
        );
      }

      setSets(newSets);
      setSelectedPokemon(null);
    }
  };

  const activePokemon = activeId
    ? (() => {
        const parts = (activeId as string).split('-');
        if (parts[0] === 'pool') {
          return samplePokemons.find((p) => p.id === parts[1]);
        } else if (parts.length >= 3) {
          const setId = parts[0];
          const itemId = parts[1];
          const pokemonId = parts[2];
          const set = sets.find((s) => s.id === setId);
          return set?.items
            .find((i) => i.id === itemId)
            ?.pokemons.find((p) => p.id === pokemonId);
        }
        return null;
      })()
    : null;

  return (
    <div className={appContainer}>
      <div className={header}>
        <h1 className={title}>ポケモンユナイト カウンターピック</h1>
        <div className={buttonGroup}>
          <button className={addButton} onClick={handleAddSet}>
            + セット追加
          </button>
          <button className={resetButton} onClick={handleReset}>
            Reset
          </button>
        </div>
      </div>

      <DndContext
        sensors={sensors}
        collisionDetection={closestCenter}
        onDragStart={handleDragStart}
        onDragEnd={handleDragEnd}
      >
        <div className={setsContainer}>
          {sets.length === 0 ? (
            <div className={emptyState}>
              <p>セットがありません。+ セット追加ボタンで新しいセットを作成してください。</p>
            </div>
          ) : (
            sets.map((set) => (
              <SetComponent
                key={set.id}
                set={set}
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
    </div>
  );
}

export default App;
