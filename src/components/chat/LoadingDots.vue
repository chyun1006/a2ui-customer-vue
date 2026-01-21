<template>
  <div class="flex items-center justify-center gap-1">
    <div 
      v-for="i in 3" 
      :key="i"
      class="w-2 h-2 bg-slate-400 rounded-full animate-bounce"
      :style="{ animationDelay: `${(i - 1) * 0.15}s` }"
    />
  </div>
</template>

<script setup>
// 加载动画组件
</script>

<style scoped>
@keyframes bounce {
  0%, 80%, 100% {
    transform: translateY(0);
  }
  40% {
    transform: translateY(-8px);
  }
}

.animate-bounce {
  animation: bounce 1s infinite;
}
</style>
