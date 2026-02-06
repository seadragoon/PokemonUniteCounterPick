import { useState } from 'react';
import { css } from '@linaria/core';
import { SortableContext, horizontalListSortingStrategy } from '@dnd-kit/sortable';
import type { SetItem, Pokemon } from '../types';
import { SortablePokemon } from './SortablePokemon';
import { useDroppable } from '@dnd-kit/core';

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
  border-radius: 12px;
  padding: 15px;
  margin-bottom: 15px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
`;

const itemHeader = css`
  display: flex;
  align-items: center;
  margin-bottom: 12px;
  gap: 4px;
`;

const itemNameInput = css`
  flex: 1;
  font-size: 1.1rem;
  font-weight: 600;
  padding: 8px 12px;
  border: 2px solid transparent;
  border-radius: 6px;
  background: rgba(0, 0, 0, 0.05);
  cursor: text;
  transition: all 0.2s;

  &:focus {
    outline: none;
    border-color: #667eea;
    background: white;
  }

  &:hover:not(:focus) {
    background: rgba(0, 0, 0, 0.08);
  }
`;

const pokemonsContainer = css`
  display: flex;
  flex-wrap: wrap;
  gap: 4px;
  min-height: 80px;
  padding: 10px;
  border-radius: 8px;
  background: rgba(0, 0, 0, 0.08);
  border: 1px solid rgba(0, 0, 0, 0.4);
  transition: all 0.2s;
`;

const pokemonsContainerDroppable = css`
  ${pokemonsContainer}
  background: rgba(102, 126, 234, 0.1);
  border: 2px dashed #667eea;
`;

const emptyMessage = css`
  color: #999;
  font-size: 0.9rem;
  display: flex;
  align-items: center;
  justify-content: center;
  width: 100%;
  min-height: 60px;
`;

export function SetItemComponent({
  item,
  setId,
  selectedPokemon,
  onNameChange,
  onPokemonClick,
  onClick,
}: SetItemComponentProps) {
  const [isEditing, setIsEditing] = useState(false);
  const [name, setName] = useState(item.name);

  const droppableId = `drop:${setId}:${item.id}`;
  const { setNodeRef, isOver } = useDroppable({
    id: droppableId,
  });

  const handleNameBlur = () => {
    setIsEditing(false);
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
          onFocus={() => setIsEditing(true)}
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
        className={isOver ? pokemonsContainerDroppable : pokemonsContainer}
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
