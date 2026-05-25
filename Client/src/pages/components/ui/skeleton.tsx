import { cn } from "../../../lib/utils";
import { useAuth } from "../../../context/AuthContext";

function Skeleton({
  className,
  ...props
}: React.HTMLAttributes<HTMLDivElement>) {
  let role = "citizen";
  try {
    const auth = useAuth();
    if (auth && auth.user) {
      role = auth.user.role;
    }
  } catch (e) {
    // Graceful fallback if context is not available
  }

  let bgClass = "bg-blue-100/70 dark:bg-blue-950/40"; // Citizen (Blue)
  if (role === "admin") {
    bgClass = "bg-emerald-100/70 dark:bg-emerald-950/40"; // Admin (Green/Emerald)
  } else if (role === "department") {
    bgClass = "bg-orange-100/70 dark:bg-orange-950/40"; // Department Manager (Orange)
  }

  return (
    <div
      className={cn("animate-pulse rounded-md", bgClass, className)}
      {...props}
    />
  );
}

export { Skeleton };
