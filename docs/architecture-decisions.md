# Architecture Decisions

## ADR-001: Rollup WASM override for client build

**Context:** Vite's default Rollup dependency uses native platform binaries
(Rust/NAPI). These fail to load on 32-bit ARM Termux (Android) with a
`dlopen` ABI error — a known, unresolved upstream limitation, not specific
to this project. Native Rollup binaries are also unavailable entirely for
some platform/arch combinations.

**Decision:** `client/package.json` overrides `rollup` to resolve to
`@rollup/wasm-node` (Rollup's official WASM build) via npm's `overrides`
field. This is intentional and required for local development on Termux.

**Consequences:**
- Works identically on all platforms, including Render's x86_64 Linux
  build servers — WASM is cross-platform by design.
- Slightly slower build/dev-server startup than native Rollup. Acceptable
  trade-off at this project's scale.
- Do NOT remove this override without confirming Termux's native ARM
  binary support has been fixed upstream first.
