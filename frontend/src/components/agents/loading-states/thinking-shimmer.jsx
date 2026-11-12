"use client";;
import { TextShimmer } from "@/components/motion/text-shimmer";
import { useMessages } from "@/lib/i18n";
import { cn } from "@/lib/utils";
import { loadingStatesMessages } from "./messages";

export function ThinkingShimmer({
  children,
  duration = 1.8,
  labels,
  className
}) {
  const t = useMessages("loadingStates", loadingStatesMessages, labels);

  return (
    <TextShimmer as="span" duration={duration} className={cn("font-medium", className)}>
      {children ?? t("thinking")}
    </TextShimmer>
  );
}
