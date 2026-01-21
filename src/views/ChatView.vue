<template>
  <div
    class="flex flex-col h-screen bg-slate-50 relative shadow-2xl overflow-hidden"
  >
    <!-- 顶部导航栏 -->
    <!-- <header class="flex items-center justify-between px-4 py-3 bg-white border-b border-slate-100 sticky top-0 z-20 shadow-sm">
      <router-link
        to="/"
        class="p-2 hover:bg-slate-100 rounded-full transition-colors"
      >
        <component :is="ArrowLeft" class="w-5 h-5 text-slate-700" />
      </router-link>
      
      <div class="flex items-center gap-2">
        <img src="/src/assets/logo.png" alt="鸿小通" class="w-8 h-8" />
        <span class="font-bold text-lg text-slate-800">鸿小通</span>
      </div>
      
      <div class="w-9" />
    </header> -->

    <!-- 消息列表 -->
    <main
      ref="messagesContainer"
      class="flex-1 overflow-y-auto no-scrollbar p-4 pb-32"
    >
      <ChatBubble
        v-for="msg in messages"
        :key="msg.id"
        :message="msg"
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
        <ChatInput :disabled="isLoading" @send="handleSendMessage" />
      </div>
    </footer>
  </div>
</template>

<script setup>
import { ref, nextTick, onMounted } from "vue";
import { ArrowLeft, Sparkles } from "lucide-vue-next";
import ChatBubble from "../components/chat/ChatBubble.vue";
import ChatInput from "../components/chat/ChatInput.vue";
import {
  sendChatMessage,
  generateSessionId,
  getApprovalCount,
} from "../api/chat";
import { FUNCTION_ITEMS } from "../constants";
import { useRoute } from "vue-router";
const route = useRoute();
const workno = route.query.workno;

// 状态管理
const messages = ref([]);
const isLoading = ref(false);
const sessionId = ref("");
const messagesContainer = ref(null);
const messagesEnd = ref(null);
const quickActions = ref(FUNCTION_ITEMS);

// 初始化
onMounted(async () => {
  sessionId.value = generateSessionId();

  // 添加欢迎消息
  messages.value.push({
    id: Date.now().toString(),
    sender: "ai",
    type: "text",
    content: "您好,我是鸿小通。请问有什么可以帮您?",
    timestamp: new Date(),
  });

  // 获取待审核数量
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
    console.error("获取待审核数量失败:", error);
  }
};

// 处理快捷操作
const handleQuickAction = (label) => {
  handleSendMessage(label);
};

// 处理消息中的按钮
const handleChatAction = (actionName, text, formState) => {
  // 添加用户消息
  const loadingId = genUserMessage(text);
  const payload = {
    name: actionName,
    context: {
      submitted_text: formState,
    },
  };
  sendMessage(payload, loadingId);
};

// 处理发送消息
const handleSendMessage = async (message) => {
  const loadingId = genUserMessage(message);

  const payload = {
    name: "user_input",
    context: {
      submitted_text: message,
    },
  };
  sendMessage(payload, loadingId);
};

// 生成用户信息
const genUserMessage = (message) => {
  const userMessage = {
    id: Date.now().toString(),
    sender: "user",
    type: "text",
    content: message,
    timestamp: new Date(),
  };
  messages.value.push(userMessage);
  scrollToBottom();

  // 添加加载状态
  const loadingId = "loading_" + Date.now();
  messages.value.push({
    id: loadingId,
    sender: "ai",
    type: "loading",
    timestamp: new Date(),
  });
  scrollToBottom();
  return loadingId;
};

const sendMessage = async (payload, loadingId) => {
  try {
    isLoading.value = true;
    // 调用 API
    const response = await sendChatMessage(payload, sessionId.value, workno);

    const { success, message } = response || {};
    const [rawText, a2uiText] = message.split("---a2ui_JSON---");

    // 移除加载消息
    messages.value = messages.value.filter((m) => m.id !== loadingId);

    if (success) {
      const a2ui = a2uiText ? JSON.parse(a2uiText) : null;
      // 添加 A2UI 消息
      messages.value.push({
        id: Date.now().toString(),
        sender: "ai",
        type: "a2ui",
        a2uiData: a2ui,
        content: rawText,
        timestamp: new Date(),
      });
    } else {
      // 添加错误消息
      messages.value.push({
        id: Date.now().toString(),
        sender: "ai",
        type: "error",
        content: rawText || "抱歉,服务响应异常,请稍后重试。",
        timestamp: new Date(),
      });
    }
  } catch (error) {
    // 移除加载消息
    messages.value = messages.value.filter((m) => m.id !== loadingId);

    // 添加错误消息
    messages.value.push({
      id: Date.now().toString(),
      sender: "ai",
      type: "error",
      content: `网络连接错误: ${error.message}`,
      timestamp: new Date(),
    });
  } finally {
    isLoading.value = false;
    scrollToBottom();
  }
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
