import { useState, useEffect } from 'react';
import type { Set, Pokemon } from '../types';
import { samplePokemons } from '../data/pokemon';

const STORAGE_KEY = 'pokemon-unite-counter-pick';

// 保存形式: pokemons/pool を number[] (IDのみ) で保存
interface SavedSetItem {
    id: string;
    name: string;
    pokemons: number[];
}
interface SavedSet {
    id: string;
    name?: string;
    items: SavedSetItem[];
    pool: number[];
    isPoolOpen: boolean;
}

const pokemonById = (id: number): Pokemon | undefined =>
    samplePokemons.find((p) => p.id === id);

// eslint-disable-next-line @typescript-eslint/no-explicit-any
const resolvePokemonId = (raw: any): number | null => {
    if (typeof raw === 'number') return raw;
    if (typeof raw === 'string') {
        // 旧形式: 英語名 → en_name で検索して数値IDに変換
        const found = samplePokemons.find((sp) => sp.en_name === raw);
        return found ? found.id : null;
    }
    // 旧形式: オブジェクト { id: ... }
    if (raw && typeof raw === 'object' && 'id' in raw) {
        return resolvePokemonId(raw.id);
    }
    return null;
};

/** localStorage からセットデータを読み込み、保存する */
// eslint-disable-next-line @typescript-eslint/no-explicit-any
const deserializeSets = (parsed: any[]): Set[] => {
    return parsed.map((set: any) => ({
        ...set,
        items: (set.items || []).map((item: any) => ({
            ...item,
            pokemons: (item.pokemons || [])
                .map((p: any) => resolvePokemonId(p))
                .filter((id: number | null): id is number => id !== null)
                .map((id: number) => pokemonById(id))
                .filter(Boolean),
        })),
        pool: (set.pool || [])
            .map((p: any) => resolvePokemonId(p))
            .filter((id: number | null): id is number => id !== null)
            .map((id: number) => pokemonById(id))
            .filter(Boolean),
    }));
};

const serializeSets = (sets: Set[]): SavedSet[] => {
    return sets.map((set) => ({
        ...set,
        items: set.items.map((item) => ({
            ...item,
            pokemons: item.pokemons.map((p) => p.id),
        })),
        pool: set.pool.map((p) => p.id),
    }));
};

const createInitialSet = (): Set => ({
    id: 'set_1',
    items: [
        { id: 'item_1', name: 'ターゲット', pokemons: [] },
        { id: 'item_2', name: '有利', pokemons: [] },
    ],
    pool: [...samplePokemons],
    isPoolOpen: false,
});

export function useSetsStorage() {
    const [sets, setSets] = useState<Set[]>([]);

    // URLからの読み込みを優先、次いで localStorage
    useEffect(() => {
        const urlParams = new URLSearchParams(window.location.search);
        const urlData = urlParams.get('d');

        if (urlData) {
            try {
                // Base64デコード (URL safe対応)
                const decoded = atob(urlData.replace(/-/g, '+').replace(/_/g, '/'));
                const parsed = JSON.parse(decodeURIComponent(escape(decoded)));
                const deserialized = deserializeSets(parsed);
                setSets(deserialized);
                // URLから読み込んだ場合はクエリパラメータを消す（リロード対策）
                window.history.replaceState({}, '', window.location.pathname);
                return;
            } catch (e) {
                console.error('Failed to parse URL data:', e);
            }
        }

        const saved = localStorage.getItem(STORAGE_KEY);
        if (saved) {
            try {
                const parsed = JSON.parse(saved);
                setSets(deserializeSets(parsed));
            } catch (e) {
                console.error('Failed to load saved data:', e);
            }
        } else {
            setSets([createInitialSet()]);
        }
    }, []);

    // 保存
    useEffect(() => {
        if (sets.length > 0) {
            localStorage.setItem(STORAGE_KEY, JSON.stringify(serializeSets(sets)));
        }
    }, [sets]);

    const clearStorage = () => {
        localStorage.removeItem(STORAGE_KEY);
    };

    const getShareUrl = () => {
        const serialized = serializeSets(sets);
        const json = JSON.stringify(serialized);
        // Base64エンコード (Unicode対応 + URL safe)
        const encoded = btoa(unescape(encodeURIComponent(json)))
            .replace(/\+/g, '-')
            .replace(/\//g, '_')
            .replace(/=+$/, '');

        const url = new URL(window.location.href);
        url.searchParams.set('d', encoded);
        return url.toString();
    };

    return { sets, setSets, clearStorage, getShareUrl };
}
