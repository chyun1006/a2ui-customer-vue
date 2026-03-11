<template>
  <div
    class="w-full min-h-screen flex items-center justify-center p-4 bg-slate-50"
  >
    <div class="w-full max-w-sm space-y-2 mt-[-100px]">
      <div class="space-y-1.5">
        <label class="block text-sm font-medium text-slate-600">工号</label>
        <input
          v-model="workno"
          type="text"
          :class="[
            'w-full px-4 py-2.5 rounded-xl text-sm text-slate-800 placeholder-slate-400 bg-white shadow-sm focus:outline-none focus:ring-2 transition-shadow',
            worknoError
              ? 'border-2 border-red-400 focus:ring-red-500/30 focus:border-red-500'
              : 'border border-slate-200 focus:ring-emerald-500/30 focus:border-emerald-500',
          ]"
          placeholder="请输入工号"
          @input="worknoError = ''"
        />
        <p v-if="worknoError" class="text-xs text-red-500">{{ worknoError }}</p>
      </div>
      <div class="space-y-1.5">
        <label class="block text-sm font-medium text-slate-600">Agent</label>
        <select
          v-model="agentId"
          class="home-select w-full px-4 py-2.5 pr-10 border border-slate-200 rounded-xl text-sm text-slate-800 bg-white shadow-sm focus:outline-none focus:ring-2 focus:ring-emerald-500/30 focus:border-emerald-500 transition-shadow appearance-none cursor-pointer"
        >
          <option value="" disabled>请选择 Agent</option>
          <option
            v-for="opt in agentOptions"
            :key="opt.value"
            :value="opt.value"
          >
            {{ opt.label }}
          </option>
        </select>
      </div>
      <button
        type="button"
        style="margin-top: 40px"
        class="block w-full py-3 px-4 bg-gradient-to-r from-emerald-500 to-emerald-600 text-white text-center rounded-xl font-bold shadow-lg hover:shadow-xl transition-all hover:opacity-95 active:opacity-90"
        @click="goToChat"
      >
        进入 CoPaw 聊天 →
      </button>
    </div>
  </div>
</template>

<script setup>
import { ref } from "vue";
import { useRouter } from "vue-router";

const router = useRouter();
const workno = ref("");
const worknoError = ref("");
const agentId = ref("default");

const agentOptions = ref([
  { value: "asst_a00432", label: "CoPaw 智能体 (asst_a00432)" },
  { value: "default", label: "默认 Agent" },
]);

function goToChat() {
  const trimmed = workno.value?.trim() ?? "";
  if (!trimmed) {
    worknoError.value = "请填写工号后再进入聊天";
    return;
  }
  worknoError.value = "";
  router.push(
    `/agent-demo?workno=${encodeURIComponent(trimmed)}&agentId=${encodeURIComponent(agentId.value)}`,
  );
}
</script>

<style scoped>
.home-select {
  background-image: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' fill='none' viewBox='0 0 24 24' stroke='%2364748b'%3E%3Cpath stroke-linecap='round' stroke-linejoin='round' stroke-width='2' d='m19 9-7 7-7-7'/%3E%3C/svg%3E");
  background-size: 1.25rem;
  background-repeat: no-repeat;
  background-position: right 0.75rem center;
}
</style>
