// CSS サイズ変換ユーティリティ
// ※ ブラウザAPI (document, getComputedStyle等) に依存しない純粋関数のみ定義
//    → Linaria の css テンプレート内で ${Size(px)} のように使用可能

// px値からremに変換
const PixelToRem = (px: number): number => {
    return parseFloat((px / 16).toFixed(3));
};

/**
 * px値からremに変換してrem指定文字列として返却
 *
 * NOTE:
 *  CSS (Emotion/Linaria) 上で長さを指定するときはこの関数を使い、px などの絶対単位は使用しないでください。
 *  可変サイズ指定したい場合にはVariableSize()関数の使用もできます。
 *
 * @example
 *  // Linaria css テンプレート内で使用可能
 *  const style = css`
 *    font-size: ${Size(14)};
 *    padding: ${Size(8)} ${Size(16)};
 *  `;
 *
 * @param px px値
 * @returns rem指定文字列
 */
export const Size = (px: number): string => {
    return `${PixelToRem(px)}rem`;
};

/**
 * ピクセル指定した可変サイズのrem
 * @param minPx 最小px値
 * @param maxPx 最大px値
 * @param minWidth 最小画面幅px
 * @param maxWidth 最大画面幅px
 * @returns rem指定文字列
 */
export const VariableSize = (minPx: number, maxPx: number, minWidth: number, maxWidth: number): string => {
    const min = Size(minPx);
    const max = Size(maxPx);
    return `clamp(${min}, calc(${min} + ${maxPx - minPx} * ((100vw - ${Size(minWidth)}) / ${maxWidth - minWidth})), ${max})`;
};
