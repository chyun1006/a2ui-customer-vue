<template>
  <div
    class="mb-6 flex w-full animate-fade-in-up"
    :class="message.sender === 'user' ? 'justify-end' : 'justify-start'"
  >
    <!-- 用户消息 -->
    <div
      v-if="message.sender === 'user'"
      class="flex flex-col items-end max-w-[80%]"
    >
      <div
        class="bg-blue-600 text-white rounded-2xl rounded-tr-sm px-4 py-2.5 shadow-md text-sm leading-relaxed"
      >
        {{ message.content }}
      </div>
      <span class="text-[9px] text-slate-300 mt-1 mr-1">{{ timeString }}</span>
    </div>

    <!-- AI 消息 -->
    <div v-else class="flex flex-col w-full items-start">
      <!-- 头像和名称 -->
      <div class="flex items-center mb-2">
        <div
          class="w-6 h-6 rounded-full bg-white border border-slate-100 shadow-sm flex items-center justify-center mr-2 shrink-0 overflow-hidden"
        >
          <img
            src="/src/assets/logo.png"
            alt="鸿小通"
            class="w-full h-full object-cover"
          />
        </div>
        <span class="text-[10px] text-slate-400">鸿小通 {{ timeString }}</span>
      </div>

      <!-- 加载状态 -->
      <div
        v-if="message.type === 'loading'"
        class="bg-white border border-slate-100 rounded-bl-2xl rounded-tr-2xl rounded-br-2xl p-4 shadow-sm"
      >
        <div class="flex items-center gap-2 text-slate-500 text-xs">
          <div className="relative w-5 h-5">
            <div
              className="absolute inset-0 border-2 border-blue-200 rounded-full"
            ></div>
            <div
              className="absolute inset-0 border-2 border-blue-600 rounded-full border-t-transparent animate-spin"
            ></div>
          </div>
          <div className="flex flex-col">
            <span
              className="text-xs font-bold text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-indigo-600 flex items-center gap-1"
            >
              正在思考...
            </span>
            <span className="text-[10px] text-slate-400">
              正在构建动态交互界面...
            </span>
          </div>
        </div>
      </div>

      <!-- A2UI 消息 -->
      <div v-else-if="message.type === 'a2ui'" class="flex flex-col gap-2">
        <!-- Markdown 内容气泡 -->
        <div
          v-if="message.content"
          class="bg-white px-4 py-2.5 rounded-bl-2xl rounded-tr-2xl rounded-br-2xl shadow-sm border border-slate-100"
        >
          <div
            class="prose prose-sm max-w-none text-slate-700 leading-relaxed"
            v-html="markdownHtml"
          />
        </div>

        <!-- A2UI 组件 -->
        <A2UIRenderer
          v-if="message.a2uiData"
          :data="message.a2uiData"
          @action-click="handleActionClick"
        />
      </div>

      <!-- 错误消息 -->
      <div
        v-else-if="message.type === 'error'"
        class="bg-red-50 text-red-700 px-4 py-2.5 rounded-bl-2xl rounded-tr-2xl rounded-br-2xl shadow-sm border border-red-100"
      >
        <p class="text-sm">{{ message.content }}</p>
      </div>

      <!-- 普通文本消息 -->
      <div
        v-else
        class="bg-white px-4 py-2.5 rounded-bl-2xl rounded-tr-2xl rounded-br-2xl shadow-sm border border-slate-100"
      >
        <p class="text-sm text-slate-700">{{ message.content }}</p>
      </div>
    </div>
  </div>
</template>

<script setup>
import { computed } from "vue";
import { Loader2 } from "lucide-vue-next";
import { marked } from "marked";
import A2UIRenderer from "../A2UIRenderer.vue";
import LoadingDots from "./LoadingDots.vue";

const props = defineProps({
  message: {
    type: Object,
    required: true,
  },
});

const emit = defineEmits(["action-click"]);

const timeString = computed(() => {
  if (!props.message.timestamp) return "";
  return new Date(props.message.timestamp).toLocaleTimeString([], {
    hour: "2-digit",
    minute: "2-digit",
  });
});

const markdownHtml = computed(() => {
  if (!props.message.content) return "";
  try {
    return marked(props.message.content, { breaks: true });
  } catch (error) {
    console.error("Markdown parsing error:", error);
    return props.message.content;
  }
});

const handleActionClick = (actionName, text, formState) => {
  emit("action-click", actionName, text, formState);
};
</script>

<style scoped>
@keyframes fade-in-up {
  from {
    opacity: 0;
    transform: translateY(10px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

.animate-fade-in-up {
  animation: fade-in-up 0.3s ease-out;
}

/* Markdown prose styles */
:deep(.prose) {
  color: #334155;
  font-size: 0.875rem;
  line-height: 1.75;
}

:deep(.prose p) {
  margin: 0.5em 0;
}

:deep(.prose p:first-child) {
  margin-top: 0;
}

:deep(.prose p:last-child) {
  margin-bottom: 0;
}

:deep(.prose strong) {
  font-weight: 600;
  color: #1e293b;
}

:deep(.prose em) {
  font-style: italic;
}

:deep(.prose code) {
  background-color: #f1f5f9;
  padding: 0.125rem 0.25rem;
  border-radius: 0.25rem;
  font-size: 0.8125rem;
  font-family: ui-monospace, monospace;
}

:deep(.prose pre) {
  background-color: #1e293b;
  color: #e2e8f0;
  padding: 1rem;
  border-radius: 0.5rem;
  overflow-x: auto;
  margin: 0.5em 0;
}

:deep(.prose pre code) {
  background-color: transparent;
  padding: 0;
  color: inherit;
}

:deep(.prose ul),
:deep(.prose ol) {
  margin: 0.5em 0;
  padding-left: 1.5em;
}

:deep(.prose li) {
  margin: 0.25em 0;
}

:deep(.prose a) {
  color: #2563eb;
  text-decoration: underline;
}

:deep(.prose a:hover) {
  color: #1d4ed8;
}

:deep(.prose h1),
:deep(.prose h2),
:deep(.prose h3),
:deep(.prose h4) {
  font-weight: 600;
  margin: 1em 0 0.5em;
  color: #1e293b;
}

:deep(.prose h1) {
  font-size: 1.25rem;
}

:deep(.prose h2) {
  font-size: 1.125rem;
}

:deep(.prose h3) {
  font-size: 1rem;
}

:deep(.prose blockquote) {
  border-left: 3px solid #cbd5e1;
  padding-left: 1rem;
  margin: 0.5em 0;
  color: #64748b;
  font-style: italic;
}
</style>
