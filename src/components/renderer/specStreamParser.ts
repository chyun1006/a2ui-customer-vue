import { createSpecStreamCompiler, type Spec } from '@json-render/core'
import { validateSpec } from './validateSpec'

export interface SpecStreamParserLogEntry {
  type: 'token' | 'patch' | 'text' | 'fence'
  content: string
}

export interface SpecStreamParserOptions {
  onLog?: (entry: SpecStreamParserLogEntry) => void
  onTextLine?: (line: string) => void
}

export interface SpecStreamParser {
  pushContent(chunk: string): void
  getCurrentSpec(): Spec | null
  finish(): Spec | null
  reset(): void
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

/** Fence 内 JSON 行可能被后端转义为 \" 和 \\，喂给 compiler 前需反转义。 */
function unescapeJsonInFence(line: string): string {
  return line
    .replace(/\\\\/g, '\u0000')
    .replace(/\\"/g, '"')
    .replace(/\u0000/g, '\\')
}

/** 将字面量 \\n 转为真实换行后按行拆，兼容后端发来整段带转义换行的情况。 */
function splitSpecLines(block: string): string[] {
  return block.replace(/\\n/g, '\n').split('\n')
}

export function createSpecStreamParser(options: SpecStreamParserOptions = {}): SpecStreamParser {
  const { onLog, onTextLine } = options
  let compiler = createSpecStreamCompiler<Spec>()
  let contentBuffer = ''
  let insideSpecFence = false

  /** Fence 内单行：先原样 push，失败再 unescape 后 push，兼容无转义与 \" 转义两种输入。 */
  function pushFenceLine(trimmed: string): void {
    if (!trimmed) return
    onLog?.({ type: 'patch', content: trimmed })
    try {
      compiler.push(trimmed + '\n')
    } catch {
      try {
        compiler.push(unescapeJsonInFence(trimmed) + '\n')
      } catch {
        // skip malformed patch
      }
    }
  }

  function flushLine(line: string): void {
    if (line.startsWith('"') && line.endsWith('"') && line.length > 1) {
      line = line.slice(1, -1)
    }
    else if (line.startsWith('"')) {
      line = line.slice(1)
    }
    const trimmed = line.trim()

    // 已在 fence 内且本行含结束 ```：拆出 ``` 前的内容按行 push，再关闭 fence
    if (insideSpecFence && trimmed.includes('```')) {
      const closeIdx = trimmed.indexOf('```')
      const before = trimmed.slice(0, closeIdx).trim()
      for (const part of splitSpecLines(before)) {
        const t = part.trim()
        if (t) pushFenceLine(t)
      }
      insideSpecFence = false
      onLog?.({ type: 'fence', content: '```' })
      return
    }

    // 行首为 ```spec：提取同行 rest，有内容则按行 push，再进入 fence
    if (/^```\s*spec/i.test(trimmed)) {
      onLog?.({ type: 'fence', content: '```spec' })
      let rest = trimmed.replace(/^```\s*spec\s*/i, '').trim()
      if (rest.startsWith('"') && rest.endsWith('"') && rest.length > 1)
        rest = rest.slice(1, -1)
      if (rest) {
        if (rest.includes('```')) {
          const closeIdx = rest.indexOf('```')
          const before = rest.slice(0, closeIdx).trim()
          for (const part of splitSpecLines(before)) {
            const t = part.trim()
            if (t) pushFenceLine(t)
          }
          insideSpecFence = false
          onLog?.({ type: 'fence', content: '```' })
        }
        else {
          for (const part of splitSpecLines(rest)) {
            const t = part.trim()
            if (t) pushFenceLine(t)
          }
          insideSpecFence = true
        }
      }
      else {
        insideSpecFence = true
      }
      return
    }

    if (insideSpecFence && /^```\s*$/.test(trimmed)) {
      insideSpecFence = false
      onLog?.({ type: 'fence', content: '```' })
      return
    }

    if (insideSpecFence) {
      if (trimmed) pushFenceLine(trimmed)
      return
    }
    if (isJsonlPatch(line)) {
      onLog?.({ type: 'patch', content: trimmed })
      try {
        compiler.push(trimmed + '\n')
      } catch {
        // skip
      }
      return
    }
    // 行首不是 ```spec，但行内可能含 ```spec（例如 reasoning + 同一 token 的 spec）：拆开处理
    const specStart = trimmed.search(/```\s*spec/i)
    if (specStart > 0) {
      const textPart = trimmed.slice(0, specStart).trim()
      const specPart = trimmed.slice(specStart)
      if (textPart) {
        onLog?.({ type: 'text', content: textPart })
        onTextLine?.(textPart)
      }
      flushLine(specPart)
      return
    }
    if (trimmed) onLog?.({ type: 'text', content: line })
    onTextLine?.(line)
  }

  return {
    pushContent(chunk: string) {
      contentBuffer += chunk
      let idx: number
      while ((idx = contentBuffer.indexOf('\n')) !== -1) {
        const line = contentBuffer.slice(0, idx)
        contentBuffer = contentBuffer.slice(idx + 1)
        flushLine(line)
      }
    },

    getCurrentSpec() {
      return compiler.getResult()
    },

    finish(): Spec | null {
      if (contentBuffer.trim()) {
        flushLine(contentBuffer)
        contentBuffer = ''
      }
      const raw = compiler.getResult()
      const validated = (raw && typeof raw === 'object' && 'root' in raw)
        ? validateSpec(raw)
        : null
      return validated
    },

    reset() {
      compiler = createSpecStreamCompiler<Spec>()
      contentBuffer = ''
      insideSpecFence = false
    },
  }
}
