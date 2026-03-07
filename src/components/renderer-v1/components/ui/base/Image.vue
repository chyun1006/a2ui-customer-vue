<script setup lang="ts">
defineProps<{
  src: string
  alt?: string | null
  width?: string | number | null
  height?: string | number | null
  radius?: 'none' | 'sm' | 'md' | 'lg' | 'full' | null
}>()
</script>

<template>
  <div class="jr-image-wrapper" :data-radius="radius ?? 'md'">
    <img
      class="jr-image"
      :src="src"
      :alt="alt ?? ''"
      :style="{
        width: width ? String(width) : '100%',
        height: height ? String(height) : 'auto',
      }"
    >
  </div>
</template>

<style scoped>
.jr-image-wrapper {
  overflow: hidden;
  border-radius: 0.75rem;
  background: #020617;
}

.jr-image-wrapper[data-radius='none'] {
  border-radius: 0;
}

.jr-image-wrapper[data-radius='sm'] {
  border-radius: 0.375rem;
}

.jr-image-wrapper[data-radius='md'] {
  border-radius: 0.75rem;
}

.jr-image-wrapper[data-radius='lg'] {
  border-radius: 1rem;
}

.jr-image-wrapper[data-radius='full'] {
  border-radius: 999px;
}

.jr-image {
  display: block;
  width: 100%;
  height: auto;
  object-fit: cover;
}
</style>

