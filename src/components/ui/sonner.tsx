import { Toaster as Sonner } from "sonner";

export function Toaster() {
  return (
    <Sonner
      theme="dark"
      position="bottom-right"
      toastOptions={{
        classNames: {
          toast:
            "glass-strong !bg-popover/80 !text-foreground !border-border-strong rounded-xl",
          description: "!text-muted-foreground",
        },
      }}
    />
  );
}
