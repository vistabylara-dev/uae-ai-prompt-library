import { createHash } from "node:crypto"
import { mkdir, readFile, writeFile } from "node:fs/promises"

const revision = "ae213a68143347d7322f0406e72ed233f6989e1c"
const checksum = "1d81cbd3473fdde9b1033e3192b88fb08dcefa70a91e500bd158ec41f4f7b13b"
const source = `https://raw.githubusercontent.com/f/prompts.chat/${revision}/prompts.csv`
const output = new URL("../public/uae-prompt-catalog/", import.meta.url)
const translations = JSON.parse(await readFile(new URL("../data/uae-prompt-arabic.json", import.meta.url), "utf8"))
const hash = (value) => createHash("sha256").update(value).digest("hex")

function parseCsv(csv) {
  const rows = []
  let fields = []
  let start = 0
  let quoted = false
  for (let index = 0; index < csv.length; index++) {
    const character = csv[index]
    if (character === '"') {
      if (quoted && csv[index + 1] === '"') index++
      else quoted = !quoted
    } else if (!quoted && (character === "," || character === "\n")) {
      const token = csv.slice(start, index).replace(/\r$/u, "")
      fields.push(token.startsWith('"') ? token.slice(1, -1).replaceAll('""', '"') : token)
      start = index + 1
      if (character === "\n") {
        rows.push(fields)
        fields = []
      }
    }
  }
  if (quoted || csv.slice(start).trim() || fields.length) throw new Error("Unexpected CSV ending")
  return rows
}

const response = process.env.VISTA_PROMPT_CATALOG_CSV ? null : await fetch(source, { signal: AbortSignal.timeout(45000) })
if (response && !response.ok) throw new Error(`Catalog returned HTTP ${response.status}`)
const bytes = response ? Buffer.from(await response.arrayBuffer()) : await readFile(process.env.VISTA_PROMPT_CATALOG_CSV)
if (hash(bytes) !== checksum) throw new Error("Unexpected prompts.chat snapshot checksum")
const csv = bytes.toString("utf8")
const [header, ...records] = parseCsv(csv.endsWith("\n") ? csv : csv + "\n")
if (header.join(",") !== "act,prompt,for_devs,type,contributor" || records.length !== 3173) throw new Error("Unexpected catalog format or record count")

const media = JSON.parse(await readFile(new URL("../data/uae-prompt-media.json", import.meta.url), "utf8"))
if (!Array.isArray(media) || media.length !== 143) throw new Error("Unexpected media prompt snapshot")
function excerpt(value) {
  const text = value.replace(/\s+/gu, " ").trim()
  return text.length > 180 ? text.slice(0, 179).trimEnd() + "…" : text
}

const index = []
const batches = new Map()
const identities = new Set()
const sourceRecords = [...records, ...media.map(([title, prompt, type, contributor, link]) => [title, prompt, "FALSE", type, contributor, link])]
for (const [position, [title, prompt, forDevs, type, contributor, ...extra]] of sourceRecords.entries()) {
  const mediaType = type === "VIDEO" || type === "AUDIO"
  const link = mediaType ? extra[0] : undefined
  if (mediaType && (extra.length !== 1 || typeof link !== "string" || !/^https:\/\/prompts\.chat\/prompts\/[a-z0-9_-]+$/iu.test(link))) throw new Error(`Invalid media source link at item ${position + 1}`)
  if (!title || !prompt || !contributor || (!mediaType && extra.length) || !["TRUE", "FALSE"].includes(forDevs) || !["TEXT", "STRUCTURED", "IMAGE", "VIDEO", "AUDIO"].includes(type)) {
    throw new Error(`Invalid prompt record at line item ${position + 1}`)
  }
  const id = hash(JSON.stringify([title, prompt, contributor, type]))
  const translation = translations[id]
  if (translation && (typeof translation.title !== "string" || typeof translation.prompt !== "string" || !/\p{Script=Arabic}/u.test(translation.title) || !/\p{Script=Arabic}/u.test(translation.prompt) || !translation.reviewer?.trim())) {
    throw new Error(`Arabic translation ${id} requires a title, prompt and named reviewer`)
  }
  identities.add(id)
  const batch = id.slice(0, 2)
  if (!batches.has(batch)) batches.set(batch, {})
  batches.get(batch)[id] = { prompt, ...(translation ? { ar: translation.prompt } : {}) }
  index.push({ id, title, type, contributor, excerpt: excerpt(prompt), ...(link ? { link } : {}), ...(translation ? { ar: translation.title, arExcerpt: excerpt(translation.prompt) } : {}) })
}
for (const id of Object.keys(translations)) {
  if (!identities.has(id)) throw new Error(`Translation does not match a source prompt: ${id}`)
}

await mkdir(output, { recursive: true })
await Promise.all([...batches].map(([name, details]) => writeFile(new URL(`${name}.json`, output), JSON.stringify(details))))
await writeFile(new URL("index.json", output), JSON.stringify(index))
console.log(`Prompt catalog: ${index.length} source records, ${Object.keys(translations).length} reviewed Arabic translations`)
