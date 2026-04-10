/**
 * Shared action state type for all Server Actions.
 * Replaces duplicate definitions across action files.
 */
export type ActionState<T = { success: boolean; [key: string]: unknown }> = {
  error?: string;
  fieldErrors?: Record<string, string[]>;
  data?: T;
};
