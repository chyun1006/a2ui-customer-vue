import { createSpecStreamCompiler, type Spec } from '@json-render/core'

/**
 * 将 JSONL patch 字符串编译成 Spec 对象。
 * - 输入为多行字符串，每行一个 {"op","path","value"} JSON。
 * - 忽略空行。
 */
export function compileSpecFromJsonl(source: string): Spec | null {
  const compiler = createSpecStreamCompiler<Spec>()

  const lines = source.split('\n')
  for (const raw of lines) {
    const line = raw.trim()
    if (!line) continue
    try {
      // 先尝试把拼在 value 外面的 children 修正进 value.children
      let fixed = line
      try {
        const obj = JSON.parse(line) as Record<string, unknown>
        if (
          obj &&
          typeof obj === 'object' &&
          obj.op === 'add' &&
          typeof obj.path === 'string' &&
          Object.prototype.hasOwnProperty.call(obj, 'children') &&
          obj.value &&
          typeof obj.value === 'object' &&
          !Object.prototype.hasOwnProperty.call(obj.value as object, 'children')
        ) {
          ;(obj.value as Record<string, unknown>).children = obj.children
          delete obj.children
          fixed = JSON.stringify(obj)
        }
      } catch {
        // 如果这一行本身不是合法 JSON，就直接走原始逻辑让编译器决定是否接受
      }

      compiler.push(fixed + '\n')
    } catch {
      // 单行出错则跳过本行，继续处理后续行
    }
  }

  return compiler.getResult()
}

// 奶茶点单 Demo：使用题目中的 patch 文本生成 Spec
const milkTeaDemoSource = `{"op":"add","path":"/root","value":"main"}
{"op":"add","path":"/elements/main","value":{"type":"Column","props":{"gap":"lg"},"children":["header","image","description","options","quantity","submit"]}}
{"op":"add","path":"/elements/header","value":{"type":"Heading","props":{"text":"点奶茶","level":"1"},"children":[]}}
{"op":"add","path":"/elements/image","value":{"type":"Image","props":{"src":"https://example.com/tea.jpg","alt":"奶茶图片","width":"100%","height":"300px"},"children":[]}}
{"op":"add","path":"/elements/description","value":{"type":"Text","props":{"content":"我们提供多种口味的奶茶，包括经典原味、香草味、珍珠奶茶等。"},"children":[]}}
{"op":"add","path":"/elements/options","value":{"type":"Select","props":{"label":"选择口味","value":"original","options":[{"label":"原味","value":"original"},{"label":"香草味","value":"vanilla"},{"label":"珍珠奶茶","value":"bubble"}]},"children":[]}}
{"op":"add","path":"/elements/quantity","value":{"type":"Slider","props":{"label":"选择数量","value":1,"min":1,"max":10,"step":1},"children":[]}}
{"op":"add","path":"/elements/submit","value":{"type":"Button","props":{"label":"提交订单","variant":"primary","size":"lg"},"children":[]}}`

/**
 * 返回奶茶点单 Demo 的 Spec。
 * 主要用于本地调试或作为示例。
 */
export function buildMilkTeaDemoSpec(): Spec | null {
  return compileSpecFromJsonl(milkTeaDemoSource)
}

