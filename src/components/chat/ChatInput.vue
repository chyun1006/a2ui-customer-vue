<template>
  <div class="flex items-center gap-3 px-4 py-3 bg-white border-t border-slate-100">
    <!-- 语音按钮 -->
    <button class="p-2 text-slate-600 hover:bg-slate-100 rounded-full transition-colors">
      <component :is="Mic" class="w-6 h-6" />
    </button>
    
    <!-- 输入框 -->
    <div class="flex-1 bg-slate-100 rounded-2xl flex items-center px-4 py-2.5 border border-transparent focus-within:border-blue-200 transition-all">
      <input
        v-model="inputText"
        type="text"
        :placeholder="placeholder"
        :disabled="disabled"
        class="bg-transparent w-full outline-none text-slate-800 text-sm disabled:opacity-50"
        @keydown.enter="handleSend"
      />
    </div>
    
    <!-- 发送按钮或多媒体按钮 -->
    <div class="flex items-center gap-1">
      <button
        v-if="inputText.trim()"
        @click="handleSend"
        :disabled="disabled"
        class="p-2 bg-blue-600 rounded-full shadow-lg hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
      >
        <component :is="SendHorizontal" class="w-5 h-5 text-white" />
      </button>
      <button
        v-else
        class="p-2 text-slate-600 hover:bg-slate-100 rounded-full transition-colors"
      >
        <component :is="PlusCircle" class="w-6 h-6" />
      </button>
    </div>
  </div>
</template>

<script setup>
import { ref } from 'vue'
import { SendHorizontal, Mic, PlusCircle } from 'lucide-vue-next'

const props = defineProps({
  placeholder: {
    type: String,
    default: '发消息或输入指令...'
  },
  disabled: {
    type: Boolean,
    default: false
  }
})

const emit = defineEmits(['send'])

const inputText = ref('')

const handleSend = () => {
  const message = inputText.value.trim()
  if (message && !props.disabled) {
    emit('send', message)
    inputText.value = ''
  }
}

// 暴露方法供父组件调用
defineExpose({
  clear: () => {
    inputText.value = ''
  }
})
</script>
