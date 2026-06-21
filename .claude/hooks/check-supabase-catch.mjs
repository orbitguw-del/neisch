#!/usr/bin/env node
// PreToolUse(Edit|Write) guard for the Supabase query-builder `.catch()` trap.
//
// The Postgrest builder (supabase.from(...).select()... .maybeSingle(), .rpc(),
// etc.) is THENABLE but NOT a full Promise — chaining `.catch()` directly on it
// throws "...catch is not a function" at runtime. This shipped to prod once and
// blocked every new sign-up on storeyinfra.com. See CLAUDE.md.
//
// This is a NON-BLOCKING warning: it surfaces the risk via systemMessage +
// additionalContext so the edit can be self-corrected, but never hard-blocks
// (the detector is a heuristic and we don't want to wedge a legit edit).
//
// `.catch()` IS safe on fetch(), req.json(), and admin.auth.admin.* — those are
// real Promises. The script tries to exclude those.

let raw = "";
process.stdin.setEncoding("utf8");
process.stdin.on("data", (c) => (raw += c));
process.stdin.on("end", () => {
  let ok = () => process.exit(0); // silent pass
  let data;
  try {
    data = JSON.parse(raw);
  } catch {
    return ok();
  }

  const fp = data?.tool_input?.file_path || "";
  // Only inspect JS/TS source in app or edge functions.
  if (!/\.(js|jsx|ts|tsx|mjs|cjs)$/.test(fp)) return ok();
  const norm = fp.replace(/\\/g, "/");
  if (!/\/src\/|\/supabase\/functions\//.test(norm)) return ok();

  // Content the edit introduces: Edit -> new_string, Write -> content.
  const content = data?.tool_input?.new_string ?? data?.tool_input?.content ?? "";
  if (!content.includes(".catch")) return ok();

  // Find each `.catch(` and look back within the same statement for a postgrest
  // builder signature, while excluding real-Promise sources.
  const builder = /\.(from|rpc|maybeSingle|single|select|insert|update|upsert|delete)\s*\(/;
  const safeSrc = /\b(fetch|req\.json|res\.json|\.admin\.|Promise\.all|Promise\.race|Promise\.resolve)\b/;

  const hits = [];
  const re = /\.catch\s*\(/g;
  let m;
  while ((m = re.exec(content)) !== null) {
    // Window = current statement: back to the previous `;`, `{`, `}` or newline-with-`;`.
    const start = Math.max(
      content.lastIndexOf(";", m.index),
      content.lastIndexOf("{", m.index),
      content.lastIndexOf("}", m.index)
    );
    const stmt = content.slice(start + 1, m.index);
    if (builder.test(stmt) && !safeSrc.test(stmt)) {
      const line = content.slice(0, m.index).split("\n").length;
      hits.push(line);
    }
  }

  if (hits.length === 0) return ok();

  const where = hits.length === 1 ? `line ${hits[0]}` : `lines ${hits.join(", ")}`;
  const msg =
    `⚠ Supabase .catch() trap: ${norm.split("/").pop()} chains .catch() on what looks ` +
    `like a Postgrest query builder (${where}). The builder is thenable but NOT a full ` +
    `Promise — .catch() throws at runtime and has broken prod before. Use try/catch around ` +
    `await, or .then(ok, err), or wrap in Promise.all([...]).catch(). (.catch IS fine on ` +
    `fetch()/req.json()/admin.auth.* — those are real Promises.)`;

  process.stdout.write(
    JSON.stringify({
      systemMessage: msg,
      hookSpecificOutput: {
        hookEventName: "PreToolUse",
        additionalContext: msg,
      },
    })
  );
  process.exit(0);
});
