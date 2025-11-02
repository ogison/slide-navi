import React, { useEffect, useState } from "react";
import type { SlideScript } from "@/types/slides";
import styles from "./FormattedScriptView.module.scss";

interface FormattedScriptViewProps {
  slideScripts: SlideScript[];
  /**
   * Optional callback invoked with updated slide scripts after edits.
   */
  onChange?: (updated: SlideScript[]) => void;
}

const FormattedScriptView: React.FC<FormattedScriptViewProps> = ({
  slideScripts,
  onChange,
}) => {
  const [localScripts, setLocalScripts] = useState<SlideScript[]>(
    slideScripts ?? []
  );
  const [editing, setEditing] = useState<
    Record<string, { type: "title" | "message"; value: string }>
  >({});
  const [newMessage, setNewMessage] = useState<Record<string, string>>({});

  useEffect(() => {
    setLocalScripts(slideScripts ?? []);
  }, [slideScripts]);

  if (!localScripts || localScripts.length === 0) {
    return <div className={styles.noScripts}>No script data available.</div>;
  }

  const handleStartEditTitle = (slideIndex: number) => {
    const key = `title-${slideIndex}`;
    setEditing((s) => ({
      ...s,
      [key]: { type: "title", value: localScripts[slideIndex].title ?? "" },
    }));
  };

  const handleStartEditMessage = (
    slideIndex: number,
    groupIndex: number,
    messageIndex: number
  ) => {
    const key = `m-${slideIndex}-${groupIndex}-${messageIndex}`;
    setEditing((s) => ({
      ...s,
      [key]: {
        type: "message",
        value:
          localScripts[slideIndex].messageGroups[groupIndex].messages[
            messageIndex
          ].text,
      },
    }));
  };

  const handleChangeEditingValue = (key: string, value: string) => {
    setEditing((s) => ({ ...s, [key]: { ...s[key], value } }));
  };

  const handleSaveEdit = (key: string) => {
    const meta = editing[key];
    if (!meta) return;

    // title key: title-{slideIndex}
    if (meta.type === "title") {
      const parts = key.split("-");
      const slideIndex = Number(parts[1]);
      const updated = [...localScripts];
      updated[slideIndex] = { ...updated[slideIndex], title: meta.value };
      setLocalScripts(updated);
      onChange?.(updated);
      setEditing((s) => {
        const copy = { ...s };
        delete copy[key];
        return copy;
      });
      return;
    }

    // message key: m-{slideIndex}-{groupIndex}-{messageIndex}
    if (meta.type === "message") {
      const parts = key.split("-");
      const slideIndex = Number(parts[1]);
      const groupIndex = Number(parts[2]);
      const messageIndex = Number(parts[3]);
      const updated = [...localScripts];
      const group = { ...updated[slideIndex].messageGroups[groupIndex] };
      const messages = [...group.messages];
      messages[messageIndex] = { ...messages[messageIndex], text: meta.value };
      group.messages = messages;
      const groups = [...updated[slideIndex].messageGroups];
      groups[groupIndex] = group;
      updated[slideIndex] = { ...updated[slideIndex], messageGroups: groups };
      setLocalScripts(updated);
      onChange?.(updated);
      setEditing((s) => {
        const copy = { ...s };
        delete copy[key];
        return copy;
      });
    }
  };

  const handleCancelEdit = (key: string) => {
    setEditing((s) => {
      const copy = { ...s };
      delete copy[key];
      return copy;
    });
  };

  const handleStartNewMessage = (slideIndex: number, groupIndex: number) => {
    const key = `new-${slideIndex}-${groupIndex}`;
    setNewMessage((prev) => ({ ...prev, [key]: "" }));
  };

  const handleSaveNewMessage = (slideIndex: number, groupIndex: number) => {
    const key = `new-${slideIndex}-${groupIndex}`;
    const messageText = newMessage[key];
    if (!messageText?.trim()) return;

    const updated = [...localScripts];
    const group = { ...updated[slideIndex].messageGroups[groupIndex] };
    const messages = [...group.messages];
    messages.push({ text: messageText.trim() });
    group.messages = messages;
    const groups = [...updated[slideIndex].messageGroups];
    groups[groupIndex] = group;
    updated[slideIndex] = { ...updated[slideIndex], messageGroups: groups };

    setLocalScripts(updated);
    onChange?.(updated);
    setNewMessage((prev) => {
      const copy = { ...prev };
      delete copy[key];
      return copy;
    });
  };

  const handleCancelNewMessage = (slideIndex: number, groupIndex: number) => {
    const key = `new-${slideIndex}-${groupIndex}`;
    setNewMessage((prev) => {
      const copy = { ...prev };
      delete copy[key];
      return copy;
    });
  };

  return (
    <div className={styles.container}>
      {localScripts.map((slide, index) => (
        <div key={index} className={styles.slideContainer}>
          <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
            <h3 className={styles.slideTitle}>
              Page {index + 1} {slide.title && `- ${slide.title}`}
            </h3>
            <button
              className={styles.editButton}
              onClick={() => handleStartEditTitle(index)}
            >
              タイトルを編集
            </button>
          </div>
          {editing[`title-${index}`] ? (
            <div className={styles.editControls}>
              <input
                className={styles.titleEditInput}
                value={editing[`title-${index}`].value}
                onChange={(e) =>
                  handleChangeEditingValue(`title-${index}`, e.target.value)
                }
              />
              <div className={styles.editButtons}>
                <button
                  className={styles.saveButton}
                  onClick={() => handleSaveEdit(`title-${index}`)}
                >
                  保存
                </button>
                <button
                  className={styles.cancelButton}
                  onClick={() => handleCancelEdit(`title-${index}`)}
                >
                  キャンセル
                </button>
              </div>
            </div>
          ) : null}

          {slide.messageGroups.length > 0 ? (
            <ul className={styles.groupList}>
              {slide.messageGroups.map((group, gIndex) => (
                <li key={group.id ?? gIndex} className={styles.groupItem}>
                  <div className={styles.groupHeader}>
                    <span className={styles.badge}>{gIndex + 1}</span>
                    <span className={styles.groupLabel}>
                      表示グループ {gIndex + 1} · {group.messages.length}
                      件のメッセージ
                    </span>
                    <span className={styles.metaSmall} aria-hidden>
                      {/* additional metadata placeholder */}
                    </span>
                  </div>

                  <ul className={styles.messageList}>
                    {group.messages.map((message, mIndex) => (
                      <li key={mIndex} className={styles.messageItem}>
                        {editing[`m-${index}-${gIndex}-${mIndex}`] ? (
                          <div className={styles.editControls}>
                            <textarea
                              className={styles.editTextarea}
                              value={
                                editing[`m-${index}-${gIndex}-${mIndex}`].value
                              }
                              onChange={(e) =>
                                handleChangeEditingValue(
                                  `m-${index}-${gIndex}-${mIndex}`,
                                  e.target.value
                                )
                              }
                              rows={3}
                            />
                            <div className={styles.editButtons}>
                              <button
                                className={styles.saveButton}
                                onClick={() =>
                                  handleSaveEdit(
                                    `m-${index}-${gIndex}-${mIndex}`
                                  )
                                }
                              >
                                保存
                              </button>
                              <button
                                className={styles.cancelButton}
                                onClick={() =>
                                  handleCancelEdit(
                                    `m-${index}-${gIndex}-${mIndex}`
                                  )
                                }
                              >
                                キャンセル
                              </button>
                            </div>
                          </div>
                        ) : (
                          <div
                            style={{
                              display: "flex",
                              gap: 8,
                              alignItems: "flex-start",
                            }}
                          >
                            <div className={styles.messageBubble}>
                              {message.text}
                            </div>
                            <div>
                              <button
                                className={styles.editButtonSmall}
                                onClick={() =>
                                  handleStartEditMessage(index, gIndex, mIndex)
                                }
                              >
                                編集
                              </button>
                            </div>
                          </div>
                        )}
                      </li>
                    ))}
                    <li className={styles.messageItem}>
                      {newMessage[`new-${index}-${gIndex}`] !== undefined ? (
                        <div className={styles.editControls}>
                          <textarea
                            className={styles.editTextarea}
                            value={newMessage[`new-${index}-${gIndex}`]}
                            onChange={(e) =>
                              setNewMessage((prev) => ({
                                ...prev,
                                [`new-${index}-${gIndex}`]: e.target.value,
                              }))
                            }
                            placeholder="新しいメッセージを入力..."
                            rows={3}
                          />
                          <div className={styles.editButtons}>
                            <button
                              className={styles.saveButton}
                              onClick={() =>
                                handleSaveNewMessage(index, gIndex)
                              }
                            >
                              メッセージを追加
                            </button>
                            <button
                              className={styles.cancelButton}
                              onClick={() =>
                                handleCancelNewMessage(index, gIndex)
                              }
                            >
                              キャンセル
                            </button>
                          </div>
                        </div>
                      ) : (
                        <button
                          className={styles.addButton}
                          onClick={() => handleStartNewMessage(index, gIndex)}
                        >
                          + メッセージを追加
                        </button>
                      )}
                    </li>
                  </ul>
                </li>
              ))}
            </ul>
          ) : (
            <p>このスライドにメッセージはありません。</p>
          )}
        </div>
      ))}
    </div>
  );
};

export default FormattedScriptView;
