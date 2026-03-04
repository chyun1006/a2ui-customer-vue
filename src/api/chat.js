// 使用相对路径，开发时由 Vite 代理到对应后端（/api/chat -> 本地 server，其余 /api -> 业务后端）
const BASE_URL = "";

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
    return data.data;
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
