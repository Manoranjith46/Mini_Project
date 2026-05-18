import Player from "lottie-react";
import starloader from "../../../../assets/animations/starloder.json";
import styles from "./loader.module.css";

type AdminLoaderProps = {
  message?: string;
  fullScreen?: boolean;
};

const ADMIN_GREEN = [0.082, 0.502, 0.239, 1];
const ADMIN_BRIGHT_GREEN = [0.086, 0.639, 0.29, 1];

const recolorStarLoader = () => {
  const animation = JSON.parse(JSON.stringify(starloader));

  const walk = (node: unknown) => {
    if (!node || typeof node !== "object") {
      return;
    }

    if (Array.isArray(node)) {
      node.forEach(walk);
      return;
    }

    const record = node as Record<string, unknown>;

    if (record.ty === "fl" && record.c && typeof record.c === "object") {
      const color = record.c as { k?: unknown };

      if (Array.isArray(color.k)) {
        if (typeof color.k[0] === "number") {
          color.k = ADMIN_GREEN;
        } else {
          color.k = color.k.map((keyframe, index) => {
            if (!keyframe || typeof keyframe !== "object") {
              return keyframe;
            }

            const frame = { ...(keyframe as Record<string, unknown>) };
            const colorValue = index % 2 === 0 ? ADMIN_GREEN : ADMIN_BRIGHT_GREEN;

            if ("s" in frame) {
              frame.s = colorValue;
            }

            if ("e" in frame) {
              frame.e = colorValue;
            }

            return frame;
          });
        }
      }
    }

    Object.values(record).forEach(walk);
  };

  walk(animation);
  return animation;
};

const adminStarLoader = recolorStarLoader();

const AdminLoader = ({
  message = "Loading...",
  fullScreen = false,
}: AdminLoaderProps) => {
  return (
    <div
      className={`${styles.loaderShell} ${fullScreen ? styles.fullScreen : ""}`}
      role="status"
      aria-live="polite"
    >
      <div className={styles.loaderCard}>
        <div className={styles.star}>
          <Player
            autoplay
            loop
            animationData={adminStarLoader}
            style={{ height: "220px", width: "220px" }}
          />
        </div>
        <p className={styles.message}>{message}</p>
      </div>
    </div>
  );
};

export default AdminLoader;
