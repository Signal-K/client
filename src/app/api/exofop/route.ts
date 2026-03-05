import fs from 'fs/promises'
import path from 'path'
import { NextResponse } from 'next/server'

const EXOFOP_FILE_PATH = path.join(process.cwd(), 'citizen', 'archive', 'data', 'exofop.csv')

let cache: Record<string, { metallicity: string | null }> | null = null
let cacheMtimeMs = 0

function parseCSVLine(line: string) {
  const parts: string[] = []
  let cur = ''
  let inQuotes = false
  for (let i = 0; i < line.length; i++) {
    const ch = line[i]
    if (ch === '"') {
      inQuotes = !inQuotes
      continue
    }
    if (ch === ',' && !inQuotes) {
      parts.push(cur)
      cur = ''
    } else {
      cur += ch
    }
  }
  parts.push(cur)
  return parts
}

export async function GET(req: Request) {
  try {
    const url = new URL(req.url)
    const ticQuery = url.searchParams.get('tic')

    let map = cache
    const stat = await fs.stat(EXOFOP_FILE_PATH).catch(() => null)
    if (!stat) {
      if (ticQuery) {
        return NextResponse.json({ tic: ticQuery, result: null, available: false })
      }
      return NextResponse.json({ count: 0, available: false })
    }

    if (!map || stat.mtimeMs !== cacheMtimeMs) {
      const raw = await fs.readFile(EXOFOP_FILE_PATH, 'utf8')
      const lines = raw.split(/\r?\n/).filter((l) => l && l.trim().length > 0)

      const headerIndex = lines.findIndex((l) => l.toUpperCase().includes('"TICID"'))
      if (headerIndex === -1) {
        return NextResponse.json({ error: 'ExoFOP header not found' }, { status: 500 })
      }

      const headerCols = parseCSVLine(lines[headerIndex]).map((c) => c.trim())
      const ticIdx = headerCols.findIndex((c) => c.toUpperCase().includes('TICID'))
      const metalIdx = headerCols.findIndex((c) => c.toUpperCase().includes('STELLAR METALLICITY'))

      if (ticIdx === -1) {
        return NextResponse.json({ error: 'TICID column not found' }, { status: 500 })
      }

      map = {}
      for (let i = headerIndex + 1; i < lines.length; i++) {
        const line = lines[i]
        if (!line) continue
        const parts = parseCSVLine(line)
        const tic = parts[ticIdx]
        if (!tic) continue
        const metal = metalIdx !== -1 ? (parts[metalIdx] || '') : ''
        map[tic.replace(/\"/g, '').trim()] = { metallicity: metal ? metal.trim() : null }
      }

      cache = map
      cacheMtimeMs = stat.mtimeMs
    }

    if (ticQuery) {
      const found = map[String(ticQuery)] || null
      return NextResponse.json({ tic: ticQuery, result: found, available: true })
    }

    // otherwise return a small summary
    return NextResponse.json({ count: Object.keys(map).length, available: true })
  } catch (err: any) {
    return NextResponse.json({ error: String(err?.message || err) }, { status: 500 })
  }
}
