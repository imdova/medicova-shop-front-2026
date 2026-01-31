"use client";

import * as React from "react";
import * as TabsPrimitive from "@radix-ui/react-tabs";
import { cn } from "@/util";

function Tabs({
  className,
  ...props
}: React.ComponentProps<typeof TabsPrimitive.Root>) {
  return (
    <TabsPrimitive.Root
      data-slot="tabs"
      className={cn("flex flex-col gap-2", className)}
      {...props}
    />
  );
}

function TabsList({
  className,
  ...props
}: React.ComponentProps<typeof TabsPrimitive.List>) {
  return (
    <div className="scroll-bar-hidden grid w-full grid-cols-1 overflow-x-auto rounded-md border border-gray-200 bg-white p-1">
      <TabsPrimitive.List
        data-slot="tabs-list"
        className={cn(
          "rounded-base inline-flex h-9 w-max items-center justify-start gap-2 bg-white p-[3px] text-muted-foreground",
          className,
        )}
        {...props}
      />
    </div>
  );
}

function TabsTrigger({
  className,
  ...props
}: React.ComponentProps<typeof TabsPrimitive.Trigger>) {
  const ref = React.useRef<HTMLButtonElement>(null);

  // run synchronously to avoid flicker
  React.useLayoutEffect(() => {
    const node = ref.current;
    if (!node) return;

    // Scroll if it's active on mount
    if (node.getAttribute("data-state") === "active") {
      node.scrollIntoView({
        behavior: "instant",
        inline: "center",
        block: "nearest",
      });
    }

    // Observe attribute changes (Radix changes data-state dynamically)
    const observer = new MutationObserver(() => {
      if (node.getAttribute("data-state") === "active") {
        node.scrollIntoView({
          behavior: "smooth",
          inline: "center",
          block: "nearest",
        });
      }
    });

    observer.observe(node, {
      attributes: true,
      attributeFilter: ["data-state"],
    });

    return () => observer.disconnect();
  }, []);

  return (
    <TabsPrimitive.Trigger
      ref={ref}
      data-slot="tabs-trigger"
      className={cn(
        "text-foreground focus-visible:ring-ring/50 dark:data-[state=active]:text-foreground dark:data-[state=active]:bg-input/30 inline-flex h-[calc(100%-1px)] flex-1 cursor-pointer items-center justify-center gap-1.5 whitespace-nowrap rounded-md border border-transparent px-3 py-1 text-sm font-medium transition-[color,box-shadow] focus-visible:outline-1 focus-visible:outline-ring focus-visible:ring-[3px] disabled:pointer-events-none disabled:opacity-50 data-[state=active]:text-primary dark:data-[state=active]:border-input [&_svg:not([class*='size-'])]:size-4 [&_svg]:shrink-0",
        className,
      )}
      {...props}
    />
  );
}

function TabsContent({
  className,
  ...props
}: React.ComponentProps<typeof TabsPrimitive.Content>) {
  return (
    <TabsPrimitive.Content
      data-slot="tabs-content"
      className={cn("flex-1 outline-none", className)}
      {...props}
    />
  );
}

export { Tabs, TabsList, TabsTrigger, TabsContent };
