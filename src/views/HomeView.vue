<template>
  <div class="w-full p-4">
    <div class="mb-6 text-center">
      <h1 class="text-2xl font-bold text-slate-800 mb-2">A2UI 动态渲染器</h1>
      <p class="text-sm text-slate-500">基于 JSON 协议的动态 UI 渲染系统</p>
    </div>

    <div class="mb-4">
      <A2UIRenderer :data="currentData" />
    </div>

    <div class="flex gap-3 mb-4">
      <button
        @click="currentData = formData"
        :class="[
          'flex-1 py-2 px-4 rounded-lg font-medium transition-colors',
          currentData === formData
            ? 'bg-blue-600 text-white'
            : 'bg-white text-slate-700 border border-slate-200',
        ]"
      >
        表单示例
      </button>
      <button
        @click="currentData = loginData"
        :class="[
          'flex-1 py-2 px-4 rounded-lg font-medium transition-colors',
          currentData === loginData
            ? 'bg-blue-600 text-white'
            : 'bg-white text-slate-700 border border-slate-200',
        ]"
      >
        登录示例
      </button>
      <button
        @click="currentData = datePickerData"
        :class="[
          'flex-1 py-2 px-4 rounded-lg font-medium transition-colors',
          currentData === datePickerData
            ? 'bg-blue-600 text-white'
            : 'bg-white text-slate-700 border border-slate-200',
        ]"
      >
        日期选择
      </button>
    </div>

    <router-link
      to="/chat"
      class="block w-full py-3 px-4 bg-gradient-to-r from-blue-600 to-blue-700 text-white text-center rounded-xl font-bold shadow-lg hover:shadow-xl transition-all"
    >
      进入聊天模式 →
    </router-link>
  </div>
</template>

<script setup>
import { ref } from "vue";
import A2UIRenderer from "../components/A2UIRenderer.vue";

const loginData = {
  version: "0.8",
  title: "欢迎回来",
  analysis: "建议使用手机验证码登录,安全性更高且无需记忆密码。",
  uiNode: {
    id: "login_root",
    type: "container",
    style: {
      className:
        "flex flex-col gap-6 p-6 max-w-sm mx-auto bg-white rounded-3xl shadow-xl border border-slate-50",
    },
    children: [
      {
        id: "brand_header",
        type: "container",
        style: { className: "flex flex-col items-center gap-2 mb-2" },
        children: [
          {
            id: "logo_icon",
            type: "icon",
            props: { iconName: "ShieldCheck" },
            style: {
              className: "w-12 h-12 text-blue-600 bg-blue-50 p-2 rounded-2xl",
            },
          },
          {
            id: "welcome_text",
            type: "text",
            props: { text: "登录您的账号", usageHint: "h2" },
            style: { className: "font-extrabold text-slate-900" },
          },
        ],
      },
      {
        id: "form_fields",
        type: "container",
        style: { className: "flex flex-col gap-4" },
        children: [
          {
            id: "input_phone",
            type: "input",
            props: {
              label: "手机号码",
              name: "phoneNumber",
              placeholder: "请输入11位手机号",
              iconName: "Phone",
            },
          },
          {
            id: "otp_container",
            type: "container",
            style: { className: "flex gap-2 items-end" },
            children: [
              {
                id: "input_otp",
                type: "input",
                props: {
                  label: "验证码",
                  name: "otp_code",
                  placeholder: "6位数字",
                  iconName: "Lock",
                },
                style: { className: "flex-1" },
              },
              {
                id: "btn_get_otp",
                type: "button",
                props: {
                  text: "获取验证码",
                  actionName: "SEND_OTP",
                  variant: "secondary",
                },
                style: {
                  className:
                    "h-[38px] px-3 whitespace-nowrap bg-slate-100 text-slate-600 text-[10px]",
                },
              },
            ],
          },
        ],
      },
      {
        id: "action_area",
        type: "container",
        style: { className: "flex flex-col gap-3 mt-2" },
        children: [
          {
            id: "btn_login",
            type: "button",
            props: {
              text: "进入系统",
              actionName: "SUBMIT_LOGIN",
              variant: "primary",
            },
            style: {
              className:
                "w-full py-3 bg-blue-600 text-white rounded-xl font-bold shadow-lg shadow-blue-200",
            },
          },
          {
            id: "divider_or",
            type: "container",
            style: { className: "flex items-center gap-4 my-2" },
            children: [
              { id: "line_l", type: "divider", style: { className: "flex-1" } },
              {
                id: "or_text",
                type: "text",
                props: { text: "其他方式", usageHint: "caption" },
                style: { className: "text-slate-400" },
              },
              { id: "line_r", type: "divider", style: { className: "flex-1" } },
            ],
          },
          {
            id: "btn_switch_register",
            type: "button",
            props: {
              text: "没有账号?立即注册",
              actionName: "SWITCH_TO_REGISTER",
              variant: "ghost",
            },
            style: { className: "text-blue-500 font-medium" },
          },
        ],
      },
    ],
  },
};

const formData = {
  version: "0.1",
  title: "航后检查表单",
  analysis: "",
  uiNode: {
    id: "root",
    type: "container",
    style: {
      className:
        "flex flex-col gap-4 p-5 bg-white rounded-2xl border border-slate-100 shadow-sm",
    },
    children: [
      {
        id: "header_section",
        type: "container",
        style: { className: "flex justify-between items-center" },
        children: [
          {
            id: "title_text",
            type: "text",
            props: { text: "A6-8892 航后检查", usageHint: "h2" },
            style: { className: "font-bold text-slate-800" },
          },
          {
            id: "status_badge",
            type: "badge",
            props: { text: "进行中", variant: "warning" },
            style: {
              className:
                "bg-amber-100 text-amber-700 px-2 py-0.5 rounded-full text-[10px] font-bold",
            },
          },
        ],
      },
      { id: "sep_1", type: "divider", style: { className: "my-1" } },
      {
        id: "form_section",
        type: "container",
        style: { className: "flex flex-col gap-3" },
        children: [
          {
            id: "input_technician",
            type: "input",
            props: {
              label: "负责人",
              name: "technician_name",
              placeholder: "请输入姓名",
              iconName: "User",
            },
          },
          {
            id: "select_location",
            type: "select",
            props: {
              label: "作业机位",
              name: "gate_id",
              placeholder: "请选择机位",
              options: [
                { label: "201 远机位", value: "201" },
                { label: "15 桥位", value: "15" },
                { label: "502 库内", value: "502" },
              ],
            },
          },
          {
            id: "textarea_findings",
            type: "textarea",
            props: {
              label: "检查发现 (Findings)",
              name: "findings_detail",
              placeholder: "若发现渗油、磨损请详细记录...",
              rows: 4,
            },
          },
        ],
      },
      {
        id: "tool_info",
        type: "container",
        style: {
          className: "flex items-center gap-2 p-3 bg-slate-50 rounded-lg",
        },
        children: [
          {
            id: "info_icon",
            type: "icon",
            props: { iconName: "Info" },
            style: { className: "text-blue-500 w-4 h-4" },
          },
          {
            id: "info_text",
            type: "text",
            props: {
              text: "请确保所有借出工具已清点归还。",
              usageHint: "caption",
            },
          },
        ],
      },
      {
        id: "footer_actions",
        type: "container",
        style: { className: "flex gap-3 mt-2" },
        children: [
          {
            id: "btn_cancel",
            type: "button",
            props: {
              text: "暂存",
              actionName: "SAVE_DRAFT",
              variant: "secondary",
              iconName: "Save",
            },
            style: { className: "flex-1" },
          },
          {
            id: "btn_submit",
            type: "button",
            props: {
              text: "提交签发",
              actionName: "SUBMIT_REPORT",
              variant: "primary",
              iconName: "CheckCircle",
            },
            style: { className: "flex-[2] bg-blue-600 text-white" },
          },
        ],
      },
    ],
  },
};

const datePickerData = {
  version: "0.8",
  title: "机票预订",
  analysis: "请选择您的出行日期,系统将为您查询最优航班。",
  uiNode: {
    id: "booking_root",
    type: "container",
    style: {
      className:
        "flex flex-col gap-5 p-6 max-w-md mx-auto bg-white rounded-3xl shadow-xl border border-slate-50",
    },
    children: [
      {
        id: "header",
        type: "container",
        style: { className: "flex flex-col items-center gap-2 mb-2" },
        children: [
          {
            id: "icon",
            type: "icon",
            props: { iconName: "Plane" },
            style: {
              className: "w-12 h-12 text-blue-600 bg-blue-50 p-2 rounded-2xl",
            },
          },
          {
            id: "title",
            type: "text",
            props: { text: "预订公务机票", usageHint: "h2" },
            style: { className: "font-extrabold text-slate-900" },
          },
        ],
      },
      {
        id: "form_section",
        type: "container",
        style: { className: "flex flex-col gap-4" },
        children: [
          {
            id: "input_from",
            type: "input",
            props: {
              label: "出发城市",
              name: "from_city",
              placeholder: "请输入城市名称",
              iconName: "MapPin",
            },
          },
          {
            id: "input_to",
            type: "input",
            props: {
              label: "到达城市",
              name: "to_city",
              placeholder: "请输入城市名称",
              iconName: "MapPinned",
            },
          },
          {
            id: "date_departure",
            type: "datepicker",
            props: {
              label: "出发日期",
              name: "departure_date",
              placeholder: "请选择日期",
              iconName: "Calendar",
            },
          },
          {
            id: "date_return",
            type: "datepicker",
            props: {
              label: "返程日期 (可选)",
              name: "return_date",
              placeholder: "请选择日期",
              iconName: "CalendarCheck",
            },
          },
          {
            id: "select_class",
            type: "select",
            props: {
              label: "舱位等级",
              name: "cabin_class",
              placeholder: "请选择舱位",
              options: [
                { label: "经济舱", value: "economy" },
                { label: "商务舱", value: "business" },
                { label: "头等舱", value: "first" },
              ],
            },
          },
        ],
      },
      {
        id: "actions",
        type: "container",
        style: { className: "flex gap-3 mt-2" },
        children: [
          {
            id: "btn_search",
            type: "button",
            props: {
              text: "搜索航班",
              actionName: "SEARCH_FLIGHTS",
              variant: "primary",
              iconName: "Search",
            },
            style: {
              className:
                "flex-1 py-3 bg-blue-600 text-white rounded-xl font-bold shadow-lg shadow-blue-200",
            },
          },
        ],
      },
    ],
  },
};

const currentData = ref(datePickerData);
</script>
