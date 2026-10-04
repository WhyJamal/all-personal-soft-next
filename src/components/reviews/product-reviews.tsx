"use client";

import { useEffect, useMemo, useState, type FormEvent } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useSession } from "next-auth/react";
import { useLocale, useTranslations } from "next-intl";
import { motion } from "motion/react";
import { LogIn, MessageSquareText, Pencil, Send } from "lucide-react";
import { cn } from "@/lib/utils";
import { BffError, bff, errorMessage } from "@/lib/api/bff";
import { Avatar } from "@/components/avatar";
import { StarRating } from "@/components/ui/star-rating";
import { useToast } from "@/components/ui/toast";
import { INTL_LOCALE } from "@/components/profile/format";
import { SubmitButton } from "@/components/auth/submit-button";

type Review = {
  id: number;
  user: number;
  user_name: string;
  user_avatar: string | null;
  rating: number;
  comment: string;
  created_at: string;
};
type Summary = { average: number; count: number };
type State = { loading: boolean; locked: boolean; failed: boolean; reviews: Review[]; summary: Summary };

const PAGE = 6;
const reviewsUrl = (id: number) => `products/reviews/?product=${id}`;
const summaryUrl = (id: number) => `products/reviews/summary/?product=${id}`;

async function fetchAll(productId: number): Promise<Pick<State, "reviews" | "summary">> {
  const [list, summary] = await Promise.all([
    bff.get<Review[] | { results: Review[] }>(reviewsUrl(productId), { keepSession: true }),
    bff.get<Summary>(summaryUrl(productId), { keepSession: true }),
  ]);
  return { reviews: Array.isArray(list) ? list : (list.results ?? []), summary };
}

const failure = (e: unknown): Pick<State, "loading" | "locked" | "failed"> => {
  const locked = e instanceof BffError && (e.status === 401 || e.status === 403);
  return { loading: false, locked, failed: !locked };
};

export function ProductReviews({ productId }: { productId: number }) {
  const t = useTranslations("reviews");
  const locale = useLocale();
  const pathname = usePathname();
  const { data: session } = useSession();
  const { toast } = useToast();

  const [state, setState] = useState<State>({ loading: true, locked: false, failed: false, reviews: [], summary: { average: 0, count: 0 } });
  const [visible, setVisible] = useState(PAGE);
  const [editing, setEditing] = useState(false);
  const [rating, setRating] = useState(0);
  const [comment, setComment] = useState("");
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    let alive = true;
    fetchAll(productId)
      .then((data) => alive && setState({ loading: false, locked: false, failed: false, ...data }))
      .catch((e) => alive && setState((s) => ({ ...s, ...failure(e) })));
    return () => {
      alive = false;
    };
  }, [productId, session?.user.id]); // re-read once the sign-in state is known

  const userId = session ? Number(session.user.id) : null;
  const mine = userId ? state.reviews.find((r) => r.user === userId) : undefined;
  const { reviews, summary } = state;

  const distribution = useMemo(() => {
    const counts = [0, 0, 0, 0, 0];
    for (const r of reviews) if (r.rating >= 1 && r.rating <= 5) counts[r.rating - 1]++;
    return counts;
  }, [reviews]);

  const fmtDate = (iso: string) => new Intl.DateTimeFormat(INTL_LOCALE[locale] ?? locale, { dateStyle: "medium" }).format(new Date(iso));

  function startEdit() {
    setRating(mine?.rating ?? 0);
    setComment(mine?.comment ?? "");
    setEditing(true);
  }

  async function onSubmit(e: FormEvent) {
    e.preventDefault();
    if (rating < 1) return toast(t("ratingRequired"), "info");
    setSubmitting(true);
    try {
      await bff.post("products/reviews/", { product: productId, rating, comment: comment.trim() });
      toast(mine ? t("updated") : t("submitted"), "success");
      setEditing(false);
      setRating(0);
      setComment("");
      const data = await fetchAll(productId);
      setState((s) => ({ ...s, ...data }));
    } catch (err) {
      toast(errorMessage(err, t("failed")), "error");
    } finally {
      setSubmitting(false);
    }
  }

  const card = "rounded-3xl border border-zinc-200 bg-white p-6";

  return (
    <section id="reviews" className="mx-auto w-full max-w-5xl scroll-mt-20 px-4 py-20 md:px-6">
      <h2 className="text-3xl font-semibold tracking-tight text-zinc-900 md:text-4xl">{t("title")}</h2>

      <div className="mt-8 grid items-start gap-6 lg:grid-cols-[280px_minmax(0,1fr)]">
        {/* summary */}
        <aside className={cn(card, "lg:sticky lg:top-20")}>
          <p className="text-xs font-medium text-zinc-400">{t("average")}</p>
          <div className="mt-2 flex items-end gap-3">
            <span className="text-6xl font-semibold leading-none tracking-tight tabular-nums text-zinc-900">
              {summary.count > 0 ? Number(summary.average).toFixed(1) : "—"}
            </span>
            {summary.count > 0 && <StarRating value={Math.round(summary.average)} size={18} className="mb-1" />}
          </div>
          <p className="mt-2 text-sm text-zinc-500">{t("count", { count: summary.count })}</p>

          {reviews.length > 0 && (
            <ul className="mt-5 space-y-2">
              {[5, 4, 3, 2, 1].map((n) => {
                const c = distribution[n - 1];
                return (
                  <li key={n} className="flex items-center gap-2.5 text-xs text-zinc-500">
                    <span className="w-3 tabular-nums">{n}</span>
                    <span className="h-1.5 flex-1 overflow-hidden rounded-full bg-zinc-100">
                      <motion.span
                        className="block h-full rounded-full bg-amber-400"
                        initial={{ width: 0 }}
                        animate={{ width: `${(c / reviews.length) * 100}%` }}
                        transition={{ duration: 0.6, ease: "easeOut" }}
                      />
                    </span>
                    <span className="w-5 text-right tabular-nums">{c}</span>
                  </li>
                );
              })}
            </ul>
          )}
        </aside>

        <div className="min-w-0 space-y-6">
          {/* composer */}
          {!session ? (
            <div className={cn(card, "flex flex-col items-center gap-3 bg-zinc-50/70 text-center sm:flex-row sm:justify-between sm:text-left")}>
              <p className="text-sm text-zinc-600">{state.locked ? t("loginToSee") : t("loginToReview")}</p>
              <Link
                href={`/login?callbackUrl=${encodeURIComponent(pathname)}`}
                className="inline-flex h-10 shrink-0 items-center gap-2 rounded-xl bg-sky-600 px-5 text-sm font-semibold text-white transition-colors hover:bg-sky-500"
              >
                <LogIn className="size-4" />
                {t("login")}
              </Link>
            </div>
          ) : mine && !editing ? (
            <div className={cn(card, "border-sky-200 bg-sky-50/40")}>
              <div className="flex items-center justify-between gap-3">
                <p className="text-xs font-medium text-zinc-500">{t("yourReview")}</p>
                <button type="button" onClick={startEdit} className="inline-flex items-center gap-1.5 rounded-lg px-2.5 py-1.5 text-xs font-medium text-sky-700 transition-colors hover:bg-sky-100">
                  <Pencil className="size-3.5" />
                  {t("edit")}
                </button>
              </div>
              <StarRating value={mine.rating} size={22} className="mt-2" />
              {mine.comment && <p className="mt-3 break-words text-sm leading-relaxed text-zinc-700">{mine.comment}</p>}
            </div>
          ) : (
            <form onSubmit={onSubmit} className={card}>
              <p className="text-sm font-medium text-zinc-700">{mine ? t("yourReview") : t("yourRating")}</p>
              <StarRating value={rating} onChange={setRating} size={30} className="mt-2" />
              <textarea
                value={comment}
                onChange={(e) => setComment(e.target.value)}
                maxLength={1000}
                rows={3}
                placeholder={t("commentPlaceholder")}
                className="mt-4 w-full resize-none rounded-xl border border-zinc-200 bg-white px-3.5 py-3 text-sm text-zinc-900 outline-none transition-colors placeholder:text-zinc-400 focus:border-sky-500 focus:ring-4 focus:ring-sky-500/10"
              />
              <div className="mt-3 flex items-center justify-between gap-3">
                <span className="text-xs tabular-nums text-zinc-400">{comment.length}/1000</span>
                <div className="flex gap-2">
                  {mine && (
                    <button type="button" onClick={() => setEditing(false)} className="rounded-xl px-4 py-2 text-sm font-medium text-zinc-600 transition-colors hover:bg-zinc-100">
                      {t("cancel")}
                    </button>
                  )}
                  <SubmitButton loading={submitting} className="w-auto px-5">
                    <Send className="size-4" />
                    {mine ? t("update") : t("submit")}
                  </SubmitButton>
                </div>
              </div>
            </form>
          )}

          {/* list */}
          {state.failed ? (
            <p className="rounded-2xl bg-red-50 px-4 py-3 text-sm text-red-600">{t("loadFailed")}</p>
          ) : !state.loading && reviews.length === 0 && !state.locked ? (
            <div className="flex flex-col items-center gap-2 rounded-3xl border border-dashed border-zinc-200 py-14 text-center">
              <span className="grid size-11 place-items-center rounded-2xl bg-zinc-100 text-zinc-400">
                <MessageSquareText className="size-5" />
              </span>
              <p className="text-sm text-zinc-500">{t("noReviews")}</p>
            </div>
          ) : (
            <ul className="space-y-3">
              {reviews.slice(0, visible).map((r, i) => (
                <motion.li
                  key={r.id}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.3, delay: Math.min(i, PAGE) * 0.04 }}
                  className={cn("flex gap-3.5 rounded-2xl border bg-white p-5", r.user === userId ? "border-sky-200" : "border-zinc-200")}
                >
                  <Avatar name={r.user_name} src={r.user_avatar} className="size-10 text-sm" />
                  <div className="min-w-0 flex-1">
                    <div className="flex flex-wrap items-center gap-x-2.5 gap-y-1">
                      <span className="text-sm font-semibold text-zinc-900">{r.user_name}</span>
                      {r.user === userId && <span className="rounded-full bg-sky-50 px-2 py-0.5 text-[11px] font-medium text-sky-700">{t("you")}</span>}
                      <StarRating value={r.rating} size={14} />
                      <span className="text-xs text-zinc-400">{fmtDate(r.created_at)}</span>
                    </div>
                    {r.comment && <p className="mt-1.5 break-words text-sm leading-relaxed text-zinc-600">{r.comment}</p>}
                  </div>
                </motion.li>
              ))}
              {reviews.length > visible && (
                <li className="pt-1 text-center">
                  <button type="button" onClick={() => setVisible((v) => v + PAGE)} className="rounded-full border border-zinc-200 px-5 py-2 text-sm font-medium text-zinc-700 transition-colors hover:bg-zinc-50">
                    {t("showMore")}
                  </button>
                </li>
              )}
            </ul>
          )}
        </div>
      </div>
    </section>
  );
}
