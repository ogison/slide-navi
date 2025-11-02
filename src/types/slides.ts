export type SlideImage = {
  dataUrl: string;
  pageNumber: number;
};

export type TransitionType = "immediate";

export type MessageLine = {
  text: string;
};

export type Speaker = "axolotl" | "yagi";

export type MessageGroup = {
  id: string;
  speaker: Speaker;
  messages: MessageLine[];
  animation?: "fight";
};

export type SlideScript = {
  title?: string;
  messageGroups: MessageGroup[];
  transition: {
    type: TransitionType;
  };
};
