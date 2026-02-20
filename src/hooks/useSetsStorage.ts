import { useState, useEffect, useRef } from 'react';
import type { RuntimeSet, Pokemon } from '../types';
import { samplePokemons } from '../data/pokemon';

const STORAGE_KEY = 'pokemon-unite-counter-pick';

// 項目のデフォルト名（インデックスで決まる）
const DEFAULT_ITEM_NAMES: Record<number, string> = { 0: 'ターゲット', 1: '有利' };

// 保存形式: 短縮キー（n=name, i=items, p=pokemons）、デフォルト名の項目はn省略
interface SavedSetItem {
    n?: string;  // name（デフォルト名の場合は省略）
    p: number[]; // pokemons
}
interface SavedSet {
    n?: string;  // name
    i: SavedSetItem[]; // items
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

/** 使用中のポケモンIDのセットを取得 */
const getUsedPokemonIds = (items: { pokemons: Pokemon[] }[]): globalThis.Set<number> => {
    const usedIds = new globalThis.Set<number>();
    for (const item of items) {
        for (const p of item.pokemons) {
            usedIds.add(p.id);
        }
    }
    return usedIds;
};

/** 全ポケモンから使用済みを除いてpoolを算出 */
const computePool = (items: { pokemons: Pokemon[] }[]): Pokemon[] => {
    const usedIds = getUsedPokemonIds(items);
    return samplePokemons.filter((p) => !usedIds.has(p.id));
};

/**
 * localStorage / URL からセットデータを読み込み、RuntimeSetに変換する。
 * 短縮キー（n, i, p）と旧形式の長いキー（name, items, pokemons）の両方に対応。
 */
// eslint-disable-next-line @typescript-eslint/no-explicit-any
const deserializeSets = (parsed: any[]): RuntimeSet[] => {
    return parsed.map((set: any, si: number) => {
        const setId = `s${si}`;
        const rawItems = set.i || set.items || [];
        const items = rawItems.map((item: any, ii: number) => ({
            id: `${setId}_i${ii}`,
            name: item.n || item.name || DEFAULT_ITEM_NAMES[ii] || '',
            pokemons: (item.p || item.pokemons || [])
                .map((p: any) => resolvePokemonId(p))
                .filter((id: number | null): id is number => id !== null)
                .map((id: number) => pokemonById(id))
                .filter(Boolean),
        }));
        return {
            id: setId,
            name: set.n || set.name,
            items,
            pool: computePool(items),
        };
    });
};

/** RuntimeSet を保存形式に変換する（短縮キー、IDなし、pool なし、デフォルト名は省略） */
const serializeSets = (sets: RuntimeSet[]): SavedSet[] => {
    return sets.map((set) => ({
        n: set.name,
        i: set.items.map((item, ii) => ({
            // デフォルト名と一致する場合はnを省略して保存データを削減
            ...(item.name !== DEFAULT_ITEM_NAMES[ii] ? { n: item.name } : {}),
            p: item.pokemons.map((p) => p.id),
        })),
    }));
};

const createInitialSet = (): RuntimeSet => ({
    id: 'set_1',
    items: [
        { id: 'item_1', name: 'ターゲット', pokemons: [] },
        { id: 'item_2', name: '有利', pokemons: [] },
    ],
    pool: [...samplePokemons],
});

export function useSetsStorage() {
    const [sets, setSets] = useState<RuntimeSet[]>([]);
    const loadedRef = useRef(false);

    // URLからの読み込みを優先、次いで localStorage
    // ※ StrictMode対策: replaceStateでURLパラメータを消すため、2回目の実行でURLデータが失われる問題を防ぐ
    useEffect(() => {
        if (loadedRef.current) return;
        loadedRef.current = true;

        const urlParams = new URLSearchParams(window.location.search);
        const urlData = urlParams.get('d');

        if (urlData) {
            try {
                // Base64デコード (URL safe対応)
                const binary = atob(urlData.replace(/-/g, '+').replace(/_/g, '/'));
                const bytes = Uint8Array.from(binary, (c) => c.charCodeAt(0));
                const parsed = JSON.parse(new TextDecoder().decode(bytes));
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
        const bytes = new TextEncoder().encode(json);
        const binary = Array.from(bytes, (b) => String.fromCharCode(b)).join('');
        const encoded = btoa(binary)
            .replace(/\+/g, '-')
            .replace(/\//g, '_')
            .replace(/=+$/, '');

        const url = new URL(window.location.href);
        url.searchParams.set('d', encoded);
        return url.toString();
    };

    return { sets, setSets, clearStorage, getShareUrl };
}
