export function TerminalDemo() {
  return (
    <figure className="mt-20 overflow-hidden rounded-xl border border-border bg-[#0d1117] shadow-2xl max-w-4xl mx-auto">
      <header className="flex items-center justify-between border-b border-border bg-card px-4 py-3">
        <span className="flex gap-2">
          <span className="size-3 rounded-full bg-red-500/50" />
          <span className="size-3 rounded-full bg-yellow-500/50" />
          <span className="size-3 rounded-full bg-green-500/50" />
        </span>
        <figcaption className="text-xs font-mono text-gray-500 uppercase tracking-widest">
          lynx-v2.0.4-scan.sh
        </figcaption>
        <span className="size-4" />
      </header>
      <pre className="p-6 font-mono text-sm leading-6">
        <code className="flex gap-4">
          <span className="text-primary">$</span>
          <span className="text-white">lynx scan --dir ./src/auth</span>
        </code>
        <p className="text-gray-400 mt-2">
          Connecting to repository context... DONE
        </p>
        <p className="text-gray-400">
          Loading AI reasoning model (v4.2)... DONE
        </p>
        <p className="text-success mt-4">
          ✔ Static Analysis: 142 files scanned. 0 critical errors.
        </p>
        <p className="text-warning">
          ⚠ AI Suggestion: Potential race condition detected in
          auth_provider.ts (line 42).
        </p>
        <p className="text-primary mt-2">→ Analyzing logic flow...</p>
        <p className="text-white mt-2">
          [INFO] Lynx suggests adding a mutex lock to prevent concurrent state
          updates.
        </p>
        <code className="mt-4 flex gap-4">
          <span className="text-primary">$</span>
          <span className="animate-pulse">_</span>
        </code>
      </pre>
    </figure>
  );
}
