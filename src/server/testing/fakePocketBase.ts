// Minimal PocketBase stand-in for background-job and snapshot tests. Supports
// the filters those modules build: `field = {:x}` / `field >= {:x}` / `!= null`
// clauses joined with && and ||, and `anomaly = 5` literals.
import type PocketBase from "pocketbase";

type Row = Record<string, any>;

function matches(row: Row, filter: string | undefined): boolean {
  if (!filter) return true;
  return filter.split("||").some((alt) =>
    alt.split("&&").every((raw) => {
      const clause = raw.replace(/[()]/g, "").trim();
      const m = clause.match(/^(\w+)\s*(>=|!=|=|>)\s*(.+)$/);
      if (!m) return true;
      const [, field, op, rawValue] = m;
      const value = rawValue === "null" ? null : rawValue.replace(/^"|"$/g, "");
      const actual = row[field];
      if (op === "!=") return value === null ? actual != null && actual !== "" : String(actual) !== value;
      if (op === "=") return String(actual) === value;
      if (op === ">=") return String(actual) >= String(value);
      return Number(actual) > Number(value);
    }),
  );
}

export function fakePocketBase(data: Record<string, Row[]>, options: { failOn?: string[] } = {}) {
  const calls: string[] = [];
  const deleted: Array<[string, string]> = [];
  const pb = {
    filter(expr: string, params: Record<string, unknown>) {
      return expr.replace(/\{:(\w+)\}/g, (_, key) => JSON.stringify(params[key]));
    },
    collection(name: string) {
      const rows = () => {
        calls.push(name);
        if (options.failOn?.includes(name)) throw new Error(`${name} unavailable`);
        return data[name] ?? [];
      };
      const sorted = (list: Row[], sort?: string) => {
        if (!sort) return list;
        const [key, dir] = sort.split(",")[0].startsWith("-") ? [sort.split(",")[0].slice(1), -1] : [sort.split(",")[0].replace(/^\+/, ""), 1];
        return [...list].sort((a, b) => (a[key] > b[key] ? dir : a[key] < b[key] ? -dir : 0));
      };
      return {
        async getList(page: number, perPage: number, opts: { filter?: string; sort?: string } = {}) {
          const all = sorted(rows().filter((r) => matches(r, opts.filter)), opts.sort);
          return {
            page,
            perPage,
            totalItems: all.length,
            totalPages: Math.max(1, Math.ceil(all.length / perPage)),
            items: all.slice((page - 1) * perPage, page * perPage),
          };
        },
        async getFullList(opts: { filter?: string; sort?: string } = {}) {
          return sorted(rows().filter((r) => matches(r, opts.filter)), opts.sort);
        },
        async getFirstListItem(filter: string) {
          const found = rows().find((r) => matches(r, filter));
          if (!found) throw new Error("not found");
          return found;
        },
        async delete(id: string) {
          deleted.push([name, id]);
          data[name] = (data[name] ?? []).filter((r) => r.id !== id);
          return true;
        },
      };
    },
  };
  return { pb: pb as unknown as PocketBase, calls, deleted };
}
