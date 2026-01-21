// const BASE_URL = 'http://10.30.32.110:8080'
const BASE_URL = "";

/**
 * 发送聊天消息到后端
 * @param {string} message - 用户消息
 * @param {string} sessionId - 会话ID
 * @param {string} workNo - 工号
 * @returns {Promise<Object>} API 响应
 */
export async function sendChatMessage(message, sessionId, workNo = "") {
  try {
    const payload = {
      message: message,
      sessionId,
      workNo,
    };
    const response = await fetch(`${BASE_URL}/api/chat`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(payload),
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const data = await response.json();
    return data;
  } catch (error) {
    console.error("API 调用失败:", error);
    throw error;
  }
}

/**
 * 查询待我审核的数量
 * @param {string} workNo - 工号
 * @returns {Promise<Object>} API 响应
 */
export async function getApprovalCount(workNo) {
  try {
    const response = await fetch(`${BASE_URL}/api/approvalList`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        approvalWorkNo: workNo,
      }),
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const data = await response.json();
    return data;
  } catch (error) {
    console.error("获取待审核数量失败:", error);
    return { success: false, data: 0 };
  }
}

export async function getUserInfo(workNo) {
  try {
    const response = await fetch(`${BASE_URL}/api/userInfo`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        workNo: workNo,
      }),
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const data = await response.json();
    return data;
  } catch (error) {
    return { success: false, data: null };
  }
}

/**
 * 生成唯一的会话ID
 * @returns {string} UUID
 */
export function generateSessionId() {
  return "xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx".replace(/[xy]/g, function (c) {
    const r = (Math.random() * 16) | 0;
    const v = c === "x" ? r : (r & 0x3) | 0x8;
    return v.toString(16);
  });
}
