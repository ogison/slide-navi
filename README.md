# Slide Navi

Slide Navi is a Next.js application for rehearsing slide presentations. Upload a PDF deck, write a companion script, and rehearse with synchronized slide playback, typewriter-style audio cues, or speech synthesis.

## Summary

- Upload a PDF to preview individual slides with navigation controls.
- Draft and manage narration scripts with automatic grouping by slide.
- Rehearse with auto-play, timing controls, and either typewriter sound effects or speech synthesis.
- Store audio preferences in local storage so rehearsal settings persist across sessions.

## Getting started

1. Install dependencies: `npm install`
2. Start the development server: `npm run dev`
3. Build for production: `npm run build`
4. Preview the production build locally: `npm run start`

## Usage

1. **Upload slides** – Use the "PDF" tab to upload your deck. The viewer previews each page so you can confirm slide order.
2. **Load or author a script** – Open the "編集" tab and paste a script JSON that follows the format described below. Slide Navi parses the JSON and pairs each slide with its narration groups.
3. **Rehearse** – Switch back to the viewer to step through slides manually or enable auto play. Choose between the typewriter audio cue or synthesized speech, and adjust timing as needed.
4. **Iterate quickly** – Edit the script JSON directly in the editor. Parsing errors appear inline so you can resolve formatting issues before the next run-through.

## Script JSON format

Slide Navi expects a JSON document that describes each slide and its narration groups.

- The JSON can be either an array of slide objects or an object with a top-level `slides` array.
- Each slide object supports:
  - `title` (optional string): Used as the slide heading in the rehearsal view.
  - `transition` (optional string or `{ "type": string }`): Defaults to `"immediate"`. Only `"immediate"` is currently supported.
  - `groups` / `messageGroups` / `messages`: Narration content. Use `groups` for consistency.
- Each group can be:
  - A string (treated as a single message), or
  - An object with the following recommended shape:
    - `id` (optional string): Stable identifier used internally.
    - `speaker` (optional string): Choose `"axolotl"` or `"yagi"`. Defaults to `"axolotl"`.
    - `messages` (array): Each entry is either a string or an object with a `text` property.
    - `animation` (optional string): `"fight"` triggers the special battle animation; omit for standard playback.
- Messages that are empty or whitespace are ignored. If a slide has no groups or messages, it is treated as an empty script for that slide.

### Example

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

For a deeper dive into writing narration content, see [SCRIPT_RULES.md](SCRIPT_RULES.md).

## Additional documentation

- [README.ja.md](README.ja.md) – Japanese overview of Slide Navi.
- [SCRIPT_RULES.md](SCRIPT_RULES.md) – Detailed guidelines for writing rehearsal scripts.
- [docs/script-json-prompt.md](docs/script-json-prompt.md) – Prompt template for generating script JSON with an LLM.
