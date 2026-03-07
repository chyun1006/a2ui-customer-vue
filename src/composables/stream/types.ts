/** 统一的内容事件类型，供 adapter 输出、useChatStream 消费 */
export type SseContentEvent =
  | { kind: 'token'; text: string }
  | { kind: 'message'; text: string }
  | { kind: 'error'; message: string }
