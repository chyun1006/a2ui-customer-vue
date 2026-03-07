import type { Spec } from '@json-render/core'
import { catalog } from './catalog'

/**
 * 校验 spec 是否符合 catalog 约定；不通过则不渲染。
 * 不做任何非标准格式的转换或补丁。
 * 不完整/流式中的 spec（如无 elements、缺 children）不调用校验、不打日志。
 */
export function validateSpec(spec: Spec | null | undefined): Spec | null {
  if (!spec || typeof spec !== 'object') return null
  if (!spec.elements || typeof spec.elements !== 'object') return null

  const result = catalog.validate(spec)
  // 对于通过校验的情况，直接返回原始 spec，避免 catalog.validate()
  // 在解析过程中丢弃 json-render 核心支持但 catalog 未显式声明的字段
  // （例如顶层 state、元素上的 on.action 绑定等）。
  if (result.success) return spec as Spec

  const issues = result.error?.issues ?? []
  const isIncompleteIssue = (issue: { path?: unknown[]; message?: string }) => {
    const path = (issue.path ?? []) as string[]
    const msg = String(issue.message ?? '')
    if (path.length === 1 && path[0] === 'elements' && msg.includes('undefined')) return true
    if (path[path.length - 1] === 'children' && msg.includes('expected array') && msg.includes('undefined')) return true
    return false
  }
  if (result.error && !issues.every(isIncompleteIssue)) {
    console.error('[validateSpec]', {
      message: 'Spec validation failed',
      root: (spec as any).root,
      issues: result.error.issues,
    })
  }
  return null
}
