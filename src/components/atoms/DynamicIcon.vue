<template>
  <component 
    :is="iconComponent" 
    :class="className"
  />
</template>

<script setup>
import { computed } from 'vue'
import * as LucideIcons from 'lucide-vue-next'

const props = defineProps({
  iconName: {
    type: String,
    required: true
  },
  className: {
    type: String,
    default: ''
  }
})

const iconComponent = computed(() => {
  return LucideIcons[props.iconName] || LucideIcons.HelpCircle
})
</script>
