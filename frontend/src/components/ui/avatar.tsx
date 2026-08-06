import * as React from "react";
import { cn } from "@/lib/utils";

interface AvatarProps extends React.HTMLAttributes<HTMLDivElement> {
  src?: string;
  fallback: string;
}

export function Avatar({ src, fallback, className, ...props }: AvatarProps) {
  const [imageError, setImageError] = React.useState(false);

  return (
    <div
      className={cn(
        "relative flex h-10 w-10 shrink-0 overflow-hidden rounded-full bg-surface-hover border border-border",
        className
      )}
      {...props}
    >
      {src && !imageError ? (
        <img
          src={src}
          alt="Avatar"
          className="aspect-square h-full w-full object-cover"
          onError={() => setImageError(true)}
        />
      ) : (
        <div className="flex h-full w-full items-center justify-center text-sm font-medium text-muted-foreground uppercase">
          {fallback.substring(0, 2)}
        </div>
      )}
    </div>
  );
}
