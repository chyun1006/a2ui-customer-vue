<template>
  <div :class="`flex items-center gap-2 ${className}`">
    <label v-if="label" class="text-[12px] text-slate-500 min-w-[60px]">
      {{ label }}
    </label>
    <div class="relative flex-1">
      <select 
        :value="modelValue"
        :class="selectClass"
        @change="handleChange"
        @click.stop
      >
        <option value="" disabled>{{ placeholder || '请选择' }}</option>
        <option 
          v-for="(opt, i) in options" 
          :key="i" 
          :value="opt.value"
        >
          {{ opt.label }}
        </option>
      </select>
      <component 
        :is="ChevronDown" 
        class="absolute right-2 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-slate-400 pointer-events-none"
      />
    </div>
  </div>
</template>

<script setup>
import { ChevronDown } from 'lucide-vue-next'

const props = defineProps({
  label: {
    type: String,
    default: ''
  },
  name: {
    type: String,
    default: ''
  },
  placeholder: {
    type: String,
    default: ''
  },
  options: {
    type: Array,
    default: () => []
  },
  className: {
    type: String,
    default: ''
  },
  modelValue: {
    type: String,
    default: ''
  }
})

const emit = defineEmits(['update:modelValue'])

const selectClass = 'w-full bg-slate-50 border border-slate-200 rounded-lg px-3 py-2 text-xs outline-none focus:border-blue-500 focus:bg-white focus:ring-1 focus:ring-blue-100 transition-all placeholder:text-slate-300 appearance-none pr-8'

const handleChange = (e) => {
  emit('update:modelValue', e.target.value)
}
</script>
