export abstract class MigrationError extends Error {
  public abstract toString(): string;
}
