interface Array<T> {
    FirstOrDefault(predicate?: (x: T) => boolean): T | null;
    LastOrDefault(predicate?: (x: T) => boolean): T | null;
    IsInRange(index: number | undefined): boolean;
}
Object.defineProperty(Array.prototype, "FirstOrDefault", {
  configurable: true,
  enumerable: false,
  writable: true,
  value(this: Array<any>, predicate?: (x: any) => boolean) {
    let me: Array<any> = this;

    if (predicate) {
      me = me.filter((x) => predicate(x));
    }
    return me.length > 0 ? me[0] : null;
  }
});
Object.defineProperty(Array.prototype, "LastOrDefault", {
  configurable: true,
  enumerable: false,
  writable: true,
  value(this: Array<any>, predicate?: (x: any) => boolean) {
    let me: Array<any> = this;

    if (predicate) {
      me = me.filter((x) => predicate(x));
    }
    return me.length > 0 ? me[me.length - 1] : null;
  }
});
Object.defineProperty(Array.prototype, "IsInRange", {
  configurable: true,
  enumerable: false,
  writable: true,
  value(this: Array<any>, index: number | undefined) {
    const me: Array<any> = this;

    if (index === undefined) {
      return false;
    }
    if (!Number.isInteger(index)) {
      return false;
    }
    return index >= 0 && index < me.length;
  }
});