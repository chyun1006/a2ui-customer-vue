<template>
  <div
    class="w-full bg-white rounded-2xl shadow-sm border border-slate-100 overflow-hidden animate-fade-in-up"
  >
    <!-- Header -->
    <div
      class="bg-slate-50/50 px-4 py-2.5 flex items-center gap-1.5 border-b border-slate-100"
    >
      <component :is="Sparkles" class="w-3.5 h-3.5 text-blue-500" />
      <span class="text-slate-800 font-bold text-[13px] tracking-tight">
        {{ data.title }}
      </span>
    </div>

    <div v-if="data.analysis" class="px-4 pt-2.5 text-slate-500 text-[12px]">
      {{ data.analysis }}
    </div>

    <!-- Content -->
    <div class="p-4">
      <RenderNode
        v-if="data.uiNode"
        :node="data.uiNode"
        :form-state="formState"
        @update:form-state="updateFormState"
        @action-click="handleActionClick"
      />
    </div>
  </div>
</template>

<script setup>
import { reactive, h } from "vue";
import { Sparkles } from "lucide-vue-next";
import DynamicContainer from "./atoms/DynamicContainer.vue";
import DynamicText from "./atoms/DynamicText.vue";
import DynamicButton from "./atoms/DynamicButton.vue";
import DynamicInput from "./atoms/DynamicInput.vue";
import DynamicSelect from "./atoms/DynamicSelect.vue";
import DynamicTextarea from "./atoms/DynamicTextarea.vue";
import DynamicDatePicker from "./atoms/DynamicDatePicker.vue";
import DynamicChart from "./atoms/DynamicChart.vue";
import DynamicIcon from "./atoms/DynamicIcon.vue";
import DynamicBadge from "./atoms/DynamicBadge.vue";
import DynamicDivider from "./atoms/DynamicDivider.vue";

const props = defineProps({
  data: {
    type: Object,
    required: true,
  },
});

const emits = defineEmits(["action-click"]);

// 表单状态管理
const formState = reactive({});

// 更新表单状态
const updateFormState = (name, value) => {
  formState[name] = value;
};

// 处理按钮点击
const handleActionClick = (actionName, text) => {
  console.log("=== 表单提交 ===");
  console.log("操作:", actionName);
  console.log("按钮文本:", text);
  console.log("表单数据:", JSON.stringify(formState, null, 2));
  console.log("================");
  emits("action-click", actionName, text, formState);
};

// 组件映射
const componentMap = {
  container: DynamicContainer,
  text: DynamicText,
  button: DynamicButton,
  input: DynamicInput,
  select: DynamicSelect,
  textarea: DynamicTextarea,
  datepicker: DynamicDatePicker,
  chart: DynamicChart,
  icon: DynamicIcon,
  badge: DynamicBadge,
  divider: DynamicDivider,
};

// 递归渲染节点
const RenderNode = {
  name: "RenderNode",
  props: {
    node: {
      type: Object,
      required: true,
    },
    formState: {
      type: Object,
      required: true,
    },
  },
  emits: ["update:form-state", "action-click"],
  setup(props, { emit }) {
    return () => {
      const { node = {} } = props || {};
      const { type, props: nodeProps = {}, style = {}, children } = node || {};
      const { className } = style || {};

      // 获取对应的组件
      const component = componentMap[type];
      if (!component) return null;

      // 准备组件属性
      const componentProps = {
        ...nodeProps,
        className,
      };

      // 处理表单组件的双向绑定
      if (
        type === "input" ||
        type === "select" ||
        type === "textarea" ||
        type === "datepicker"
      ) {
        const fieldName = nodeProps.name || nodeProps.label || "";

        // 如果 props 中有 value 且 formState 中还没有值,则使用 props.value 作为初始值
        if (
          nodeProps.value !== undefined &&
          nodeProps.value !== null &&
          !props.formState[fieldName]
        ) {
          props.formState[fieldName] = nodeProps.value;
        }

        componentProps.modelValue = props.formState[fieldName] || "";
        componentProps["onUpdate:modelValue"] = (value) => {
          emit("update:form-state", fieldName, value);
        };
      }

      // 处理按钮点击事件
      if (type === "button") {
        componentProps.onActionClick = (actionName, text) => {
          emit("action-click", actionName, text);
        };
      }

      // 渲染子节点
      const childNodes = children?.map((child, idx) =>
        h(RenderNode, {
          key: child.id || idx,
          node: child,
          formState: props.formState,
          "onUpdate:formState": (name, value) =>
            emit("update:form-state", name, value),
          onActionClick: (actionName, text) =>
            emit("action-click", actionName, text),
        }),
      );

      return h(component, componentProps, () => childNodes);
    };
  },
};
</script>
