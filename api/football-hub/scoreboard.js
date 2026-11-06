import { createFootballService } from '../../server/football.js'

const service = createFootballService()

export const config = { maxDuration: 60 }

export default async function handler(req, res) {
  try {
    const method = String(req.method || 'GET').toUpperCase()
    const url = new URL(req.url, 'http://localhost')
    const response = await service.handle(new Request(url, { method }))
    res.statusCode = response.status
    for (const [key, value] of response.headers) res.setHeader(key, value)
    res.end(method === 'HEAD' ? undefined : Buffer.from(await response.arrayBuffer()))
  } catch (error) {
    res.statusCode = 500
    res.setHeader('content-type', 'application/json; charset=utf-8')
    res.end(JSON.stringify({ error: 'The scoreboard request failed.', detail: String(error) }))
  }
}
