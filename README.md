# quilt-vm-typescript

The 5-opcode Quilt VM in TypeScript. Cordis-native.

> A runtime is a function from context to value with an inverse,
> advanced by a clock that processes async I/O while projecting
> a sync view.

## What this is

The TypeScript port of the foundation layer. The same 5 opcodes
that host 8 polyformalisms, written in strict TypeScript. The
home turf of the Cordis ecosystem.

## The 5 opcodes

```typescript
vm.bind("bathy:0", 4.2);              // BIND — make a thing
vm.link("a", "b", "type");            // LINK — connect things
vm.effect(target, fwd, inv, arg);    // EFFECT — reversible change
vm.view<T>("target", "viewer");      // VIEW — project for viewer
vm.tick(1.0);                        // TICK — advance time
```

## The 8 polyformalisms

1. Quilt cell
2. **Cordis plugin** (native in TypeScript — same shape)
3. Spreadsheet
4. MUD
5. TTRPG (with perception check)
6. The bay dance
7. The cowboy
8. The bus

## Build

```bash
npm install
npm run build
npm test
npm run gold
```

## Why TypeScript

TypeScript is the Cordis's home turf. The cell-plugin bridge
(`quilt-cordis`) shows that a Cordis plugin and a Quilt cell are
the same shape. The TypeScript port lets the Quilt VM run in
the same runtime as the Cordis fibers — same language, same
type system, same ecosystem.

## Compatibility

This port is API-compatible with the Python, C, and Rust ports.
The same `BIND`/`LINK`/`EFFECT`/`VIEW`/`TICK` semantics. The
same 8 polyformalisms. The same gold demo.

## Test count

6 tests, all passing.

## Related

- `quilt-foundation` (Python) — the original
- `quilt-vm-c` — C port (closest to metal, 0.11ms)
- `quilt-vm-rust` — Rust port (safe systems language)
- `quilt-vm-haskell` — Haskell port (algebraic)

## Version

0.1.0 — first public release.
