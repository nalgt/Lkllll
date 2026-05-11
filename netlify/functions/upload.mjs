import { getStore } from '@netlify/blobs'

export default async (req) => {
  if (req.method !== 'POST') {
    return new Response('Method not allowed', { status: 405 })
  }

  let body
  try {
    body = await req.json()
  } catch {
    return Response.json({ error: 'Invalid JSON body' }, { status: 400 })
  }

  const { name, data } = body
  if (!name || !data) {
    return Response.json({ error: 'Missing name or data' }, { status: 400 })
  }

  try {
    const store = getStore('uploads')
    const uploadedAt = Date.now()
    const key = `${uploadedAt}-${name}`

    const bytes = Buffer.from(data, 'base64')
    await store.set(key, bytes, {
      metadata: { filename: name, uploadedAt: String(uploadedAt) },
    })

    const link = `/.netlify/functions/download?file=${encodeURIComponent(key)}`
    const expire = uploadedAt + 24 * 60 * 60 * 1000

    return Response.json({ link, expire })
  } catch (err) {
    console.error('Upload error:', err)
    return Response.json({ error: 'Upload failed' }, { status: 500 })
  }
}
