<template>
  <div :class="`flex flex-col gap-1.5 ${className}`">
    <label v-if="label" class="text-[12px] text-slate-500">
      {{ label }}
    </label>
    <textarea 
      :rows="rows || 3"
      :value="modelValue"
      :placeholder="placeholder"
      :class="textareaClass"
      @input="handleInput"
      @click.stop
    />
  </div>
</template>

<script setup>
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
  rows: {
    type: Number,
    default: 3
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

const textareaClass = 'w-full bg-slate-50 border border-slate-200 rounded-lg px-3 py-2 text-xs outline-none focus:border-blue-500 focus:bg-white focus:ring-1 focus:ring-blue-100 transition-all placeholder:text-slate-300 resize-none'

const handleInput = (e) => {
  emit('update:modelValue', e.target.value)
}
</script>
