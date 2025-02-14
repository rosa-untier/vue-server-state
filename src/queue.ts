type QueueFn<TContext> = (ctx: TContext) => Promise<TContext>;

/**
 * A context aware queue, which enables queuing dependant asynchronous functions.
 * @constructor creates a new Queue with an inital context
 */
export class Queue<Context> {
  #context: Context;
  #items: QueueFn<Context>[] = [];
  #processing: boolean = false;

  /**
   * @param initialContext - the initial context of the queue
   */
  constructor(initialContext: Context) {
    this.#context = initialContext;
  }

  /**
   * @returns the value of the current context
   */
  get context(): Context {
    return this.#context;
  }

  /**
   * @returns the items currently in queue
   */
  get items(): QueueFn<Context>[] {
    return this.#items;
  }

  /**
   * @param fn - the funciton to queue
   * @returns a promise mimicking the original functions return value
   */
  add(fn: QueueFn<Context>): Promise<Context> {
    const p = Promise.withResolvers<Context>();
    this.#items.push(async (ctx: Context) => {
      try {
        const newContext = await fn(ctx);
        p.resolve(newContext);

        return newContext;
      } catch (e: unknown) {
        p.reject(e);
        return ctx;
      }
    });
    this.#processQueue();
    return p.promise;
  }

  async #processQueue() {
    if (this.#processing) return;
    const next = this.#items.shift();

    if (!next) {
      this.#processing = false;
      return;
    }
    this.#processing = true;
    this.#context = await next(this.#context);
    this.#processing = false;
    this.#processQueue();
  }
}
