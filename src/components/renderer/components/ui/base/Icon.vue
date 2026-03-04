<script setup lang="ts">
import { computed } from 'vue'
import * as icons from 'lucide-vue-next'

const props = withDefaults(
  defineProps<{
    name: string
    size?: number | string
    color?: string | null
  }>(),
  {
    size: 20,
    color: null,
  },
)

const iconComp = computed(() => {
  const key = props.name as keyof typeof icons
  const C = icons[key] as unknown
  return (C as any) || (icons as any).CircleHelp || null
})
</script>

<template>
  <span class="jr-icon" v-if="iconComp">
    <component
      :is="iconComp"
      :size="size"
      :color="color || 'currentColor'"
      class="jr-icon-svg"
    />
  </span>
</template>

<style scoped>
.jr-icon {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  line-height: 1;
  vertical-align: middle;
}

.jr-icon-svg {
  display: block;
}
</style>

