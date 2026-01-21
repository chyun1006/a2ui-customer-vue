<template>
  <div :class="`h-px bg-slate-100 my-1 ${className}`" />
</template>

<script setup>
defineProps({
  className: {
    type: String,
    default: ''
  }
})
</script>
