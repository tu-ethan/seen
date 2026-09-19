import assert from 'node:assert/strict'
import { spawn } from 'node:child_process'
import test from 'node:test'

test('Google Meet transcript-generated evidence workflow', { timeout: 45_000 }, async () => {
  const port = 3417
  const baseUrl = `http://127.0.0.1:${port}`
  const server = spawn(process.execPath, ['node_modules/next/dist/bin/next', 'dev', '--hostname', '127.0.0.1', '--port', String(port)], {
    cwd: new URL('..', import.meta.url),
    env: {
      ...process.env,
      GOOGLE_MEET_ACCESS_TOKEN: 'mock-google-access-token',
      OPENROUTER_API_KEY: 'mock-openrouter-api-key',
      GOOGLE_PUBSUB_TOPIC: 'projects/seen-demo/topics/meet-events',
      GOOGLE_PUBSUB_PUSH_TOKEN: 'mock-webhook-secret',
    },
    stdio: ['ignore', 'pipe', 'pipe'],
  })

  let serverOutput = ''
  server.stdout.on('data', (chunk) => { serverOutput += chunk.toString() })
  server.stderr.on('data', (chunk) => { serverOutput += chunk.toString() })

  async function waitForServer() {
    const deadline = Date.now() + 30_000
    while (Date.now() < deadline) {
      if (server.exitCode !== null) throw new Error(`Next.js exited early:\n${serverOutput}`)
      try {
        const response = await fetch(`${baseUrl}/api/integrations/google-meet`)
        if (response.ok) return
      } catch {}
      await new Promise((resolve) => setTimeout(resolve, 200))
    }
    throw new Error(`Timed out waiting for Next.js:\n${serverOutput}`)
  }

  async function json(path, options = {}) {
    const response = await fetch(`${baseUrl}${path}`, options)
    const payload = response.status === 204 ? null : await response.json()
    return { response, payload }
  }

  try {
    await waitForServer()

    const initial = await json('/api/integrations/google-meet')
    assert.equal(initial.response.status, 200)
    assert.equal(initial.payload.connected, false)

    const connected = await json('/api/integrations/google-meet/connect', { method: 'POST' })
    assert.equal(connected.response.status, 200)
    assert.equal(connected.payload.connected, true)
    assert.equal(connected.payload.mode, 'mock')
    const weekly = connected.payload.availableSeries.find((item) => item.title === 'Weekly Contributions')
    assert.ok(weekly)
    assert.equal(weekly.spaceName, 'spaces/seenWeeklyContributions')

    const subscribed = await json('/api/integrations/google-meet/subscription', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ seriesId: weekly.id }),
    })
    assert.equal(subscribed.response.status, 200)
    assert.equal(subscribed.payload.selectedSeries.title, 'Weekly Contributions')
    assert.equal(subscribed.payload.subscription.eventType, 'google.workspace.meet.transcript.v2.fileGenerated')
    assert.equal(subscribed.payload.subscription.targetResource, '//meet.googleapis.com/spaces/seenWeeklyContributions')

    const processed = await json('/api/integrations/google-meet/simulate', { method: 'POST' })
    assert.equal(processed.response.status, 200)
    assert.equal(processed.payload.duplicate, false)
    assert.equal(processed.payload.contributionIds.length, 3)

    const contributions = await json('/api/contributions')
    assert.equal(contributions.response.status, 200)
    const generated = contributions.payload.contributions.filter((item) => processed.payload.contributionIds.includes(item.id))
    assert.equal(generated.length, 3)
    assert.ok(generated.every((item) => item.status === 'AI_CAPTURED' && item.sharedWithManager === true))
    assert.ok(generated.every((item) => item.source.title === 'Weekly Contributions'))
    assert.ok(generated.every((item) => item.evidence[0].speaker === 'Maya Chen' && /^\d{2}:\d{2}$/.test(item.evidence[0].timestamp)))

    const duplicate = await json('/api/integrations/google-meet/simulate', { method: 'POST' })
    assert.equal(duplicate.response.status, 200)
    assert.equal(duplicate.payload.duplicate, true)
    assert.deepEqual(duplicate.payload.contributionIds.sort(), processed.payload.contributionIds.sort())

    const pubsubEvent = {
      message: {
        messageId: 'mock-pubsub-transcript-generated-2026-09-18',
        publishTime: '2026-09-18T14:35:00.000Z',
        data: Buffer.from(JSON.stringify({ transcript: { name: processed.payload.transcriptResourceName } })).toString('base64'),
        attributes: {
          'ce-id': 'mock-pubsub-transcript-generated-2026-09-18',
          'ce-type': 'google.workspace.meet.transcript.v2.fileGenerated',
          'ce-time': '2026-09-18T14:35:00.000Z',
        },
      },
    }
    const webhookDuplicate = await json('/api/integrations/google-meet/webhook?token=mock-webhook-secret', {
      method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(pubsubEvent),
    })
    assert.equal(webhookDuplicate.response.status, 200)
    assert.equal(webhookDuplicate.payload.duplicate, true)

    const id = processed.payload.contributionIds[0]
    const edited = await json(`/api/contributions/${id}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ title: 'Edited employee evidence', description: 'The employee clarified the outcome.' }),
    })
    assert.equal(edited.response.status, 200)
    assert.equal(edited.payload.contribution.title, 'Edited employee evidence')
    assert.equal(edited.payload.contribution.status, 'EDITED')

    const removed = await json(`/api/contributions/${id}`, { method: 'DELETE' })
    assert.equal(removed.response.status, 204)
    const afterDelete = await json('/api/contributions')
    assert.equal(afterDelete.payload.contributions.some((item) => item.id === id), false)

    const unauthorized = await json('/api/integrations/google-meet/webhook?token=wrong', {
      method: 'POST', headers: { 'Content-Type': 'application/json' }, body: '{}',
    })
    assert.equal(unauthorized.response.status, 401)
  } finally {
    server.kill('SIGTERM')
    await new Promise((resolve) => {
      if (server.exitCode !== null) resolve()
      else server.once('exit', resolve)
    })
  }
})
