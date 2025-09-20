export type SlideImage = {
  dataUrl: string;
  pageNumber: number;
};

export type TransitionType = 'immediate' | 'wait' | 'click';

export type MessageLine = {
  text: string;
  speaker?: string;
};

export type SlideScript = {
  title?: string;
  messages: MessageLine[];
  transition: {
    type: TransitionType;
    delay?: number;
  };
};

