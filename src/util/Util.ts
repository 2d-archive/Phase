export default abstract class Util {
  static isPromise(value: any): boolean {
    return value
      && typeof value.then === 'function'
      && typeof value.catch === 'function';
  }
}