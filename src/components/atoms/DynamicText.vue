<template>
  <div :class="className">
    <slot>{{ text }}</slot>
  </div>
</template>

<script setup>
defineProps({
  text: {
    type: String,
    default: ''
  },
  usageHint: {
    type: String,
    default: ''
  },
  className: {
    type: String,
    default: ''
  }
})
</script>
