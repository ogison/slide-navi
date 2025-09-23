/* eslint-disable @next/next/no-img-element */

import { useEffect, useMemo, useRef, useState } from "react";

import type { MessageLine } from "../types/slides";
import styles from "./SpeakerMessage.module.scss";

const TYPEWRITER_DELAY_MS = 45;

type SpeakerMessageProps = {
  speakerName: string;
  iconSrc: string;
  messages: MessageLine[];
  messageGroupId: string;
};

export default function SpeakerMessage({
  speakerName,
  iconSrc,
  messages,
  messageGroupId,
}: SpeakerMessageProps) {
  const [visibleText, setVisibleText] = useState("");
  const [isTyping, setIsTyping] = useState(false);
  const [currentIconIndex, setCurrentIconIndex] = useState(0);
  const timeoutRef = useRef<number | null>(null);
  const iconIntervalRef = useRef<number | null>(null);
  const previousFullMessageRef = useRef<string>("");
  const previousGroupIdRef = useRef<string>("");
  const fullMessage = useMemo(() => messages.map(m => m.text).join("\n"), [messages]);

  useEffect(() => {
    if (timeoutRef.current) {
      window.clearTimeout(timeoutRef.current);
      timeoutRef.current = null;
    }

    const previousFullMessage = previousFullMessageRef.current;
    const previousGroupId = previousGroupIdRef.current;

    // Check if the group ID has changed
    const isNewGroup = previousGroupId !== messageGroupId;

    // Debug logging in development
    if (process.env.NODE_ENV === 'development') {
      console.log('SpeakerMessage debug:', {
        messageGroupId,
        previousGroupId,
        isNewGroup,
        fullMessage,
        previousFullMessage
      });
    }

    if (!fullMessage) {
      setVisibleText("");
      previousFullMessageRef.current = "";
      previousGroupIdRef.current = messageGroupId;
      setIsTyping(false);
      return;
    }

    let startIndex = 0;
    let shouldClearFirst = false;

    if (isNewGroup) {
      // New group - always clear first and reset state completely
      shouldClearFirst = true;
      setVisibleText("");
      previousFullMessageRef.current = "";
    } else if (previousFullMessage && fullMessage.startsWith(previousFullMessage)) {
      // This is a continuation of the previous message in the same group
      startIndex = previousFullMessage.length;
      setVisibleText(previousFullMessage);
    } else {
      // This is a new message within the same group - clear first, then start typing
      shouldClearFirst = true;
      setVisibleText("");
    }

    previousFullMessageRef.current = fullMessage;
    previousGroupIdRef.current = messageGroupId;

    if (startIndex >= fullMessage.length) {
      setVisibleText(fullMessage);
      setIsTyping(false);
      return;
    }

    let index = startIndex;
    setIsTyping(true);

    const tick = () => {
      index += 1;
      setVisibleText(fullMessage.slice(0, index));
      if (index < fullMessage.length) {
        timeoutRef.current = window.setTimeout(tick, TYPEWRITER_DELAY_MS);
      } else {
        timeoutRef.current = null;
        setIsTyping(false);
      }
    };

    if (shouldClearFirst) {
      // For new messages/groups, clear first then start after a brief delay
      setVisibleText("");
      const delay = isNewGroup ? 300 : 200; // Longer delay for new groups
      timeoutRef.current = window.setTimeout(() => {
        // 必ず最新の状態で開始するため、startIndexを0にリセット
        let currentIndex = 0;
        const typingTick = () => {
          currentIndex += 1;
          setVisibleText(fullMessage.slice(0, currentIndex));
          if (currentIndex < fullMessage.length) {
            timeoutRef.current = window.setTimeout(typingTick, TYPEWRITER_DELAY_MS);
          } else {
            timeoutRef.current = null;
            setIsTyping(false);
          }
        };
        typingTick();
      }, delay);
    } else if (startIndex === 0) {
      tick();
    } else {
      timeoutRef.current = window.setTimeout(tick, TYPEWRITER_DELAY_MS);
    }

    return () => {
      if (timeoutRef.current) {
        window.clearTimeout(timeoutRef.current);
        timeoutRef.current = null;
      }
      setIsTyping(false);
    };
  }, [fullMessage, messageGroupId]);

  useEffect(() => {
    if (iconIntervalRef.current) {
      window.clearInterval(iconIntervalRef.current);
      iconIntervalRef.current = null;
    }

    if (isTyping) {
      iconIntervalRef.current = window.setInterval(() => {
        setCurrentIconIndex((prev) => (prev === 0 ? 1 : 0));
      }, 250);
    } else {
      setCurrentIconIndex(0);
    }

    return () => {
      if (iconIntervalRef.current) {
        window.clearInterval(iconIntervalRef.current);
        iconIntervalRef.current = null;
      }
    };
  }, [isTyping]);

  const animatedLines = useMemo(() => {
    if (!fullMessage) {
      return [];
    }

    if (!visibleText) {
      return [""];
    }

    return visibleText.split("\n");
  }, [fullMessage, visibleText]);

  const linesToRender = animatedLines.length ? animatedLines : messages.map(m => m.text);

  const displayedIconSrc = isTyping
    ? (currentIconIndex === 0 ? iconSrc : "/speaker_2.png")
    : iconSrc;

  return (
    <div className={styles.messagePanel}>
      <div className={styles.messageCard}>
        <div className={styles.speaker}>
          <img src={displayedIconSrc} alt="話者アイコン" className={styles.icon} />
          <span className={styles.speakerName}>{speakerName}</span>
        </div>
        <div className={styles.message}>
          {linesToRender.map((line, index) => (
            <p key={index} className={styles.messageLine}>
              {line}
            </p>
          ))}
        </div>
      </div>
    </div>
  );
}