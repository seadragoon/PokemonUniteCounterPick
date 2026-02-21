export default class AppUtility {
  /**
   * nullまたはundefindかどうか判定
   * @param obj 任意のオブジェクト
   * @returns 真偽値
   */
  public static isNullOrUndefined<T>(obj: T | undefined | null): obj is undefined | null {
    return obj === null || obj === undefined;
  }

  /**
   * objectかどうかを判定
   * @param obj 任意のオブジェクト
   * @returns 真偽値
   */
  public static isObject(obj: any): obj is object {
    return typeof (obj) === "object";
  }

  /**
   * functionかどうかを判定
   * @param obj 任意のオブジェクト
   * @returns 真偽値
   */
  public static isFunction(obj: any): obj is Function {
    return typeof (obj) === "function";
  }

  /**
   * stringかどうかを判定
   * @param obj 任意のオブジェクト
   * @returns 真偽値
   */
  public static isString(obj: any): obj is string {
    return typeof (obj) === "string";
  }

  /**
   * numberかどうかを判定
   * @param obj 任意のオブジェクト
   * @returns 真偽値
   */
  public static isNumber(obj: any): obj is number {
    return typeof (obj) === "number";
  }

  /**
   * string型の配列かどうかを判定
   * @param obj 任意のオブジェクト
   * @returns 真偽値
   */
  public static isStringArray(obj: any): obj is Array<string> {
    return Array.isArray(obj) && (obj as Array<string>).every((x) => typeof (x) === "string");
  }

  /**
   * 整数のランダム値を取得
   * @param max 最大値
   * @returns ランダム数値
   */
  public static getRandomInt(max: number): number {
    const maxInt = Math.round(max);
    if (maxInt <= 0) {
      return 0;
    }
    return Math.floor(Math.random() * maxInt);
  }

  /**
   * ゼロパティング
   * @param num 数値
   * @param length 長さ
   * @returns 文字列
   */
  public static getZeroPadding(num: number, length: number = 2): string {
    return num.toString().padStart(length, "0");
  }

  /**
   * stringが空白かどうか
   * @param text 文字列
   * @returns 真偽値
   */
  public static isEmpty(text: string | undefined | null): boolean {
    if (text === undefined || text === null) {
      return true;
    }
    return text === "";
  }

  /**
   * 一定時間待機する
   * @param ms ミリ秒
   * @returns Promise<void>
   */
  public static sleep(ms: number): Promise<void> {
    return new Promise<void>((resolve) => setTimeout(resolve, ms));
  }

  /**
   * 破棄可能なプロミスに変換
   * @param promise Promise<any>
   * @param signal AbortControllerのシグナル
   * @returns Promise<any>
   */
  public static abortable<T>(promise: Promise<T>, signal: AbortSignal): Promise<T> {
    return new Promise<T>((resolve, reject) => {
      const abort = (): void => {
        reject(new DOMException("aborted", "AbortError"));
      };
      signal.addEventListener("abort", abort, { once: true });
      promise.then(resolve, reject);
    });
  }

  /**
   * アドレス欄のハッシュ値を削除
   */
  public static removeLocationHash(): void {
    if (!AppUtility.isEmpty(window.location.hash)) {
      window.history.pushState({}, document.title, window.location.href.replace(window.location.hash, ""));
    }
  }

  /**
   * フォーマットを使用して文字列を取得する
   * ex)
   *  1番目の引数 -> {0} を置き換え
   *  2番目の引数 -> {1} を置き換え
   *
   * @param template テンプレート文字列
   * @param replacement 変換文字
   * @returns フォーマット後の文字列
   */
  public static getFormatText(template: string, ...replacement: Array<string>): string {
    // 配列時は置き換え
    if (typeof replacement[0] === "object") {
      replacement = replacement[0];
    }
    return template.replace(/\{(.+?)\}/g, (m, c) => {
      return (replacement[c] !== null) ? replacement[c] : m;
    });
  }
}