import { useState, useEffect, useCallback, useRef } from 'react';
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
import type { RuntimeSet, Pokemon } from './types';
import { samplePokemons } from './data/pokemon';
import { SetComponent } from './components/SetComponent';
import { SetViewComponent } from './components/SetViewComponent';
import { PokemonImage } from './components/PokemonImage';
import { useSetsStorage, isSetSaveable } from './hooks/useSetsStorage';
import { OverwriteConfirmModal } from './components/modals/OverwriteConfirmModal';
import { VariableSize, Size, MOBILE_BREAKPOINT, HEADER_BREAKPOINT } from './constants/cssSize';
import utils from './utils';

const appContainer = css`
  min-height: 100vh;
  padding: ${Size(20)};
  padding-top: ${Size(70)}; /* JSで動的に上書き */
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', 'Roboto', 'Oxygen',
    'Ubuntu', 'Cantarell', 'Fira Sans', 'Droid Sans', 'Helvetica Neue',
    sans-serif;
  transition: padding-top 0.3s ease;
`;

const viewModeContainer = css`
  max-width: ${Size(1400)};
  margin: 0 auto;
  column-count: 1;
  column-gap: ${Size(20)};
  padding: 0 ${Size(10)};

  @media (min-width: ${Size(MOBILE_BREAKPOINT)}) {
    column-count: 2;
  }

  @media (min-width: ${Size(1200)}) {
    column-count: 3;
    padding: 0;
  }
`;

const toggleButtonGroup = css`
  display: flex;
  background: rgba(255, 255, 255, 0.2);
  padding: ${Size(4)};
  border-radius: ${Size(8)};
  gap: ${Size(4)};
`;


const toggleButton = css`
  padding: ${Size(8)} ${Size(16)};
  border: none;
  border-radius: ${Size(6)};
  font-size: ${VariableSize(12, 16, MOBILE_BREAKPOINT, HEADER_BREAKPOINT)};
  font-weight: 600;
  white-space: nowrap;
  cursor: pointer;
  transition: all 0.2s;
  background: transparent;
  color: rgba(255, 255, 255, 0.8);
  flex: 1;
  text-align: center;

  &:hover {
    color: white;
    background: rgba(255, 255, 255, 0.1);
  }
`;

const activeToggleButton = css`
  background: white;
  color: #667eea;
  box-shadow: 0 ${Size(2)} ${Size(4)} rgba(0, 0, 0, 0.1);

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
  padding: ${Size(10)} ${Size(24)};
  display: flex;
  flex-direction: column;
  gap: 0;
  background: rgba(102, 126, 234, 0.95);
  backdrop-filter: blur(${Size(10)});
  box-shadow: 0 ${Size(4)} ${Size(12)} rgba(0, 0, 0, 0.15);

  @media (max-width: ${Size(MOBILE_BREAKPOINT)}) {
    padding: ${Size(8)} ${Size(12)};
  }
`;

const headerRow1 = css`
  display: flex;
  justify-content: space-between;
  align-items: center;
  width: 100%;
  gap: ${Size(12)};
`;

const headerRow1Right = css`
  display: flex;
  align-items: center;
  gap: ${Size(10)};

  @media (max-width: ${Size(MOBILE_BREAKPOINT)}) {
    display: none;
  }
`;

const headerRow2 = css`
  display: flex;
  justify-content: flex-end;
  align-items: center;
  width: 100%;
  gap: ${Size(10)};
  max-height: 0;
  opacity: 0;
  overflow: hidden;
  transition: max-height 0.3s ease, opacity 0.3s ease, padding-top 0.3s ease;
  padding-top: 0;

  &.open {
    max-height: ${Size(60)};
    opacity: 1;
    padding-top: ${Size(8)};
  }

  @media (max-width: ${Size(MOBILE_BREAKPOINT)}) {
    display: none;
  }
`;

const row2ToggleButton = css`
  background: rgba(255, 255, 255, 0.15);
  border: none;
  color: white;
  cursor: pointer;
  padding: ${Size(6)} ${Size(8)};
  border-radius: ${Size(6)};
  font-size: ${Size(13)};
  display: flex;
  align-items: center;
  transition: all 0.2s;

  &:hover {
    background: rgba(255, 255, 255, 0.3);
  }

  @media (max-width: ${Size(MOBILE_BREAKPOINT)}) {
    display: none;
  }
`;

const title = css`
  color: white;
  font-size: ${VariableSize(22, 32, MOBILE_BREAKPOINT, HEADER_BREAKPOINT)};
  font-weight: bold;
  margin: 0;
  text-shadow: ${Size(2)} ${Size(2)} ${Size(4)} rgba(0, 0, 0, 0.3);
  white-space: nowrap;

  @media (max-width: ${Size(MOBILE_BREAKPOINT)}) {
    font-size: ${Size(22)};
  }
`;

const hamburgerButton = css`
  display: none;
  background: transparent;
  border: none;
  cursor: pointer;
  padding: ${Size(10)};
  flex-direction: column;
  justify-content: space-around;
  width: ${Size(40)};
  height: ${Size(40)};
  
  span {
    display: block;
    width: ${Size(24)};
    height: ${Size(3)};
    background-color: white;
    border-radius: ${Size(2)};
    transition: all 0.3s;
  }

  @media (max-width: ${Size(MOBILE_BREAKPOINT)}) {
    display: flex;
  }
`;

const mobileMenu = css`
  display: none;
  gap: ${Size(10)};
  align-items: center;

  @media (max-width: ${Size(MOBILE_BREAKPOINT)}) {
    display: flex;
    flex-direction: column;
    width: 100%;
    
    /* アニメーション用プロパティ */
    max-height: 0;
    opacity: 0;
    overflow: hidden;
    transition: max-height 0.3s ease-in-out, opacity 0.3s ease-in-out, margin-top 0.3s ease, padding-top 0.3s ease;
    
    margin-top: 0;
    padding-top: 0;
    border-top: ${Size(1)} solid rgba(255, 255, 255, 0); 
    align-items: stretch;
    
    &.open {
      max-height: ${Size(500)};
      opacity: 1;
      margin-top: ${Size(10)};
      padding-top: ${Size(10)};
      border-top: ${Size(1)} solid rgba(255, 255, 255, 0.2);
    }
  }
`;

const menuOverlay = css`
  display: none;

  @media (max-width: ${Size(MOBILE_BREAKPOINT)}) {
    display: block;
    position: fixed;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    background: rgba(0, 0, 0, 0.5);
    z-index: 999;
    opacity: 0;
    pointer-events: none;
    transition: opacity 0.3s ease;

    &.active {
      opacity: 1;
      pointer-events: auto;
    }
  }
`;

const buttonGroup = css`
  display: flex;
  gap: ${Size(10)};
  flex-wrap: wrap;

  @media (max-width: ${Size(MOBILE_BREAKPOINT)}) {
    justify-content: stretch;
    flex-direction: column;
    width: 100%;
    
    /* トランジション用 */
    transition: max-height 0.3s ease-in-out, opacity 0.3s ease-in-out, margin-top 0.3s ease;
    overflow: hidden;
    
    button {
      width: 100%;
    }
  }
`;



const addButton = css`
  padding: ${Size(10)} ${Size(20)};
  border: none;
  border-radius: ${Size(8)};
  font-size: ${VariableSize(12, 16, MOBILE_BREAKPOINT, HEADER_BREAKPOINT)};
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s;
  box-shadow: 0 ${Size(2)} ${Size(4)} rgba(0, 0, 0, 0.2);

  &:hover {
    transform: translateY(${Size(-2)});
    box-shadow: 0 ${Size(4)} ${Size(8)} rgba(0, 0, 0, 0.3);
  }

  &:active {
    transform: translateY(0);
  }

  background: #4caf50;
  color: white;

  &:hover {
    background: #45a049;
    transform: translateY(${Size(-2)});
    box-shadow: 0 ${Size(4)} ${Size(8)} rgba(0, 0, 0, 0.3);
  }
`;

const resetButton = css`
  padding: ${Size(10)} ${Size(20)};
  border: none;
  border-radius: ${Size(8)};
  font-size: ${VariableSize(12, 16, MOBILE_BREAKPOINT, HEADER_BREAKPOINT)};
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s;
  box-shadow: 0 ${Size(2)} ${Size(4)} rgba(0, 0, 0, 0.2);

  &:hover {
    transform: translateY(${Size(-2)});
    box-shadow: 0 ${Size(4)} ${Size(8)} rgba(0, 0, 0, 0.3);
  }

  &:active {
    transform: translateY(0);
  }

  background: #f44336;
  color: white;

  &:hover {
    background: #da190b;
    transform: translateY(${Size(-2)});
    box-shadow: 0 ${Size(4)} ${Size(8)} rgba(0, 0, 0, 0.3);
  }
`;

const shareButton = css`
  padding: ${Size(10)} ${Size(20)};
  border: none;
  border-radius: ${Size(8)};
  font-size: ${VariableSize(12, 16, MOBILE_BREAKPOINT, HEADER_BREAKPOINT)};
  font-weight: 600;
  white-space: nowrap;
  cursor: pointer;
  transition: all 0.2s;
  box-shadow: 0 ${Size(2)} ${Size(4)} rgba(0, 0, 0, 0.2);

  &:hover {
    transform: translateY(${Size(-2)});
    box-shadow: 0 ${Size(4)} ${Size(8)} rgba(0, 0, 0, 0.3);
  }

  &:active {
    transform: translateY(0);
  }

  background: #2196f3;
  color: white;

  &:hover {
    background: #1976d2;
  }

  &:disabled {
    background: #9e9e9e;
    cursor: not-allowed;
    transform: none;
    box-shadow: none;
    opacity: 0.6;

    &:hover {
      background: #9e9e9e;
      transform: none;
      box-shadow: none;
    }
  }
`;

const setsContainer = css`
  max-width: ${Size(1200)};
  margin: 0 auto;
  display: flex;
  flex-direction: column;
  gap: ${Size(20)};
`;

const emptyState = css`
  text-align: center;
  color: white;
  padding: ${Size(40)};
  background: rgba(255, 255, 255, 0.1);
  border-radius: ${Size(12)};
  backdrop-filter: blur(${Size(10)});
  column-span: all;
`;

const footerStyle = css`
  max-width: ${Size(1200)};
  margin: ${Size(40)} auto 0;
  padding: 0 ${Size(20)} ${Size(20)};
  text-align: center;
`;

const footerDivider = css`
  border: none;
  border-top: ${Size(1)} solid rgba(255, 255, 255, 0.3);
  margin-bottom: ${Size(16)};
`;

const footerDisclaimer = css`
  color: rgba(255, 255, 255, 0.7);
  font-size: ${Size(12)};
  line-height: 1.6;
  margin: 0 0 ${Size(8)};
`;

const footerCopyright = css`
  color: rgba(255, 255, 255, 0.5);
  font-size: ${Size(12)};
  margin: 0;
`;

function App() {
  const { sets, setSets, clearStorage, getShareUrl, loadedFromUrl, isShowingUrlData, restoreOwnData, overwriteWithUrlData } = useSetsStorage();
  const hasSaveableData = sets.some(isSetSaveable);
  const [activeId, setActiveId] = useState<string | null>(null);
  const [selectedPokemon, setSelectedPokemon] = useState<{
    setId: string;
    pokemon: Pokemon;
  } | null>(null);
  // モード管理: 'edit' | 'view'
  const [viewMode, setViewMode] = useState<'edit' | 'view'>('edit');
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isRow2Open, setIsRow2Open] = useState(true); // PCヘッダー2段目の開閉
  const [isOverwriteModalOpen, setIsOverwriteModalOpen] = useState(false);
  const headerRef = useRef<HTMLElement>(null);
  const [headerHeight, setHeaderHeight] = useState(70);

  const [isMobile, setIsMobile] = useState(window.innerWidth <= MOBILE_BREAKPOINT);

  useEffect(() => {
    const handleResize = () => setIsMobile(window.innerWidth <= MOBILE_BREAKPOINT);
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  // URLからデータを読み込んだ場合は表示モードで開始
  useEffect(() => {
    if (loadedFromUrl) {
      setViewMode('view');
    }
  }, [loadedFromUrl]);

  // ヘッダー高さを測定してpadding-topを動的に設定
  useEffect(() => {
    const measure = () => {
      if (headerRef.current) {
        setHeaderHeight(headerRef.current.offsetHeight);
      }
    };
    measure();
    // アニメーション後に再測定
    const timer = setTimeout(measure, 350);
    return () => clearTimeout(timer);
  }, [isRow2Open, viewMode, isMenuOpen, isMobile]);

  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: isMobile ? 10000 : 5, // モバイルの場合はドラッグ無効化（実質的に）
      },
    }),
    useSensor(TouchSensor, {
      activationConstraint: {
        delay: isMobile ? 100000 : 250, // モバイルの場合はドラッグ無効化
        tolerance: 5,
      },
    })
  );

  const handleAddSet = () => {
    const ts = Date.now();
    const newSet: RuntimeSet = {
      id: `set_${ts}`,
      items: [
        { id: `item_${ts}_1`, name: 'ターゲット', pokemons: [] },
        { id: `item_${ts}_2`, name: '有利', pokemons: [] },
      ],
      pool: [...samplePokemons],
    };
    setSets([...sets, newSet]);
  };

  // 編集モードに切り替えるハンドラ（URLデータ表示中なら確認モーダルを表示）
  const handleSwitchToEdit = useCallback(() => {
    if (isShowingUrlData) {
      setIsOverwriteModalOpen(true);
    } else {
      setViewMode('edit');
    }
  }, [isShowingUrlData]);



  // モーダル: 自分のデータを利用
  const handleKeepOwnData = useCallback(() => {
    restoreOwnData();
    setIsOverwriteModalOpen(false);
    setViewMode('edit');
  }, [restoreOwnData]);

  // モーダル: 読み込んだデータで上書き
  const handleOverwriteData = useCallback(() => {
    overwriteWithUrlData();
    setIsOverwriteModalOpen(false);
    setViewMode('edit');
  }, [overwriteWithUrlData]);

  const handleShare = async () => {
    try {
      const url = await getShareUrl();
      await navigator.clipboard.writeText(url);
      alert('共有URLをクリップボードにコピーしました！');
    } catch (err) {
      console.error('Failed to copy URL:', err);
      alert('URLのコピーに失敗しました。');
    }
  };

  const handleReset = () => {
    if (window.confirm('すべてのデータを削除しますか？')) {
      clearStorage();
      setSets([]);
      setSelectedPokemon(null);
    }
  };

  const handleDragStart = (event: DragStartEvent) => {
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
      // 現在の実装では `id` は `set_...` (アンダースコア) なのでハイフンは安全だが、
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
        // pool-set_123-101
        return { type: 'pool-poke', setId: parts[1], pokemonId: Number(parts.slice(2).join('-')) } as const;
      }
      return null;
    }
    if (id.includes('-')) {
      // {setId}-{itemId}-{pokemonId}
      const parts = id.split('-');
      if (parts.length >= 3) {
        return { type: 'item-poke', setId: parts[0], itemId: parts[1], pokemonId: Number(parts.slice(2).join('-')) } as const;
      }
    }
    return null;
  };

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;
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

  const handleSetUpdate = useCallback((setId: string, updatedSet: RuntimeSet) => {
    setSets((prevSets) => prevSets.map((s) => (s.id === setId ? updatedSet : s)));
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

        // 同一項目の場合は選択解除のみ（移動しない）
        if (sourceItem && sourceItem.id === itemId) {
          return prevSets;
        }

        // プールからの移動処理
        if (!sourceItem) {
          const poolPokemonIndex = prevSets[setIndex].pool.findIndex(
            (p) => p.id === prevSelectedPokemon.pokemon.id
          );

          if (poolPokemonIndex !== -1) {
            const newSets = [...prevSets];
            const pokemon = newSets[setIndex].pool[poolPokemonIndex];

            // プールから削除
            newSets[setIndex].pool = newSets[setIndex].pool.filter(
              (p) => p.id !== prevSelectedPokemon.pokemon.id
            );

            // ターゲット項目に追加
            const targetItemIndex = newSets[setIndex].items.findIndex((i) => i.id === itemId);
            if (targetItemIndex !== -1) {
              newSets[setIndex].items[targetItemIndex].pokemons.push(pokemon);
            }
            return newSets;
          }
          return prevSets;
        }

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

  const handlePoolClick = useCallback((setId: string) => {
    setSelectedPokemon((prevSelectedPokemon) => {
      if (!prevSelectedPokemon) return prevSelectedPokemon; // 何も選択されていない場合は何もしない

      setSets((prevSets) => {
        const setIndex = prevSets.findIndex((s) => s.id === setId);
        if (setIndex === -1) return prevSets;

        // 選択中のポケモンがどの項目にいるか探す
        const sourceItem = prevSets[setIndex].items.find((i) =>
          i.pokemons.some((p) => p.id === prevSelectedPokemon.pokemon.id)
        );

        // 項目にいない（＝既にプールにいる、または別セットなど）場合は何もしない
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

        // プールに追加（重複チェック）
        if (!newSets[setIndex].pool.some(p => p.id === prevSelectedPokemon.pokemon.id)) {
          newSets[setIndex].pool.push(prevSelectedPokemon.pokemon);
          // ソート
          newSets[setIndex].pool.sort((a, b) => {
            const indexA = samplePokemons.findIndex(p => p.id === a.id);
            const indexB = samplePokemons.findIndex(p => p.id === b.id);
            return indexA - indexB;
          });
        }

        return newSets;
      });

      return null; // 選択解除
    });
  }, []);

  const handlePokemonClick = useCallback((setId: string, pokemon: Pokemon) => {
    // 既にポケモン選択中で、別のポケモンをクリックした場合
    if (selectedPokemon && selectedPokemon.pokemon.id !== pokemon.id) {
      const set = sets.find(s => s.id === setId);
      if (set) {
        const sourceItem = set.items.find(item => item.pokemons.some(p => p.id === selectedPokemon.pokemon.id));
        const targetItem = set.items.find(item => item.pokemons.some(p => p.id === pokemon.id));
        if (sourceItem === targetItem) {
          // 同一項目の場合は選択変更のみ
          setSelectedPokemon({ setId, pokemon });
          return;
        }

        const isTargetPool = !targetItem && set.pool.some(p => p.id === pokemon.id);

        // 別の項目へ移動
        if (targetItem) {
          handleItemClick(setId, targetItem.id);
          return;
        }

        // プールへ移動
        if (isTargetPool) {
          handlePoolClick(setId);
          return;
        }
      }
    }

    setSelectedPokemon((prev) => {
      if (prev?.setId === setId && prev?.pokemon.id === pokemon.id) {
        return null;
      }
      return { setId, pokemon };
    });
  }, [selectedPokemon, sets, handleItemClick, handlePoolClick]);

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
    <div className={appContainer} style={{ paddingTop: headerHeight + 16 }}>
      <header className={header} ref={headerRef}>
        {/* 1段目: タイトル + 共有ボタン + モード切替 + 開閉ボタン */}
        <div className={headerRow1}>
          <h1 className={title}>Unite CounterPick Maker</h1>
          <div className={headerRow1Right}>
            <button className={shareButton} onClick={handleShare} disabled={!hasSaveableData} style={{ display: 'inline-flex', alignItems: 'center', gap: Size(6) }}>
              リンク作成
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="9" y="9" width="13" height="13" rx="2" /><path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1" /></svg>
            </button>
            <div className={toggleButtonGroup}>
              <button
                className={`${toggleButton} ${viewMode === 'edit' ? activeToggleButton : ''}`}
                onClick={handleSwitchToEdit}
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
            <button
              className={row2ToggleButton}
              onClick={() => setIsRow2Open(!isRow2Open)}
              title={isRow2Open ? 'ツールバーを閉じる' : 'ツールバーを開く'}
              style={viewMode === 'view' ? { visibility: 'hidden', pointerEvents: 'none' } : undefined}
            >
              {isRow2Open ? '▲' : '▼'}
            </button>
          </div>
          <button
            className={hamburgerButton}
            onClick={() => setIsMenuOpen(!isMenuOpen)}
            aria-label="Toggle menu"
          >
            <span style={{ transform: isMenuOpen ? utils.getFormatText('rotate(45deg) translate({0}, {1})', Size(5), Size(5)) : 'none' }} />
            <span style={{ opacity: isMenuOpen ? 0 : 1 }} />
            <span style={{ transform: isMenuOpen ? utils.getFormatText('rotate(-45deg) translate({0}, -{1})', Size(5), Size(5)) : 'none' }} />
          </button>
        </div>

        {/* 2段目 (PC): アクションボタン群 右寄せ・開閉可能 */}
        <div className={`${headerRow2} ${isRow2Open && viewMode === 'edit' ? 'open' : ''}`}>
          <button className={addButton} onClick={handleAddSet}>
            + セット追加
          </button>
          <button className={resetButton} onClick={handleReset}>
            Reset
          </button>
        </div>

        {/* モバイルメニュー */}
        <div className={`${mobileMenu} ${isMenuOpen ? 'open' : ''}`}>
          <div className={toggleButtonGroup}>
            <button
              className={`${toggleButton} ${viewMode === 'edit' ? activeToggleButton : ''}`}
              onClick={handleSwitchToEdit}
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
            style={{
              transition: 'max-height 0.3s ease-in-out, opacity 0.3s ease-in-out, margin-top 0.3s ease',
              maxHeight: viewMode === 'edit' ? Size(200) : Size(0),
              opacity: viewMode === 'edit' ? 1 : 0,
              marginTop: viewMode === 'edit' ? Size(10) : Size(0),
              overflow: 'hidden',
              pointerEvents: viewMode === 'edit' ? 'auto' : 'none',
              width: '100%',
            }}
          >
            <button className={addButton} onClick={() => { handleAddSet(); setIsMenuOpen(false); }}>
              + セット追加
            </button>
            <button className={shareButton} onClick={() => { handleShare(); setIsMenuOpen(false); }} disabled={!hasSaveableData} style={{ display: 'inline-flex', alignItems: 'center', justifyContent: 'center', gap: Size(6) }}>
              リンク作成
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="9" y="9" width="13" height="13" rx="2" /><path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1" /></svg>
            </button>
            <button className={resetButton} onClick={() => { handleReset(); setIsMenuOpen(false); }}>
              Reset
            </button>
          </div>
        </div>
      </header>

      {/* モバイルメニュー用オーバーレイ */}
      <div
        className={`${menuOverlay} ${isMenuOpen ? 'active' : ''}`}
        onClick={() => setIsMenuOpen(false)}
      />

      {viewMode === 'view' ? (
        <div className={viewModeContainer}>
          {!hasSaveableData ? (
            <div className={emptyState}>
              <p>セットがありません。編集モードでセットを作成してください。</p>
            </div>
          ) : (
            sets.filter(isSetSaveable).map((set, index) => (
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
            {sets.map((set, index) => (
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
                onPoolClick={() => handlePoolClick(set.id)}
                isMobile={isMobile}
              />
            ))}
            <div style={{ display: 'flex', justifyContent: 'center', padding: utils.getFormatText("{0} {1}", Size(20), Size(0)) }}>
              <button className={addButton} onClick={handleAddSet} style={{ fontSize: Size(18), padding: utils.getFormatText("{0} {1}", Size(14), Size(32)) }}>
                + セットを追加
              </button>
            </div>
          </div>
          <DragOverlay>
            {activePokemon ? <PokemonImage pokemon={activePokemon} isDragging /> : null}
          </DragOverlay>
        </DndContext>
      )}

      <footer className={footerStyle}>
        <hr className={footerDivider} />
        <p className={footerDisclaimer}>
          当サイトはファンによる非営利目的のプロジェクトであり、株式会社ポケモン、Nintendo、Creatures Inc.、GAME FREAK inc.、およびTencent Gamesとは一切関係ありません。
          『Pokémon UNITE』に関するすべての画像および知的財産権は、各権利者に帰属します。
        </p>
        <p className={footerCopyright}>
          ©2026 Developed by seadragoon
        </p>
      </footer>

      <OverwriteConfirmModal
        isOpen={isOverwriteModalOpen}
        onClose={() => setIsOverwriteModalOpen(false)}
        onKeepOwn={handleKeepOwnData}
        onOverwrite={handleOverwriteData}
      />
    </div>
  );
}

export default App;
