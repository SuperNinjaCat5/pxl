export type PixelEvent = {
    x: number;
    y: number;
    color: string;
    placed_by: string;
};

const subscribers: Array<(e: PixelEvent) => void> = [];

export function subscribe(fn: (e: PixelEvent) => void) {
  subscribers.push(fn);

  return () => {
    const idx = subscribers.indexOf(fn);
    if (idx !== -1) subscribers.splice(idx, 1);
  }
}

export function broadcast(msg: PixelEvent) {
    for (const fn of subscribers) {
        fn(msg);
    }
}