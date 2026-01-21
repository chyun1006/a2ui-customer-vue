import React, { useState, useEffect, useRef } from "react";
import {
  Mic,
  SendHorizontal,
  Bell,
  Menu,
  Search,
  User,
  X,
  PlusCircle,
  LayoutGrid,
} from "lucide-react";
import ChatBubble from "./components/ChatBubble";
import FunctionGrid from "./components/FunctionGrid";
import { Message, MessageType, Sender } from "./types";
import { FUNCTION_ITEMS, MEDIA_ITEMS } from "./constants";
import HongXiaoTongLogo from "./components/HongXiaoTongLogo";

// configuration constants - STRICTLY PRESERVED
const PROXY_API_URL =
  "https://api.kuai.host/v1beta/models/gemini-3-pro-preview:generateContent?key=sk-tD5WANykuBesDGn17HDMsZ3Pk8BkkmKFz7rtfeHw2KrelIIP";

// 1. STRICT BILINGUAL SYSTEM INSTRUCTION WITH ANALYSIS FIELD
const SYSTEM_INSTRUCTION = `
**CRITICAL PROTOCOL**
You are a specialized UI rendering engine.
1. **NO CONVERSATION**: Do not output "Internalizing", "Thinking", "Okay", or any analysis outside the JSON.
2. **JSON ONLY**: Your entire output must be a single valid JSON object starting with '{'.
3. **LANGUAGE**: All UI text must be Simplified Chinese.

**OUTPUT SCHEMA**
{
  "summary": "Brief chat response (1 sentence)",
  "analysis": "Professional operational analysis. Identify risks, trends, or give recommendations based on the data (2-3 sentences).",
  "title": "Widget Title",
  "rootNode": {
    "type": "container",
    "children": []
  }
}
`;

const mock_ui_1 = {
  version: "0.8",
  title: "机务维修任务确认",
  analysis:
    "根据 B-1234 的飞行计划，本次检修必须在 18:00 前完成以确保航段正常执行。",
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

const MOCK_UI = {
  id: "root_container",
  type: "container",
  style: { className: "flex flex-col gap-4 p-4" },
  children: [
    {
      id: "info_alert",
      type: "alert",
      props: {
        title: "自动关联",
        text: "已锁定飞机编号：B-1234",
        type: "info",
      },
    },
    {
      id: "field_issue",
      type: "textarea",
      props: {
        label: "故障现象描述",
        name: "issue_desc",
        placeholder: "请详细描述漏油位置及严重程度...",
        required: true,
        value: "发现左侧发动机下方有持续滴油现象",
      },
    },
    {
      id: "field_level",
      type: "select",
      props: {
        label: "紧急程度",
        name: "priority",
        options: [
          { label: "紧急 - 停场维修", value: "A" },
          { label: "一般 - 航后处理", value: "B" },
        ],
      },
    },
    {
      id: "row_actions",
      type: "container",
      style: { className: "flex justify-end gap-2 mt-4" },
      children: [
        {
          id: "btn_cancel",
          type: "button",
          props: {
            text: "取消",
            actionName: "CANCEL_WORKFLOW",
            variant: "ghost",
          },
        },
        {
          id: "btn_submit",
          type: "button",
          props: {
            text: "提交报修",
            actionName: "SUBMIT_REPAIR",
            variant: "primary",
            iconName: "Send",
          },
        },
      ],
    },
  ],
};

// 2. CLEAN FEW-SHOT EXAMPLES WITH ANALYSIS
const FEW_SHOT_EXAMPLES = [
  {
    role: "user",
    parts: [{ text: "查看维修日报" }],
  },
  {
    role: "model",
    parts: [
      {
        text: JSON.stringify(MOCK_UI),
      },
    ],
  },
];

const ROLES = ["营销主控", "维修席位", "航班生产控制席位", "签派放行席位"];

export default function App() {
  const [messages, setMessages] = useState<Message[]>([]);
  const [inputValue, setInputValue] = useState("");
  const [activeGrid, setActiveGrid] = useState<"none" | "business" | "media">(
    "none",
  );
  const [currentUserRole, setCurrentUserRole] = useState("值班经理");
  const [showLeftPanel, setShowLeftPanel] = useState(false);
  const [showRightPanel, setShowRightPanel] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const hasInitialized = useRef(false);

  useEffect(() => {
    if (hasInitialized.current) return;
    hasInitialized.current = true;
    startNewSession();
  }, []);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, activeGrid]);

  // RICH INITIAL DASHBOARDS
  const getInitialDashboardForRole = (role: string) => {
    // Styles
    const cardStyle = {
      className: "bg-white border border-slate-200 rounded-xl p-4 shadow-sm",
    };
    const labelStyle = {
      className:
        "text-[10px] font-bold text-slate-400 mb-2 uppercase tracking-wider",
    };
    const valueStyle = { className: "text-2xl font-bold text-slate-800" };
    const rowStyle = {
      className:
        "flex items-center justify-between py-2 border-b border-slate-50 last:border-0",
    };
    const btnSecondary = {
      className:
        "bg-white border border-slate-200 py-2.5 rounded-lg text-xs font-bold text-slate-600 flex items-center justify-center gap-2",
    };
    const btnPrimary = {
      className:
        "bg-blue-600 text-white py-2.5 rounded-lg text-xs font-bold flex items-center justify-center gap-2",
    };

    switch (role) {
      case "维修席位":
        return {
          title: "MCC 维修控制台",
          analysis:
            "当前机队整体运行平稳，但需注意 B737 机队由于机龄原因，近期液压系统故障率略有上升。建议提前储备相关航材。",
          rootNode: mock_ui_1.uiNode,
        };
      case "营销主控":
        return {
          title: "航班销售驾驶舱",
          analysis:
            "今日整体营收符合预期，但京沪线（PEK-SHA）晚间航班超售情况严重，存在溢出风险。建议提前进行超售旅客的分流引导。",
          rootNode: {
            type: "container",
            style: { className: "flex flex-col gap-4" },
            children: [
              {
                // Metrics
                type: "container",
                style: cardStyle,
                children: [
                  {
                    type: "text",
                    props: { text: "实时营收预估" },
                    style: labelStyle,
                  },
                  {
                    type: "text",
                    props: { text: "¥ 2,840,500" },
                    style: valueStyle,
                  },
                  {
                    type: "chart",
                    props: {
                      chartType: "area",
                      height: "100px",
                      chartData: [
                        { name: "08:00", value: 20 },
                        { name: "12:00", value: 45 },
                        { name: "16:00", value: 70 },
                        { name: "20:00", value: 95 },
                      ],
                    },
                  },
                ],
              },
              {
                // Tasks
                type: "container",
                style: cardStyle,
                children: [
                  {
                    type: "text",
                    props: { text: "重点航班监控" },
                    style: labelStyle,
                  },
                  {
                    type: "container",
                    style: rowStyle,
                    children: [
                      {
                        type: "text",
                        props: { text: "A67701 (PEK-SHA)" },
                        style: { className: "text-sm font-medium" },
                      },
                      {
                        type: "text",
                        props: { text: "超售 2 人" },
                        style: { className: "text-xs text-red-500 font-bold" },
                      },
                    ],
                  },
                  {
                    type: "container",
                    style: rowStyle,
                    children: [
                      {
                        type: "text",
                        props: { text: "A68821 (CTU-SZX)" },
                        style: { className: "text-sm font-medium" },
                      },
                      {
                        type: "text",
                        props: { text: "客座率 42%" },
                        style: {
                          className: "text-xs text-orange-500 font-bold",
                        },
                      },
                    ],
                  },
                ],
              },
              {
                // Action
                type: "container",
                style: { className: "grid grid-cols-2 gap-3" },
                children: [
                  {
                    type: "button",
                    props: { text: "竞对分析", iconName: "LineChart" },
                    style: btnSecondary,
                  },
                  {
                    type: "button",
                    props: { text: "舱位调控", iconName: "Settings" },
                    style: btnPrimary,
                  },
                ],
              },
            ],
          },
        };
      default: // AOC / Dispatch
        return {
          title: "AOC 运行总览",
          analysis:
            "全网准点率维持在较高水平。需密切关注华南区域雷雨天气发展，预计晚间 A61301 等进出港航班将受到流控影响，建议提前启动协同放行。",
          rootNode: {
            type: "container",
            style: { className: "flex flex-col gap-4" },
            children: [
              {
                // Metrics
                type: "container",
                style: cardStyle,
                children: [
                  {
                    type: "text",
                    props: { text: "航班正常性 (95.8%)" },
                    style: labelStyle,
                  },
                  {
                    type: "container",
                    style: {
                      className:
                        "flex items-center gap-1 h-3 mb-4 rounded-full overflow-hidden",
                    },
                    children: [
                      {
                        type: "container",
                        style: { className: "h-full bg-blue-500 w-[70%]" },
                      },
                      {
                        type: "container",
                        style: { className: "h-full bg-green-500 w-[25%]" },
                      },
                      {
                        type: "container",
                        style: { className: "h-full bg-red-500 w-[5%]" },
                      },
                    ],
                  },
                  {
                    type: "container",
                    style: {
                      className: "flex justify-between text-xs text-slate-500",
                    },
                    children: [
                      { type: "text", props: { text: "正常 68" } },
                      { type: "text", props: { text: "延误 2" } },
                    ],
                  },
                ],
              },
              {
                // Tasks
                type: "container",
                style: cardStyle,
                children: [
                  {
                    type: "text",
                    props: { text: "待处理异常" },
                    style: labelStyle,
                  },
                  {
                    type: "container",
                    style: rowStyle,
                    children: [
                      {
                        type: "text",
                        props: { text: "A61301 流控等待" },
                        style: { className: "text-sm font-medium" },
                      },
                      {
                        type: "button",
                        props: { text: "协调" },
                        style: {
                          className:
                            "text-[10px] bg-blue-100 text-blue-600 px-2 py-0.5 rounded",
                        },
                      },
                    ],
                  },
                  {
                    type: "container",
                    style: rowStyle,
                    children: [
                      {
                        type: "text",
                        props: { text: "A65502 旅客晚到" },
                        style: { className: "text-sm font-medium" },
                      },
                      {
                        type: "button",
                        props: { text: "减载" },
                        style: {
                          className:
                            "text-[10px] bg-orange-100 text-orange-600 px-2 py-0.5 rounded",
                        },
                      },
                    ],
                  },
                ],
              },
              {
                // Action
                type: "container",
                style: { className: "grid grid-cols-2 gap-3" },
                children: [
                  {
                    type: "button",
                    props: { text: "大面积延误", iconName: "Siren" },
                    style: {
                      className:
                        "bg-white border border-red-200 text-red-500 py-2.5 rounded-lg text-xs font-bold flex items-center justify-center gap-2",
                    },
                  },
                  {
                    type: "button",
                    props: { text: "一键放行", iconName: "CheckCircle" },
                    style: btnPrimary,
                  },
                ],
              },
            ],
          },
        };
    }
  };

  const startNewSession = () => {
    const randomRole = ROLES[Math.floor(Math.random() * ROLES.length)];
    setCurrentUserRole(randomRole);

    const initialDashboard = getInitialDashboardForRole(randomRole);

    setMessages([
      {
        id: "init_" + Date.now(),
        sender: Sender.AGENT,
        type: MessageType.A2UI_WIDGET,
        thought: undefined,
        content: `您好，我是鸿小通。已为您加载【${randomRole}】专属工作台：`,
        widgetPayload: initialDashboard as any,
        timestamp: new Date(),
      },
    ]);
  };

  /**
   * STACK-BASED JSON EXTRACTION (v4 - Enhanced Robustness)
   * 1. Aggressively cleans markdown and conversational filler.
   * 2. Finds the outermost JSON object by matching braces.
   */
  const extractJSON = (text: string): any => {
    if (!text) return null;

    // 1. First pass cleanup
    let cleanText = text
      .replace(/[\u0000-\u001F\u007F-\u009F]/g, "")
      .replace(/```json/gi, "")
      .replace(/```/g, "");

    // 2. Locate the outermost brace pair
    const firstBrace = cleanText.indexOf("{");
    const lastBrace = cleanText.lastIndexOf("}");

    if (firstBrace !== -1 && lastBrace !== -1 && lastBrace > firstBrace) {
      const potentialJson = cleanText.substring(firstBrace, lastBrace + 1);
      try {
        const parsed = JSON.parse(potentialJson);
        if (parsed.rootNode || parsed.summary) {
          return parsed;
        }
      } catch (e) {
        console.warn(
          "Direct parsing of outer block failed, falling back to candidate search.",
          e,
        );
      }
    }

    // 3. Fallback: Candidate Search (Stack Based)
    const candidates: string[] = [];
    let braceCount = 0;
    let startIndex = -1;

    for (let i = 0; i < cleanText.length; i++) {
      const char = cleanText[i];
      if (char === "{") {
        if (braceCount === 0) startIndex = i;
        braceCount++;
      } else if (char === "}") {
        braceCount--;
        if (braceCount === 0 && startIndex !== -1) {
          candidates.push(cleanText.substring(startIndex, i + 1));
          startIndex = -1;
        }
      }
    }

    // Prioritize candidates that look like our expected schema
    for (const candidate of candidates.reverse()) {
      if (!candidate.includes("rootNode") && !candidate.includes("summary"))
        continue;
      try {
        const parsed = JSON.parse(candidate);
        return parsed;
      } catch (e) {
        // Continue
      }
    }

    return null;
  };

  const processUserMessage = async (
    displayText: string,
    hiddenContext: string = "",
  ) => {
    if (!displayText.trim()) return;

    setMessages((prev) => [
      ...prev,
      {
        id: Date.now().toString(),
        sender: Sender.USER,
        type: MessageType.TEXT,
        content: displayText,
        timestamp: new Date(),
      },
    ]);
    const loaderId = "loader_" + Date.now();
    setMessages((prev) => [
      ...prev,
      {
        id: loaderId,
        sender: Sender.AGENT,
        type: MessageType.LOADER,
        timestamp: new Date(),
      },
    ]);

    try {
      const currentSessionContents = messages
        .filter((m) => m.type !== MessageType.LOADER)
        .map((m) => {
          let partText = m.content || "";
          if (m.sender === Sender.AGENT && m.widgetPayload) {
            partText += `\n[System Context: Widget Rendered]`;
          }
          return {
            role: m.sender === Sender.USER ? "user" : "model",
            parts: [{ text: partText }],
          };
        });

      const promptContent = hiddenContext
        ? `${displayText}\n[Context]: ${hiddenContext}`
        : displayText;

      const contents = [
        ...FEW_SHOT_EXAMPLES,
        ...currentSessionContents,
        {
          role: "user",
          // FINAL FORCE INSTRUCTION - EXTRA STRICT
          parts: [
            {
              text: `QUERY: ${promptContent}\n\n[MANDATORY]: OUTPUT RAW JSON ONLY. NO PREAMBLE. NO CONVERSATIONAL FILLER. NO MARKDOWN BLOCK.`,
            },
          ],
        },
      ];

      const payload = {
        contents: contents,
        systemInstruction: {
          parts: [{ text: SYSTEM_INSTRUCTION }],
        },
        generationConfig: {
          responseMimeType: "application/json",
          temperature: 0.1,
        },
      };

      const response = await fetch(PROXY_API_URL, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      if (!response.ok) throw new Error(`API Error: ${response.status}`);

      const data = await response.json();

      const parts = data.candidates?.[0]?.content?.parts || [];
      const rawText = parts.map((p: any) => p.text).join("\n") || "{}";

      let jsonResponse = extractJSON(rawText);

      // FALLBACK UI - MATCHING SCREENSHOT STYLE
      if (!jsonResponse) {
        console.error("Parse Failed. Raw:", rawText);
        jsonResponse = {
          summary: "数据解析异常，请重试。",
          analysis:
            "系统未能成功解析模型返回的数据，这可能是由于网络波动或模型输出格式异常导致的。请尝试重新发送请求。",
          title: "系统消息",
          rootNode: {
            type: "container",
            style: { className: "flex flex-col gap-3" },
            children: [
              {
                type: "container",
                style: {
                  className:
                    "bg-blue-50/50 rounded-lg p-4 border border-blue-100 flex items-start gap-3",
                },
                children: [
                  {
                    type: "icon",
                    props: { iconName: "Puzzle" },
                    style: { className: "w-5 h-5 text-blue-500 mt-0.5" },
                  },
                  {
                    type: "container",
                    style: { className: "flex flex-col gap-1" },
                    children: [
                      {
                        type: "text",
                        props: { text: "格式错误" },
                        style: {
                          className: "text-sm font-bold text-slate-700",
                        },
                      },
                      {
                        type: "text",
                        props: {
                          text: "AI 返回了非标准格式，请点击下方按钮重试。",
                        },
                        style: { className: "text-xs text-blue-500" },
                      },
                    ],
                  },
                ],
              },
              {
                type: "button",
                props: { text: "重新生成", onClickIntent: displayText },
                style: {
                  className:
                    "w-full bg-blue-500 hover:bg-blue-600 text-white py-3 rounded-xl font-bold text-sm shadow-sm transition-colors active:scale-[0.98]",
                },
              },
            ],
          },
        };
      }

      setMessages((prev) => {
        const filtered = prev.filter((m) => m.id !== loaderId);
        return [
          ...filtered,
          {
            id: Date.now().toString() + "_ai",
            sender: Sender.AGENT,
            type: MessageType.A2UI_WIDGET,
            thought: undefined,
            content: jsonResponse.summary,
            widgetPayload: {
              title: jsonResponse.title || "鸿小通",
              analysis: jsonResponse.analysis, // Capture Analysis
              rootNode: jsonResponse.rootNode,
            },
            timestamp: new Date(),
          },
        ];
      });
    } catch (error: any) {
      setMessages((prev) => {
        const filtered = prev.filter((m) => m.id !== loaderId);
        return [
          ...filtered,
          {
            id: Date.now().toString() + "_err",
            sender: Sender.AGENT,
            type: MessageType.TEXT,
            content: `网络连接错误: ${error.message}`,
            timestamp: new Date(),
          },
        ];
      });
    }
  };

  const handleSendMessage = () => {
    if (inputValue.trim()) {
      processUserMessage(inputValue);
      setInputValue("");
      setActiveGrid("none");
    }
  };

  return (
    <div className="flex flex-col h-screen bg-slate-50 max-w-md mx-auto relative shadow-2xl overflow-hidden font-sans">
      {showLeftPanel && (
        <div className="absolute inset-0 z-50 flex animate-fade-in">
          <div className="w-[80%] h-full bg-white shadow-xl animate-slide-in-left flex flex-col">
            <div className="p-4 border-b border-slate-100 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-slate-100 flex items-center justify-center">
                  <User className="w-5 h-5 text-slate-500" />
                </div>
                <div>
                  <div className="font-bold text-slate-800">
                    {currentUserRole}
                  </div>
                  <div className="text-xs text-slate-400">ID: 80021</div>
                </div>
              </div>
              <button
                onClick={() => setShowLeftPanel(false)}
                className="p-2 bg-slate-50 rounded-full"
              >
                <X className="w-4 h-4 text-slate-400" />
              </button>
            </div>
            <div className="p-4 flex-1 overflow-y-auto">
              <div className="flex items-center gap-2 bg-slate-50 p-2 rounded-lg border border-slate-100 mb-6">
                <Search className="w-4 h-4 text-slate-400" />
                <input
                  type="text"
                  placeholder="搜索功能..."
                  className="bg-transparent text-sm outline-none w-full"
                />
              </div>
              <div className="text-xs font-bold text-slate-400 uppercase mb-3">
                历史记录
              </div>
              <div className="space-y-1">
                <div className="p-3 hover:bg-slate-50 rounded-xl cursor-pointer text-sm text-slate-700">
                  运行态势监控
                </div>
              </div>
            </div>
          </div>
          <div
            className="flex-1 bg-black/20"
            onClick={() => setShowLeftPanel(false)}
          ></div>
        </div>
      )}

      <header className="flex items-center justify-between px-4 py-3 bg-white border-b border-slate-100 sticky top-0 z-20 shadow-sm">
        <button
          onClick={() => setShowLeftPanel(true)}
          className="p-2 hover:bg-slate-100 rounded-full transition-colors"
        >
          <Menu className="w-5 h-5 text-slate-700" />
        </button>
        <div className="flex items-center gap-2">
          <div className="w-8 h-8">
            <HongXiaoTongLogo className="w-full h-full" />
          </div>
          <span className="font-bold text-lg text-slate-800">鸿小通</span>
        </div>
        <button
          onClick={() => setShowRightPanel(!showRightPanel)}
          className="p-2 relative hover:bg-slate-100 rounded-full"
        >
          <Bell className="w-5 h-5 text-slate-600" />
          <span className="absolute top-1 right-1 w-2 h-2 bg-red-500 rounded-full border-2 border-white"></span>
        </button>
      </header>

      <main className="flex-1 overflow-y-auto p-4 pb-32 no-scrollbar bg-slate-50/20">
        {messages.map((msg) => (
          <ChatBubble
            key={msg.id}
            message={msg}
            onActionClick={(text, hidden) => processUserMessage(text, hidden)}
          />
        ))}
        <div ref={messagesEndRef} />
      </main>

      <footer className="fixed bottom-0 z-40 w-full max-w-md pointer-events-none">
        <div className="flex items-center justify-between px-4 pb-2 pointer-events-auto">
          <div className="flex-1 overflow-x-auto no-scrollbar flex items-center gap-2">
            {FUNCTION_ITEMS.map((item) => (
              <button
                key={item.id}
                onClick={() => processUserMessage(item.label)}
                className="flex-shrink-0 bg-white border border-slate-200 px-3 py-1.5 rounded-full text-[11px] font-bold text-slate-600 shadow-sm active:scale-95 transition-all"
              >
                {item.label}
              </button>
            ))}
          </div>
          <button
            onClick={() =>
              setActiveGrid(activeGrid === "business" ? "none" : "business")
            }
            className={`flex-shrink-0 w-8 h-8 rounded-full flex items-center justify-center shadow-sm border ${activeGrid === "business" ? "bg-blue-600 text-white border-blue-600" : "bg-white text-slate-500 border-white"}`}
          >
            <LayoutGrid className="w-4 h-4" />
          </button>
        </div>
        <div className="bg-white border-t border-slate-100 pointer-events-auto shadow-lg">
          <div className="p-3 pb-6 flex items-center gap-3">
            <button className="p-2 text-slate-600">
              <Mic className="w-6 h-6" />
            </button>
            <div className="flex-1 bg-slate-100 rounded-2xl flex items-center px-4 py-2.5 border border-transparent focus-within:border-blue-200 transition-all">
              <input
                type="text"
                value={inputValue}
                onChange={(e) => setInputValue(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && handleSendMessage()}
                placeholder="发消息或输入指令..."
                className="bg-transparent w-full outline-none text-slate-800 text-sm"
              />
            </div>
            <div className="flex items-center gap-1">
              {inputValue.trim() ? (
                <button
                  onClick={handleSendMessage}
                  className="p-2 bg-blue-600 rounded-full shadow-lg"
                >
                  <SendHorizontal className="w-5 h-5 text-white" />
                </button>
              ) : (
                <button
                  onClick={() =>
                    setActiveGrid(activeGrid === "media" ? "none" : "media")
                  }
                  className="p-2 text-slate-600"
                >
                  <PlusCircle className="w-6 h-6" />
                </button>
              )}
            </div>
          </div>
          <FunctionGrid
            isOpen={activeGrid === "media"}
            mode="media"
            items={MEDIA_ITEMS}
            onItemClick={(item) => {
              processUserMessage(`打开${item.label}`);
              setActiveGrid("none");
            }}
          />
        </div>
        <FunctionGrid
          isOpen={activeGrid === "business"}
          title="常用业务"
          mode="business"
          items={FUNCTION_ITEMS}
          onItemClick={(item) => {
            processUserMessage(item.label);
            setActiveGrid("none");
          }}
        />
      </footer>
    </div>
  );
}
