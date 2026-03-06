<script setup lang="ts">
defineProps<{
  content: string
  align?: 'left' | 'center' | 'right' | null
}>()
</script>

<template>
  <p class="jr-text" :data-align="align ?? 'left'">
    {{ content }}
  </p>
</template>

<style scoped>
.jr-text {
  margin: 0;
  font-size: 14px;
  line-height: 1.6;
  color: #111827;
}

.jr-text[data-align='center'] {
  text-align: center;
}

.jr-text[data-align='right'] {
  text-align: right;
}
</style>
