"use client";

import { motion, AnimatePresence } from "framer-motion";
import { ConversationSidebar } from "./conversation-sidebar";
import { X } from "lucide-react";
import { Button } from "@/components/ui/button";

interface MobileSidebarDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  userId: string;
  activeId: string | null;
  onSelectConversation: (id: string | null) => void;
}

export function MobileSidebarDrawer({
  isOpen,
  onClose,
  userId,
  activeId,
  onSelectConversation,
}: MobileSidebarDrawerProps) {
  const handleSelect = (id: string | null) => {
    onSelectConversation(id);
    onClose();
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-50 lg:hidden flex">
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            onClick={onClose}
            className="fixed inset-0 bg-black/70 backdrop-blur-sm"
          />

          {/* Drawer Slide-in */}
          <motion.div
            initial={{ x: "-100%" }}
            animate={{ x: 0 }}
            exit={{ x: "-100%" }}
            transition={{ type: "spring", damping: 25, stiffness: 250 }}
            className="relative flex flex-col w-4/5 max-w-xs h-full bg-background border-r border-border shadow-2xl z-10"
          >
            {/* Close Button Header */}
            <div className="flex items-center justify-between p-3 border-b border-border/40 bg-card/60">
              <span className="font-semibold text-sm text-foreground">Menu & Chats</span>
              <Button
                variant="ghost"
                size="icon"
                onClick={onClose}
                aria-label="Close sidebar"
                className="h-8 w-8 text-muted-foreground hover:text-foreground"
              >
                <X className="h-4 w-4" />
              </Button>
            </div>

            {/* Embed Sidebar Component */}
            <div className="flex-1 overflow-hidden">
              <ConversationSidebar
                userId={userId}
                activeId={activeId}
                onSelectConversation={handleSelect}
                className="border-none bg-transparent"
              />
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}
