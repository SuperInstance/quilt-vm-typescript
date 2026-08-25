/**
 * test_quilt_vm.ts — Tests for the 5-opcode Quilt VM in TypeScript.
 */

import { QuiltVM } from "../src/quilt_vm";

let passed = 0;
let failed = 0;

function test(name: string, fn: () => void): void {
  try {
    fn();
    console.log(`  PASS ${name}`);
    passed++;
  } catch (e) {
    console.log(`  FAIL ${name}: ${(e as Error).message}`);
    failed++;
  }
}

test("bind_and_view", () => {
  const vm = new QuiltVM();
  vm.bind("bathy:0", 4.2);
  const v = vm.view<number>("bathy:0", "anyone");
  if (v !== 4.2) throw new Error(`expected 4.2, got ${v}`);
});

test("link", () => {
  const vm = new QuiltVM();
  vm.bind("a", null);
  vm.bind("b", null);
  vm.link("a", "b", "depends_on");
  const ta = vm.things.get("a")!;
  if (!ta.links.get("depends_on")?.has("b")) throw new Error("a should link to b");
  const tb = vm.things.get("b")!;
  if (!tb.links.get("!depends_on")?.has("a")) throw new Error("b should reverse-link to a");
});

test("effect_and_tick", () => {
  const vm = new QuiltVM();
  let x = 0;
  vm.bind("counter", 0);
  vm.effect(
    "counter",
    (t) => { t.value = (t.value as number) + 1; },
    (t) => { t.value = (t.value as number) - 1; }
  );
  vm.tick(0);
  if (x !== 0) throw new Error("expected 0 before tick (effect runs in tick)");
  // After tick, the effect should have been processed
  if (vm.view<number>("counter", "any") !== 1) throw new Error("expected 1 after tick");
});

test("dispose_runs_inverses", () => {
  const vm = new QuiltVM();
  vm.bind("counter", 0);
  vm.effect(
    "counter",
    (t) => { t.value = (t.value as number) + 1; },
    (t) => { t.value = (t.value as number) - 1; }
  );
  vm.tick(0);
  if (vm.view<number>("counter", "any") !== 1) throw new Error("expected 1 after tick");
  vm.dispose("counter");
  if (vm.view("counter", "any") !== null) throw new Error("expected null after dispose");
});

test("subscribe_and_tick", () => {
  const vm = new QuiltVM();
  let count = 0;
  vm.subscribe(() => count++);
  vm.tick(1.0);
  if (count !== 1) throw new Error(`expected 1, got ${count}`);
  if (vm.time !== 1.0) throw new Error(`expected time 1.0, got ${vm.time}`);
});

test("full_polyformalism", () => {
  const vm = new QuiltVM();
  // 1. Quilt cell
  vm.bind("bathy:0", 4.2);
  vm.link("bathy:0", "tide:current", "depends_on");
  // 2. Cordis plugin
  vm.bind("logger:0", "hello");
  vm.bind("config:main", "json");
  vm.link("logger:0", "config:main", "coeffect:config");
  // 3. Spreadsheet
  vm.bind("A1", 10);
  vm.bind("A2", 20);
  vm.bind("B1", 0);
  vm.link("B1", "A1", "depends_on");
  vm.link("B1", "A2", "depends_on");
  // 4. MUD
  vm.bind("room:1", "Forbidden Chamber");
  // 5. TTRPG
  vm.bind("player:gandalf", { perception: 15 });
  // 6. Boat
  vm.bind("boat:0", "north");
  // 7. Cowboy's model
  vm.bind("model:PHI-4", 0.6);
  // 8. Bus
  vm.subscribe(() => {});
  // TICK
  vm.tick(1.0);
  if (vm.things.size < 8) throw new Error(`expected >= 8 things, got ${vm.things.size}`);
  if (vm.time !== 1.0) throw new Error(`expected time 1.0, got ${vm.time}`);
});

console.log(`\n${passed} passed, ${failed} failed, ${passed + failed} total`);
if (failed > 0) process.exit(1);
