<script setup lang="ts">
import { onErrorCaptured, ref } from 'vue'

const err = ref<Error | null>(null)

onErrorCaptured((e) => {
  err.value = e instanceof Error ? e : new Error(String(e))
  return false
})
</script>

<template>
  <slot v-if="!err" />
  <div v-else class="render-error">
    <p>UI 渲染出错：{{ err.message }}</p>
    <button type="button" @click="err = null">重试</button>
  </div>
</template>

<style scoped>
.render-error {
  padding: 1.5rem;
  background: #fef2f2;
  border: 1px solid #fecaca;
  border-radius: 8px;
  color: #991b1b;
  font-size: 0.875rem;
}
.render-error p {
  margin: 0 0 0.75rem;
}
.render-error button {
  padding: 0.375rem 0.75rem;
  background: #dc2626;
  color: #fff;
  border: none;
  border-radius: 4px;
  cursor: pointer;
  font-size: 0.8125rem;
}
.render-error button:hover {
  background: #b91c1c;
}
</style>
