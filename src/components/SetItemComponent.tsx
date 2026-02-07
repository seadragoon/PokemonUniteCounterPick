import { useState } from 'react';
import { css } from '@linaria/core';
import { SortableContext, horizontalListSortingStrategy, rectSortingStrategy } from '@dnd-kit/sortable';
import type { SetItem, Pokemon } from '../types';
import { SortablePokemon } from './SortablePokemon';
import { useDroppable, useDndContext } from '@dnd-kit/core';

interface SetItemComponentProps {
  item: SetItem;
  setId: string;
  selectedPokemon: Pokemon | null;
  onNameChange: (itemId: string, newName: string) => void;
  onPokemonClick: (pokemon: Pokemon) => void;
  onClick: () => void;
}

const itemContainer = css`
  background: rgba(255, 255, 255, 0.95);
  border-radius: 8px;
  overflow: hidden;
  border: 1px solid rgba(102, 126, 234, 0.3);
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
  flex: 1;
  display: flex;
  flex-direction: row;
  align-items: stretch;
`;

const itemHeader = css`
  display: flex;
  align-items: center;
  margin-bottom: 0;
  padding: 8px 12px;
  background: rgba(102, 126, 234, 0.1);
  border-bottom: none;
  border-right: 1px solid rgba(102, 126, 234, 0.3);
  width: 160px;
  flex-shrink: 0;
`;

const itemNameInput = css`
  width: 100%;
  font-size: 1rem;
  font-weight: 700;
  padding: 4px 8px;
  border: 1px solid transparent;
  border-radius: 4px;
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
  gap: 4px;
  min-height: 40px;
  padding: 10px;
  background: rgba(255, 255, 255, 0.5);
  transition: all 0.2s;
  flex: 1;
`;

const pokemonsContainerDroppable = css`
  display: flex;
  flex-wrap: wrap;
  align-content: flex-start;
  gap: 4px;
  min-height: 40px;
  padding: 10px;
  background: rgba(255, 255, 255, 0.5);
  transition: all 0.2s;
  flex: 1;
  background: rgba(102, 126, 234, 0.15);
  box-shadow: inset 0 0 0 2px #667eea;
`;

const emptyMessage = css`
  color: #888;
  font-size: 0.85rem;
  display: flex;
  align-items: center;
  justify-content: center;
  width: 100%;
  height: 100%;
  min-height: 40px;
`;

export function SetItemComponent({
  item,
  setId,
  selectedPokemon,
  onNameChange,
  onPokemonClick,
  onClick,
}: SetItemComponentProps) {
  const [name, setName] = useState(item.name);

  const droppableId = `drop:${setId}:${item.id}`;
  const { setNodeRef } = useDroppable({
    id: droppableId,
  });

  const { over } = useDndContext();

  const isOverContainer = over?.id === droppableId;
  const isOverChild = typeof over?.id === 'string' && (over.id as string).startsWith(`${setId}-${item.id}-`);
  const isHovering = isOverContainer || isOverChild;

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
        className={isHovering ? pokemonsContainerDroppable : pokemonsContainer}
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
              ? 'ここにドロップまたはクリック'
              : 'ポケモンをドラッグ&ドロップ'}
          </div>
        ) : (
          <SortableContext
            items={item.pokemons.map((p) => `${setId}-${item.id}-${p.id}`)}
            strategy={horizontalListSortingStrategy}
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
    </div>
  );
}
