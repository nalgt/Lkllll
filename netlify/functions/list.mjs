import { getStore } from '@netlify/blobs'

export default async (req) => {
  try {
    const store = getStore('uploads')
    const { blobs } = await store.list()

    const files = await Promise.all(
      blobs.map(async (blob) => {
        const meta = await store.getMetadata(blob.key)
        const uploadedAt = Number(meta?.metadata?.uploadedAt || 0)
        return {
          key: blob.key,
          filename: meta?.metadata?.filename || blob.key,
          uploadedAt,
          downloadUrl: `/.netlify/functions/download?file=${encodeURIComponent(blob.key)}`,
        }
      }),
    )

    files.sort((a, b) => b.uploadedAt - a.uploadedAt)

    return Response.json({ files })
  } catch (err) {
    console.error('List error:', err)
    return Response.json({ files: [] }, { status: 500 })
  }
}
