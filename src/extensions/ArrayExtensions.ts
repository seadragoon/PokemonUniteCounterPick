export { };

declare global {
  interface Array<T> {
    FirstOrDefault(predicate?: (x: T) => boolean): T | null;
    LastOrDefault(predicate?: (x: T) => boolean): T | null;
    IsInRange(index: number | undefined): boolean;
  }
}
Object.defineProperty(Array.prototype, "FirstOrDefault", {
  configurable: true,
  enumerable: false,
  writable: true,
  value<T>(this: Array<T>, predicate?: (x: T) => boolean) {
    const filtered = predicate ? this.filter((x) => predicate(x)) : this;
    return filtered.length > 0 ? filtered[0] : null;
  }
});
Object.defineProperty(Array.prototype, "LastOrDefault", {
  configurable: true,
  enumerable: false,
  writable: true,
  value<T>(this: Array<T>, predicate?: (x: T) => boolean) {
    const filtered = predicate ? this.filter((x) => predicate(x)) : this;
    return filtered.length > 0 ? filtered[filtered.length - 1] : null;
  }
});
Object.defineProperty(Array.prototype, "IsInRange", {
  configurable: true,
  enumerable: false,
  writable: true,
  value<T>(this: Array<T>, index: number | undefined) {
    if (index === undefined) {
      return false;
    }
    if (!Number.isInteger(index)) {
      return false;
    }
    return index >= 0 && index < this.length;
  }
});