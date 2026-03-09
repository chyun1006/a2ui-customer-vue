import type { SseContentEvent } from "../types";

export interface SseAdapterOptions {
  sessionId?: string;
}

export interface SseAdapter {
  /** 根据历史消息和选项构建请求体 */
  buildBody(
    messages: Array<{ role: "user" | "assistant"; text: string }>,
    options: SseAdapterOptions,
    userContent: string,
    userId: string,
  ): object;

  /**
   * 解析一行 data: 后的 JSON 字符串。
   * 若识别为本协议的事件则 push(ev) 并返回 true；否则返回 false。
   */
  parseDataLine(dataJson: string, push: (ev: SseContentEvent) => void): boolean;
}
