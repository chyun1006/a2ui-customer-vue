import type { SseAdapter, SseAdapterOptions } from "./types";
import type { SseContentEvent } from "../types";

/** 识别「首尾带引号、含 ```spec 且含 \" 或 \\」的转义 spec 块，需在 push 前规范化。 */
function isEscapedSpecBlock(text: string): boolean {
  if (!text || text[0] !== '"') return false;
  if (!/```\s*spec/i.test(text)) return false;
  return text.includes('\\"') || text.includes("\\\\");
}

/** 规范化转义 spec 块：去首尾引号、字面量 \\n 转真实换行、反转义 \\ 与 \"。 */
function normalizeEscapedSpecBlock(text: string): string {
  let s = text.trim();
  if (s.startsWith('"')) s = s.slice(1);
  if (s.endsWith('"')) s = s.slice(0, -1);
  s = s.replace(/\\n/g, "\n");
  s = s
    .replace(/\\\\/g, "\u0000")
    .replace(/\\"/g, '"')
    .replace(/\u0000/g, "\\");
  return s;
}

export const copawAdapter: SseAdapter = {
  buildBody(
    messages: Array<{ role: "user" | "assistant"; text: string }>,
    options: SseAdapterOptions,
    userContent: string,
    userId: string,
  ) {
    return {
      input: messages.map((m, index) => ({
        role: m.role as "user" | "assistant",
        type: "message" as const,
        content: [
          {
            type: "text" as const,
            text: m.text,
            status: "created" as const,
          },
        ],
        metadata: {
          metadata:
            index == messages.length - 1
              ? {
                  formData: userContent,
                }
              : null,
        },
      })),

      session_id: options.sessionId ?? `session-${Date.now()}`,
      user_id: userId || "default",
      channel: "console",
      agent_id: "default",
      stream: true,
    };
  },

  parseDataLine(
    dataJson: string,
    push: (ev: SseContentEvent) => void,
  ): boolean {
    const trimmed = dataJson.trim();
    if (!trimmed || trimmed === "[DONE]") return true;

    try {
      const parsed = JSON.parse(trimmed) as Record<string, unknown>;
      const err = parsed.error;
      if (err != null && err !== "") {
        push({ kind: "error", message: String(err) });
        return true;
      }
      if (
        parsed.object === "content" &&
        parsed.type === "text" &&
        typeof parsed.text === "string"
      ) {
        let token = parsed.text;
        if (token) {
          if (isEscapedSpecBlock(token))
            token = normalizeEscapedSpecBlock(token);
          push({ kind: "token", text: token });
        }
        return true;
      }
      if (parsed.object === "message" && Array.isArray(parsed.content)) {
        let text = "";
        for (const item of parsed.content) {
          const c = item as Record<string, unknown>;
          if (c?.type === "text" && typeof c.text === "string") text += c.text;
        }
        if (text) {
          if (isEscapedSpecBlock(text)) text = normalizeEscapedSpecBlock(text);
          push({ kind: "message", text });
        }
        return true;
      }
    } catch {
      // not our format
    }
    return false;
  },
};
