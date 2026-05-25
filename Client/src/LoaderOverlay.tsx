import { useLoader } from "./context/LoaderContext";
import { useAuth } from "./context/AuthContext";
import Player from "lottie-react";
import starloader from "./assets/animations/starloder.json";
import { motion } from "framer-motion";
import { useMemo } from "react";

const recolorStarLoader = (role: string) => {
  try {
    const animation = JSON.parse(JSON.stringify(starloader));

    // Determine colors based on role (normalized RGB color values [r, g, b, a] from 0 to 1)
    let mainColor = [0.082, 0.376, 0.843, 1]; // Citizen Blue (#1d4ed8)
    let brightColor = [0.145, 0.494, 0.961, 1]; // Citizen Bright Blue (#2563eb)

    if (role === "admin") {
      mainColor = [0.082, 0.502, 0.239, 1]; // Admin Green (#15803d)
      brightColor = [0.086, 0.639, 0.29, 1]; // Admin Bright Green (#16a34a)
    } else if (role === "department") {
      mainColor = [0.918, 0.345, 0.047, 1]; // Department Orange (#ea580c)
      brightColor = [0.976, 0.459, 0.169, 1]; // Department Bright Orange (#f97316)
    }

    const walk = (node: any) => {
      if (!node || typeof node !== "object") {
        return;
      }

      if (Array.isArray(node)) {
        node.forEach(walk);
        return;
      }

      if (node.ty === "fl" && node.c && typeof node.c === "object") {
        const color = node.c;

        if (Array.isArray(color.k)) {
          if (typeof color.k[0] === "number") {
            color.k = mainColor;
          } else {
            color.k = color.k.map((keyframe: any, index: number) => {
              if (!keyframe || typeof keyframe !== "object") {
                return keyframe;
              }

              const frame = { ...keyframe };
              const colorValue = index % 2 === 0 ? mainColor : brightColor;

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

      Object.values(node).forEach(walk);
    };

    walk(animation);
    return animation;
  } catch (err) {
    console.error("Failed to recolor Lottie starloader:", err);
    return starloader;
  }
};

export function LoaderOverlay() {
  const { loading } = useLoader();
  const { user } = useAuth();
  
  const role = user?.role || "citizen";

  const recoloredAnimation = useMemo(() => {
    return recolorStarLoader(role);
  }, [role]);

  if (!loading) return null;

  return (
    <motion.div
      className="fixed inset-0 bg-slate-50/90 backdrop-blur-sm flex items-center justify-center z-50"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.4 }}
    >
      <Player
        autoplay
        loop
        animationData={recoloredAnimation}
        style={{ height: "200px", width: "200px" }}
      />
    </motion.div>
  );
}
