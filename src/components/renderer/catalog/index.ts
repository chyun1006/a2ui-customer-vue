import { defineCatalog } from '@json-render/core'
import { schema } from '@json-render/vue/schema'
import { z } from 'zod'

export const catalog = defineCatalog(schema, {
  components: {
    Card: {
      props: z.object({
        title: z.string(),
        description: z.string().nullable(),
      }),
      slots: ['default'],
      description: '容器卡片，用于分组内容',
    },
    Metric: {
      props: z.object({
        label: z.string(),
        value: z.union([z.string(), z.number()]),
        unit: z.string().nullable(),
        trend: z.enum(['up', 'down', 'flat']).nullable(),
        trendValue: z.string().nullable(),
      }),
      description: '单个 KPI 指标展示',
    },
    Grid: {
      props: z.object({ columns: z.enum(['2', '3', '4']) }),
      slots: ['default'],
      description: '网格布局',
    },
    Row: {
      props: z.object({ gap: z.enum(['sm', 'md', 'lg']).nullable() }),
      slots: ['default'],
      description: '水平布局',
    },
    Column: {
      props: z.object({ gap: z.enum(['sm', 'md', 'lg']).nullable().optional() }),
      slots: ['default'],
      description: '垂直布局',
    },
    Container: {
      props: z.object({ gap: z.enum(['sm', 'md', 'lg']).nullable() }),
      slots: ['default'],
      description: '通用容器（垂直布局），等同于 Column，禁止单独使用，请优先使用 Column/Card/Grid',
    },
    Heading: {
      props: z.object({
        text: z.string(),
        level: z.enum(['1', '2', '3']).nullable(),
      }),
      description: '标题文字',
    },
    Text: {
      props: z.object({
        content: z.string(),
        align: z.enum(['left', 'center', 'right']).nullable().optional(),
      }),
      description: '普通文本段落，可通过 align 设置对齐方式（left/center/right）。',
    },
    Table: {
      props: z.object({
        columns: z.array(
          z.object({
            key: z.string(),
            label: z.string(),
          }),
        ),
        rows: z.array(z.record(z.string(), z.union([z.string(), z.number()]))),
      }),
      description: '数据表格',
    },
    BarChart: {
      props: z.object({
        title: z.string().nullable(),
        categories: z.array(z.string()),
        series: z.array(
          z.object({
            name: z.string(),
            data: z.array(z.number()),
          }),
        ),
      }),
      description: '柱状图',
    },
    LineChart: {
      props: z.object({
        title: z.string().nullable(),
        categories: z.array(z.string()),
        series: z.array(
          z.object({
            name: z.string(),
            data: z.array(z.number()),
          }),
        ),
      }),
      description: '折线图/趋势图',
    },
    PieChart: {
      props: z.object({
        title: z.string().nullable(),
        data: z.array(
          z.object({
            name: z.string(),
            value: z.number(),
          }),
        ),
      }),
      description: '饼图/占比图',
    },
    Badge: {
      props: z.object({
        label: z.string(),
        variant: z.enum(['success', 'warning', 'error', 'info']),
      }),
      description: '状态标签',
    },
    Progress: {
      props: z.object({
        label: z.string(),
        value: z.number(),
        max: z.number().nullable(),
      }),
      description: '进度条',
    },
    Alert: {
      props: z.object({
        message: z.string(),
        type: z.enum(['success', 'warning', 'error', 'info']),
      }),
      description: '提示信息',
    },
    Button: {
      props: z.object({
        label: z.string(),
        variant: z.enum(['primary', 'secondary', 'danger', 'ghost']).nullable(),
        size: z.enum(['sm', 'md', 'lg']).nullable(),
        disabled: z.boolean().nullable(),
      }),
      description: '按钮，支持不同变体和尺寸。点击需在元素上设置 on.press 为 { "action": "动作名", "params": { ... } }，例如提交按钮：on: { "press": { "action": "submit_form", "params": { "formId": "login" } } }。禁止将 on.press 设为 null 或省略，否则点击无效。',
    },
    Divider: {
      props: z.object({}),
      description: '分割线',
    },
    Input: {
      props: z.object({
        label: z.string().nullable(),
        placeholder: z.string().nullable(),
        type: z.enum(['text', 'number', 'email', 'password', 'url']).nullable(),
        value: z.string().nullable(),
        disabled: z.boolean().nullable(),
      }),
      description: '文本输入框。若需在提交时获取用户输入，必须使用 value: { "$bindState": "/字段名" }（字段名与 state 中的 key 一致），并在 spec 中通过 patch 添加 /state/字段名 初始值（如 ""）；仅写 value: null 时提交无法从 state 读取该输入。',
    },
    TextArea: {
      props: z.object({
        label: z.string().nullable(),
        placeholder: z.string().nullable(),
        value: z.string().nullable(),
        rows: z.number().nullable(),
      }),
      description: '多行文本域。若需在提交时获取内容，请用 value: { "$bindState": "/字段名" }（字段名与 state 中的 key 一致），并通过 patch 添加 /state/字段名 初始值。',
    },
    Select: {
      props: z.object({
        label: z.string().nullable(),
        value: z.string().nullable(),
        placeholder: z.string().nullable(),
        options: z.array(z.object({ label: z.string(), value: z.string() })),
      }),
      description: '下拉选择器',
    },
    Switch: {
      props: z.object({
        label: z.string(),
        checked: z.boolean().nullable(),
      }),
      description: '开关切换，支持 $bindState 双向绑定 checked',
    },
    Checkbox: {
      props: z.object({
        label: z.string(),
        checked: z.boolean().nullable(),
      }),
      description: '复选框',
    },
    RadioGroup: {
      props: z.object({
        label: z.string().nullable(),
        value: z.string().nullable(),
        options: z.array(z.object({ label: z.string(), value: z.string() })),
      }),
      description: '单选按钮组',
    },
    Slider: {
      props: z.object({
        label: z.string().nullable(),
        value: z.number().nullable(),
        min: z.number(),
        max: z.number(),
        step: z.number().nullable(),
      }),
      description: '滑块选择器',
    },
    DatePicker: {
      props: z.object({
        label: z.string().nullable(),
        value: z.string().nullable(),
        placeholder: z.string().nullable(),
      }),
      description: '日期选择器',
    },
    List: {
      props: z.object({
        ordered: z.boolean().nullable().optional(),
        gap: z.enum(['sm', 'md', 'lg']).nullable().optional(),
      }),
      slots: ['default'],
      description: '列表容器，可包含 ListItem 子项。ordered/gap 可省略，前端会使用默认值（ordered=false, gap=\"md\"）。',
    },
    ListItem: {
      props: z.object({
        title: z.string(),
        description: z.string().nullable(),
        icon: z.string().nullable(),
        trailing: z.string().nullable(),
      }),
      slots: ['default'],
      description: '列表项，支持标题、描述、图标和右侧内容',
    },
    DescriptionList: {
      props: z.object({
        items: z.array(
          z.object({
            term: z.string(),
            detail: z.union([z.string(), z.number()]),
          }),
        ),
        layout: z.enum(['vertical', 'horizontal']).nullable(),
      }),
      description: '描述列表 / 键值对展示，如订单详情、用户信息',
    },
    Icon: {
      props: z.object({
        name: z.string(),
        size: z.union([z.number(), z.string()]).nullable(),
        color: z.string().nullable(),
      }),
      description:
        '图标组件，使用 lucide-vue-next 图标库。name 需填写 lucide 图标组件名（例如 \"Search\"、\"Plane\"、\"UserCircle\" 等）。',
    },
    Image: {
      props: z.object({
        src: z.string(),
        alt: z.string().nullable(),
        width: z.union([z.number(), z.string()]).nullable(),
        height: z.union([z.number(), z.string()]).nullable(),
        radius: z.enum(['none', 'sm', 'md', 'lg', 'full']).nullable(),
      }),
      description:
        '图片组件，用于展示封面/插图。src 为必填，width/height 可为数字或字符串（如 \"100%\"、\"300px\"），radius 控制圆角。',
    },
  },
  actions: {
    submit_form: {
      params: z.object({ formId: z.string() }),
      description: '提交表单',
    },
  },
})
