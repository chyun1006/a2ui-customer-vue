<template>
  <div class="flex items-center justify-center gap-1">
    <div
      v-for="i in 3"
      :key="i"
      class="w-1.5 h-1.5 bg-slate-400 rounded-full animate-dot-fade"
      :style="{ animationDelay: `${(i - 1) * 0.18}s` }"
    />
  </div>
</template>

<script setup>
// 加载动画组件
</script>

<style scoped>
@keyframes dot-fade {
  0% {
    opacity: 0.1;
    transform: translateY(0);
  }
  30% {
    opacity: 1;
    transform: translateY(-1px);
  }
  60% {
    opacity: 0.6;
    transform: translateY(0);
  }
  100% {
    opacity: 0.1;
    transform: translateY(0);
  }
}

.animate-dot-fade {
  animation: dot-fade 1s infinite ease-in-out;
}
</style>
