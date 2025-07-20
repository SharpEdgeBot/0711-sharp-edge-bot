"use client";
import dynamic from "next/dynamic";

const ChatOverlay = dynamic(() => import("@/components/ChatOverlay"), { ssr: false });

export default function ChatOverlayClient() {
  return <ChatOverlay />;
}
