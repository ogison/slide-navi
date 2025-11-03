import React, { useEffect, useState } from "react";
import styles from "./ExplosionAnimation.module.scss";

type ExplosionBurst = {
  id: string;
  style: React.CSSProperties;
};

export default function ExplosionAnimation() {
  const [explosions, setExplosions] = useState<ExplosionBurst[]>([]);

  useEffect(() => {
    // 初期の爆発を生成
    const initialExplosions = Array.from({ length: 8 }, (_, i) => ({
      id: `burst-${i}`,
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
          id: `burst-${Date.now()}`,
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
      {/* 背景の爆発フラッシュ */}
      <div className={styles.explosionBackground}></div>

      {/* メインの爆発エフェクト */}
      <div className={styles.explosionCloud}>
        {/* 中心の爆発波 */}
        <div className={styles.mainWave}></div>

        {/* 爆発バースト */}
        {explosions.map((explosion) => (
          <div
            key={explosion.id}
            className={styles.burstEffect}
            style={explosion.style}
          >
            <div className={styles.burstCircle}></div>
          </div>
        ))}

        {/* 炎・煙パーティクル */}
        {Array.from({ length: 12 }, (_, i) => (
          <div
            key={`particle-${i}`}
            className={styles.fireParticle}
            style={{
              left: `${Math.random() * 100}%`,
              top: `${Math.random() * 100}%`,
              animationDelay: `${Math.random() * 2}s`,
              animationDuration: `${2 + Math.random() * 2}s`,
            }}
          ></div>
        ))}

        {/* 放射状のエネルギーライン */}
        {Array.from({ length: 8 }, (_, i) => (
          <div
            key={`ray-${i}`}
            className={styles.energyRay}
            style={{
              transform: `rotate(${i * 45}deg)`,
              animationDelay: `${i * 0.08}s`,
            }}
          ></div>
        ))}
      </div>

      {/* テキストエフェクト */}
      <div className={styles.explosionText}>
        <span className={styles.boom}>BOOM!</span>
        <span className={styles.bang}>BANG!</span>
        <span className={styles.kaboom}>KABOOM!</span>
      </div>
    </div>
  );
}
