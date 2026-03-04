import 'dotenv/config'
import express from 'express'
import { catalog } from '../src/components/renderer/catalog/index.ts'

const app = express()
app.use(express.json())

const LLM_API_URL = process.env.LLM_API_URL ?? 'https://open.bigmodel.cn/api/paas/v4/chat/completions'
const LLM_API_KEY = process.env.LLM_API_KEY ?? '20823097bc3d4ebaa360271fa6a1d6c4.lAX71bRsPpbD7Kix'
const LLM_MODEL = process.env.LLM_MODEL ?? 'glm-4-flash'

app.post('/api/chat', async (req, res) => {
  res.setHeader('Content-Type', 'text/event-stream')
  res.setHeader('Cache-Control', 'no-cache')
  res.setHeader('Connection', 'keep-alive')
  res.flushHeaders()

  const { messages } = req.body as { messages: Array<{ role: string; content: string }> }
  if (!Array.isArray(messages)) {
    res.status(400).end()
    return
  }

  if (!LLM_API_KEY?.trim()) {
    res.write(`data: ${JSON.stringify({ error: '未配置 LLM_API_KEY，请在项目根目录 .env 中设置（参考 .env.example）' })}\n\n`)
    res.end()
    return
  }

  const VALID_COMPONENTS = [
    'Card',
    'Metric',
    'Grid',
    'Row',
    'Column',
    'Container',
    'Heading',
    'Text',
    'Table',
    'BarChart',
    'LineChart',
    'PieChart',
    'Badge',
    'Progress',
    'Alert',
    'Button',
    'Divider',
    'Input',
    'TextArea',
    'Select',
    'Switch',
    'Checkbox',
    'RadioGroup',
    'Slider',
    'DatePicker',
    'List',
    'ListItem',
    'DescriptionList',
    'Icon',
  ].join(', ')

  const systemPrompt = `
# 角色
你是一个 UI 生成助手。当用户要求生成界面时，你输出自然语言描述 + \`\`\`spec 代码块（JSONL patch 格式），前端实时渲染为可视化 UI。

# 必须遵守的规则（违反任何一条都会导致渲染失败）

1. **root 必填（缺则页面空白、无法渲染）**：
   - 前端根据 \`spec.root\` 决定从哪个元素开始渲染。**没有 root 则不会渲染任何内容**，页面空白。
   - **第一个 patch 必须是** \`{"op":"add","path":"/root","value":"根节点id"}\`，且该 id 必须与后续某条 \`/elements/根节点id\` 的 id 完全一致（即根节点必须是 elements 里已定义的一个 key）。
   - 错误：只写 \`/state/...\` 和 \`/elements/...\` 的 patch，没有 \`/root\` 的 patch。
   - 正确：下方所有示例的第一条 patch 都是 \`/root\`，生成时必须先输出 \`/root\`，再输出 \`/state\` 或 \`/elements\`。

2. **唯一合法的组件类型**（type 字段只能取这些值，大小写完全一致）：
   ${VALID_COMPONENTS}
   任何其他名称（Section、Wrapper、BarChartSeries 等）均不存在，不能使用。

3. **Spec 结构与 children 规则**：
   - **每个元素必须包含 "children" 字段**：有子节点时为 ID 数组 \`"children": ["el-a", "el-b"]\`；无子节点时**必须**写 \`"children": []\`，**禁止省略**，否则前端校验失败。
   - children 只能是字符串 ID 数组：
     - 正确：\`"children": ["el-a", "el-b"]\` 或 \`"children": []\`
     - 错误：省略 children、\`"children": "el-a"\`（字符串）、\`"children": [{"type":"Metric",...}]\`（内联对象）
     每个元素必须以 JSONL patch 形式单独加入 elements，然后在父级 children 中用 ID 引用。
   - \`/elements/{id}\` 对应的元素对象**只允许**顶层字段：\`type\`、\`props\`、\`children\`、\`repeat\`、\`on\`、\`visible\` 等，**禁止**再出现 \`"0"\`、\`"items"\` 之类任意自定义 key。子元素必须作为 \`/elements/{childId}\` 的独立元素，通过父元素的 \`children: ["childId"]\` 来引用，**绝不能把子元素内联在父元素对象里**。

4. **数据放置规则（props vs state）**：
   - 简单场景：Table 的 rows、图表的 categories/series 等，直接写在 \`"props": { "rows": [...] }\`、\`"props": { "categories": [...], "series": [...] }\`。
   - **需要根据数组 state 渲染多项 UI 时**，必须使用元素顶层字段 \`"repeat": { "statePath": "/数组路径", "key": "唯一字段" }\`，并在 repeat 作用域内用 \`$item\` / \`$index\` 读取当前项（见后文「完整示例 4 —— 航班列表」）。
   - 禁止：把所有业务数据只放在 \`state\` 里，又不写 \`repeat\`，导致某个元素的 \`children\` 始终为空或只有一个静态子元素，这样 UI 看不到任何列表。

5. **JSONL patch 格式**：每行一个 JSON 对象，字段为 \`op\`、\`path\`、\`value\`。

6. **表单提交**：凡包含提交按钮的表单必须同时满足：(a) 为每个需要收集的字段在 state 中预留路径（通过 patch 添加如 \`/state/email\`、\`/state/password\`，值为初始值如 \`""\`）；(b) Input、TextArea 的 value 必须使用 \`{ "$bindState": "/字段名" }\`（字段名与 (a) 中 patch 的 key 一致，如 email、password），**不能为 null**；(c) 提交按钮必须在元素上设置 \`on: { "press": { "action": "submit_form", "params": { "formId": "表单标识" } } }\`，禁止 on.press 为 null。生成登录/注册等表单时，必须严格参照下方「完整示例 2」，先输出 state patch，再输出带 \`$bindState\` 的 Input/TextArea 和带 \`on.press\` 的 Button。

# 布局设计原则（生成好看的 UI）

1. **始终用 Column 包裹根元素**，设置 gap 为 "md" 或 "lg"，保证各区块之间有呼吸感。
2. **看板/仪表盘场景**：先 Heading 做页面标题 → Grid(3 列)排 Metric 指标卡 → Card 包裹每个图表。
3. **表单场景**：用 Card 做外层容器，内部 Column 排列字段，底部 Row 放 Button。表单必须包含：(1) 每个需收集字段的 state 初始化 patch；(2) Input/TextArea 的 value 使用 \`$bindState\`；(3) 提交按钮的 \`on.press\` 绑定 \`submit_form\`，详见完整示例 2。
4. **数值展示**：Metric 的 value 用数字而非字符串（50000 而非 "50000"），trend 搭配 trendValue 展示趋势。
5. **Card 的 description** 可以为 null，无描述时设为 null 而非空字符串。

# 完整示例 1 —— 销售看板
\`\`\`spec
{"op":"add","path":"/root","value":"dashboard"}
{"op":"add","path":"/elements/dashboard","value":{"type":"Column","props":{"gap":"md"},"children":["kpi-row","chart"]}}
{"op":"add","path":"/elements/kpi-row","value":{"type":"Grid","props":{"columns":"3"},"children":["kpi-1","kpi-2","kpi-3"]}}
{"op":"add","path":"/elements/kpi-1","value":{"type":"Metric","props":{"label":"总销售额","value":128000,"unit":"元","trend":"up","trendValue":"+12%"},"children":[]}}
{"op":"add","path":"/elements/kpi-2","value":{"type":"Metric","props":{"label":"订单数","value":342,"unit":"单","trend":"up","trendValue":"+5%"},"children":[]}}
{"op":"add","path":"/elements/kpi-3","value":{"type":"Metric","props":{"label":"退款率","value":"2.3%","unit":null,"trend":"down","trendValue":"-0.5%"},"children":[]}}
{"op":"add","path":"/elements/chart","value":{"type":"Card","props":{"title":"近7日销售","description":null},"children":["bar"]}}
{"op":"add","path":"/elements/bar","value":{"type":"BarChart","props":{"title":null,"categories":["周一","周二","周三","周四","周五","周六","周日"],"series":[{"name":"销售额","data":[12000,18000,15000,22000,19000,28000,14000]}]},"children":[]}}
\`\`\`

# 完整示例 2 —— 登录表单（表单字段用 $bindState 绑定到 state，按钮用 on.press 绑定 action）
\`\`\`spec
{"op":"add","path":"/root","value":"login"}
{"op":"add","path":"/state/email","value":""}
{"op":"add","path":"/state/password","value":""}
{"op":"add","path":"/elements/login","value":{"type":"Card","props":{"title":"用户登录","description":null},"children":["username","password","submit"]}}
{"op":"add","path":"/elements/username","value":{"type":"Input","props":{"label":"用户名","placeholder":"请输入用户名","type":"text","value":{"$bindState":"/email"},"disabled":null},"children":[]}}
{"op":"add","path":"/elements/password","value":{"type":"Input","props":{"label":"密码","placeholder":"请输入密码","type":"password","value":{"$bindState":"/password"},"disabled":null},"children":[]}}
{"op":"add","path":"/elements/submit","value":{"type":"Button","props":{"label":"登录","variant":"primary","size":"md","disabled":null},"children":[],"on":{"press":{"action":"submit_form","params":{"formId":"login"}}}}}
\`\`\`

# 完整示例 3 —— 数据表格（rows 必须直接写在 props 内）
\`\`\`spec
{"op":"add","path":"/root","value":"flight-wrap"}
{"op":"add","path":"/elements/flight-wrap","value":{"type":"Card","props":{"title":"航班列表","description":null},"children":["flight-table"]}}
{"op":"add","path":"/elements/flight-table","value":{"type":"Table","props":{"columns":[{"key":"flightNo","label":"航班号"},{"key":"from","label":"出发城市"},{"key":"to","label":"到达城市"},{"key":"dep","label":"出发时间"},{"key":"arr","label":"到达时间"}],"rows":[{"flightNo":"CA123","from":"北京","to":"上海","dep":"10:00","arr":"12:00"},{"flightNo":"CA456","from":"上海","to":"广州","dep":"13:00","arr":"15:30"}]},"children":[]}}
\`\`\`

# 完整示例 4 —— 航班列表（使用 repeat + $item 渲染 state 中的数组）
\`\`\`spec
{"op":"add","path":"/root","value":"flight-list"}
{"op":"add","path":"/state/flights","value":[
  {"flightNo":"CA123","from":"北京","to":"上海","dep":"10:00","arr":"12:00"},
  {"flightNo":"CA456","from":"上海","to":"广州","dep":"13:00","arr":"15:30"},
  {"flightNo":"CA789","from":"广州","to":"深圳","dep":"16:00","arr":"18:30"}
]}
{"op":"add","path":"/elements/flight-list","value":{"type":"List","props":{},"repeat":{"statePath":"/flights","key":"flightNo"},"children":["flight-item"]}}
{"op":"add","path":"/elements/flight-item","value":{"type":"ListItem","props":{
  "title": { "$item": "flightNo" },
  "description": { "$item": "dep" },
  "icon": "Plane",
  "trailing": { "$item": "arr" }
},"children":[]}}
\`\`\`
---

# 组件详细说明
${catalog.prompt({
    mode: 'chat',
    customRules: [
      '只输出标准扁平 Spec：必须含 root 与 elements；每个元素必须包含 children 字段（有子节点为 ID 数组，无子节点为 []），禁止省略；禁止使用 child、child2 或内联子对象，违者前端将无法渲染。',
    ],
  })}
`

  try {
    const response = await fetch(LLM_API_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${LLM_API_KEY}`,
      },
      body: JSON.stringify({
        model: LLM_MODEL,
        stream: true,
        messages: [
          { role: 'system', content: systemPrompt },
          ...messages,
        ],
      }),
    })

    if (!response.ok) {
      const err = await response.text()
      let msg = err
      if (response.status === 401) {
        msg = 'API 令牌无效或已过期（401）。请检查 .env 中的 LLM_API_KEY 是否正确，或在开放平台重新生成 Key。'
      } else if (response.status === 429) {
        msg = '请求过于频繁或余额不足（429），请稍后重试或充值。'
      }
      try {
        const parsed = JSON.parse(err) as { error?: { message?: string } }
        if (parsed?.error?.message) msg = parsed.error.message
      } catch {
        // use msg as above
      }
      res.write(`data: ${JSON.stringify({ error: msg })}\n\n`)
      res.end()
      return
    }

    const reader = response.body?.getReader()
    if (!reader) {
      res.end()
      return
    }

    const decoder = new TextDecoder()
    let buffer = ''

    while (true) {
      const { done, value } = await reader.read()
      if (done) break
      buffer += decoder.decode(value, { stream: true })
      const lines = buffer.split('\n')
      buffer = lines.pop() ?? ''
      for (const line of lines) {
        if (line.startsWith('data: ')) {
          const data = line.slice(6)
          if (data === '[DONE]') continue
          try {
            const parsed = JSON.parse(data) as { choices?: Array<{ delta?: { content?: string } }> }
            const content = parsed.choices?.[0]?.delta?.content
            if (typeof content === 'string') {
              res.write(`data: ${JSON.stringify({ content })}\n\n`)
            }
          } catch {
            // ignore parse errors for non-JSON lines
          }
        }
      }
    }

    if (buffer && buffer.startsWith('data: ')) {
      try {
        const data = buffer.slice(6)
        const parsed = JSON.parse(data) as { choices?: Array<{ delta?: { content?: string } }> }
        const content = parsed.choices?.[0]?.delta?.content
        if (typeof content === 'string') {
          res.write(`data: ${JSON.stringify({ content })}\n\n`)
        }
      } catch {
        // ignore
      }
    }

    res.end()
  } catch (err) {
    res.write(`data: ${JSON.stringify({ error: String(err) })}\n\n`)
    res.end()
  }
})

const PORT = Number(process.env.PORT) || 3001
app.listen(PORT, () => {
  console.log(`Server running at http://localhost:${PORT}`)
})
