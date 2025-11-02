# 台本入力ガイド

Slide Navi ではリハーサル用の台本を JSON 形式で読み込みます。このファイルはスライドごとのナレーションを管理し、ビューワーと同期して再生するための情報を持ちます。本ガイドでは、台本 JSON の構造と記述ルールをまとめます。

## JSON の基本構造

- ルートはスライドオブジェクトの配列、または `slides` プロパティを持つオブジェクトのどちらでも構いません。
- 各スライドオブジェクトにはタイトル、遷移方法、ナレーショングループを設定できます。

```json
{
  "slides": [
    {
      "title": "スライドタイトル",
      "transition": "immediate",
      "groups": []
    }
  ]
}
```

## スライドオブジェクトのフィールド

- `title` (任意の文字列) — リハーサル画面で表示する見出し。未指定の場合は空欄になります。
- `transition` (任意: 文字列または `{ "type": string }`) — スライド切り替え方法。省略時は `"immediate"`。現在サポートしているのは `"immediate"` のみです。
- `groups` / `messageGroups` / `messages` — ナレーションの配列。`groups` を推奨します。

## グループの記述方法

グループはシンプルに文字列ひとつでも、詳細なオブジェクトでも構いません。推奨フォーマットは以下です。

- `id` (任意の文字列) — 内部的な識別子。再利用すると台本の差分管理がしやすくなります。
- `speaker` (任意の文字列) — 発話キャラクター。`"axolotl"` または `"yagi"` を指定できます。省略時は `"axolotl"`。
- `messages` (必須: 配列) — ナレーション本文。各要素は文字列、または `{ "text": string }` 形式のオブジェクト。
- `animation` (任意の文字列) — `"fight"` を指定するとバトル演出を再生します。未指定の場合は標準演出です。

## バリデーションルール

- 空文字列や空白のみのメッセージは無視されます。
- `groups` / `messages` が空のスライドは、台本が設定されていないスライドとして扱われます。

## サンプル

```json
{
  "slides": [
    {
      "title": "Introduction",
      "transition": "immediate",
      "groups": [
        {
          "speaker": "axolotl",
          "messages": [
            "Hello everyone, thank you for joining us today.",
            "Let's dive into the agenda."
          ]
        },
        {
          "id": "intro-q",
          "speaker": "yagi",
          "messages": [
            "If you have questions, feel free to note them for the Q&A."
          ],
          "animation": "fight"
        }
      ]
    }
  ]
}
```
