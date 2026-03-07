<template>
  <div
    class="mb-6 flex w-full min-w-0 animate-fade-in-up"
    :class="isUser ? 'justify-end' : 'justify-start'"
  >
    <!-- 用户消息 -->
    <div v-if="isUser" class="flex flex-col items-end max-w-[80%]">
      <div
        class="bg-blue-600 text-white rounded-2xl rounded-tr-sm px-4 py-2.5 shadow-md text-sm leading-relaxed"
      >
        {{ mainText }}
      </div>
      <span class="text-[9px] text-slate-300 mt-1 mr-1">{{ timeString }}</span>
    </div>

    <!-- AI 消息 -->
    <div v-else class="flex flex-col w-full max-w-full min-w-0 items-start">
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

      <!-- 加载状态：刚开始流式、还没有任何文本和 UI 时 -->
      <div
        v-if="showLoadingBubble"
        class="bg-white border border-slate-100 rounded-bl-2xl rounded-tr-2xl rounded-br-2xl p-4 shadow-sm"
      >
        <div class="flex items-center gap-2 text-slate-500 text-xs">
          <div class="relative w-5 h-5">
            <div
              class="absolute inset-0 border-2 border-blue-200 rounded-full"
            ></div>
            <div
              class="absolute inset-0 border-2 border-blue-600 rounded-full border-t-transparent animate-spin"
            ></div>
          </div>
          <div class="flex flex-col">
            <span
              class="text-xs font-bold text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-indigo-600 flex items-center gap-1"
            >
              正在思考...
            </span>
          </div>
        </div>
      </div>

      <!-- 富 UI 消息（Spec 或 A2UI） -->
      <div v-else-if="hasSpec || message.type === 'a2ui'" class="w-full max-w-full min-w-0">
        <!-- 文字气泡：流式时逐字揭示，结束后 Markdown -->
        <div
          v-if="displayText"
          class="bg-white px-4 py-2.5 rounded-bl-2xl rounded-tr-2xl rounded-br-2xl shadow-sm border border-slate-100 mb-2 min-w-0 max-w-full"
        >
          <div
            v-if="isStreaming"
            class="text-sm text-slate-700 leading-relaxed whitespace-pre-wrap"
          >
            {{ revealedText }}
          </div>
          <div
            v-else
            class="prose prose-sm max-w-none text-slate-700 leading-relaxed"
            v-html="markdownHtml"
          />
        </div>

        <div class="jr-chat-spec w-full max-w-full min-w-0 overflow-x-auto">
          <SpecRender
            v-if="hasSpec"
            :spec="streamingSpec || message.spec"
            :loading="isStreaming"
          />
        </div>
      </div>

      <!-- 错误消息 -->
      <div
        v-else-if="message.type === 'error'"
        class="bg-red-50 text-red-700 px-4 py-2.5 rounded-bl-2xl rounded-tr-2xl rounded-br-2xl shadow-sm border border-red-100"
      >
        <p class="text-sm">{{ message.content }}</p>
      </div>

      <!-- 普通文本消息（含流式） -->
      <div v-else class="flex flex-col items-start gap-1">
        <div
          class="bg-white px-4 py-2.5 rounded-bl-2xl rounded-tr-2xl rounded-br-2xl shadow-sm border border-slate-100"
        >
          <p class="text-sm text-slate-700 whitespace-pre-wrap">
            {{ revealedText }}
          </p>
        </div>
      </div>
      <!-- 流式回答时，在文本气泡下方显示更柔和的 Loading 效果 -->
      <div
        v-if="isStreaming && !showLoadingBubble"
        class="mt-1 px-2 py-0.5 flex items-center gap-1 ml-1"
      >
        <span class="text-[10px] text-slate-400">正在生成</span>
        <LoadingDots class="scale-75" />
      </div>
    </div>
  </div>
</template>

<script setup>
import { computed, ref, watch, onBeforeUnmount } from "vue";
import { marked } from "marked";
import { SpecRender } from "../renderer";
import LoadingDots from "./LoadingDots.vue";

const props = defineProps({
  message: {
    type: Object,
    required: true,
  },
  isStreaming: {
    type: Boolean,
    default: false,
  },
  currentText: {
    type: String,
    default: "",
  },
  streamingSpec: {
    type: Object,
    default: null,
  },
});

const emit = defineEmits(["action-click"]);

const isUser = computed(() => {
  const m = props.message || {};
  if (m.role) {
    return m.role === "user";
  }
  return m.sender === "user";
});

const timeString = computed(() => {
  if (!props.message.timestamp) return "";
  return new Date(props.message.timestamp).toLocaleTimeString([], {
    hour: "2-digit",
    minute: "2-digit",
  });
});

const mainText = computed(() => {
  const m = props.message || {};
  return m.content || m.text || "";
});

// 流式时优先显示 currentText（SSE 实时内容），否则显示消息里的 mainText
const displayText = computed(() => {
  if (
    props.isStreaming &&
    props.currentText !== undefined &&
    props.currentText !== ""
  ) {
    return props.currentText;
  }
  return mainText.value;
});

const hasSpec = computed(() => {
  return !!(props.streamingSpec || (props.message && props.message.spec));
});

// 是否展示顶部「正在思考」骨架气泡：仅在流式开始阶段、还没有任何文本和 UI 时出现
const showLoadingBubble = computed(() => {
  return props.isStreaming && !displayText.value && !hasSpec.value;
});

const markdownHtml = computed(() => {
  const raw = displayText.value;
  if (!raw) return "";
  try {
    return marked(raw, { breaks: true });
  } catch (error) {
    console.error("Markdown parsing error:", error);
    return raw;
  }
});

// 流式逐字揭示：仅用「已揭示长度」+ rAF 追赶，不依赖 TypeIt，无 destroy/分支切换问题
const revealedLength = ref(0);
const CHAR_REVEAL_INTERVAL_MS = 25;
let rafId = 0;
let lastRevealTime = 0;

const revealedText = computed(() => {
  const text = displayText.value;
  if (props.isStreaming) {
    return text.slice(0, revealedLength.value);
  }
  return text;
});

watch(
  () => props.isStreaming,
  (streaming) => {
    if (streaming) {
      revealedLength.value = 0;
    } else {
      revealedLength.value = displayText.value.length;
      if (rafId) {
        cancelAnimationFrame(rafId);
        rafId = 0;
      }
    }
  },
);

watch(
  [displayText, () => props.isStreaming],
  () => {
    if (!props.isStreaming) return;
    if (revealedLength.value >= displayText.value.length) return;
    if (rafId !== 0) return;
    lastRevealTime = 0;
    function tick(now) {
      if (!props.isStreaming) {
        rafId = 0;
        return;
      }
      const targetLen = displayText.value.length;
      if (revealedLength.value >= targetLen) {
        rafId = 0;
        return;
      }
      if (lastRevealTime === 0) lastRevealTime = now;
      const elapsed = now - lastRevealTime;
      if (elapsed >= CHAR_REVEAL_INTERVAL_MS) {
        revealedLength.value = Math.min(
          revealedLength.value + Math.max(1, Math.floor(elapsed / CHAR_REVEAL_INTERVAL_MS)),
          targetLen,
        );
        lastRevealTime = now;
      }
      rafId = requestAnimationFrame(tick);
    }
    rafId = requestAnimationFrame(tick);
  },
  { flush: "post" },
);

onBeforeUnmount(() => {
  if (rafId) {
    cancelAnimationFrame(rafId);
    rafId = 0;
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
  margin: 0.5em 0;
  max-width: 100%;
  overflow-x: auto;
  white-space: pre-wrap;
  word-break: break-word;
}

:deep(.prose pre code) {
  background-color: transparent;
  padding: 0;
  color: inherit;
  white-space: inherit;
  word-break: inherit;
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
