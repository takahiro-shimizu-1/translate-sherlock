"use server"

/**
 * Gemini APIを使用してテキスト生成を行う関数
 */
export async function generateWithGemini(prompt: string): Promise<string> {
  try {
    const apiKey = process.env.GEMINI_API_KEY

    if (!apiKey) {
      throw new Error("Gemini API key is not set")
    }

    // 修正されたエンドポイントとモデル名
    const response = await fetch(
      `https://generativelanguage.googleapis.com/v1/models/gemini-2.0-flash:generateContent?key=${apiKey}`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          contents: [
            {
              role: "user",
              parts: [
                {
                  text:
                    prompt +
                    "\n\n重要な注意事項:\n1. マークダウン記法（```など）は絶対に使わないでください。\n2. 純粋なテキストまたはJSONのみを返してください。\n3. JSONを返す場合は、有効なJSONであることを確認してください。\n4. 余分な説明や前置きは不要です。",
                },
              ],
            },
          ],
          generationConfig: {
            temperature: 0.2, // より決定論的な応答のために温度を下げる
            topK: 40,
            topP: 0.95,
            maxOutputTokens: 8192,
          },
        }),
      },
    )

    if (!response.ok) {
      const errorText = await response.text()
      console.error("Gemini API error response:", errorText)
      let errorData
      try {
        errorData = JSON.parse(errorText)
      } catch (e) {
        errorData = { error: { message: errorText } }
      }
      throw new Error(`Gemini API error: ${errorData.error?.message || response.status}`)
    }

    const data = await response.json()

    // レスポンスからテキストを抽出（レスポンス構造を修正）
    const generatedText = data.candidates?.[0]?.content?.parts?.[0]?.text || ""
    return generatedText
  } catch (error) {
    console.error("Error generating text with Gemini:", error)
    throw error
  }
}
