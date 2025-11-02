import type {
  SlideScript,
  MessageLine,
  MessageGroup,
  TransitionType,
} from "@/types/slides";

const splitByPunctuation = (text: string): string[] => {
  // Split long lines by Japanese/Chinese punctuation
  const maxLength = 40;
  if (text.length <= maxLength) {
    return [text];
  }

  // Split by punctuation marks
  const parts: string[] = [];
  const punctuations = /[。、？！?,]/g;
  let lastIndex = 0;
  let match;

  while ((match = punctuations.exec(text)) !== null) {
    const part = text.substring(lastIndex, match.index + 1).trim();
    if (part) {
      parts.push(part);
    }
    lastIndex = match.index + 1;
  }

  // Add remaining text
  if (lastIndex < text.length) {
    const remaining = text.substring(lastIndex).trim();
    if (remaining) {
      parts.push(remaining);
    }
  }

  return parts.length > 0 ? parts : [text];
};

export const parseScript = (script: string): SlideScript[] => {
  if (!script.trim()) {
    return [];
  }

  const normalized = script.replace(/\r\n/g, "\n").replace(/\r/g, "\n");

  // Split by lines starting with #
  const sections: string[] = [];
  const lines = normalized.split("\n");
  let currentSection = "";

  for (const line of lines) {
    if (line.startsWith("# ")) {
      if (currentSection.trim()) {
        sections.push(currentSection.trim());
      }
      currentSection = line;
    } else {
      currentSection += "\n" + line;
    }
  }

  // Add the last section
  if (currentSection.trim()) {
    sections.push(currentSection.trim());
  }

  return sections.map((slideText, slideIndex) => {
    const lines = slideText.split("\n");
    let title: string | undefined;
    const messageGroups: MessageGroup[] = [];
    const transition = {
      type: "immediate" as TransitionType,
    };

    let currentGroup: string[] = [];
    let groupIndex = 0;

    const finishCurrentGroup = () => {
      if (currentGroup.length > 0) {
        const groupText = currentGroup.join("\n");
        const parts = splitByPunctuation(groupText);
        const groupMessages: MessageLine[] = parts.map((part) => ({
          text: part,
        }));

        messageGroups.push({
          id: `slide-${slideIndex}-group-${groupIndex}`,
          messages: groupMessages,
        });

        currentGroup = [];
        groupIndex++;
      }
    };

    for (let i = 0; i < lines.length; i++) {
      const line = lines[i];

      // Check for title (first line starting with #)
      if (line.startsWith("# ")) {
        title = line.substring(2).trim();
        continue;
      }

      // If empty line, finish current group
      if (!line.trim()) {
        finishCurrentGroup();
        continue;
      }

      // Add line to current group
      currentGroup.push(line);
    }

    // Add remaining group if any
    finishCurrentGroup();

    return { title, messageGroups, transition };
  });
};

export const createSlideScripts = (
  scriptInput: string,
  totalPages: number,
): SlideScript[] => {
  const scripts = parseScript(scriptInput);

  if (!totalPages) {
    return scripts;
  }

  // Scripts are mapped to slides in order, regardless of page count
  // This ensures all script sections are used, even if there are more scripts than slides
  const result: SlideScript[] = [];

  for (let i = 0; i < totalPages; i++) {
    if (i < scripts.length) {
      // Use the corresponding script
      result.push(scripts[i]);
    } else {
      // If no more scripts available, use empty script
      result.push({
        messageGroups: [],
        transition: { type: "immediate" },
      });
    }
  }

  return result;
};
