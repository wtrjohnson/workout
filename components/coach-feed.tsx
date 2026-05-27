"use client";

import { ArrowLeft, ArrowRight } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useOptimistic, useState, useTransition } from "react";
import type { CoachBubble, CoachReply } from "@/lib/training/types";

type Props = {
  bubbles: CoachBubble[];
  replies: CoachReply[];
};

type OptimisticReply = CoachReply & { pending?: boolean };

export function CoachFeed({ bubbles, replies }: Props) {
  const router = useRouter();
  const [optimisticReplies, addOptimistic] = useOptimistic<OptimisticReply[], OptimisticReply>(
    replies,
    (state, next) => [...state, next]
  );
  const [open, setOpen] = useState(false);
  const [draft, setDraft] = useState("");
  const [isPending, startTransition] = useTransition();

  const replyContextKind = bubbles[0]?.kind ?? null;

  function submit() {
    const body = draft.trim();
    if (!body) return;
    setDraft("");
    setOpen(false);
    startTransition(async () => {
      addOptimistic({
        id: `tmp-${Date.now()}`,
        body,
        contextKind: replyContextKind,
        createdAt: new Date().toISOString(),
        pending: true,
      });
      await fetch("/api/coach-reply", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ body, contextKind: replyContextKind }),
      });
      router.refresh();
    });
  }

  return (
    <>
      {/* Fullscreen chat overlay */}
      <div
        className={`fixed inset-0 z-50 flex flex-col bg-surface transition-transform duration-300 ease-out ${
          open ? "translate-y-0" : "translate-y-full"
        }`}
      >
        {/* Header */}
        <div className="flex items-center gap-3 border-b border-black/6 px-4 pb-3 pt-safe-top">
          <button
            type="button"
            onClick={() => { setOpen(false); setDraft(""); }}
            className="flex items-center gap-1.5 text-sm font-semibold text-ink"
          >
            <ArrowLeft className="size-4" aria-hidden />
            Coach
          </button>
        </div>

        {/* Message history */}
        <div className="flex-1 overflow-y-auto px-4 py-4">
          <div className="space-y-3">
            {bubbles.map((bubble) => (
              <CoachBubbleCard key={bubble.id} bubble={bubble} />
            ))}
            {optimisticReplies.map((reply) => (
              <UserReplyBubble key={reply.id} reply={reply} />
            ))}
          </div>
        </div>

        {/* Compose */}
        <div className="border-t border-black/6 px-4 pb-safe-bottom pt-3">
          <div className="flex items-end gap-2">
            <textarea
              value={draft}
              onChange={(e) => setDraft(e.target.value)}
              maxLength={500}
              rows={1}
              placeholder="Reply to the coach…"
              className="mono-copy flex-1 resize-none rounded-2xl border border-black/10 bg-white px-3 py-2 text-sm text-ink outline-none focus:border-[#2563eb]"
              autoFocus={open}
            />
            <button
              type="button"
              onClick={submit}
              disabled={isPending || !draft.trim()}
              className="rounded-full bg-[#2563eb] px-4 py-2 text-xs font-bold text-white disabled:opacity-50"
            >
              Send
            </button>
          </div>
        </div>
      </div>

      {/* Feed (normal page view) */}
      <section aria-label="Coach feed" className="mb-6">
        <h2 className="chunky-title mb-3 text-3xl font-black leading-none text-ink">Coach Feed</h2>

        <div className="space-y-3">
          {bubbles.map((bubble) => (
            <CoachBubbleCard key={bubble.id} bubble={bubble} />
          ))}

          {optimisticReplies.map((reply) => (
            <UserReplyBubble key={reply.id} reply={reply} />
          ))}
        </div>

        <div className="mt-3 flex justify-end">
          <button
            type="button"
            onClick={() => setOpen(true)}
            className="inline-flex items-center gap-1.5 rounded-full border-2 border-[#2563eb] px-4 py-1.5 text-xs font-bold text-[#2563eb]"
          >
            Reply
          </button>
        </div>
      </section>
    </>
  );
}

function CoachBubbleCard({ bubble }: { bubble: CoachBubble }) {
  const isPrimaryCta = bubble.kind === "training_cta";
  const isOptional = bubble.kind === "training_cta_optional";

  const inner = (
    <div
      className={`relative max-w-[85%] rounded-3xl px-4 py-3 text-sm leading-snug ${
        isPrimaryCta
          ? "bg-[#2563eb] font-medium text-white"
          : isOptional
            ? "bg-white text-ink ring-1 ring-black/8"
            : "bg-[#2563eb] font-medium text-white"
      } ${bubble.cta ? "cursor-pointer" : ""}`}
    >
      <span
        aria-hidden
        className={`absolute -bottom-1 left-3 h-3 w-3 rotate-45 ${
          isOptional ? "bg-white ring-1 ring-black/8" : "bg-[#2563eb]"
        }`}
      />
      {bubble.body}
      {bubble.cta && (
        <ArrowRight className="ml-1.5 inline-block size-3.5 align-middle opacity-70" aria-hidden />
      )}
    </div>
  );

  return (
    <div className="flex flex-col items-start">
      {bubble.cta ? (
        <Link href={bubble.cta.href}>{inner}</Link>
      ) : (
        inner
      )}
    </div>
  );
}

function UserReplyBubble({ reply }: { reply: OptimisticReply }) {
  return (
    <div className="flex justify-end">
      <div
        className={`max-w-[80%] rounded-3xl border border-black/8 bg-white px-4 py-2.5 text-sm leading-snug text-ink ${
          reply.pending ? "opacity-60" : ""
        }`}
      >
        {reply.body}
      </div>
    </div>
  );
}
