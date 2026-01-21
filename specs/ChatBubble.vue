<script setup>
import { computed } from "vue";
import { User, Sparkles, Loader2 } from "lucide-vue-next";
import { marked } from "marked";
// import HongXiaoTongLogo from "./HongXiaoTongLogo.vue";
import HXTWidgetRenderer from "./HXTWidgetRenderer.vue";
import { a2uiRender } from "a2ui-vue";

const props = defineProps({
  message: {
    type: Object,
    required: true,
  },
});

console.log("ChatBubble message:", props.message.type, props.message);

const emit = defineEmits(["actionClick"]); // Propagate actions

// Handle action from A2UI components
const handleAction = (actionData) => {
  console.log("ChatBubble received action:", actionData);
  emit("actionClick", actionData);
};

const isUser = computed(() => props.message.sender === "USER");
const isAgent = computed(() => props.message.sender === "AGENT");
const isLoader = computed(() => props.message.type === "LOADER");

const rawTextHtml = computed(() => {
  if (!props.message.widgetPayload?.rawText) return "";
  try {
    return marked(props.message.widgetPayload.rawText, { breaks: true });
  } catch (error) {
    console.error("Markdown parsing error:", error);
    return props.message.widgetPayload.rawText;
  }
});

const timeString = computed(() => {
  if (!props.message.timestamp) return "";
  return new Date(props.message.timestamp).toLocaleTimeString([], {
    hour: "2-digit",
    minute: "2-digit",
  });
});
</script>

<template>
  <div
    class="mb-6 flex w-full animate-fade-in-up"
    :class="isUser ? 'justify-end' : 'justify-start'"
  >
    <!-- User Avatar (Right) -->
    <!-- Not strictly needed as per most chat UIs, usually just bubble. React code doesn't show user avatar?
         Checked React code: NO user avatar shown, just bubble. Agent HAS avatar.
    -->

    <!-- Agent Avatar (Left) -->
    <!-- <div
      v-if="isAgent || isLoader"
      class="w-8 h-8 rounded-full bg-white border border-slate-100 shadow-sm flex items-center justify-center mr-2 shrink-0 overflow-hidden"
    >
      <img src="@/assets/logo.png" alt="" srcset="" />
    </div> -->

    <!-- Message Content -->
    <div class="flex flex-col w-full" :class="isUser ? 'items-end' : 'items-start'">
      <div class="flex items-center mb-2">
        <div
          v-if="isAgent || isLoader"
          class="w-6 h-6 rounded-full bg-white border border-slate-100 shadow-sm flex items-center justify-center mr-2 shrink-0 overflow-hidden"
        >
          <img src="@/assets/logo.png" alt="" srcset="" />
        </div>
        <span v-if="isAgent" class="text-[10px] text-slate-400">鸿小通 {{ timeString }}</span>
      </div>

      <!-- Loader -->
      <div
        v-if="isLoader"
        class="bg-white border border-slate-100 rounded-bl-2xl rounded-tr-2xl rounded-br-2xl p-4 shadow-sm"
      >
        <div class="flex items-center gap-2 text-slate-500 text-xs">
          <Loader2 class="w-4 h-4 animate-spin text-blue-500" />
          <span>正在思考...</span>
        </div>
      </div>

      <!-- User Text Bubble -->
      <div
        v-else-if="isUser"
        class="bg-blue-600 text-white rounded-2xl rounded-tr-sm px-4 py-2.5 shadow-md text-sm leading-relaxed"
      >
        {{ message.content }}
      </div>

      <!-- Agent Widget/Content -->
      <div v-else class="flex flex-col gap-2">
        <!-- Thought/Reasoning (Optional) -->
        <div
          v-if="message.thought"
          class="flex bg-indigo-50/50 rounded-xl p-3 gap-1 border border-indigo-100/50 inline-block w-full"
        >
          <div class="flex items-center gap-1.5">
            <Sparkles class="w-3 h-3 text-indigo-400" />
            <!-- <span class="text-[10px] font-bold text-indigo-400 uppercase tracking-wide"
              >思考中...</span
            > -->
          </div>
          <p class="text-[11px] text-indigo-800/80 leading-relaxed italic">{{ message.thought }}</p>
        </div>

        <!-- Main Content -->
        <div class="bg-white border-slate-200 overflow-hidden">
          <!-- Widget Header -->
          <!-- <div
            v-if="message.widgetPayload?.title"
            class="px-4 py-2 border-b border-slate-50 bg-slate-50/30 flex justify-between items-center"
          >
            <span class="text-xs font-bold text-slate-500">{{ message.widgetPayload.title }}</span>
          </div> -->

          <!-- Render Widget Root Node -->

          <div
            v-if="
              message.content ||
              message.widgetPayload?.surfaces?.length ||
              message.widgetPayload?.rawText
            "
            class="bg-white border border-slate-100 rounded-bl-2xl rounded-tr-2xl rounded-br-2xl p-4 shadow-sm mb-2"
          >
            <div class="items-center gap-2 text-slate-500 text-xs">
              <!-- <Loader2 class="w-4 h-4 animate-spin text-blue-500" /> -->
              <span class="text-xs font-bold text-slate-500">{{ message.content }}</span>
              <div
                v-if="message.widgetPayload?.rawText"
                class="prose prose-sm max-w-none text-slate-700 leading-7"
                v-html="rawTextHtml"
              />
            </div>
          </div>
        </div>
      </div>

      <a2uiRender
        v-if="message.widgetPayload?.surfaces"
        :surfaceList="message.widgetPayload.surfaces"
        @action="handleAction"
      ></a2uiRender>
      <!-- User timestamp (Right) -->
      <span v-if="isUser" class="text-[9px] text-slate-300 mt-1 mr-1">{{ timeString }}</span>
    </div>
  </div>
</template>
