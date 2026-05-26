"use client";

import { ArrowRight } from "lucide-react";
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
        {open ? (
          <div className="w-full">
            <textarea
              value={draft}
              onChange={(e) => setDraft(e.target.value)}
              maxLength={500}
              rows={2}
              placeholder="Reply to the coach…"
              className="mono-copy w-full rounded-2xl border border-black/10 bg-white px-3 py-2 text-sm text-ink outline-none focus:border-[#2563eb]"
              autoFocus
            />
            <div className="mt-2 flex justify-end gap-2">
              <button
                type="button"
                onClick={() => {
                  setOpen(false);
                  setDraft("");
                }}
                className="rounded-full px-3 py-1.5 text-xs font-semibold text-label"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={submit}
                disabled={isPending || !draft.trim()}
                className="rounded-full bg-[#2563eb] px-4 py-1.5 text-xs font-bold text-white disabled:opacity-50"
              >
                Send
              </button>
            </div>
          </div>
        ) : (
          <button
            type="button"
            onClick={() => setOpen(true)}
            className="inline-flex items-center gap-1.5 rounded-full border-2 border-[#2563eb] px-4 py-1.5 text-xs font-bold text-[#2563eb]"
          >
            Reply
          </button>
        )}
      </div>
    </section>
  );
}

function CoachBubbleCard({ bubble }: { bubble: CoachBubble }) {
  const isPrimaryCta = bubble.kind === "training_cta";
  const isOptional = bubble.kind === "training_cta_optional";

  return (
    <div className="flex flex-col items-start">
      <div
        className={`relative max-w-[85%] rounded-3xl px-4 py-3 text-sm leading-snug ${
          isPrimaryCta
            ? "bg-[#2563eb] font-medium text-white"
            : isOptional
              ? "bg-white text-ink ring-1 ring-black/8"
              : "bg-[#2563eb] font-medium text-white"
        }`}
      >
        <span
          aria-hidden
          className={`absolute -bottom-1 left-3 h-3 w-3 rotate-45 ${
            isOptional ? "bg-white ring-1 ring-black/8" : "bg-[#2563eb]"
          }`}
        />
        {bubble.body}
      </div>
      {bubble.cta && (
        <Link
          href={bubble.cta.href}
          className={`mt-2 inline-flex items-center gap-1.5 rounded-2xl px-4 py-2 text-sm font-bold ${
            isPrimaryCta
              ? "bg-white text-[#2563eb] shadow-card"
              : "border border-black/8 bg-white text-ink"
          }`}
        >
          {bubble.cta.label}
          <ArrowRight className="size-4" aria-hidden />
        </Link>
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
