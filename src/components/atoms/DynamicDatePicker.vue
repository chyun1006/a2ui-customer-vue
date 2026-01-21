<template>
  <div :class="['flex flex-col gap-2', className]">
    <!-- Label -->
    <label v-if="label" class="text-xs font-bold text-slate-700">
      {{ label }}
    </label>

    <!-- Input Container -->
    <div
      class="flex items-center gap-2 px-3 py-2 bg-white border border-slate-200 rounded-xl shadow-sm transition-all focus-within:border-blue-400 focus-within:ring-2 focus-within:ring-blue-100"
    >
      <!-- Icon -->
      <component
        v-if="iconName"
        :is="iconComponent"
        class="w-4 h-4 text-slate-400 flex-shrink-0"
      />

      <!-- Date Input -->
      <input
        type="date"
        :value="modelValue"
        @input="handleInput"
        :placeholder="placeholder"
        class="flex-1 outline-none text-sm text-slate-700 bg-transparent placeholder:text-slate-400"
      />
    </div>
  </div>
</template>

<script setup>
import { computed } from "vue";
import * as LucideIcons from "lucide-vue-next";

const props = defineProps({
  label: {
    type: String,
    default: "",
  },
  name: {
    type: String,
    default: "",
  },
  placeholder: {
    type: String,
    default: "请选择日期",
  },
  modelValue: {
    type: String,
    default: "",
  },
  iconName: {
    type: String,
    default: "Calendar",
  },
  className: {
    type: String,
    default: "",
  },
});

const emit = defineEmits(["update:modelValue"]);

// 动态获取图标组件
const iconComponent = computed(() => {
  if (!props.iconName) return null;
  return LucideIcons[props.iconName] || LucideIcons.Calendar;
});

const handleInput = (event) => {
  emit("update:modelValue", event.target.value);
};
</script>

<style scoped>
/* 自定义日期选择器样式 */
input[type="date"]::-webkit-calendar-picker-indicator {
  cursor: pointer;
  opacity: 0.6;
  transition: opacity 0.2s;
}

input[type="date"]::-webkit-calendar-picker-indicator:hover {
  opacity: 1;
}

/* 移除默认的日期输入框样式 */
input[type="date"]::-webkit-inner-spin-button,
input[type="date"]::-webkit-clear-button {
  display: none;
}
</style>
