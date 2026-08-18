import { motion } from "framer-motion";
import { ReactNode } from "react";
import { cn } from "@/lib/utils";

interface StorySectionProps {
  children: ReactNode;
  id?: string;
  className?: string;
  innerClassName?: string;
}

export function StorySection({
  children,
  id,
  className = "",
  innerClassName = "max-w-5xl mx-auto w-full px-6 md:px-12",
}: StorySectionProps) {
  return (
    <motion.section
      id={id}
      className={cn(
        "min-h-[70vh] w-full flex flex-col justify-start py-12 md:py-16",
        className
      )}
      initial={{ opacity: 0, y: 50 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-100px" }}
      transition={{ duration: 0.8, ease: "easeOut" }}
    >
      <div className={innerClassName}>{children}</div>
    </motion.section>
  );
}
