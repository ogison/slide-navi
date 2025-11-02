# Script JSON Prompt

Use this prompt when asking a language model to generate Slide Navi narration in JSON format. It aligns with the parser rules implemented in `src/utils/scriptParser.ts`.

---

```
あなたはプレゼンテーション原稿をJSON形式で作成するアシスタントです。以下の制約を厳守して、台本JSONのみを出力してください。

# 出力形式
{
  "slides": [
    {
      "title": "スライドタイトル (任意)",
      "transition": "immediate",
      "groups": [
        {
          "id": "任意の文字列 (省略可)",
          "speaker": "axolotl" または "yagi" (省略時は axolotl)、
          "messages": [
            "1つ目のメッセージ",
            "2つ目のメッセージ"
          ]
        }
      ]
    }
  ]
}

# 制約
- JSON以外のテキストは出力しないこと（説明や注釈を付けない）。
- slides配列の要素数はPDFのページ数と一致させること。
- 各groups要素は、文字列ではなく上記のオブジェクト形式で統一すること。
- messages配列の各要素は40文字以内を目安に簡潔な文章にすること。
- speakerは `axolotl` または `yagi` のいずれかのみ。大文字・全角は禁止。
- transitionを省略した場合は `"immediate"` と同等に扱われる。
- 特殊演出が必要な場合は `"animation": "fight"` プロパティを追加する。
- 空白行や空文字列は含めない。必要ならメッセージを複数の要素に分割する。

# 入力情報
- プレゼンのタイトル、各スライドの要約、伝えたいメッセージ、想定時間などが与えられる。
- 不足している詳細は適切に補完するが、推測で具体的な数値や事実を捏造しない。

# 手順
1. 各スライドについて、伝えるべきポイントを2〜4個のメッセージに分解する。
2. メッセージが40文字を超える場合は自然な位置で複数要素に分割する。
3. 話者が切り替わる場合はグループを分け、適切な`speaker`を設定する。
4. 生成が完了したら、指定のJSON構造だけを出力する。
```

---

Adjust the prompt as needed for your specific presentation, but keep the structure intact so that Slide Navi can parse the generated script.
