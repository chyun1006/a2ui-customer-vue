import { ref, shallowRef, triggerRef, nextTick } from "vue";
import type { Spec } from "@json-render/core";
import { createSpecStreamParser } from "../components/renderer/index";
import { getAdapter } from "./stream/sseAdapters";

export interface ChatMessage {
  id: string;
  role: "user" | "assistant";
  text: string;
  spec: Spec | null;
}

export interface SseLogEntry {
  type: "token" | "patch" | "text" | "fence";
  content: string;
}

/** CoPaw 风格：请求体为 input + session_id + stream，SSE 为 data: { type?, content } */
export interface UseChatStreamOptions {
  requestFormat?: "default" | "copaw";
  sessionId?: string;
  userId?: string;
  agentId?: string;
}

export function useChatStream(
  api = "/api/chat",
  options: UseChatStreamOptions = {},
) {
  const { requestFormat = "default", sessionId: optionSessionId } = options;
  const messages = ref<ChatMessage[]>([]);
  const currentText = ref("");
  const spec = shallowRef<Spec | null>(null);
  const isStreaming = ref(false);
  const error = ref<Error | null>(null);
  const sseLog = ref<SseLogEntry[]>([]);
  const sessionIdRef = ref(optionSessionId ?? `session-${Date.now()}`);
  const sessionId = () => optionSessionId ?? sessionIdRef.value;

  function clear() {
    messages.value = [];
    currentText.value = "";
    spec.value = null;
    error.value = null;
    sseLog.value = [];
  }

  async function send(userContent: string, label: string = "") {
    const userMsg: ChatMessage = {
      id: `user-${Date.now()}`,
      role: "user",
      text: label,
      spec: null,
    };
    messages.value.push(userMsg);

    const aId = `assistant-${Date.now()}`;
    messages.value.push({ id: aId, role: "assistant", text: "", spec: null });

    currentText.value = "";
    spec.value = null;
    sseLog.value = [];
    isStreaming.value = true;
    error.value = null;

    // currentText 仅由 parser 的 onTextLine 驱动，只展示非 ```spec 块内的文本
    const parser = createSpecStreamParser({
      onLog: (e) => sseLog.value.push(e),
      onTextLine: (line) => {
        currentText.value += line + "\n";
      },
    });
    parser.reset();

    const adapter = getAdapter(requestFormat);

    try {
      const filtered = messages.value.filter(
        (m) => m.role === "user" || (m.role === "assistant" && m.text),
      );

      const body = adapter.buildBody(
        filtered,
        { sessionId: sessionId(), agentId: options.agentId },
        userContent,
        options.userId ?? "default",
      );

      const response = await fetch(api, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });

      if (!response.ok) throw new Error(`HTTP ${response.status}`);
      const reader = response.body?.getReader();
      if (!reader) throw new Error("No response body");

      const decoder = new TextDecoder();
      let sseBuffer = "";

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;
        sseBuffer += decoder.decode(value, { stream: true });
        const sseLines = sseBuffer.split("\n");
        sseBuffer = sseLines.pop() ?? "";

        for (const sseLine of sseLines) {
          if (!sseLine.startsWith("data: ")) continue;
          const dataJson = sseLine.slice(6).trim();
          if (!dataJson) continue;

          const consumed = adapter.parseDataLine(dataJson, (ev) => {
            if (ev.kind === "error") {
              error.value = new Error(ev.message);
              return;
            }
            if (ev.kind === "token" && ev.text) {
              sseLog.value.push({ type: "token", content: ev.text });
              parser.pushContent(ev.text);
            }
            if (ev.kind === "message" && ev.text) {
              parser.pushContent(ev.text);
              parser.pushContent("\n");
            }
          });

          if (consumed && error.value) break;
          if (consumed) {
            spec.value = parser.getCurrentSpec();
            await nextTick();
          }
        }
        if (error.value) break;
      }

      if (sseBuffer.startsWith("data: ")) {
        const dataJson = sseBuffer.slice(6).trim();
        if (dataJson && dataJson !== "[DONE]") {
          adapter.parseDataLine(dataJson, (ev) => {
            if (ev.kind === "error") {
              error.value = new Error(ev.message);
            } else if (ev.kind === "token" && ev.text) {
              parser.pushContent(ev.text);
            } else if (ev.kind === "message" && ev.text) {
              parser.pushContent(ev.text);
              parser.pushContent("\n");
            }
          });
        }
      }
      parser.pushContent("\n");

      const validated = parser.finish();
      spec.value = validated;
      triggerRef(spec);

      const msgIdx = messages.value.findIndex((m) => m.id === aId);
      if (msgIdx !== -1) {
        messages.value[msgIdx] = {
          ...messages.value[msgIdx]!,
          text: currentText.value,
          spec: validated,
        };
      }
    } catch (e) {
      error.value = e instanceof Error ? e : new Error(String(e));
      const msgIdx = messages.value.findIndex((m) => m.id === aId);
      if (msgIdx !== -1) {
        messages.value[msgIdx] = {
          ...messages.value[msgIdx]!,
          text: currentText.value + "\n" + (error.value?.message ?? "请求失败"),
          spec: spec.value,
        };
      }
    } finally {
      isStreaming.value = false;
    }
  }

  return {
    messages,
    currentText,
    spec,
    isStreaming,
    error,
    sseLog,
    send,
    clear,
  };
}
