'use client'

import { useCallback, useRef } from 'react'

/**
 * Background proof-of-work for the signup forms. Nothing is shown to the visitor.
 * start() begins solving when the form is first touched, take() returns the solution
 * for one submit (or null if the browser could not solve it). A solution is single use,
 * so the next submit gets a fresh one. Format is compatible with Altcha.
 */

const CHALLENGE_ENDPOINT = '/api/signup-challenge'
// The server rejects solutions younger than 3 seconds, so never send one sooner than this
// after the challenge arrived.
const MIN_WAIT_MS = 3500

interface ChallengeData {
  algorithm: 'SHA-256'
  challenge: string
  salt: string
  signature: string
  maxnumber: number
}

const encoder = new TextEncoder()
const sleep = (ms: number) => new Promise<void>(resolve => setTimeout(resolve, ms))

function toHex(buf: ArrayBuffer): string {
  const bytes = new Uint8Array(buf)
  let out = ''
  for (let i = 0; i < bytes.length; i++) out += bytes[i].toString(16).padStart(2, '0')
  return out
}

async function solveChallenge(): Promise<string> {
  const res = await fetch(CHALLENGE_ENDPOINT, { method: 'POST' })
  if (!res.ok) throw new Error('challenge request failed')
  const received = performance.now()
  const c: ChallengeData = await res.json()

  const started = performance.now()
  let found = -1
  for (let n = 0; n <= c.maxnumber; n++) {
    const digest = await crypto.subtle.digest('SHA-256', encoder.encode(c.salt + n))
    if (toHex(digest) === c.challenge) { found = n; break }
    if (n % 1000 === 999) await sleep(0) // keep the page responsive
  }
  if (found < 0) throw new Error('challenge not solved')

  const wait = MIN_WAIT_MS - (performance.now() - received)
  if (wait > 0) await sleep(wait)

  return btoa(JSON.stringify({
    algorithm: c.algorithm,
    challenge: c.challenge,
    number: found,
    salt: c.salt,
    signature: c.signature,
    took: Math.round(performance.now() - started),
  }))
}

export function useSignupChallenge() {
  const pending = useRef<Promise<string | null> | null>(null)

  const start = useCallback(() => {
    if (!pending.current) pending.current = solveChallenge().catch(() => null)
  }, [])

  const take = useCallback(async (): Promise<string | null> => {
    start()
    const p = pending.current as Promise<string | null>
    pending.current = null // single use, so the next attempt solves a fresh challenge
    return p
  }, [start])

  return { start, take }
}
