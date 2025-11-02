export type SlideImage = {
  dataUrl: string;
  pageNumber: number;
};

export type TransitionType = "immediate";

export type MessageLine = {
  text: string;
};

export type MessageGroup = {
  id: string;
  messages: MessageLine[];
};

export type SlideScript = {
  title?: string;
  messageGroups: MessageGroup[];
  transition: {
    type: TransitionType;
  };
};
