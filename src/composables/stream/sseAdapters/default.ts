import type { SseAdapter, SseAdapterOptions } from './types'
import type { SseContentEvent } from '../types'

export const defaultAdapter: SseAdapter = {
  buildBody(
    messages: Array<{ role: 'user' | 'assistant'; text: string }>,
    _options: SseAdapterOptions,
  ) {
    return {
      messages: messages.map((m) => ({ role: m.role, content: m.text })),
    }
  },

  parseDataLine(dataJson: string, push: (ev: SseContentEvent) => void): boolean {
    const trimmed = dataJson.trim()
    if (!trimmed || trimmed === '[DONE]') return true

    try {
      const parsed = JSON.parse(trimmed) as Record<string, unknown>
      const err = parsed.error
      if (err != null && err !== '') {
        push({ kind: 'error', message: String(err) })
        return true
      }
      if (typeof parsed.content === 'string') {
        if (parsed.content) push({ kind: 'token', text: parsed.content })
        return true
      }
    } catch {
      // not our format
    }
    return false
  },
}
