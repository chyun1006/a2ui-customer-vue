<script setup lang="ts">
defineProps<{
  content: string
}>()
</script>

<template>
  <p class="jr-text">{{ content }}</p>
</template>
