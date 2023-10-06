export const exhaustiveCheck = (_: never): never => {
  throw new Error('Exhaustive type check failed.');
};

export function asyncGenToAsync<
  T extends (...args: P) => AsyncGenerator<R>,
  P extends any[] = Parameters<T>,
  R = ReturnType<T> extends AsyncGenerator<infer R> ? R : never,
>(f: T) {
  return async (...args: P) => {
    const wg: R[] = [];
    for await (const result of f(...args)) {
      wg.push(result);
    }
    return await Promise.all(wg);
  };
}
