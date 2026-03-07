import type { SseAdapter } from './types'
import { copawAdapter } from './copaw'
import { defaultAdapter } from './default'

export type { SseAdapter, SseAdapterOptions } from './types'
export { copawAdapter } from './copaw'
export { defaultAdapter } from './default'

export function getAdapter(format: 'default' | 'copaw'): SseAdapter {
  return format === 'copaw' ? copawAdapter : defaultAdapter
}
