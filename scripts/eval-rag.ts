import { readFile } from "node:fs/promises";
import { performance } from "node:perf_hooks";
import { retrieve } from "../lib/rag/retriever";
import { routeQuery } from "../lib/rag/router";

interface Topic {
  name: string;
  queries: string[];
  expectedAny?: string[];
  expectedEmpty?: boolean;
}

async function main() {
  const gold = JSON.parse(
    await readFile(new URL("../eval/gold.json", import.meta.url), "utf8"),
  ) as { topics: Topic[] };

  const cases = gold.topics.flatMap((topic) =>
    topic.queries.map((query) => ({ ...topic, query })),
  );
  const latencies: number[] = [];
  const failures: string[] = [];

  for (const item of cases) {
    const started = performance.now();
    const sources = await retrieve(item.query, {
      route: routeQuery(item.query),
      topK: 10,
    });
    latencies.push(performance.now() - started);
    const ids = new Set(sources.map((source) => source.id));
    const passed = item.expectedEmpty
      ? sources.length === 0
      : (item.expectedAny ?? []).some((id) => ids.has(id));
    if (!passed) {
      failures.push(
        `${item.name}: "${item.query}" -> [${[...ids].join(", ")}]`,
      );
    }
  }

  latencies.sort((a, b) => a - b);
  const percentile = (value: number) =>
    latencies[Math.min(latencies.length - 1, Math.ceil(latencies.length * value) - 1)] ?? 0;
  const recall = (cases.length - failures.length) / cases.length;

  console.log(JSON.stringify({
    cases: cases.length,
    recallAt10: Number(recall.toFixed(3)),
    latencyMs: {
      p50: Number(percentile(0.5).toFixed(1)),
      p95: Number(percentile(0.95).toFixed(1)),
      max: Number((latencies.at(-1) ?? 0).toFixed(1)),
    },
    failures,
  }, null, 2));

  if (recall < 0.9 || failures.length) process.exitCode = 1;
}

void main();
