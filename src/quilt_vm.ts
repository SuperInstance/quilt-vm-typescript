/**
 * quilt-vm — The 5-opcode Quilt VM in TypeScript.
 *
 * Cordis-native. The TypeScript port of the foundation layer.
 *
 * A runtime is a function from context to value with an inverse,
 * advanced by a clock that processes async I/O while projecting
 * a sync view.
 */

export type EffectFn = (target: Thing) => void;
export type ViewFn = (target: Thing, viewer: string) => unknown;
export type SubscriberFn = (event: Event) => void;
export type ScheduledFn = (vm: QuiltVM) => void;

export interface EffectRecord {
  target: string;
  forward: EffectFn;
  inverse: EffectFn;
  arg?: unknown;
}

export interface Thing {
  name: string;
  value: unknown;
  links: Map<string, Set<string>>;
  effects: EffectRecord[];
}

export interface Event {
  ts: number;
  kind: string;
  target: string;
  oldValue?: unknown;
  newValue?: unknown;
}

export interface ScheduledRecord {
  key: string;
  fn: ScheduledFn;
  at: number;
}

export class QuiltVM {
  things: Map<string, Thing> = new Map();
  time: number = 0.0;
  pendingEffects: EffectRecord[] = [];
  eventLog: Event[] = [];
  subscribers: SubscriberFn[] = [];
  scheduled: Map<string, ScheduledRecord> = new Map();

  /**
   * Opcode 1: BIND — make a thing.
   */
  bind<T = unknown>(name: string, value: T): Thing {
    const t: Thing = {
      name,
      value,
      links: new Map(),
      effects: [],
    };
    this.things.set(name, t);
    return t;
  }

  /**
   * Opcode 2: LINK — connect a to b with a relation of type.
   */
  link(a: string, b: string, type: string = "default"): void {
    // Ensure both exist
    if (!this.things.has(a)) this.bind(a, null);
    if (!this.things.has(b)) this.bind(b, null);
    const ta = this.things.get(a)!;
    const tb = this.things.get(b)!;
    if (!ta.links.has(type)) ta.links.set(type, new Set());
    ta.links.get(type)!.add(b);
    // Reverse link
    const reverseType = `!${type}`;
    if (!tb.links.has(reverseType)) tb.links.set(reverseType, new Set());
    tb.links.get(reverseType)!.add(a);
  }

  /**
   * Opcode 3: EFFECT — run fn on target, keep inv to undo.
   */
  effect(
    target: string,
    forward: EffectFn,
    inverse: EffectFn,
    arg?: unknown
  ): void {
    const t = this.things.get(target);
    if (!t) throw new Error(`target not found: ${target}`);
    const record: EffectRecord = { target, forward, inverse, arg };
    this.pendingEffects.push(record);
    t.effects.push(record);
  }

  /**
   * Opcode 4: VIEW — project target's value for viewer.
   */
  view<T = unknown>(target: string, viewer: string): T | undefined {
    const t = this.things.get(target);
    return t ? (t.value as T) : undefined;
  }

  /**
   * Opcode 5: TICK — advance time, process pending I/O.
   */
  tick(dt: number = 1.0): void {
    this.time += dt;
    // Process pending effects
    const effects = this.pendingEffects.slice();
    this.pendingEffects = [];
    for (const e of effects) {
      const t = this.things.get(e.target);
      if (t && e.forward) {
        try {
          e.forward(t);
        } catch (err) {
          console.error(`effect error on ${e.target}:`, err);
        }
      }
      this.eventLog.push({
        ts: this.time,
        kind: "effect.applied",
        target: e.target,
      });
    }
    // Fire scheduled perception checks
    const now = this.time;
    const due: string[] = [];
    for (const [key, s] of this.scheduled) {
      if (s.at <= now) due.push(key);
    }
    for (const key of due) {
      const s = this.scheduled.get(key);
      if (s) {
        this.scheduled.delete(key);
        try {
          s.fn(this);
        } catch (err) {
          console.error(`scheduled error on ${key}:`, err);
        }
      }
    }
    // Notify subscribers
    const tickEvent: Event = { ts: this.time, kind: "tick", target: "" };
    for (const sub of this.subscribers) {
      try {
        sub(tickEvent);
      } catch (err) {
        console.error("subscriber error:", err);
      }
    }
  }

  /**
   * Dispose: run all effects in REVERSE order (LIFO).
   */
  dispose(target: string): void {
    const t = this.things.get(target);
    if (!t) return;
    for (let i = t.effects.length - 1; i >= 0; i--) {
      const e = t.effects[i];
      try {
        e.inverse(t);
      } catch (err) {
        console.error(`inverse error on ${target}:`, err);
      }
    }
    t.effects = [];
    t.value = null;
  }

  /**
   * Schedule a perception check at time `at`.
   */
  schedule(key: string, fn: ScheduledFn, at: number): void {
    this.scheduled.set(key, { key, fn, at });
  }

  /**
   * Subscribe to events (the bus).
   */
  subscribe(fn: SubscriberFn): void {
    this.subscribers.push(fn);
  }

  /**
   * Get stats about the VM.
   */
  stats(): Record<string, unknown> {
    return {
      n_things: this.things.size,
      time: this.time,
      n_pending: this.pendingEffects.length,
      n_events: this.eventLog.length,
      n_scheduled: this.scheduled.size,
      n_subscribers: this.subscribers.length,
    };
  }
}

// Helper: forward/inverse that just sets/restores a value
export function setterEffect(value: unknown): { forward: EffectFn; inverse: EffectFn } {
  return {
    forward: (t) => { t.value = value; },
    inverse: (t) => { t.value = null; },
  };
}
