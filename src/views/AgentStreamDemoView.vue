<template>
  <div
    class="flex flex-col h-screen bg-slate-50 relative shadow-2xl overflow-hidden"
  >
    <!-- 消息列表 -->
    <main
      ref="messagesContainer"
      class="flex-1 overflow-y-auto no-scrollbar p-4 pb-32"
    >
      <ChatBubble
        v-for="msg in messages"
        :key="msg.id"
        :message="msg"
        :is-streaming="
          isStreaming &&
          msg.role === 'assistant' &&
          msg.id === messages[messages.length - 1]?.id
        "
        :current-text="
          isStreaming &&
          msg.role === 'assistant' &&
          msg.id === messages[messages.length - 1]?.id
            ? currentText
            : ''
        "
        :streaming-spec="
          isStreaming &&
          msg.role === 'assistant' &&
          msg.id === messages[messages.length - 1]?.id
            ? streamingSpec
            : null
        "
        @action-click="handleChatAction"
      />
      <div ref="messagesEnd" />
    </main>

    <!-- 底部输入区域 -->
    <footer class="absolute bottom-0 left-0 right-0 pointer-events-none">
      <!-- 快捷菜单 -->
      <div
        class="flex items-center justify-between px-4 pb-2 pt-2 pointer-events-auto"
      >
        <div
          class="flex-1 overflow-x-auto no-scrollbar flex items-center gap-2 py-1"
        >
          <button
            v-for="item in quickActions"
            :key="item.id"
            @click="handleQuickAction(item.label)"
            class="relative flex-shrink-0 bg-white/90 backdrop-blur-sm border border-slate-200 px-3 py-1.5 rounded-full text-[11px] font-bold text-slate-600 shadow-sm active:scale-95 transition-all hover:border-blue-300 hover:text-blue-600"
          >
            {{ item.label }}
            <!-- Badge 数字 -->
            <span
              v-if="item.showBadge && item.badge > 0"
              class="absolute -top-1 -right-1 bg-red-500 text-white text-[9px] font-bold rounded-full min-w-[16px] h-4 flex items-center justify-center px-1"
            >
              {{ item.badge > 99 ? "99+" : item.badge }}
            </span>
          </button>
        </div>
      </div>

      <!-- 输入框 -->
      <div
        class="bg-white border-t border-slate-100 shadow-lg pointer-events-auto"
      >
        <ChatInput :disabled="isStreaming" @send="handleSendMessage" />
      </div>
    </footer>
  </div>
</template>

<script setup>
import { ref, nextTick, onMounted, watch } from "vue";
import ChatBubble from "../components/chat/ChatBubble.vue";
import ChatInput from "../components/chat/ChatInput.vue";
import { getApprovalCount, getUserInfo } from "../api/chat";
import { FUNCTION_ITEMS } from "../constants";
import { useRoute } from "vue-router";
import { useChatStream } from "../composables/useChatStream";

const route = useRoute();
const workno = route.query.workno;

// 聊天流式状态（复用 /api/chat + useChatStream）
const {
  messages,
  currentText,
  spec: streamingSpec,
  isStreaming,
  send,
} = useChatStream("/api/chat");

// 其他页面状态
const messagesEnd = ref(null);
const quickActions = ref(FUNCTION_ITEMS);

// 将 json-render 内部的表单提交 action 与聊天发送打通
if (typeof window !== "undefined") {
  window.__VIBE_ACTION__ = (actionName, text, formState) => {
    const title = text || actionName || "表单提交";
    let content = title;
    if (formState && typeof formState === "object") {
      content += "\n\n表单数据：" + JSON.stringify(formState, null, 2);
    }
    send(content);
  };
}

// 初始化欢迎语 & 业务角标
onMounted(async () => {
  const userInfo = await getUserInfo(workno);
  const message = `您好，这里是 CoPaw 智能体为您服务。`;

  messages.value.push({
    id: `assistant-welcome-${Date.now()}`,
    role: "assistant",
    text: message,
    spec: null,
  });
  scrollToBottom();

  if (workno) {
    await fetchApprovalCount();
  }
});

// 滚动到底部
const scrollToBottom = () => {
  nextTick(() => {
    messagesEnd.value?.scrollIntoView({ behavior: "smooth" });
  });
};

// 消息变化时保持滚动到底部
watch(
  messages,
  () => {
    scrollToBottom();
  },
  { deep: true },
);

// 获取待审核数量
const fetchApprovalCount = async () => {
  try {
    const result = await getApprovalCount(workno);
    if (result.success) {
      const approvalItem = quickActions.value.find(
        (item) => item.label === "待我审核",
      );
      if (approvalItem) {
        approvalItem.badge = result.data || 0;
      }
    }
  } catch (error) {
    // eslint-disable-next-line no-console
    console.error("获取待审核数量失败:", error);
  }
};

// 处理快捷操作
const handleQuickAction = (label) => {
  send(String(label ?? ""));
};

// 处理消息中的按钮
const handleChatAction = (actionName, text, formState) => {
  const title = text || actionName || "表单提交";
  let content = title;
  if (formState && typeof formState === "object") {
    content += "\n\n表单数据：" + JSON.stringify(formState, null, 2);
  }
  send(content);
};

// 处理发送消息
const handleSendMessage = (message) => {
  send(message);
};
</script>

<style scoped>
.no-scrollbar::-webkit-scrollbar {
  display: none;
}
.no-scrollbar {
  -ms-overflow-style: none;
  scrollbar-width: none;
}
</style>
