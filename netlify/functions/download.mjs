import { getStore } from '@netlify/blobs'

export default async (req) => {
  const url = new URL(req.url)
  const key = url.searchParams.get('file')

  if (!key) {
    return new Response('Missing file parameter', { status: 400 })
  }

  try {
    const store = getStore('uploads')
    const result = await store.getWithMetadata(key, { type: 'arrayBuffer' })

    if (!result) {
      return new Response('File not found', { status: 404 })
    }

    const filename = result.metadata?.filename || key

    return new Response(result.data, {
      headers: {
        'Content-Disposition': `attachment; filename="${filename}"`,
        'Content-Type': 'application/octet-stream',
      },
    })
  } catch (err) {
    console.error('Download error:', err)
    return new Response('Download failed', { status: 500 })
  }
}
