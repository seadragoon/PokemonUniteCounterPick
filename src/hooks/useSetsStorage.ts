import { useState, useEffect, useRef, useCallback } from 'react';
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

/** セットが保存対象かどうかを判定（いずれかの項目にポケモンまたはカスタム名があるか） */
export const isSetSaveable = (set: RuntimeSet): boolean =>
    set.items.some((item, ii) =>
        item.pokemons.length > 0 || item.name !== DEFAULT_ITEM_NAMES[ii]
    );

/** RuntimeSet を保存形式に変換する（短縮キー、IDなし、pool なし、デフォルト名は省略） */
/** 全項目が空（ポケモン0個かつデフォルト名）のセットは保存しない */
const serializeSets = (sets: RuntimeSet[]): SavedSet[] => {
    return sets
        .filter(isSetSaveable)
        .map((set) => ({
            n: set.name,
            i: set.items.map((item, ii) => ({
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

/** deflate-raw で圧縮 */
const compressData = async (data: string): Promise<Uint8Array> => {
    const stream = new Blob([data]).stream().pipeThrough(new CompressionStream('deflate-raw'));
    return new Uint8Array(await new Response(stream).arrayBuffer());
};

/** deflate-raw を解凍 */
const decompressData = async (data: Uint8Array): Promise<string> => {
    const ds = new DecompressionStream('deflate-raw');
    const writer = ds.writable.getWriter();
    writer.write(new Uint8Array(data));
    writer.close();
    return new Response(ds.readable).text();
};

/** Uint8Array → URL safe Base64 */
const toBase64Url = (bytes: Uint8Array): string =>
    btoa(Array.from(bytes, (b) => String.fromCharCode(b)).join(''))
        .replace(/\+/g, '-')
        .replace(/\//g, '_')
        .replace(/=+$/, '');

/** URL safe Base64 → Uint8Array */
const fromBase64Url = (str: string): Uint8Array => {
    const binary = atob(str.replace(/-/g, '+').replace(/_/g, '/'));
    return Uint8Array.from(binary, (c) => c.charCodeAt(0));
};

/** localStorage からセットデータを読み込む */
const loadSetsFromStorage = (): RuntimeSet[] => {
    const saved = localStorage.getItem(STORAGE_KEY);
    if (saved) {
        try {
            return deserializeSets(JSON.parse(saved));
        } catch (e) {
            console.error('Failed to load saved data:', e);
        }
    }
    return [];
};

export function useSetsStorage() {
    // 現在表示中のセットデータ（URLデータまたはlocalStorageデータ）
    const [sets, setSets] = useState<RuntimeSet[]>([]);
    // URLから読み込んだデータを別途保持（nullならURLデータなし）
    const [urlSets, setUrlSets] = useState<RuntimeSet[] | null>(null);
    // 現在URLデータを表示中かどうか
    const [isShowingUrlData, setIsShowingUrlData] = useState(false);
    const [loadedFromUrl, setLoadedFromUrl] = useState(false);
    const loadedRef = useRef(false);

    // URLからの読み込みを優先、次いで localStorage
    // ※ StrictMode対策: replaceStateでURLパラメータを消すため、2回目の実行でURLデータが失われる問題を防ぐ
    useEffect(() => {
        if (loadedRef.current) return;
        loadedRef.current = true;

        const loadFromUrl = async () => {
            const urlParams = new URLSearchParams(window.location.search);
            const urlData = urlParams.get('d');
            if (!urlData) return false;

            try {
                const bytes = fromBase64Url(urlData);
                // 圧縮データを解凍し、失敗時は旧形式（非圧縮JSON）にフォールバック
                let jsonStr: string;
                try {
                    jsonStr = await decompressData(bytes);
                } catch {
                    jsonStr = new TextDecoder().decode(bytes);
                }
                const parsed = JSON.parse(jsonStr);
                const urlData_ = deserializeSets(parsed);
                // URLデータを表示用にセットし、別途urlSetsに保持
                setSets(urlData_);
                setUrlSets(urlData_);
                setIsShowingUrlData(true);
                window.history.replaceState({}, '', window.location.pathname);
                return true;
            } catch (e) {
                console.error('Failed to parse URL data:', e);
                return false;
            }
        };

        const loadFromStorage = () => {
            const storedSets = loadSetsFromStorage();
            if (storedSets.length > 0) {
                setSets(storedSets);
            } else {
                setSets([createInitialSet()]);
            }
        };

        loadFromUrl().then((loaded) => {
            if (loaded) {
                setLoadedFromUrl(true);
            } else {
                loadFromStorage();
            }
        });
    }, []);

    // 保存: URLデータ表示中はlocalStorageに保存しない
    useEffect(() => {
        if (sets.length > 0 && !isShowingUrlData) {
            localStorage.setItem(STORAGE_KEY, JSON.stringify(serializeSets(sets)));
        }
    }, [sets, isShowingUrlData]);

    const clearStorage = () => {
        localStorage.removeItem(STORAGE_KEY);
    };

    const getShareUrl = async (): Promise<string> => {
        const json = JSON.stringify(serializeSets(sets));
        const compressed = await compressData(json);
        const encoded = toBase64Url(compressed);

        const url = new URL(window.location.href);
        url.searchParams.set('d', encoded);
        return url.toString();
    };

    /** 自分のデータ（localStorage）に戻す */
    const restoreOwnData = useCallback(() => {
        const storedSets = loadSetsFromStorage();
        if (storedSets.length > 0) {
            setSets(storedSets);
        } else {
            setSets([createInitialSet()]);
        }
        setUrlSets(null);
        setIsShowingUrlData(false);
    }, []);

    /** URLデータで自分のデータを上書きする */
    const overwriteWithUrlData = useCallback(() => {
        if (urlSets) {
            setSets(urlSets);
            // 上書き後はlocalStorageに保存されるようにフラグを解除
            setIsShowingUrlData(false);
            setUrlSets(null);
        }
    }, [urlSets]);

    return {
        sets, setSets,
        clearStorage, getShareUrl,
        loadedFromUrl, isShowingUrlData,
        restoreOwnData, overwriteWithUrlData,
    };
}
