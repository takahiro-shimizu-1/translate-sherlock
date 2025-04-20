"use client"

import type React from "react"

import { useState } from "react"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import {
  translateToEnglish,
  convertToBritishEnglish,
  convertToSherlockStyle,
  analyzeSyntax,
  generateSimilarPhrases,
} from "@/utils/text-utils"

export default function Home() {
  const [inputText, setInputText] = useState("")
  const [translatedText, setTranslatedText] = useState("")
  const [britishText, setBritishText] = useState("")
  const [sherlockText, setSherlockText] = useState("")
  const [syntaxAnalysis, setSyntaxAnalysis] = useState<any>(null)
  const [similarPhrases, setSimilarPhrases] = useState<
    Array<{ original: string; translation: string; source: string }>
  >([])
  const [isProcessing, setIsProcessing] = useState(false)
  const [isJapanese, setIsJapanese] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const handleInputChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const text = e.target.value
    setInputText(text)
    // 日本語かどうかを判定（簡易的な判定）
    setIsJapanese(/[\u3000-\u303f\u3040-\u309f\u30a0-\u30ff\uff00-\uff9f\u4e00-\u9faf\u3400-\u4dbf]/.test(text))
  }

  const handleConvert = async () => {
    if (!inputText.trim()) return

    setIsProcessing(true)
    setError(null)

    try {
      let englishText = inputText

      // 日本語の場合は英語に翻訳
      if (isJapanese) {
        try {
          englishText = await translateToEnglish(inputText)
          setTranslatedText(englishText)
        } catch (error) {
          console.error("翻訳エラー:", error)
          setError(`翻訳中にエラーが発生しました: ${error instanceof Error ? error.message : String(error)}`)
          setIsProcessing(false)
          return
        }
      }

      // イギリス英語に変換
      try {
        const britishResult = await convertToBritishEnglish(englishText)
        setBritishText(britishResult)
      } catch (error) {
        console.error("イギリス英語変換エラー:", error)
        setError(`イギリス英語変換中にエラーが発生しました: ${error instanceof Error ? error.message : String(error)}`)
        setIsProcessing(false)
        return
      }

      // シャーロックホームズ調に変換
      try {
        const sherlockResult = await convertToSherlockStyle(britishText || englishText)
        setSherlockText(sherlockResult)
      } catch (error) {
        console.error("シャーロック調変換エラー:", error)
        setError(
          `シャーロック調変換中にエラーが発生しました: ${error instanceof Error ? error.message : String(error)}`,
        )
      }

      // 構文解析
      try {
        const analysisResult = await analyzeSyntax(sherlockText || britishText || englishText)
        setSyntaxAnalysis(analysisResult)
      } catch (error) {
        console.error("構文解析エラー:", error)
        // 構文解析のエラーは表示しない（結果が表示されないだけ）
      }

      // 類似フレーズ生成
      try {
        const phrasesResult = await generateSimilarPhrases(sherlockText || britishText || englishText)
        setSimilarPhrases(phrasesResult)
      } catch (error) {
        console.error("類似フレーズ生成エラー:", error)
        // 類似フレーズ生成のエラーは表示しない（結果が表示されないだけ）
      }
    } catch (error) {
      console.error("テキスト処理エラー:", error)
      setError(`処理中にエラーが発生しました: ${error instanceof Error ? error.message : String(error)}`)
    } finally {
      setIsProcessing(false)
    }
  }

  return (
    <main className="min-h-screen bg-white text-black p-4 md:p-8">
      <div className="max-w-4xl mx-auto">
        <header className="mb-8 text-center">
          <h1 className="text-3xl md:text-4xl font-bold mb-2">シャーロックホームズ調変換</h1>
          <p className="text-lg">
            あなたのテキストをエレガントなイギリス英語とシャーロックホームズの雰囲気に変換します
          </p>
        </header>

        <Card className="mb-8 border-black">
          <CardHeader>
            <CardTitle>入力テキスト</CardTitle>
            <CardDescription>変換したい日本語または英語テキストを入力してください</CardDescription>
          </CardHeader>
          <CardContent>
            <Textarea
              placeholder="ここにテキストを入力..."
              className="min-h-[150px] border-black focus:ring-black"
              value={inputText}
              onChange={handleInputChange}
            />
            {error && <p className="text-red-500 mt-2">{error}</p>}
          </CardContent>
          <CardFooter>
            <Button
              onClick={handleConvert}
              disabled={isProcessing || !inputText.trim()}
              className="w-full bg-black text-white hover:bg-gray-800"
            >
              {isProcessing ? "処理中..." : "テキスト変換"}
            </Button>
          </CardFooter>
        </Card>

        {(britishText || translatedText) && (
          <Tabs defaultValue={isJapanese ? "translation" : "british"} className="mb-8">
            <TabsList className="grid grid-cols-5 bg-white border border-black">
              {isJapanese && (
                <TabsTrigger
                  value="translation"
                  className="data-[state=active]:bg-black data-[state=active]:text-white"
                >
                  英語訳
                </TabsTrigger>
              )}
              <TabsTrigger value="british" className="data-[state=active]:bg-black data-[state=active]:text-white">
                イギリス英語
              </TabsTrigger>
              <TabsTrigger value="sherlock" className="data-[state=active]:bg-black data-[state=active]:text-white">
                シャーロック調
              </TabsTrigger>
              <TabsTrigger value="syntax" className="data-[state=active]:bg-black data-[state=active]:text-white">
                構文解析
              </TabsTrigger>
              <TabsTrigger value="similar" className="data-[state=active]:bg-black data-[state=active]:text-white">
                類似表現
              </TabsTrigger>
            </TabsList>

            {isJapanese && (
              <TabsContent value="translation">
                <Card className="border-black">
                  <CardHeader>
                    <CardTitle>英語訳</CardTitle>
                    <CardDescription>日本語テキストの英語訳</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="p-4 border border-black rounded-md bg-white">
                      <p className="whitespace-pre-wrap">{translatedText}</p>
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>
            )}

            <TabsContent value="british">
              <Card className="border-black">
                <CardHeader>
                  <CardTitle>イギリス英語</CardTitle>
                  <CardDescription>テキストをイギリス英語に変換しました</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="p-4 border border-black rounded-md bg-white">
                    <p className="whitespace-pre-wrap">{britishText}</p>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="sherlock">
              <Card className="border-black">
                <CardHeader>
                  <CardTitle>シャーロックホームズ調</CardTitle>
                  <CardDescription>シャーロックホームズの口調に変換しました</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="p-4 border border-black rounded-md bg-white">
                    <p className="whitespace-pre-wrap">{sherlockText}</p>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="syntax">
              <Card className="border-black">
                <CardHeader>
                  <CardTitle>構文解析</CardTitle>
                  <CardDescription>変換されたテキストの文法解析</CardDescription>
                </CardHeader>
                <CardContent>
                  {syntaxAnalysis && (
                    <div className="p-4 border border-black rounded-md bg-white">
                      <h3 className="font-bold mb-2">品詞分析</h3>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        {Object.entries(syntaxAnalysis.partsOfSpeech).map(([type, words]: [string, any]) => (
                          <div key={type} className="border border-black p-2">
                            <h4 className="font-semibold">{syntaxAnalysis.japaneseLabels[type] || type}</h4>
                            <p>{Array.isArray(words) ? words.join(", ") : words}</p>
                          </div>
                        ))}
                      </div>

                      <h3 className="font-bold mt-4 mb-2">文構造</h3>
                      <div className="border border-black p-2">
                        <p className="whitespace-pre-wrap">{syntaxAnalysis.japaneseStructure}</p>
                      </div>
                    </div>
                  )}
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="similar">
              <Card className="border-black">
                <CardHeader>
                  <CardTitle>類似表現</CardTitle>
                  <CardDescription>シャーロックホームズの物語から類似した表現</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="p-4 border border-black rounded-md bg-white">
                    <ul className="list-disc pl-5 space-y-4">
                      {similarPhrases.map((phrase, index) => (
                        <li key={index} className="mb-2">
                          <p className="font-semibold">{phrase.original}</p>
                          <p className="text-sm mt-1">「{phrase.translation}」</p>
                          <p className="text-xs text-gray-600 mt-1">出典: {phrase.source}</p>
                        </li>
                      ))}
                    </ul>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        )}
      </div>
    </main>
  )
}
