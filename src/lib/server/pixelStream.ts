export type PixelEvent = {
  x: number;
  y: number;
  color: string;
  placed_by: string;
};

const subscribers: Set<(e: PixelEvent) => void> = new Set();

export function subscribe(fn: (e: PixelEvent) => void) {
  subscribers.add(fn);

  return () => {
    subscribers.delete(fn);
  };
}

export function broadcast(msg: PixelEvent) {
  // iterate over a shallow copy so removals during iteration are safe
  for (const fn of Array.from(subscribers)) {
    try {
      fn(msg);
    } catch (err: any) {
      // If a subscriber throws because its stream/controller is closed,
      // remove it so future broadcasts won't call it again.
      console.warn(
        'subscriber threw during broadcast — removing subscriber',
        err && err.message ? err.message : err
      );
      try {
        subscribers.delete(fn);
      } catch (_) {}
    }
  }
}
