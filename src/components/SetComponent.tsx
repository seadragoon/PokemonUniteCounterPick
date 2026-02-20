import { memo, useState } from 'react';
import { css } from '@linaria/core';
import type { Set, Pokemon } from '../types';
import { SetItemComponent } from './SetItemComponent';
import { SortablePokemon } from './SortablePokemon';
import { SetEditModal } from './SetEditModal';
import { SortableContext, rectSortingStrategy, arrayMove } from '@dnd-kit/sortable';
import { useDroppable } from '@dnd-kit/core';
import { samplePokemons } from '../data/pokemon';

interface SetComponentProps {
  set: Set;
  index: number;
  isFirst: boolean;
  isLast: boolean;
  onUpdate: (set: Set) => void;
  onMoveUp: () => void;
  onMoveDown: () => void;
  onDelete: () => void;
  selectedPokemon: Pokemon | null;
  onPokemonClick: (pokemon: Pokemon) => void;
  onItemClick: (itemId: string) => void;
  onPoolClick: () => void;
  isMobile: boolean;
}

const setContainer = css`
  background: rgba(255, 255, 255, 0.98);
  border-radius: 16px;
  padding: 20px;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
  backdrop-filter: blur(10px);
`;

const setHeader = css`
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 20px;
  gap: 15px;
`;

const setTitleSection = css`
  display: flex;
  align-items: center;
  gap: 10px;
`;

const setControls = css`
  display: flex;
  align-items: center;
  gap: 8px;
`;

const arrowButtons = css`
  display: flex;
  flex-direction: column;
  gap: 2px;
`;

const arrowButton = css`
  width: 32px;
  height: 24px;
  font-size: 1rem;
  border: none;
  background: transparent;
  cursor: pointer;
  color: #999;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 4px;
  transition: all 0.2s;
  line-height: 1;

  &:hover:not(:disabled) {
    background: rgba(0, 0, 0, 0.05);
    color: #667eea;
  }

  &:disabled {
    opacity: 0.3;
    cursor: default;
  }
`;

const editButton = css`
  width: 20px;
  height: 20px;
  padding: 0;
  border: none;
  background: transparent;
  cursor: pointer;
  color: #ccc;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 4px;
  transition: all 0.2s;
  font-size: 0.85rem;
  margin-left: 6px;
  opacity: 0.6;

  &:hover {
    opacity: 1;
    color: #667eea;
  }

  &:active {
    transform: scale(0.95);
  }
`;

const deleteButton = css`
  padding: 8px 16px;
  border: none;
  border-radius: 6px;
  font-size: 0.9rem;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.2);

  &:hover {
    transform: translateY(-1px);
    box-shadow: 0 4px 6px rgba(0, 0, 0, 0.3);
  }

  &:active {
    transform: translateY(0);
  }

  &:disabled {
    opacity: 0.5;
    cursor: not-allowed;
    transform: none;
  }

  background: #f44336;
  color: white;

  &:hover {
    background: #da190b;
    transform: translateY(-1px);
    box-shadow: 0 4px 6px rgba(0, 0, 0, 0.3);
  }
`;

const poolToggle = css`
  margin: 0;
  padding: 12px 20px;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: white;
  border: none;
  border-radius: 8px;
  font-size: 1rem;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.2);
  width: 100%;

  &:hover {
    transform: translateY(-2px);
    box-shadow: 0 4px 8px rgba(0, 0, 0, 0.3);
  }
`;

const poolContainerOpen = css`
  padding: 15px;
  background: rgba(0, 0, 0, 0.02);
  border-radius: 12px;
  transition: all 0.3s;
  overflow: hidden;
  max-height: 1000px;
`;

const poolContainerClosed = css`
  padding: 15px;
  background: rgba(0, 0, 0, 0.02);
  border-radius: 12px;
  transition: all 0.3s;
  overflow: hidden;
  max-height: 0;
  padding: 0 15px;
  margin: 0;
`;

const poolGrid = css`
  display: flex;
  flex-wrap: wrap;
  gap: 4px;
  padding: 10px;
  min-height: 80px;
  border-radius: 8px;
  background: rgba(0, 0, 0, 0.02);
  transition: all 0.2s;
`;

const poolGridDroppable = css`
  display: flex;
  flex-wrap: wrap;
  gap: 4px;
  padding: 10px;
  min-height: 80px;
  border-radius: 8px;
  transition: all 0.2s;
  
  background: rgba(102, 126, 234, 0.1);
  border: 2px dashed #667eea;
`;

const poolGridClickable = css`
  display: flex;
  flex-wrap: wrap;
  gap: 4px;
  padding: 10px;
  min-height: 80px;
  border-radius: 8px;
  background: rgba(0, 0, 0, 0.02);
  transition: all 0.2s;
  cursor: pointer;
  
  &:hover {
    background: rgba(102, 126, 234, 0.1);
    box-shadow: 0 0 0 2px #667eea;
  }
`;

const emptyPoolMessage = css`
  color: #999;
  font-size: 0.9rem;
  display: flex;
  align-items: center;
  justify-content: center;
  width: 100%;
  min-height: 60px;
`;

const itemsWrapper = css`
  display: flex;
  flex-direction: column;
  gap: 15px;
  margin-bottom: 20px;
  width: 100%;
`;

const SetComponentInner = ({
  set,
  index,
  isFirst,
  isLast,
  onUpdate,
  onMoveUp,
  onMoveDown,
  onDelete,
  selectedPokemon,
  onPokemonClick,
  onItemClick,
  onPoolClick,
  isMobile,
}: SetComponentProps) => {
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const handleItemNameChange = (itemId: string, newName: string) => {
    const updatedSet = {
      ...set,
      items: set.items.map((item) =>
        item.id === itemId ? { ...item, name: newName } : item
      ),
    };
    onUpdate(updatedSet);
  };

  const handleSetNameChange = (newName: string) => {
    onUpdate({ ...set, name: newName });
  };

  const togglePool = () => {
    onUpdate({ ...set, isPoolOpen: !set.isPoolOpen });
  };

  const poolDroppableId = `pool-drop-${set.id}`;
  const { setNodeRef: poolRef, isOver: isPoolOver } = useDroppable({
    id: poolDroppableId,
  });

  const displayName = set.name || `セット${index + 1}`;

  // 選択中のポケモンが項目のポケモンなら、プールをクリックしたときに移動できるようハイライト
  const isSelectedFromItem = selectedPokemon && set.items.some(i => i.pokemons.some(p => p.id === selectedPokemon.id));

  const poolClass = isPoolOver
    ? poolGridDroppable
    : (isSelectedFromItem ? poolGridClickable : poolGrid);

  return (
    <div className={setContainer}>
      <div className={setHeader}>
        <div className={setTitleSection}>
          <h2 style={{ margin: 0, color: '#333' }}>{displayName}</h2>
          <button
            className={editButton}
            onClick={() => setIsEditModalOpen(true)}
            title="セット名を編集"
          >
            ✏️
          </button>
        </div>
        <div className={setControls}>
          <div className={arrowButtons}>
            <button
              className={arrowButton}
              onClick={onMoveUp}
              disabled={isFirst}
              title="上へ"
            >
              ˄
            </button>
            <button
              className={arrowButton}
              onClick={onMoveDown}
              disabled={isLast}
              title="下へ"
            >
              ˅
            </button>
          </div>
          <button className={deleteButton} onClick={onDelete}>
            削除
          </button>
        </div>
      </div>

      <div className={itemsWrapper}>
        {set.items.map((item, index) => (
          <SetItemComponent
            key={item.id}
            item={item}
            setId={set.id}
            selectedPokemon={selectedPokemon}
            onNameChange={handleItemNameChange}
            onPokemonClick={onPokemonClick}
            onClick={() => onItemClick(item.id)}
            onDelete={() => {
              const itemIndex = set.items.findIndex(i => i.id === item.id);
              if (itemIndex === -1) return;

              const itemToDelete = set.items[itemIndex];
              const pokemonsToReturn = itemToDelete.pokemons;

              const newPool = [...set.pool, ...pokemonsToReturn].sort((a, b) => {
                const indexA = samplePokemons.findIndex(p => p.id === a.id);
                const indexB = samplePokemons.findIndex(p => p.id === b.id);
                return indexA - indexB;
              });

              const newItems = set.items.filter(i => i.id !== item.id);

              onUpdate({
                ...set,
                items: newItems,
                pool: newPool
              });
            }}
            onAdd={(newItemName) => {
              const itemIndex = set.items.findIndex(i => i.id === item.id);
              if (itemIndex === -1) return;

              const ts = Date.now();
              const newItem = {
                id: `item_${ts}`,
                name: newItemName,
                pokemons: []
              };

              const newItems = [...set.items];
              newItems.splice(itemIndex + 1, 0, newItem);

              onUpdate({
                ...set,
                items: newItems
              });
            }}
            canDelete={set.items.length > 1}
            onMoveUp={() => {
              if (index > 0) {
                const newItems = arrayMove(set.items, index, index - 1);
                onUpdate({ ...set, items: newItems });
              }
            }}
            onMoveDown={() => {
              if (index < set.items.length - 1) {
                const newItems = arrayMove(set.items, index, index + 1);
                onUpdate({ ...set, items: newItems });
              }
            }}
            isFirst={index === 0}
            isLast={index === set.items.length - 1}
            isMobile={isMobile}
          />
        ))}
      </div>

      <button className={poolToggle} onClick={togglePool}>
        {set.isPoolOpen ? '▼ プールを閉じる' : '▶ プールを開く'}
      </button>

      <div
        className={set.isPoolOpen ? poolContainerOpen : poolContainerClosed}
      >
        <div
          ref={poolRef}
          className={poolClass}
          onClick={() => {
            if (selectedPokemon) {
              onPoolClick();
            }
          }}
        >
          {set.pool.length === 0 ? (
            <div className={emptyPoolMessage}>プールは空です</div>
          ) : (
            <SortableContext
              items={set.pool.map((p) => `pool-${set.id}-${p.id}`)}
              strategy={rectSortingStrategy}
            >
              {set.pool.map((pokemon) => (
                <SortablePokemon
                  key={pokemon.id}
                  pokemon={pokemon}
                  id={`pool-${set.id}-${pokemon.id}`}
                  isSelected={selectedPokemon?.id === pokemon.id}
                  onClick={() => onPokemonClick(pokemon)}
                />
              ))}
            </SortableContext>
          )}
        </div>
      </div>

      <SetEditModal
        isOpen={isEditModalOpen}
        onClose={() => setIsEditModalOpen(false)}
        setName={displayName}
        onRename={handleSetNameChange}
      />
    </div>
  );
};

// React.memoでメモ化してパフォーマンスを最適化
export const SetComponent = memo(SetComponentInner);
