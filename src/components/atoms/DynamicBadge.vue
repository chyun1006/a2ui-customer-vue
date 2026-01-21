<template>
  <span :class="className">{{ text }}</span>
</template>

<script setup>
defineProps({
  text: {
    type: String,
    default: ''
  },
  variant: {
    type: String,
    default: ''
  },
  className: {
    type: String,
    default: ''
  }
})
</script>
