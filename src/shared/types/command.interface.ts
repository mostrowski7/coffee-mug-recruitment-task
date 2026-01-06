export interface BaseCommand<I, O> {
  execute(input: I): Promise<O>;
}
