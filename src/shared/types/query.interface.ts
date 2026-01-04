export interface BaseQuery<I, O> {
  execute(input?: I): Promise<O>;
}
