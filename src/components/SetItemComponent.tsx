import { useState } from 'react';
import { css } from '@linaria/core';
import { Size } from '../constants/cssSize';
import { SortableContext, rectSortingStrategy } from '@dnd-kit/sortable';
import type { SetItem, Pokemon } from '../types';
import { SortablePokemon } from './SortablePokemon';
import { useDroppable, useDndContext } from '@dnd-kit/core';
import { SetItemEditModal } from './SetItemEditModal';

interface SetItemComponentProps {
  item: SetItem;
  setId: string;
  selectedPokemon: Pokemon | null;
  onNameChange: (itemId: string, newName: string) => void;
  onPokemonClick: (pokemon: Pokemon) => void;
  onClick: () => void;
  onDelete: () => void;
  onAdd: (newItemName: string) => void;
  canDelete: boolean;
  onMoveUp: () => void;
  onMoveDown: () => void;
  isFirst: boolean;
  isLast: boolean;
  isMobile: boolean;
}

const itemContainer = css`
  background: rgba(255, 255, 255, 0.95);
  border-radius: ${Size(8)};
  overflow: hidden;
  border: ${Size(1)} solid rgba(102, 126, 234, 0.3);
  box-shadow: 0 ${Size(2)} ${Size(8)} rgba(0, 0, 0, 0.1);
  flex: 1;
  display: flex;
  flex-direction: row;
  align-items: stretch;
  position: relative;

  @media (max-width: 820px) {
    flex-direction: column;
  }
`;

const itemHeader = css`
  display: flex;
  align-items: center;
  margin-bottom: 0;
  padding: ${Size(8)} ${Size(12)};
  background: rgba(102, 126, 234, 0.1);
  border-bottom: none;
  border-right: ${Size(1)} solid rgba(102, 126, 234, 0.3);
  width: ${Size(160)};
  flex-shrink: 0;

  @media (max-width: 820px) {
    width: 100%;
    border-right: none;
    border-bottom: ${Size(1)} solid rgba(102, 126, 234, 0.3);
    justify-content: center; /* タイトル入力欄を中央寄せ */
  }
`;

const itemNameInput = css`
  width: 100%;
  font-size: ${Size(16)};
  font-weight: 700;
  padding: ${Size(4)} ${Size(8)};
  border: ${Size(1)} solid transparent;
  border-radius: ${Size(4)};
  background: transparent;
  cursor: text;
  transition: all 0.2s;
  color: #333;
  text-align: center;

  &:focus {
    outline: none;
    border-color: #667eea;
    background: white;
  }

  &:hover:not(:focus) {
    background: rgba(255, 255, 255, 0.5);
  }
`;

const pokemonsContainer = css`
  display: flex;
  flex-wrap: wrap;
  align-content: flex-start;
  gap: ${Size(4)};
  min-height: ${Size(40)};
  padding: ${Size(10)};
  background: rgba(255, 255, 255, 0.5);
  transition: all 0.2s;
  flex: 1;
  padding-right: ${Size(10)};
`;

const pokemonsContainerClickable = css`
  display: flex;
  flex-wrap: wrap;
  align-content: flex-start;
  gap: ${Size(4)};
  min-height: ${Size(40)};
  padding: ${Size(10)};
  background: rgba(255, 255, 255, 0.5);
  transition: all 0.2s;
  flex: 1;
  padding-right: ${Size(10)};
  cursor: pointer;

  &:hover {
    background: rgba(102, 126, 234, 0.1);
    box-shadow: inset 0 0 0 ${Size(2)} #667eea;
  }
`;

const pokemonsContainerDroppable = css`
  display: flex;
  flex-wrap: wrap;
  align-content: flex-start;
  gap: ${Size(4)};
  min-height: ${Size(40)};
  padding: ${Size(10)};
  background: rgba(255, 255, 255, 0.5);
  transition: all 0.2s;
  flex: 1;
  background: rgba(102, 126, 234, 0.15);
  box-shadow: inset 0 0 0 ${Size(2)} #667eea;
  padding-right: ${Size(10)};
`;

const emptyMessage = css`
  color: #888;
  font-size: ${Size(14)};
  display: flex;
  align-items: center;
  justify-content: center;
  width: 100%;
  height: 100%;
  min-height: ${Size(40)};
`;

const controlsContainer = css`
  display: flex;
  align-items: center;
  justify-content: center;
  gap: ${Size(8)};
  padding: 0 ${Size(12)};
  background: rgba(102, 126, 234, 0.05);
  border-left: ${Size(1)} solid rgba(102, 126, 234, 0.2);
  flex-shrink: 0;
`;

const moveButtonsColumn = css`
  display: flex;
  flex-direction: column;
  gap: ${Size(4)};
`;

const controlButton = css`
  width: ${Size(32)};
  height: ${Size(32)};
  font-size: ${Size(19)};
  border: none;
  background: transparent;
  cursor: pointer;
  color: #999;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: ${Size(4)};
  transition: all 0.2s;

  &:hover:not(:disabled) {
    background: rgba(0, 0, 0, 0.05);
    color: #667eea;
  }

  &:disabled {
    opacity: 0.3;
    cursor: default;
  }
`;

const moveButton = css`
  width: ${Size(32)};
  height: ${Size(24)}; /* Slightly shorter for stacking */
  font-size: ${Size(16)};
  border: none;
  background: transparent;
  cursor: pointer;
  color: #999;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: ${Size(4)};
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

export function SetItemComponent({
  item,
  setId,
  selectedPokemon,
  onNameChange,
  onPokemonClick,
  onClick,
  onDelete,
  onAdd,
  canDelete,
  onMoveUp,
  onMoveDown,
  isFirst,
  isLast,
  isMobile,
}: SetItemComponentProps) {
  const [name, setName] = useState(item.name);
  const [isModalOpen, setIsModalOpen] = useState(false);

  const droppableId = `drop:${setId}:${item.id}`;
  const { setNodeRef } = useDroppable({
    id: droppableId,
  });

  const { over } = useDndContext();

  const isOverContainer = over?.id === droppableId;
  const isOverChild = typeof over?.id === 'string' && (over.id as string).startsWith(`${setId}-${item.id}-`);
  const isHovering = isOverContainer || isOverChild;

  // 選択中で、かつ選択中のポケモンが自分自身に含まれていない場合にクリッカブルにする
  const isClickable = selectedPokemon && !item.pokemons.some(p => p.id === selectedPokemon.id);

  const containerClass = isHovering
    ? pokemonsContainerDroppable
    : (isClickable ? pokemonsContainerClickable : pokemonsContainer);

  const handleNameBlur = () => {
    if (name.trim()) {
      onNameChange(item.id, name.trim());
    } else {
      setName(item.name);
    }
  };

  const handleNameKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      handleNameBlur();
    }
  };

  return (
    <div className={itemContainer}>
      <div className={itemHeader}>
        <input
          type="text"
          className={itemNameInput}
          value={name}
          onChange={(e) => setName(e.target.value)}
          onBlur={handleNameBlur}
          onKeyDown={handleNameKeyDown}
          onClick={(e) => {
            if (selectedPokemon) {
              e.stopPropagation();
              onClick();
            }
          }}
        />
      </div>
      <div
        ref={setNodeRef}
        className={containerClass}
        onClick={(e) => {
          if (selectedPokemon && e.target === e.currentTarget) {
            onClick();
          }
        }}
      >
        {item.pokemons.length === 0 ? (
          <div
            className={emptyMessage}
            onClick={(e) => {
              e.stopPropagation();
              if (selectedPokemon) onClick();
            }}
          >
            {selectedPokemon
              ? (isMobile ? '領域をタップで移動' : 'ここにドロップ')
              : (isMobile ? 'ポケモンを選択し、領域をタップで決定' : 'ポケモンをドラッグ&ドロップ')}
          </div>
        ) : (
          <SortableContext
            items={item.pokemons.map((p) => `${setId}-${item.id}-${p.id}`)}
            strategy={rectSortingStrategy}
          >
            {item.pokemons.map((pokemon) => (
              <SortablePokemon
                key={pokemon.id}
                pokemon={pokemon}
                id={`${setId}-${item.id}-${pokemon.id}`}
                isSelected={selectedPokemon?.id === pokemon.id}
                onClick={() => onPokemonClick(pokemon)}
              />
            ))}
          </SortableContext>
        )}
      </div>

      <div className={controlsContainer}>
        <button
          className={controlButton}
          onClick={(e) => {
            e.stopPropagation();
            setIsModalOpen(true);
          }}
          title="項目設定"
        >
          ⚙
        </button>
        <div className={moveButtonsColumn}>
          <button
            className={moveButton}
            onClick={(e) => {
              e.stopPropagation();
              if (!isFirst) onMoveUp();
            }}
            disabled={isFirst}
            title="上へ移動"
          >
            ▲
          </button>
          <button
            className={moveButton}
            onClick={(e) => {
              e.stopPropagation();
              if (!isLast) onMoveDown();
            }}
            disabled={isLast}
            title="下へ移動"
          >
            ▼
          </button>
        </div>
      </div>

      <SetItemEditModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        itemName={name}
        onRename={(newName) => {
          setName(newName);
          onNameChange(item.id, newName);
        }}
        onDelete={onDelete}
        onAdd={onAdd}
        canDelete={canDelete}
      />
    </div>
  );
}
