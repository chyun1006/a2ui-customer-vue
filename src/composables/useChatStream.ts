import { ref, shallowRef, triggerRef } from 'vue'
import {
  createSpecStreamCompiler,
  type Spec,
} from '@json-render/core'
import { validateSpec } from '../components/renderer/index'

export interface ChatMessage {
  id: string
  role: 'user' | 'assistant'
  text: string
  spec: Spec | null
}

function isJsonlPatch(line: string): boolean {
  const trimmed = line.trim()
  if (!trimmed || trimmed[0] !== '{') return false
  try {
    const obj = JSON.parse(trimmed) as Record<string, unknown>
    return typeof obj.op === 'string' && typeof obj.path === 'string'
  } catch {
    return false
  }
}

export interface SseLogEntry {
  type: 'token' | 'patch' | 'text' | 'fence'
  content: string
}

/** CoPaw 风格：请求体为 input + session_id + stream，SSE 为 data: { type?, content } */
export interface UseChatStreamOptions {
  requestFormat?: 'default' | 'copaw'
  sessionId?: string
}

export function useChatStream(api = '/api/chat', options: UseChatStreamOptions = {}) {
  const { requestFormat = 'default', sessionId: optionSessionId } = options
  const messages = ref<ChatMessage[]>([])
  const currentText = ref('')
  const spec = shallowRef<Spec | null>(null)
  const isStreaming = ref(false)
  const error = ref<Error | null>(null)
  const sseLog = ref<SseLogEntry[]>([])
  /** CoPaw 多轮对话：同一会话内复用 sessionId */
  const sessionIdRef = ref(optionSessionId ?? `session-${Date.now()}`)
  const sessionId = () => optionSessionId ?? sessionIdRef.value

  let compiler = createSpecStreamCompiler<Spec>()

  function clear() {
    messages.value = []
    currentText.value = ''
    spec.value = null
    error.value = null
    sseLog.value = []
    compiler = createSpecStreamCompiler<Spec>()
  }

  async function send(userContent: string) {
    if (!userContent.trim()) return

    const userMsg: ChatMessage = {
      id: `user-${Date.now()}`,
      role: 'user',
      text: userContent,
      spec: null,
    }
    messages.value.push(userMsg)

    const aId = `assistant-${Date.now()}`
    messages.value.push({ id: aId, role: 'assistant', text: '', spec: null })

    currentText.value = ''
    spec.value = null
    sseLog.value = []
    compiler = createSpecStreamCompiler<Spec>()
    isStreaming.value = true
    error.value = null

    try {
      const filtered = messages.value.filter(
        (m) => m.role === 'user' || (m.role === 'assistant' && m.text),
      )
      const body =
        requestFormat === 'copaw'
          ? {
              input: filtered.map((m) => ({
                role: m.role as 'user' | 'assistant',
                content: [{ type: 'text' as const, text: m.text }],
              })),
              session_id: sessionId(),
              stream: true,
            }
          : {
              messages: filtered.map((m) => ({ role: m.role, content: m.text })),
            }

      const response = await fetch(api, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
      })

      if (!response.ok) throw new Error(`HTTP ${response.status}`)
      const reader = response.body?.getReader()
      if (!reader) throw new Error('No response body')

      const decoder = new TextDecoder()
      let sseBuffer = ''
      let contentBuffer = ''
      let insideSpecFence = false

      function appendText(t: string) {
        if (!t && !currentText.value) return
        currentText.value += (currentText.value ? '\n' : '') + t
      }

      function processContentBuffer() {
        let idx: number
        while ((idx = contentBuffer.indexOf('\n')) !== -1) {
          const line = contentBuffer.slice(0, idx)
          contentBuffer = contentBuffer.slice(idx + 1)
          const trimmed = line.trim()

          if (/^```\s*spec/i.test(trimmed)) {
            insideSpecFence = true
            sseLog.value.push({ type: 'fence', content: '```spec' })
            continue
          }
          if (insideSpecFence && /^```\s*$/.test(trimmed)) {
            insideSpecFence = false
            sseLog.value.push({ type: 'fence', content: '```' })
            continue
          }

          if (insideSpecFence) {
            if (trimmed) {
              sseLog.value.push({ type: 'patch', content: trimmed })
              try {
                const { result } = compiler.push(trimmed + '\n')
                spec.value = result
              } catch {
                // skip malformed patch
              }
            }
          } else if (isJsonlPatch(line)) {
            sseLog.value.push({ type: 'patch', content: trimmed })
            try {
              const { result } = compiler.push(trimmed + '\n')
              spec.value = result
            } catch {
              // skip
            }
          } else {
            if (trimmed) sseLog.value.push({ type: 'text', content: line })
            appendText(line)
          }
        }
      }

      while (true) {
        const { done, value } = await reader.read()
        if (done) break
        sseBuffer += decoder.decode(value, { stream: true })
        const sseLines = sseBuffer.split('\n')
        sseBuffer = sseLines.pop() ?? ''

        for (const sseLine of sseLines) {
          if (!sseLine.startsWith('data: ')) continue
          const data = sseLine.slice(6).trim()
          if (!data || data === '[DONE]') continue
          try {
            const parsed = JSON.parse(data) as Record<string, unknown>
            const err = parsed.error
            if (err != null && err !== '') {
              error.value = new Error(String(err))
              break
            }
            // CoPaw：object=== "content" 且 type=== "text" 时取 text 字段（流式 delta）
            if (requestFormat === 'copaw') {
              if (parsed.object === 'content' && parsed.type === 'text' && typeof parsed.text === 'string') {
                const token = parsed.text
                if (token) sseLog.value.push({ type: 'token', content: token })
                contentBuffer += token
                processContentBuffer()
              }
              continue
            }
            // 默认格式：content 字段
            if (typeof parsed.content === 'string') {
              if (parsed.content) sseLog.value.push({ type: 'token', content: parsed.content })
              contentBuffer += parsed.content
              processContentBuffer()
            }
          } catch {
            // ignore
          }
        }
      }

      if (sseBuffer.startsWith('data: ')) {
        try {
          const parsed = JSON.parse(sseBuffer.slice(6).trim()) as Record<string, unknown>
          if (requestFormat === 'copaw') {
            if (parsed.object === 'content' && parsed.type === 'text' && typeof parsed.text === 'string')
              contentBuffer += parsed.text
          } else if (typeof parsed.content === 'string') {
            contentBuffer += parsed.content
          }
        } catch {
          // ignore
        }
      }
      contentBuffer += '\n'
      processContentBuffer()

      const finalSpec = compiler.getResult()
      const validated = (finalSpec && typeof finalSpec === 'object' && 'root' in finalSpec)
        ? validateSpec(finalSpec)
        : null
      spec.value = validated
      triggerRef(spec)

      const msgIdx = messages.value.findIndex((m) => m.id === aId)
      if (msgIdx !== -1) {
        messages.value[msgIdx] = {
          ...messages.value[msgIdx]!,
          text: currentText.value,
          spec: validated,
        }
      }
    } catch (e) {
      error.value = e instanceof Error ? e : new Error(String(e))
      const msgIdx = messages.value.findIndex((m) => m.id === aId)
      if (msgIdx !== -1) {
        messages.value[msgIdx] = {
          ...messages.value[msgIdx]!,
          text: currentText.value + '\n' + (error.value?.message ?? '请求失败'),
          spec: spec.value,
        }
      }
    } finally {
      isStreaming.value = false
    }
  }

  return { messages, currentText, spec, isStreaming, error, sseLog, send, clear }
}
