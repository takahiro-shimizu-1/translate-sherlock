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

  const handleReset = () => {
    setInputText("")
    setTranslatedText("")
    setBritishText("")
    setSherlockText("")
    setSyntaxAnalysis(null)
    setSimilarPhrases([])
    setError(null)
  }

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
    <main className="min-h-screen gradient-background text-gray-900 pt-20 pb-16">
      <div className="max-w-4xl mx-auto px-4">
        <header className="mb-12 text-center">
          <div className="inline-flex items-center justify-center rounded-full bg-blue-50 px-3 py-1 text-xs font-medium text-blue-700 mb-6">
            SHERLOCK TEXT CONVERTER
          </div>
          <h1 className="text-4xl md:text-5xl font-bold mb-4 tracking-tight">シャーロックホームズ調変換</h1>
          <p className="text-lg text-gray-600 max-w-2xl mx-auto">
            あなたのテキストをエレガントなイギリス英語とシャーロックホームズの雰囲気に変換します
          </p>
        </header>

        <Card className="mb-8 shadow-sm border border-gray-200">
          <CardHeader>
            <CardTitle>入力テキスト</CardTitle>
            <CardDescription>変換したい日本語または英語テキストを入力してください</CardDescription>
          </CardHeader>
          <CardContent>
            <Textarea
              placeholder="ここにテキストを入力..."
              className="min-h-[150px] border-gray-200 focus:ring-blue-500 focus:border-blue-500"
              value={inputText}
              onChange={handleInputChange}
            />
            {error && <p className="text-red-500 mt-2">{error}</p>}
          </CardContent>
          <CardFooter>
            <Button
              onClick={handleConvert}
              disabled={isProcessing || !inputText.trim()}
              className="w-full bg-blue-500 hover:bg-blue-600 text-white"
            >
              {isProcessing ? "処理中..." : "テキスト変換"}
            </Button>
            <Button onClick={handleReset} variant="outline" className="w-full mt-2 border-gray-200 text-gray-700">
              リセット
            </Button>
          </CardFooter>
        </Card>

        {(britishText || translatedText) && (
          <Tabs defaultValue={isJapanese ? "translation" : "british"} className="mb-8">
            <TabsList className="grid grid-cols-5 bg-gray-50 rounded-xl p-1">
              {isJapanese && (
                <TabsTrigger
                  value="translation"
                  className="rounded-lg data-[state=active]:bg-white data-[state=active]:shadow-sm"
                >
                  英語訳
                </TabsTrigger>
              )}
              <TabsTrigger
                value="british"
                className="rounded-lg data-[state=active]:bg-white data-[state=active]:shadow-sm"
              >
                イギリス英語
              </TabsTrigger>
              <TabsTrigger
                value="sherlock"
                className="rounded-lg data-[state=active]:bg-white data-[state=active]:shadow-sm"
              >
                シャーロック調
              </TabsTrigger>
              <TabsTrigger
                value="syntax"
                className="rounded-lg data-[state=active]:bg-white data-[state=active]:shadow-sm"
              >
                構文解析
              </TabsTrigger>
              <TabsTrigger
                value="similar"
                className="rounded-lg data-[state=active]:bg-white data-[state=active]:shadow-sm"
              >
                類似表現
              </TabsTrigger>
            </TabsList>

            {isJapanese && (
              <TabsContent value="translation">
                <Card className="shadow-sm border border-gray-200">
                  <CardHeader>
                    <CardTitle>英語訳</CardTitle>
                    <CardDescription>日本語テキストの英語訳</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="p-4 border border-gray-200 rounded-lg bg-gray-50">
                      <p className="whitespace-pre-wrap">{translatedText}</p>
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>
            )}

            <TabsContent value="british">
              <Card className="shadow-sm border border-gray-200">
                <CardHeader>
                  <CardTitle>イギリス英語</CardTitle>
                  <CardDescription>テキストをイギリス英語に変換しました</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="p-4 border border-gray-200 rounded-lg bg-gray-50">
                    <p className="whitespace-pre-wrap">{britishText}</p>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="sherlock">
              <Card className="shadow-sm border border-gray-200">
                <CardHeader>
                  <CardTitle>シャーロックホームズ調</CardTitle>
                  <CardDescription>シャーロックホームズの口調に変換しました</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="p-4 border border-gray-200 rounded-lg bg-gray-50">
                    <p className="whitespace-pre-wrap">{sherlockText}</p>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="syntax">
              <Card className="shadow-sm border border-gray-200">
                <CardHeader>
                  <CardTitle>構文解析</CardTitle>
                  <CardDescription>変換されたテキストの文法解析</CardDescription>
                </CardHeader>
                <CardContent>
                  {syntaxAnalysis && (
                    <div className="p-4 border border-gray-200 rounded-lg bg-gray-50">
                      <h3 className="font-bold mb-2">品詞分析</h3>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        {Object.entries(syntaxAnalysis.partsOfSpeech).map(([type, words]: [string, any]) => (
                          <div key={type} className="border border-gray-200 p-2 rounded-lg bg-white">
                            <h4 className="font-semibold">{syntaxAnalysis.japaneseLabels[type] || type}</h4>
                            <p className="text-gray-700">{Array.isArray(words) ? words.join(", ") : words}</p>
                          </div>
                        ))}
                      </div>

                      <h3 className="font-bold mt-4 mb-2">文構造</h3>
                      <div className="border border-gray-200 p-2 rounded-lg bg-white">
                        <p className="whitespace-pre-wrap text-gray-700">{syntaxAnalysis.japaneseStructure}</p>
                      </div>
                    </div>
                  )}
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="similar">
              <Card className="shadow-sm border border-gray-200">
                <CardHeader>
                  <CardTitle>類似表現</CardTitle>
                  <CardDescription>シャーロックホームズの物語から類似した表現</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="p-4 border border-gray-200 rounded-lg bg-gray-50">
                    <ul className="list-disc pl-5 space-y-4">
                      {similarPhrases.map((phrase, index) => (
                        <li key={index} className="mb-2">
                          <p className="font-semibold">{phrase.original}</p>
                          <p className="text-sm mt-1 text-gray-700">「{phrase.translation}」</p>
                          <p className="text-xs text-gray-500 mt-1">出典: {phrase.source}</p>
                        </li>
                      ))}
                    </ul>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        )}
        {(britishText || translatedText) && (
          <div className="flex justify-center mt-4">
            <Button onClick={handleReset} variant="outline" className="border-gray-200 text-gray-700">
              すべてリセット
            </Button>
          </div>
        )}
      </div>
    </main>
  )
}
