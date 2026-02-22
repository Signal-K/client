import fs from 'fs/promises'
import path from 'path'
import { NextResponse } from 'next/server'

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

    const filePath = path.join(process.cwd(), 'citizen', 'archive', 'data', 'exofop.csv')
    const raw = await fs.readFile(filePath, 'utf8')

    const lines = raw.split(/\r?\n/)
      // remove empty leading lines
      .filter((l) => l && l.trim().length > 0)

    // find header line with TICID
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

    // Build a small map of TIC -> metallicity
    const map: Record<string, { metallicity: string | null }> = {}
    for (let i = headerIndex + 1; i < lines.length; i++) {
      const line = lines[i]
      if (!line) continue
      const parts = parseCSVLine(line)
      const tic = parts[ticIdx]
      if (!tic) continue
      const metal = metalIdx !== -1 ? (parts[metalIdx] || '') : ''
      map[tic.replace(/\"/g, '').trim()] = { metallicity: metal ? metal.trim() : null }
    }

    if (ticQuery) {
      const found = map[String(ticQuery)] || null
      return NextResponse.json({ tic: ticQuery, result: found })
    }

    // otherwise return a small summary
    return NextResponse.json({ count: Object.keys(map).length })
  } catch (err: any) {
    return NextResponse.json({ error: String(err?.message || err) }, { status: 500 })
  }
}
