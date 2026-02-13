import { memo } from 'react';
import { useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import type { Pokemon } from '../types';
import { PokemonImage } from './PokemonImage';

interface SortablePokemonProps {
  pokemon: Pokemon;
  id: string;
  isSelected?: boolean;
  onClick?: () => void;
}

const SortablePokemonInner = ({
  pokemon,
  id,
  isSelected = false,
  onClick,
}: SortablePokemonProps) => {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } =
    useSortable({ id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
  };

  return (
    <div ref={setNodeRef} style={style} {...attributes} {...listeners}>
      <PokemonImage pokemon={pokemon} isSelected={isSelected} onClick={onClick} />
    </div>
  );
};

// React.memoでメモ化してパフォーマンスを最適化
export const SortablePokemon = memo(SortablePokemonInner);
