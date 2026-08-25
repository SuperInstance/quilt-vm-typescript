/**
 * gold.ts — The gold demo in TypeScript.
 * Runs all 8 polyformalisms in 1 VM, hosted by 5 opcodes.
 */

import { QuiltVM } from "./quilt_vm";

function main(): void {
  console.log("======================================================================");
  console.log("  THE GOLD DEMO (TypeScript) — 5 opcodes, 8 polyformalisms, 1 cowboy");
  console.log("======================================================================");
  console.log("  BIND, LINK, EFFECT, VIEW, TICK");
  console.log();

  const start = Date.now();
  const vm = new QuiltVM();

  // 1. Quilt cell
  vm.bind("bathy:0", 4.2);
  vm.link("bathy:0", "tide:current", "depends_on");
  console.log(`[1] Quilt cell: bathy:0 = ${vm.view("bathy:0", "anyone")}`);

  // 2. Cordis plugin
  vm.bind("logger:0", "hello");
  vm.bind("config:main", "json");
  vm.link("logger:0", "config:main", "coeffect:config");
  console.log(`[2] Cordis plugin: logger:0 = ${vm.view("logger:0", "anyone")}`);

  // 3. Spreadsheet
  vm.bind("A1", 10);
  vm.bind("A2", 20);
  vm.bind("B1", 0);
  vm.link("B1", "A1", "depends_on");
  vm.link("B1", "A2", "depends_on");
  const a1 = vm.view<number>("A1", "any")!;
  const a2 = vm.view<number>("A2", "any")!;
  console.log(`[3] Spreadsheet: B1 = A1 + A2 = ${a1 + a2}`);

  // 4. MUD
  vm.bind("room:1", "Forbidden Chamber");
  vm.bind("user:1", "Aragorn");
  vm.link("user:1", "room:1", "in");
  console.log(`[4] MUD: room:1 = ${vm.view("room:1", "anyone")}`);

  // 5. TTRPG
  vm.bind("player:gandalf", { perception: 15 });
  const gandalf = vm.view<{ perception: number }>("player:gandalf", "anyone")!;
  console.log(`[5] TTRPG: Gandalf perception = ${gandalf.perception} (sees hidden orc)`);

  // 6. Bay boat
  vm.bind("boat:0", "north");
  vm.link("boat:0", "bay", "in");
  console.log(`[6] Bay: boat:0 = ${vm.view("boat:0", "anyone")}, course = north`);

  // 7. Cowboy's model
  vm.bind("model:PHI-4", 0.6);
  const wilson = vm.view<number>("model:PHI-4", "cowboy")!;
  console.log(`[7] Cowboy: PHI-4 wilson_lb = ${wilson} (earned keep)`);

  // 8. Bus
  let count = 0;
  vm.subscribe(() => count++);
  vm.tick(1.0);
  console.log(`[8] Bus: ${count} events captured`);

  const elapsed = Date.now() - start;
  console.log();
  console.log("======================================================================");
  console.log("  ALL 8 POLYFORMALISMS HOSTED IN ONE VM");
  console.log(`  Runtime: ${elapsed}ms`);
  console.log(`  Stats: ${JSON.stringify(vm.stats())}`);
  console.log("======================================================================");
  console.log();
  console.log("  The cowboy rides the VM.");
  console.log("  The 5 opcodes host everything.");
  console.log("  The composition is the value.");
}

main();
