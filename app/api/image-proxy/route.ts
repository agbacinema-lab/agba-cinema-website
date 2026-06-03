import { NextResponse } from 'next/server'

const ALLOWED_HOSTS = new Set(['drive.google.com', 'lh3.googleusercontent.com', 'docs.google.com'])

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url)
    const url = searchParams.get('url')

    if (!url) {
      return NextResponse.json({ error: 'Missing url parameter' }, { status: 400 })
    }

    let parsed
    try {
      parsed = new URL(url)
    } catch (err) {
      return NextResponse.json({ error: 'Invalid url' }, { status: 400 })
    }

    if (!ALLOWED_HOSTS.has(parsed.hostname)) {
      return NextResponse.json({ error: 'Host not allowed' }, { status: 403 })
    }

    const upstream = await fetch(url)
    if (!upstream.ok) {
      return NextResponse.json({ error: 'Upstream fetch failed' }, { status: upstream.status })
    }

    const contentType = upstream.headers.get('content-type') || 'application/octet-stream'
    const arrayBuffer = await upstream.arrayBuffer()

    const headers = new Headers()
    headers.set('Content-Type', contentType)
    // Cache images for a day in browsers and longer in CDNs
    headers.set('Cache-Control', 'public, max-age=86400, s-maxage=2592000, stale-while-revalidate=604800')

    return new Response(arrayBuffer, { headers })
  } catch (err) {
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

export const runtime = 'edge'
