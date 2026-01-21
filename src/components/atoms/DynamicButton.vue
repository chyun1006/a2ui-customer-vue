<template>
  <button 
    :class="buttonClass"
    @click="handleClick"
  >
    <DynamicIcon 
      v-if="iconName" 
      :icon-name="iconName" 
      class-name="w-3.5 h-3.5"
    />
    <span v-if="text">{{ text }}</span>
  </button>
</template>

<script setup>
import { computed } from 'vue'
import DynamicIcon from './DynamicIcon.vue'

const props = defineProps({
  text: {
    type: String,
    default: ''
  },
  actionName: {
    type: String,
    default: ''
  },
  variant: {
    type: String,
    default: 'secondary'
  },
  iconName: {
    type: String,
    default: ''
  },
  className: {
    type: String,
    default: ''
  }
})

const emit = defineEmits(['action-click'])

const buttonClass = computed(() => {
  const baseClass = 'transition-all active:scale-[0.98] duration-200 py-2 px-3 rounded-lg text-xs font-bold border shadow-sm flex items-center justify-center gap-1.5'
  
  if (props.className) {
    return `${baseClass} ${props.className}`
  }
  
  return `${baseClass} bg-slate-50 text-slate-700 border-slate-200`
})

const handleClick = (e) => {
  e.stopPropagation()
  emit('action-click', props.actionName, props.text)
}
</script>
