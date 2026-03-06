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

const props = withDefaults(
  defineProps<{
    spec: Spec | null
    loading?: boolean
    registry?: typeof defaultRegistry
  }>(),
  { loading: false },
)

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

const actionHandlers = computed(() =>
  handlers(
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
  ),
)
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
