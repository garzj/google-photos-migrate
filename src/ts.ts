export const exhaustiveCheck = (_: never): never => {
  throw new Error('Exhaustive type check failed.');
};
