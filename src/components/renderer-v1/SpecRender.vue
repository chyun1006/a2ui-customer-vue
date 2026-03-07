<script setup lang="ts">
import { computed, shallowRef, watch } from 'vue'
import {
  StateProvider,
  VisibilityProvider,
  ActionProvider,
  Renderer,
  createStateStore,
} from '@json-render/vue'
import type { Spec } from '@json-render/core'
import { registry as defaultRegistry, handlers } from './registry'
import ErrorBoundary from './components/ErrorBoundary.vue'
import { validateSpec } from './validateSpec'
import {
  createGenericActionHandler,
  mergeDynamicHandlers,
} from './collectSpecActions'

const props = withDefaults(
  defineProps<{
    spec: Spec | null
    loading?: boolean
    registry?: typeof defaultRegistry
    /** 任意 action 触发后调用（含 catalog 中定义的 submit_form 与未注册的动态 action），统一在此监听并拿表单值 state */
    onAction?: (
      actionName: string,
      params: Record<string, unknown>,
      state: Record<string, unknown>,
    ) => void | Promise<void>
  }>(),
  { loading: false },
)

const emit = defineEmits<{
  /** 任意 action 触发后发出，参数 (actionName, params, state) */
  action: [
    actionName: string,
    params: Record<string, unknown>,
    state: Record<string, unknown>,
  ]
}>()

const validSpec = computed(() => validateSpec(props.spec))

const store = shallowRef(createStateStore({}))
/** 仅当 root 变化时用 spec.state 初始化 store，避免流式更新覆盖用户已填写的表单 */
const lastInitedRoot = shallowRef<string | null>(null)

watch(
  validSpec,
  (newSpec) => {
    if (!newSpec?.root) {
      lastInitedRoot.value = null
      return
    }
    if (lastInitedRoot.value === newSpec.root) return
    lastInitedRoot.value = newSpec.root
    const newStore = createStateStore({})
    if (newSpec.state && typeof newSpec.state === 'object') {
      for (const [key, value] of Object.entries(newSpec.state)) {
        newStore.set(`/${key}`, value)
      }
    }
    store.value = newStore
  },
  { immediate: true },
)

const registry = computed(() => props.registry ?? defaultRegistry)

const actionHandlers = computed(() => {
  const base = handlers(
    () => (updater: (prev: Record<string, unknown>) => Record<string, unknown>) => {
      const prev = store.value.getSnapshot()
      const next = updater(prev)
      if (next && typeof next === 'object') {
        for (const [key, value] of Object.entries(next)) {
          store.value.set(key.startsWith('/') ? key : `/${key}`, value)
        }
      }
    },
    () => store.value.getSnapshot(),
  )
  const getState = () => (store.value.getSnapshot() ?? {}) as Record<string, unknown>
  const merged = mergeDynamicHandlers(
    base,
    validSpec.value,
    (name) => createGenericActionHandler(name, getState),
  )
  // 包装所有 handler，统一通过 @action / onAction 向外抛（含 catalog 与动态 action）
  const wrapped: Record<string, (params: Record<string, unknown>) => Promise<void>> = {}
  for (const [name, fn] of Object.entries(merged)) {
    wrapped[name] = async (params) => {
      await (fn as (p: Record<string, unknown>) => Promise<void>)(params)
      const state = getState()
      emit('action', name, params ?? {}, state)
    }
  }
  return wrapped as typeof base
})
</script>

<template>
  <StateProvider :store="store">
    <VisibilityProvider>
      <ActionProvider :handlers="actionHandlers">
        <ErrorBoundary v-if="validSpec?.root && validSpec?.elements?.[validSpec.root]">
          <Renderer
            :spec="validSpec"
            :registry="registry"
            :loading="loading"
          />
        </ErrorBoundary>
        <slot v-else name="empty" />
      </ActionProvider>
    </VisibilityProvider>
  </StateProvider>
</template>
