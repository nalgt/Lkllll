import { getStore } from '@netlify/blobs'

export default async (req) => {
  const { next_run } = await req.json()
  console.log('Running file cleanup. Next run:', next_run)

  try {
    const store = getStore('uploads')
    const { blobs } = await store.list()
    const cutoff = Date.now() - 24 * 60 * 60 * 1000
    let deleted = 0

    for (const blob of blobs) {
      const meta = await store.getMetadata(blob.key)
      const uploadedAt = Number(meta?.metadata?.uploadedAt || 0)
      if (uploadedAt && uploadedAt < cutoff) {
        await store.delete(blob.key)
        console.log(`Deleted: ${blob.key}`)
        deleted++
      }
    }

    console.log(`Cleanup complete. Deleted ${deleted} expired files.`)
  } catch (err) {
    console.error('Cleanup error:', err)
  }
}

export const config = {
  schedule: '@daily',
}
