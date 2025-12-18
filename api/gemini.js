// 這是 Vercel Serverless Function
// 負責在伺服器端安全地呼叫 Google Gemini API

export default async function handler(req, res) {
  // 1. 取得環境變數中的 API Key
  const apiKey = process.env.GEMINI_API_KEY;

  if (!apiKey) {
    return res.status(500).json({ error: "Server Configuration Error: API Key is missing." });
  }

  // 只允許 POST 請求
  if (req.method !== 'POST') {
    return res.status(405).json({ error: "Method Not Allowed" });
  }

  try {
    // 2. 準備轉發給 Google 的請求
    // 注意：我們使用 gemini-2.5-flash-preview-09-2025 模型
    const googleUrl = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash-preview-09-2025:generateContent?key=${apiKey}`;

    // 3. 發送請求到 Google
    const googleResponse = await fetch(googleUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(req.body) // 將前端傳來的資料原樣轉發
    });

    // 4. 處理 Google 的回應
    const data = await googleResponse.json();

    if (!googleResponse.ok) {
      // 如果 Google 回傳錯誤，將錯誤訊息回傳給前端
      return res.status(googleResponse.status).json(data);
    }

    // 5. 回傳成功結果給前端
    return res.status(200).json(data);

  } catch (error) {
    console.error("Gemini API Proxy Error:", error);
    return res.status(500).json({ error: "Internal Server Error" });
  }
}