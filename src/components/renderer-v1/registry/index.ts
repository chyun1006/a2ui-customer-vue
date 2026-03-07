import { defineComponent, h, ref } from 'vue'
import { defineRegistry, useBoundProp } from '@json-render/vue'
import { catalog } from '../catalog'
import BarChartComp from '../components/ui/chart/BarChart.vue'
import LineChartComp from '../components/ui/chart/LineChart.vue'
import PieChartComp from '../components/ui/chart/PieChart.vue'
import DataTableComp from '../components/ui/data/DataTable.vue'
import FormInput from '../components/ui/form/FormInput.vue'
import FormTextArea from '../components/ui/form/FormTextArea.vue'
import FormSelect from '../components/ui/form/FormSelect.vue'
import FormSwitch from '../components/ui/form/FormSwitch.vue'
import FormCheckbox from '../components/ui/form/FormCheckbox.vue'
import FormRadioGroup from '../components/ui/form/FormRadioGroup.vue'
import FormSlider from '../components/ui/form/FormSlider.vue'
import FormDatePicker from '../components/ui/form/FormDatePicker.vue'
import AppList from '../components/ui/list/AppList.vue'
import AppListItem from '../components/ui/list/AppListItem.vue'
import DescList from '../components/ui/list/DescList.vue'
import CardComp from '../components/ui/layout/Card.vue'
import GridComp from '../components/ui/layout/Grid.vue'
import RowComp from '../components/ui/layout/Row.vue'
import ColumnComp from '../components/ui/layout/Column.vue'
import ContainerComp from '../components/ui/layout/Container.vue'
import MetricComp from '../components/ui/base/Metric.vue'
import HeadingComp from '../components/ui/base/Heading.vue'
import TextComp from '../components/ui/base/Text.vue'
import BadgeComp from '../components/ui/base/Badge.vue'
import ProgressComp from '../components/ui/base/Progress.vue'
import AlertComp from '../components/ui/base/Alert.vue'
import ButtonComp from '../components/ui/base/Button.vue'
import DividerComp from '../components/ui/base/Divider.vue'
import IconComp from '../components/ui/base/Icon.vue'
import ImageComp from '../components/ui/base/Image.vue'

const InputWithBinding = defineComponent({
  name: 'JsonRenderInput',
  props: { props: { type: Object, required: true }, bindings: { type: Object, default: null } },
  setup(p) {
    const props = p.props as { label?: string | null; placeholder?: string | null; type?: string | null; value?: string | null; disabled?: boolean | null }
    const bindings = p.bindings as Record<string, string> | undefined
    const [value, setValue] = useBoundProp<string>(props?.value ?? undefined, bindings?.value)
    return () =>
      h(FormInput, {
        modelValue: value ?? '',
        'onUpdate:modelValue': setValue,
        label: props?.label,
        placeholder: props?.placeholder,
        type: (props?.type as 'text' | 'number' | 'email' | 'password' | 'url') ?? 'text',
        disabled: props?.disabled ?? false,
      })
  },
})

const TextAreaWithBinding = defineComponent({
  name: 'JsonRenderTextArea',
  props: { props: { type: Object, required: true }, bindings: { type: Object, default: null } },
  setup(p) {
    const props = p.props as { label?: string | null; placeholder?: string | null; value?: string | null; rows?: number | null }
    const bindings = p.bindings as Record<string, string> | undefined
    const [value, setValue] = useBoundProp<string>(props?.value ?? undefined, bindings?.value)
    return () =>
      h(FormTextArea, {
        modelValue: value ?? '',
        'onUpdate:modelValue': setValue,
        label: props?.label,
        placeholder: props?.placeholder,
        rows: props?.rows ?? 3,
      })
  },
})

const SelectWithBinding = defineComponent({
  name: 'JsonRenderSelect',
  props: { props: { type: Object, required: true }, bindings: { type: Object, default: null } },
  setup(p) {
    const props = p.props as { label?: string | null; value?: string | null; placeholder?: string | null; options: { label: string; value: string }[] }
    const bindings = p.bindings as Record<string, string> | undefined
    const [value, setValue] = useBoundProp<string>(props?.value ?? undefined, bindings?.value)
    return () =>
      h(FormSelect, {
        modelValue: value ?? '',
        'onUpdate:modelValue': setValue,
        label: props?.label,
        placeholder: props?.placeholder,
        options: props?.options ?? [],
      })
  },
})

const SwitchWithBinding = defineComponent({
  name: 'JsonRenderSwitch',
  props: { props: { type: Object, required: true }, bindings: { type: Object, default: null } },
  setup(p) {
    const props = p.props as { label: string; checked?: boolean | null }
    const bindings = p.bindings as Record<string, string> | undefined
    const [bound, setBound] = useBoundProp<boolean>(props?.checked ?? undefined, bindings?.checked)
    const local = ref(bound ?? props?.checked ?? false)
    return () =>
      h(FormSwitch, {
        modelValue: bindings?.checked ? (bound ?? false) : local.value,
        'onUpdate:modelValue': (v: boolean) => {
          local.value = v
          setBound(v)
        },
        label: props?.label ?? '',
      })
  },
})

const CheckboxWithBinding = defineComponent({
  name: 'JsonRenderCheckbox',
  props: { props: { type: Object, required: true }, bindings: { type: Object, default: null } },
  setup(p) {
    const props = p.props as { label: string; checked?: boolean | null }
    const bindings = p.bindings as Record<string, string> | undefined
    const [bound, setBound] = useBoundProp<boolean>(props?.checked ?? undefined, bindings?.checked)
    const local = ref(bound ?? props?.checked ?? false)
    return () =>
      h(FormCheckbox, {
        modelValue: bindings?.checked ? (bound ?? false) : local.value,
        'onUpdate:modelValue': (v: boolean) => {
          local.value = v
          setBound(v)
        },
        label: props?.label ?? '',
      })
  },
})

const RadioGroupWithBinding = defineComponent({
  name: 'JsonRenderRadioGroup',
  props: { props: { type: Object, required: true }, bindings: { type: Object, default: null } },
  setup(p) {
    const props = p.props as { label?: string | null; value?: string | null; options: { label: string; value: string }[] }
    const bindings = p.bindings as Record<string, string> | undefined
    const [value, setValue] = useBoundProp<string>(props?.value ?? undefined, bindings?.value)
    return () =>
      h(FormRadioGroup, {
        modelValue: value ?? '',
        'onUpdate:modelValue': setValue,
        label: props?.label,
        options: props?.options ?? [],
      })
  },
})

const SliderWithBinding = defineComponent({
  name: 'JsonRenderSlider',
  props: { props: { type: Object, required: true }, bindings: { type: Object, default: null } },
  setup(p) {
    const props = p.props as { label?: string | null; value?: number | null; min: number; max: number; step?: number | null }
    const bindings = p.bindings as Record<string, string> | undefined
    const [value, setValue] = useBoundProp<number>(props?.value ?? undefined, bindings?.value)
    return () =>
      h(FormSlider, {
        modelValue: value ?? props?.min ?? 0,
        'onUpdate:modelValue': setValue,
        label: props?.label,
        min: props?.min ?? 0,
        max: props?.max ?? 100,
        step: props?.step ?? 1,
      })
  },
})

const DatePickerWithBinding = defineComponent({
  name: 'JsonRenderDatePicker',
  props: { props: { type: Object, required: true }, bindings: { type: Object, default: null } },
  setup(p) {
    const props = p.props as { label?: string | null; value?: string | null; placeholder?: string | null }
    const bindings = p.bindings as Record<string, string> | undefined
    const [value, setValue] = useBoundProp<string>(props?.value ?? undefined, bindings?.value)
    return () =>
      h(FormDatePicker, {
        modelValue: value ?? '',
        'onUpdate:modelValue': setValue,
        label: props?.label,
        placeholder: props?.placeholder,
      })
  },
})

export const { registry, handlers } = defineRegistry(catalog, {
  components: {
    Card: ({ props, children }) =>
      h(CardComp, { title: props.title, description: props.description }, { default: () => children }),
    Metric: ({ props }) =>
      h(MetricComp, {
        label: props.label,
        value: props.value,
        unit: props.unit ?? undefined,
        trend: props.trend ?? undefined,
        trendValue: props.trendValue ?? undefined,
      }),
    Grid: ({ props, children }) =>
      h(GridComp, { columns: props.columns }, { default: () => children }),
    Row: ({ props, children }) =>
      h(RowComp, { gap: props.gap ?? undefined }, { default: () => children }),
    Column: ({ props, children }) =>
      h(ColumnComp, { gap: props.gap ?? undefined }, { default: () => children }),
    Container: ({ props, children }) =>
      h(ContainerComp, { gap: props.gap ?? undefined }, { default: () => children }),
    Heading: ({ props }) =>
      h(HeadingComp, { text: props.text, level: props.level ?? undefined }),
    Text: ({ props }) =>
      h(TextComp, {
        content: props.content,
        align: props.align ?? null,
      }),
    Table: ({ props }) =>
      h(DataTableComp, {
        columns: props.columns,
        rows: props.rows,
      }),
    BarChart: ({ props }) =>
      h(BarChartComp, {
        title: props.title ?? null,
        categories: props.categories ?? [],
        series: props.series ?? [],
      }),
    LineChart: ({ props }) =>
      h(LineChartComp, {
        title: props.title ?? null,
        categories: props.categories ?? [],
        series: props.series ?? [],
      }),
    PieChart: ({ props }) =>
      h(PieChartComp, {
        title: props.title ?? null,
        data: props.data ?? [],
      }),
    Badge: ({ props }) =>
      h(BadgeComp, { label: props.label, variant: props.variant }),
    Progress: ({ props }) =>
      h(ProgressComp, {
        label: props.label,
        value: props.value,
        max: props.max ?? undefined,
      }),
    Alert: ({ props }) =>
      h(AlertComp, { message: props.message, type: props.type }),
    Button: ({ props, emit, loading }) =>
      h(ButtonComp, {
        label: props.label,
        variant: props.variant ?? undefined,
        size: props.size ?? undefined,
        disabled: props.disabled ?? undefined,
        loading,
        onPress: () => emit('press'),
      }),
    Divider: () => h(DividerComp),
    Icon: ({ props }) =>
      h(IconComp, {
        name: props.name,
        size: props.size ?? undefined,
        color: props.color ?? undefined,
      }),
    Image: ({ props }) =>
      h(ImageComp, {
        src: props.src,
        alt: props.alt ?? null,
        width: props.width ?? null,
        height: props.height ?? null,
        radius: props.radius ?? 'md',
      }),

    Input: (ctx) => h(InputWithBinding, { props: ctx.props, bindings: ctx.bindings }),
    TextArea: (ctx) => h(TextAreaWithBinding, { props: ctx.props, bindings: ctx.bindings }),
    Select: (ctx) => h(SelectWithBinding, { props: ctx.props, bindings: ctx.bindings }),
    Switch: (ctx) => h(SwitchWithBinding, { props: ctx.props, bindings: ctx.bindings }),
    Checkbox: (ctx) => h(CheckboxWithBinding, { props: ctx.props, bindings: ctx.bindings }),
    RadioGroup: (ctx) => h(RadioGroupWithBinding, { props: ctx.props, bindings: ctx.bindings }),
    Slider: (ctx) => h(SliderWithBinding, { props: ctx.props, bindings: ctx.bindings }),
    DatePicker: (ctx) => h(DatePickerWithBinding, { props: ctx.props, bindings: ctx.bindings }),

    List: ({ props, children }) =>
      h(AppList, {
        ordered: props.ordered ?? false,
        gap: props.gap ?? 'md',
      }, { default: () => children }),
    ListItem: ({ props, children }) =>
      h(AppListItem, {
        title: props.title,
        description: props.description,
        icon: props.icon,
        trailing: props.trailing,
      }, { default: () => children }),
    DescriptionList: ({ props }) =>
      h(DescList, {
        items: props.items,
        layout: props.layout ?? 'vertical',
      }),
  },
  actions: {
    submit_form: async (params, _setState, state) => {
      console.log('submit_form params:', params, 'state:', state)
    },
  },
})
