import { NextResponse } from 'next/server';

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const url = searchParams.get('url');

  if (!url) {
    return new NextResponse('Missing url parameter', { status: 400 });
  }

  try {
    let fetchUrl = url;

    // ── Google Docs / Sheets / Slides ──────────────────────────────
    // These cannot be directly downloaded – they must be exported.
    // Pattern:  docs.google.com/document/d/{id}/...
    //           docs.google.com/spreadsheets/d/{id}/...
    //           docs.google.com/presentation/d/{id}/...
    const docsMatch = url.match(/docs\.google\.com\/(document|spreadsheets|presentation)\/d\/([a-zA-Z0-9_-]+)/);
    if (docsMatch) {
      const docType = docsMatch[1];
      const docId = docsMatch[2];
      fetchUrl = `https://docs.google.com/${docType}/d/${docId}/export?format=pdf`;
    } else {
      // ── Google Drive raw file ────────────────────────────────────
      // Pattern:  drive.google.com/file/d/{id}/...
      //           drive.google.com/open?id={id}
      //           drive.google.com/uc?id={id}
      const driveMatch = url.match(/\/d\/([a-zA-Z0-9_-]+)/) ?? url.match(/[?&]id=([a-zA-Z0-9_-]+)/);
      if (driveMatch) {
        fetchUrl = `https://drive.google.com/uc?export=download&id=${driveMatch[1]}`;
      }
    }

    const response = await fetch(fetchUrl, {
      // Realistic user-agent to avoid bot-detection rejections from Google
      headers: {
        'User-Agent': 'Mozilla/5.0 (compatible; AgbaCinemaProxy/1.0)',
      },
      redirect: 'follow',
    });

    if (!response.ok) {
      throw new Error(`Upstream fetch failed: ${response.status} ${response.statusText}`);
    }

    const headers = new Headers();
    headers.set('Content-Type', 'application/pdf');
    headers.set('Access-Control-Allow-Origin', '*');
    headers.set('Content-Disposition', 'inline; filename="document.pdf"');

    return new NextResponse(response.body, { status: 200, headers });

  } catch (error: any) {
    console.error('[proxy-file] Error:', error);
    return new NextResponse(`Error: ${error.message}`, { status: 500 });
  }
}
