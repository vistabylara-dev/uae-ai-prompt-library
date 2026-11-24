import { readFile } from "node:fs/promises"

const [size = "50"] = process.argv.slice(2)
const limit = Number(size)
if (!Number.isSafeInteger(limit) || limit < 1 || limit > 500) {
  throw new Error("Usage: node scripts/export-uae-prompt-translation-queue.mjs [1–500]")
}

const root = new URL("../public/uae-prompt-catalog/", import.meta.url)
const index = JSON.parse(await readFile(new URL("index.json", root), "utf8"))
const selected = [...new Map(index.filter((entry) => !entry.ar).map((entry) => [entry.id, entry])).values()].slice(0, limit)
const shards = new Map()

for (const { id, title, type, contributor, link } of selected) {
  const prefix = id.slice(0, 2)
  if (!shards.has(prefix)) {
    shards.set(prefix, JSON.parse(await readFile(new URL(`${prefix}.json`, root), "utf8")))
  }
  const { prompt } = shards.get(prefix)[id]
  process.stdout.write(JSON.stringify({
    id, type, contributor,
    source: { title, prompt, ...(link ? { link } : {}) },
    reviewedArabic: { title: "", prompt: "", reviewer: "" },
  }) + "\n")
}
