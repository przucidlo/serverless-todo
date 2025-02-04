export type Event<E extends string, P> = { event: E; payload: P };

export interface EventPublisher {
  publish: <E extends Event<string, unknown>>(
    topic: E['event'],
    payload: E['payload'],
  ) => Promise<void>;
}
