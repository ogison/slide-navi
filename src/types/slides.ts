export type SlideImage = {
  dataUrl: string;
  pageNumber: number;
};

export type TransitionType = 'immediate';

export type MessageLine = {
  text: string;
};

export type SlideScript = {
  title?: string;
  messages: MessageLine[];
  transition: {
    type: TransitionType;
  };
};

