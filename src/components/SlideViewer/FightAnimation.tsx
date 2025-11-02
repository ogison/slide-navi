import React, { useEffect, useState } from "react";
import styles from "./FightAnimation.module.scss";

type Explosion = {
  id: string;
  style: React.CSSProperties;
};

export default function FightAnimation() {
  const [explosions, setExplosions] = useState<Explosion[]>([]);

  useEffect(() => {
    // 初期の爆発を生成
    const initialExplosions = Array.from({ length: 8 }, (_, i) => ({
      id: `explosion-${i}`,
      style: {
        left: `${Math.random() * 80 + 10}%`,
        top: `${Math.random() * 80 + 10}%`,
        animationDelay: `${Math.random() * 0.5}s`,
        transform: `scale(${0.8 + Math.random() * 0.4})`,
      },
    }));
    setExplosions(initialExplosions);

    // 継続的に新しい爆発を追加
    const interval = setInterval(() => {
      setExplosions((prev) => {
        const newExplosion = {
          id: `explosion-${Date.now()}`,
          style: {
            left: `${Math.random() * 80 + 10}%`,
            top: `${Math.random() * 80 + 10}%`,
            animationDelay: "0s",
            transform: `scale(${0.8 + Math.random() * 0.4})`,
          },
        };

        // 古い爆発を削除して新しいものを追加
        const updated = [...prev.slice(-7), newExplosion];
        return updated;
      });
    }, 300);

    return () => clearInterval(interval);
  }, []);

  return (
    <div className={styles.container}>
      {/* 背景の砂ぼこり */}
      <div className={styles.dustBackground}></div>

      {/* メインの砂ぼこり雲 */}
      <div className={styles.dustCloud}>
        {/* 中心の大きな雲 */}
        <div className={styles.mainCloud}></div>

        {/* 爆発エフェクト */}
        {explosions.map((explosion) => (
          <div
            key={explosion.id}
            className={styles.explosion}
            style={explosion.style}
          >
            <div className={styles.star}></div>
          </div>
        ))}

        {/* 追加の雲パーティクル */}
        {Array.from({ length: 12 }, (_, i) => (
          <div
            key={`particle-${i}`}
            className={styles.cloudParticle}
            style={{
              left: `${Math.random() * 100}%`,
              top: `${Math.random() * 100}%`,
              animationDelay: `${Math.random() * 2}s`,
              animationDuration: `${2 + Math.random() * 2}s`,
            }}
          ></div>
        ))}

        {/* アクションライン */}
        {Array.from({ length: 6 }, (_, i) => (
          <div
            key={`line-${i}`}
            className={styles.actionLine}
            style={{
              transform: `rotate(${i * 60}deg)`,
              animationDelay: `${i * 0.1}s`,
            }}
          ></div>
        ))}
      </div>

      {/* テキストエフェクト（オプション） */}
      <div className={styles.fightText}>
        <span className={styles.bam}>BAM!</span>
        <span className={styles.pow}>POW!</span>
        <span className={styles.wham}>WHAM!</span>
      </div>
    </div>
  );
}
