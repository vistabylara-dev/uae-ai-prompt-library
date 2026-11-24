import { readFile, writeFile, rename, rm } from "node:fs/promises"

const [path] = process.argv.slice(2)
if (!path) throw new Error("Usage: node scripts/import-uae-prompt-translation-queue.mjs reviewed-batch.jsonl")

const catalog = new URL("../public/uae-prompt-catalog/", import.meta.url)
const registryPath = new URL("../data/uae-prompt-arabic.json", import.meta.url)
const registry = JSON.parse(await readFile(registryPath, "utf8"))
const index = JSON.parse(await readFile(new URL("index.json", catalog), "utf8"))
const ids = new Set(index.map(({ id }) => id))
const lines = (await readFile(path, "utf8")).split(/\r?\n/u).filter((line) => line.trim())
if (!lines.length) throw new Error("The batch is empty")
const imported = new Set()

for (const [number, line] of lines.entries()) {
  const { id, reviewedArabic } = JSON.parse(line)
  if (!ids.has(id)) throw new Error(`Unknown source ID on line ${number + 1}`)
  if (imported.has(id)) throw new Error(`Repeated source ID on line ${number + 1}`)
  if (Object.hasOwn(registry, id)) throw new Error(`A reviewed translation already exists for ${id}`)
  const { title, prompt, reviewer } = reviewedArabic ?? {}
  if (typeof title !== "string" || typeof prompt !== "string" || typeof reviewer !== "string" || !/\p{Script=Arabic}/u.test(title) || !/\p{Script=Arabic}/u.test(prompt) || !reviewer.trim()) {
    throw new Error(`Line ${number + 1} requires Arabic title, Arabic prompt and named reviewer`)
  }
  registry[id] = { title: title.trim(), prompt, reviewer: reviewer.trim() }
  imported.add(id)
}

const temporary = new URL(`${registryPath.href}.${process.pid}.tmp`)
try {
  await writeFile(temporary, JSON.stringify(registry, null, 2) + "\n", { flag: "wx" })
  await rename(temporary, registryPath)
} finally {
  await rm(temporary, { force: true })
}
console.log(`Imported ${imported.size} reviewed Arabic prompts`)
