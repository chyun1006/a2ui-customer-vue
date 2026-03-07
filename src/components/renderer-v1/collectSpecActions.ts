import type { Spec } from '@json-render/core'

type SetStateFn = (updater: (prev: Record<string, unknown>) => Record<string, unknown>) => void
export type ActionHandler = (
  params: Record<string, unknown>,
  setState: SetStateFn,
  state: Record<string, unknown>,
) => void | Promise<void>

interface OnBinding {
  action?: string
  params?: unknown
}

/**
 * 从 spec 中收集所有 element.on[event].action 的字符串值（去重）。
 */
export function collectActionNames(spec: Spec | null | undefined): string[] {
  if (!spec?.elements || typeof spec.elements !== 'object') return []
  const names: string[] = []
  for (const el of Object.values(spec.elements)) {
    const on = (el as { on?: Record<string, OnBinding> }).on
    if (!on || typeof on !== 'object') continue
    for (const binding of Object.values(on)) {
      if (binding && typeof binding === 'object' && typeof binding.action === 'string') {
        names.push(binding.action)
      }
    }
  }
  return [...new Set(names)]
}

export type OnDynamicAction = (
  actionName: string,
  params: Record<string, unknown>,
  state: Record<string, unknown>,
) => void | Promise<void>

/**
 * 为未在 registry 中声明的 action 创建通用 handler。
 * getState 用于在运行时读取当前表单 state（因 @json-render/core executeAction 只传 params，不传 state）。
 * 不传 onDynamicAction 时仅作 no-op，由 SpecRender 外层统一通过 @action 抛出。
 */
export function createGenericActionHandler(
  actionName: string,
  getState: () => Record<string, unknown>,
  onDynamicAction?: OnDynamicAction,
): ActionHandler {
  return async (params, _setState?, stateFromLib?) => {
    if (onDynamicAction) {
      const state = (stateFromLib ?? getState()) as Record<string, unknown>
      await onDynamicAction(actionName, params ?? {}, state)
    }
  }
}

/**
 * 将 base handlers 与 spec 中收集到的、未在 base 中注册的 action 合并。
 * 未注册的 action 使用 genericHandler(name) 返回的 handler。
 */
export function mergeDynamicHandlers(
  base: Record<string, ActionHandler>,
  spec: Spec | null | undefined,
  genericHandler: (actionName: string) => ActionHandler,
): Record<string, ActionHandler> {
  const names = collectActionNames(spec)
  const merged = { ...base }
  for (const name of names) {
    if (!(name in merged)) {
      merged[name] = genericHandler(name)
    }
  }
  return merged
}
