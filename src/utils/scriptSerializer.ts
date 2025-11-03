import { SlideScript } from "@/types/slides";

/**
 * Converts SlideScript array to formatted JSON string
 * @param slideScripts - Array of SlideScript objects
 * @returns Formatted JSON string (2-space indentation)
 */
export function serializeSlideScripts(slideScripts: SlideScript[]): string {
  const scriptObject = {
    slides: slideScripts.map((slide) => ({
      title: slide.title,
      transition: slide.transition,
      groups: slide.messageGroups.map((group) => ({
        ...(group.speaker && { speaker: group.speaker }),
        messages: group.messages,
        ...(group.animation && { animation: group.animation }),
      })),
    })),
  };

  return JSON.stringify(scriptObject, null, 2);
}
