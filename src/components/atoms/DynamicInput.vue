<template>
  <div :class="`flex items-center gap-2 ${className}`">
    <label v-if="label" class="text-[12px] text-slate-500 min-w-[60px]">
      {{ label }}
    </label>
    <input 
      type="text"
      :name="name"
      :value="modelValue"
      :placeholder="placeholder"
      :class="inputClass"
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
  iconName: {
    type: String,
    default: ''
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

const inputClass = 'w-full bg-slate-50 border border-slate-200 rounded-lg px-3 py-2 text-xs outline-none focus:border-blue-500 focus:bg-white focus:ring-1 focus:ring-blue-100 transition-all placeholder:text-slate-300'

const handleInput = (e) => {
  emit('update:modelValue', e.target.value)
}
</script>
