import type {
  MessageGroup,
  MessageLine,
  SlideScript,
  TransitionType,
} from "@/types/slides";

const DEFAULT_TRANSITION: TransitionType = "immediate";
const SUPPORTED_TRANSITIONS: ReadonlyArray<TransitionType> = [
  DEFAULT_TRANSITION,
];

const createBlankScripts = (totalPages: number): SlideScript[] => {
  if (totalPages <= 0) {
    return [];
  }

  return Array.from({ length: totalPages }, () => ({
    title: undefined,
    messageGroups: [],
    transition: { type: DEFAULT_TRANSITION },
  }));
};

const normalizeTransitionType = (value: unknown): TransitionType => {
  if (typeof value === "string") {
    const normalized = value.trim();
    if (SUPPORTED_TRANSITIONS.includes(normalized as TransitionType)) {
      return normalized as TransitionType;
    }

    throw new Error(
      `未対応の遷移タイプです: ${String(value)}。使用可能な値: ${SUPPORTED_TRANSITIONS.join(
        ", ",
      )}`,
    );
  }

  if (value === undefined || value === null) {
    return DEFAULT_TRANSITION;
  }

  throw new Error(
    `遷移タイプは文字列で指定してください (例: "${DEFAULT_TRANSITION}")。`,
  );
};

const normalizeTransition = (input: unknown): { type: TransitionType } => {
  if (typeof input === "string" || input === undefined || input === null) {
    return { type: normalizeTransitionType(input) };
  }

  if (typeof input === "object") {
    const transitionObject = input as { type?: unknown };
    return { type: normalizeTransitionType(transitionObject.type) };
  }

  throw new Error(
    "transition プロパティは文字列または { type: string } 形式で指定してください。",
  );
};

const normalizeMessages = (
  input: unknown,
  slideIndex: number,
  groupIndex: number,
): MessageLine[] => {
  if (!Array.isArray(input)) {
    throw new Error(
      `slides[${slideIndex}].groups[${groupIndex}] の messages は配列である必要があります。`,
    );
  }

  const messages: MessageLine[] = [];

  input.forEach((item, messageIndex) => {
    if (typeof item === "string") {
      const trimmed = item.trim();
      if (trimmed.length > 0) {
        messages.push({ text: trimmed });
      }
      return;
    }

    if (item && typeof item === "object") {
      const text = (item as { text?: unknown }).text;
      if (typeof text === "string" && text.trim().length > 0) {
        messages.push({ text: text.trim() });
        return;
      }
    }

    throw new Error(
      `slides[${slideIndex}].groups[${groupIndex}].messages[${messageIndex}] に有効なテキストがありません。`,
    );
  });

  return messages;
};

const normalizeGroup = (
  input: unknown,
  slideIndex: number,
  groupIndex: number,
): MessageGroup | null => {
  if (typeof input === "string") {
    const trimmed = input.trim();
    if (!trimmed) {
      return null;
    }

    return {
      id: `slide-${slideIndex}-group-${groupIndex}`,
      messages: [{ text: trimmed }],
    };
  }

  let messagesSource: unknown;
  let id: string | undefined;

  if (Array.isArray(input)) {
    messagesSource = input;
  } else if (input && typeof input === "object") {
    const group = input as {
      id?: unknown;
      messages?: unknown;
      lines?: unknown;
    };

    if (typeof group.id === "string" && group.id.trim().length > 0) {
      id = group.id.trim();
    }

    if (Array.isArray(group.messages)) {
      messagesSource = group.messages;
    } else if (Array.isArray(group.lines)) {
      messagesSource = group.lines;
    } else if (Array.isArray(group)) {
      messagesSource = group;
    } else {
      messagesSource = [];
    }
  } else {
    throw new Error(
      `slides[${slideIndex}].groups[${groupIndex}] はオブジェクト、配列、または文字列である必要があります。`,
    );
  }

  const messages = normalizeMessages(messagesSource, slideIndex, groupIndex);

  if (messages.length === 0) {
    return null;
  }

  return {
    id: id ?? `slide-${slideIndex}-group-${groupIndex}`,
    messages,
  };
};

const normalizeSlide = (input: unknown, slideIndex: number): SlideScript => {
  if (!input || typeof input !== "object" || Array.isArray(input)) {
    throw new Error(
      `slides[${slideIndex}] はオブジェクトである必要があります。`,
    );
  }

  const slide = input as Record<string, unknown>;

  const rawGroups = Array.isArray(slide.groups)
    ? slide.groups
    : Array.isArray(slide.messageGroups)
      ? slide.messageGroups
      : Array.isArray(slide.messages)
        ? [slide.messages]
        : [];

  const messageGroups = (rawGroups as unknown[])
    .map((group, groupIndex) => normalizeGroup(group, slideIndex, groupIndex))
    .filter((group): group is MessageGroup => group !== null);

  const title =
    typeof slide.title === "string" && slide.title.trim().length > 0
      ? slide.title.trim()
      : undefined;

  return {
    title,
    messageGroups,
    transition: normalizeTransition(slide.transition),
  };
};

const extractSlides = (parsed: unknown): unknown[] => {
  if (Array.isArray(parsed)) {
    return parsed;
  }

  if (
    parsed &&
    typeof parsed === "object" &&
    Array.isArray((parsed as { slides?: unknown }).slides)
  ) {
    return (parsed as { slides: unknown[] }).slides as unknown[];
  }

  throw new Error(
    "スクリプトJSONは配列、または slides プロパティに配列を持つオブジェクトである必要があります。",
  );
};

export const parseScriptJson = (script: string): SlideScript[] => {
  if (!script.trim()) {
    return [];
  }

  let parsed: unknown;
  try {
    parsed = JSON.parse(script);
  } catch {
    throw new Error(
      "スクリプトJSONの解析に失敗しました。構文を確認してください。",
    );
  }

  const slides = extractSlides(parsed);

  return slides.map((slide, index) => normalizeSlide(slide, index));
};

export const createSlideScripts = (
  scriptInput: string,
  totalPages: number,
): SlideScript[] => {
  if (!scriptInput.trim()) {
    return createBlankScripts(totalPages);
  }

  const scripts = parseScriptJson(scriptInput);

  if (!totalPages) {
    return scripts;
  }

  const result: SlideScript[] = [];

  for (let i = 0; i < totalPages; i++) {
    if (i < scripts.length) {
      result.push(scripts[i]);
    } else {
      result.push({
        title: undefined,
        messageGroups: [],
        transition: { type: DEFAULT_TRANSITION },
      });
    }
  }

  return result;
};
