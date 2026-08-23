export interface LlmProvider<TModel = unknown> {
  readonly id: string;
  createModel(): TModel;
}
