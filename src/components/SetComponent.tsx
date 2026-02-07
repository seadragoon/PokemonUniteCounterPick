import { css } from '@linaria/core';
import type { Set, Pokemon } from '../types';
import { SetItemComponent } from './SetItemComponent';
import { SortablePokemon } from './SortablePokemon';
import { SortableContext, rectSortingStrategy } from '@dnd-kit/sortable';
import { useDroppable } from '@dnd-kit/core';

interface SetComponentProps {
  set: Set;
  onUpdate: (set: Set) => void;
  onMoveUp: () => void;
  onMoveDown: () => void;
  onDelete: () => void;
  selectedPokemon: Pokemon | null;
  onPokemonClick: (pokemon: Pokemon) => void;
  onItemClick: (itemId: string) => void;
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
  flex-wrap: wrap;
  gap: 10px;
`;

const setControls = css`
  display: flex;
  gap: 8px;
  flex-wrap: wrap;
`;

const controlButton = css`
  padding: 8px 16px;
  border: none;
  border-radius: 6px;
  font-size: 0.9rem;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s;
  background: #667eea;
  color: white;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.2);

  &:hover {
    background: #5568d3;
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

export function SetComponent({
  set,
  onUpdate,
  onMoveUp,
  onMoveDown,
  onDelete,
  selectedPokemon,
  onPokemonClick,
  onItemClick,
}: SetComponentProps) {
  const handleItemNameChange = (itemId: string, newName: string) => {
    const updatedSet = {
      ...set,
      items: set.items.map((item) =>
        item.id === itemId ? { ...item, name: newName } : item
      ),
    };
    onUpdate(updatedSet);
  };

  const togglePool = () => {
    onUpdate({ ...set, isPoolOpen: !set.isPoolOpen });
  };

  const poolDroppableId = `pool-drop-${set.id}`;
  const { setNodeRef: poolRef, isOver: isPoolOver } = useDroppable({
    id: poolDroppableId,
  });

  return (
    <div className={setContainer}>
      <div className={setHeader}>
        <h2 style={{ margin: 0, color: '#333' }}>セット {set.id}</h2>
        <div className={setControls}>
          <button className={controlButton} onClick={onMoveUp}>
            ↑ 上へ
          </button>
          <button className={controlButton} onClick={onMoveDown}>
            ↓ 下へ
          </button>
          <button className={deleteButton} onClick={onDelete}>
            削除
          </button>
        </div>
      </div>

      <div className={itemsWrapper}>
        {set.items.map((item) => (
          <SetItemComponent
            key={item.id}
            item={item}
            setId={set.id}
            selectedPokemon={selectedPokemon}
            onNameChange={handleItemNameChange}
            onPokemonClick={onPokemonClick}
            onClick={() => onItemClick(item.id)}
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
          className={isPoolOver ? poolGridDroppable : poolGrid}
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
    </div>
  );
}
