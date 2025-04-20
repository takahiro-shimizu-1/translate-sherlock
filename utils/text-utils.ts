"use server"

import { generateWithGemini } from "./gemini-api"

/**
 * マークダウンからJSONを抽出し、修復する関数
 */
function extractAndRepairJson(text: string): string {
  if (typeof text !== "string") {
    console.error("extractAndRepairJson: Input is not a string:", text)
    return "{}" // 空のJSONオブジェクトを返す
  }

  try {
    // マークダウンのコードブロック（\`\`\`json や \`\`\` など）を削除
    let cleanedText = text.replace(/```json\s*|\s*```/g, "")

    // 前後の空白を削除
    cleanedText = cleanedText.trim()

    // JSONの開始と終了を確認
    if (!cleanedText.startsWith("{") && !cleanedText.startsWith("[")) {
      // JSONの開始位置を探す
      const jsonStartIndex = Math.min(
        cleanedText.indexOf("{") !== -1 ? cleanedText.indexOf("{") : Number.POSITIVE_INFINITY,
        cleanedText.indexOf("[") !== -1 ? cleanedText.indexOf("[") : Number.POSITIVE_INFINITY,
      )

      if (jsonStartIndex !== Number.POSITIVE_INFINITY) {
        cleanedText = cleanedText.substring(jsonStartIndex)
      } else {
        return "{}" // JSONの開始が見つからない場合は空のオブジェクトを返す
      }
    }

    // JSONの終了位置を探す
    const lastBraceIndex = cleanedText.lastIndexOf("}")
    const lastBracketIndex = cleanedText.lastIndexOf("]")

    // 最後の閉じ括弧を見つける
    let lastIndex = -1
    if (cleanedText.startsWith("{")) {
      lastIndex = lastBraceIndex
    } else if (cleanedText.startsWith("[")) {
      lastIndex = lastBracketIndex
    } else {
      // 開始括弧に基づいて最後の閉じ括弧を決定
      lastIndex = Math.max(lastBraceIndex, lastBracketIndex)
    }

    if (lastIndex !== -1) {
      cleanedText = cleanedText.substring(0, lastIndex + 1)
    }

    // 壊れたJSONを修復する試み
    try {
      JSON.parse(cleanedText)
      return cleanedText // 正常にパースできた場合はそのまま返す
    } catch (parseError) {
      console.log("Attempting to repair JSON:", parseError)

      // 配列の場合の修復
      if (cleanedText.startsWith("[")) {
        // 不完全な配列要素を修復
        cleanedText = repairJsonArray(cleanedText)
      }

      // オブジェクトの場合の修復
      if (cleanedText.startsWith("{")) {
        // 不完全なオブジェクトを修復
        cleanedText = repairJsonObject(cleanedText)
      }

      return cleanedText
    }
  } catch (error) {
    console.error("JSON抽出・修復エラー:", error)
    return "{}" // エラーが発生した場合は空のJSONオブジェクトを返す
  }
}

/**
 * 壊れたJSON配列を修復する
 */
function repairJsonArray(jsonText: string): string {
  // 最後の文字が]でない場合は追加
  if (!jsonText.endsWith("]")) {
    jsonText += "]"
  }

  // 配列要素間のカンマの問題を修正
  try {
    JSON.parse(jsonText)
    return jsonText
  } catch (error) {
    // エラーメッセージから問題の位置を特定
    const errorMessage = (error as Error).message
    const positionMatch = errorMessage.match(/position (\d+)/)

    if (positionMatch && positionMatch[1]) {
      const errorPosition = Number.parseInt(positionMatch[1])

      // エラー位置の前後の文字を確認
      const beforeError = jsonText.substring(Math.max(0, errorPosition - 10), errorPosition)
      const afterError = jsonText.substring(errorPosition, Math.min(jsonText.length, errorPosition + 10))

      console.log(`JSON error context: ...${beforeError}|ERROR|${afterError}...`)

      // カンマが必要な場合は追加
      if (afterError.trim().startsWith("{") && beforeError.includes("}")) {
        const fixedJson = jsonText.substring(0, errorPosition) + "," + jsonText.substring(errorPosition)
        try {
          JSON.parse(fixedJson)
          return fixedJson
        } catch (e) {
          // 修復に失敗した場合は単純化
          return "[]"
        }
      }

      // その他の修復方法を試す
      // ...
    }

    // 修復に失敗した場合は空の配列を返す
    return "[]"
  }
}

/**
 * 壊れたJSONオブジェクトを修復する
 */
function repairJsonObject(jsonText: string): string {
  // 最後の文字が}でない場合は追加
  if (!jsonText.endsWith("}")) {
    jsonText += "}"
  }

  try {
    JSON.parse(jsonText)
    return jsonText
  } catch (error) {
    // 修復に失敗した場合は空のオブジェクトを返す
    return "{}"
  }
}

/**
 * 日本語テキストを英語に翻訳
 */
export async function translateToEnglish(text: string): Promise<string> {
  try {
    const prompt = `
あなたは高品質な翻訳を提供するAIアシスタントです。
以下の日本語テキストを自然なアメリカ英語に翻訳してください。
翻訳のみを出力し、説明や追加のコメントは不要です。

日本語テキスト:
${text}
`

    const translatedText = await generateWithGemini(prompt)
    return translatedText.trim()
  } catch (error) {
    console.error("翻訳エラー:", error)
    // 簡易的なフォールバック
    return `Translation of: ${text}`
  }
}

/**
 * テキストをイギリス英語に変換
 */
export async function convertToBritishEnglish(text: string): Promise<string> {
  try {
    const prompt = `
あなたは英語のスタイル変換の専門家です。
以下の日本語テキストをイギリス英語に変換してください。とにかくイギリス英語特有の表現を積極的に使ってください。
スペルや語彙、表現をイギリス英語のスタイルに合わせてください。
変換されたテキストのみを出力し、説明や追加のコメントは不要です。

テキスト:
${text}
`

    const britishText = await generateWithGemini(prompt)
    return britishText.trim()
  } catch (error) {
    console.error("イギリス英語変換エラー:", error)
    // 簡易的なフォールバック
    return text
  }
}

/**
 * テキストをシャーロックホームズ調に変換
 */
export async function convertToSherlockStyle(text: string): Promise<string> {
  try {
    const prompt = `
あなたはシャーロックホームズの文体と語彙に精通した文体変換の専門家です。
以下のテキストをシャーロックホームズ（特にコナン・ドイルの原作）の文体に変換してください。

変換の際は以下の特徴を取り入れてください：
1. ビクトリア朝時代の格式高い言い回し
2. シャーロックホームズが使用する特徴的な表現や語彙
3. 論理的で分析的な表現
4. 時には "Elementary, my dear Watson" や "The game is afoot" などの有名なフレーズを適切に挿入
5. 現代的な表現を避け、19世紀後半のイギリスの知的階級にふさわしい言葉遣い

その後、変換された文章について、日本語で以下の形式で解説してください：

- 使われている主な語彙とその効果（シャーロックらしい単語、時代背景を感じさせる単語など）
- 文章構造や言い回しの特徴（格式、長文構造、倒置法など）
- 文体が原文と比べてどう変化したか（語調や論理性の強調など）

input:
テキスト:
${text}

output:
最終出力は以下の2部構成にしてください：

=== Holmes Style (British English) ===
[変換後の文章（イギリス英語）]

=== 日本語 ===
[変換後の文章を日本語に翻訳する]

=== 解説（日本語） ===
[語彙、構文、文体に関する解説]
`

    const sherlockText = await generateWithGemini(prompt)
    return sherlockText.trim()
  } catch (error) {
    console.error("シャーロック調変換エラー:", error)
    // 簡易的なフォールバック
    return `In the style of Sherlock Holmes: ${text}`
  }
}

/**
 * テキストの構文を解析
 */
export async function analyzeSyntax(text: string): Promise<any> {
  try {
    const prompt = `
あなたは英語の構文解析の専門家です。
以下の英語テキストを解析し、以下の情報を含むJSON形式で結果を返してください：

1. 品詞分析（名詞、動詞、形容詞、副詞のリスト）
2. 文の数と種類（平叙文、疑問文、感嘆文）
3. 文構造の説明（日本語で）

テキスト:
${text}

以下の形式で返してください（マークダウンやコードブロックは使わず、純粋なJSONのみを出力）：
{
  "partsOfSpeech": {
    "nouns": ["名詞1", "名詞2"],
    "verbs": ["動詞1", "動詞2"],
    "adjectives": ["形容詞1", "形容詞2"],
    "adverbs": ["副詞1", "副詞2"]
  },
  "sentenceCount": 文の数,
  "sentenceTypes": ["文タイプ1", "文タイプ2"],
  "japaneseStructure": "日本語での文構造の説明",
  "japaneseLabels": {
    "nouns": "名詞",
    "verbs": "動詞",
    "adjectives": "形容詞",
    "adverbs": "副詞",
    "sentenceCount": "文の数",
    "sentenceTypes": "文のタイプ"
  }
}
`

    try {
      const analysisText = await generateWithGemini(prompt)
      console.log("Raw analysis response:", analysisText ? analysisText.substring(0, 100) + "..." : "undefined") // デバッグ用

      // マークダウンからJSONを抽出して修復
      const cleanedJson = extractAndRepairJson(analysisText)
      console.log("Cleaned JSON:", cleanedJson.substring(0, 100) + "...") // デバッグ用

      try {
        // JSONをパース
        return JSON.parse(cleanedJson)
      } catch (finalParseError) {
        console.error("最終的なJSON解析エラー:", finalParseError)
        return createFallbackAnalysis(text)
      }
    } catch (parseError) {
      console.error("JSON解析エラー:", parseError)
      // フォールバック解析を返す
      return createFallbackAnalysis(text)
    }
  } catch (error) {
    console.error("構文解析エラー:", error)
    return createFallbackAnalysis(text)
  }
}

/**
 * シャーロックホームズの物語から類似フレーズを生成
 */
export async function generateSimilarPhrases(
  text: string,
): Promise<Array<{ original: string; translation: string; source: string }>> {
  try {
    const prompt = `
あなたはシャーロックホームズの物語に精通した専門家です。
以下のテキストに関連するシャーロックホームズの物語からの引用を3つだけ選んでください。
それぞれの引用について、原文、日本語訳、出典（どの作品からの引用か）を提供してください。

テキスト:
${text}

以下の形式で返してください（マークダウンやコードブロックは使わず、純粋なJSONのみを出力）：
[
  {
    "original": "英語の原文",
    "translation": "日本語訳",
    "source": "出典作品名（英語と日本語）"
  },
  {
    "original": "英語の原文",
    "translation": "日本語訳",
    "source": "出典作品名（英語と日本語）"
  },
  {
    "original": "英語の原文",
    "translation": "日本語訳",
    "source": "出典作品名（英語と日本語）"
  }
]

注意: 必ず3つの引用だけを返してください。それ以上でも以下でもなく、正確に3つです。
また、各引用は必ず上記のJSON形式に従ってください。
`

    try {
      const phrasesText = await generateWithGemini(prompt)

      if (!phrasesText || typeof phrasesText !== "string") {
        console.error("類似フレーズ生成: 無効なレスポンス", phrasesText)
        return createFallbackPhrases()
      }

      console.log("Raw phrases response:", phrasesText.substring(0, 100) + "...") // デバッグ用

      // マークダウンからJSONを抽出して修復
      const cleanedJson = extractAndRepairJson(phrasesText)
      console.log("Cleaned phrases JSON:", cleanedJson.substring(0, 100) + "...") // デバッグ用

      try {
        // JSONをパース
        const parsedPhrases = JSON.parse(cleanedJson)

        // 配列であることを確認
        if (!Array.isArray(parsedPhrases)) {
          console.error("類似フレーズ生成: 結果が配列ではありません", parsedPhrases)
          return createFallbackPhrases()
        }

        // 各要素が必要なプロパティを持っているか確認
        const validPhrases = parsedPhrases.filter(
          (phrase) =>
            phrase &&
            typeof phrase === "object" &&
            "original" in phrase &&
            "translation" in phrase &&
            "source" in phrase,
        )

        if (validPhrases.length === 0) {
          console.error("類似フレーズ生成: 有効なフレーズがありません", parsedPhrases)
          return createFallbackPhrases()
        }

        return validPhrases
      } catch (finalParseError) {
        console.error("最終的なJSON解析エラー:", finalParseError, "Cleaned JSON:", cleanedJson)
        return createFallbackPhrases()
      }
    } catch (parseError) {
      console.error("JSON解析エラー:", parseError)
      return createFallbackPhrases()
    }
  } catch (error) {
    console.error("類似フレーズ生成エラー:", error)
    return createFallbackPhrases()
  }
}

// フォールバック関数
function createFallbackAnalysis(text: string): any {
  // 単語の抽出
  const words = text.split(/\s+/).filter((word) => word.length > 0)

  return {
    partsOfSpeech: {
      nouns: ["analysis", "unavailable"],
      verbs: ["is"],
      adjectives: ["unavailable"],
      adverbs: [],
    },
    sentenceCount: 1,
    sentenceTypes: ["Statement"],
    japaneseStructure: "APIエラーのため解析できませんでした。",
    japaneseLabels: {
      nouns: "名詞",
      verbs: "動詞",
      adjectives: "形容詞",
      adverbs: "副詞",
      sentenceCount: "文の数",
      sentenceTypes: "文のタイプ",
    },
  }
}

function createFallbackPhrases(): Array<{ original: string; translation: string; source: string }> {
  return [
    {
      original: "When you have eliminated the impossible, whatever remains, however improbable, must be the truth.",
      translation: "不可能なものを除外したら、残ったもの、それがどんなに信じがたくても、真実に違いない。",
      source: "The Sign of the Four (四つの署名)",
    },
    {
      original: "It is a capital mistake to theorize before one has data.",
      translation: "データを持つ前に理論を立てるのは、重大な誤りだ。",
      source: "A Scandal in Bohemia (ボヘミアの醜聞)",
    },
    {
      original: "I never guess. It is a shocking habit—destructive to the logical faculty.",
      translation: "私は決して推測などしない。それは論理的思考力を破壊する恐ろしい習慣だ。",
      source: "The Sign of the Four (四つの署名)",
    },
  ]
}
