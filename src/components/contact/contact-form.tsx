"use client";

import { useState, type FormEvent } from "react";
import { useSession } from "next-auth/react";
import { useTranslations } from "next-intl";
import { AnimatePresence, motion } from "motion/react";
import { Send } from "lucide-react";
import { AuthInput } from "@/components/auth/auth-input";
import { SubmitButton } from "@/components/auth/submit-button";
import { GlowTextarea } from "@/components/ui/glow-textarea";
import { MovingBorderCard } from "@/components/ui/moving-border";
import { useToast } from "@/components/ui/toast";
import { bff, errorMessage } from "@/lib/api/bff";
import { contactConfig } from "@/config/contact.config";
import { cn } from "@/lib/utils";

const { limits } = contactConfig;
const TOPICS = ["question", "partnership", "support", "other"] as const;
const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;

type Field = "name" | "email" | "subject" | "message";
type Values = Record<Field, string | null>; // null = untouched, falls back to the signed-in user's data
type Errors = Partial<Record<Field, string>>;

function SuccessPanel({ onAgain }: { onAgain: () => void }) {
  const t = useTranslations("contact.form.success");

  return (
    <motion.div
      key="success"
      initial={{ opacity: 0, scale: 0.96 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.35, ease: [0.22, 1, 0.36, 1] }}
      className="flex min-h-96 flex-col items-center justify-center text-center"
    >
      <div className="relative grid size-20 place-items-center">
        <span aria-hidden className="absolute inset-0 animate-ping rounded-full bg-emerald-400/20 [animation-iteration-count:2]" />
        <span className="relative grid size-20 place-items-center rounded-full bg-emerald-50 ring-8 ring-emerald-50/60">
          <svg viewBox="0 0 24 24" className="size-9 text-emerald-600" fill="none" stroke="currentColor" strokeWidth={2.4} strokeLinecap="round" strokeLinejoin="round">
            <motion.path
              d="M5 12.5l4.5 4.5L19 7.5"
              initial={{ pathLength: 0 }}
              animate={{ pathLength: 1 }}
              transition={{ duration: 0.5, delay: 0.2, ease: "easeOut" }}
            />
          </svg>
        </span>
      </div>
      <h3 className="mt-6 text-xl font-semibold tracking-tight text-zinc-900">{t("title")}</h3>
      <p className="mt-2 max-w-xs text-sm leading-6 text-zinc-500">{t("text")}</p>
      <button
        type="button"
        onClick={onAgain}
        className="mt-6 rounded-xl border border-zinc-200 px-4 py-2.5 text-sm font-medium text-zinc-700 transition-colors hover:border-sky-300 hover:text-sky-700 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-sky-500"
      >
        {t("again")}
      </button>
    </motion.div>
  );
}

export function ContactForm() {
  const t = useTranslations("contact.form");
  const { toast } = useToast();
  const { data: session } = useSession();
  const user = session?.user;

  const [values, setValues] = useState<Values>({ name: null, email: null, subject: null, message: null });
  const [honeypot, setHoneypot] = useState("");
  const [errors, setErrors] = useState<Errors>({});
  const [sending, setSending] = useState(false);
  const [sent, setSent] = useState(false);

  const current: Record<Field, string> = {
    name: values.name ?? user?.name ?? "",
    email: values.email ?? user?.email ?? "",
    subject: values.subject ?? "",
    message: values.message ?? "",
  };

  function set(field: Field, value: string) {
    setValues((v) => ({ ...v, [field]: value }));
    if (errors[field]) setErrors((e) => ({ ...e, [field]: undefined }));
  }

  function validate(): Errors {
    const e: Errors = {};
    const name = current.name.trim();
    const email = current.email.trim();
    const subject = current.subject.trim();
    const message = current.message.trim();
    if (!name) e.name = t("errors.nameRequired");
    if (!email) e.email = t("errors.emailRequired");
    else if (!EMAIL_RE.test(email)) e.email = t("errors.emailInvalid");
    if (!subject) e.subject = t("errors.subjectRequired");
    if (!message) e.message = t("errors.messageRequired");
    else if (message.length < limits.messageMin) e.message = t("errors.messageShort", { min: limits.messageMin });
    return e;
  }

  async function onSubmit(ev: FormEvent<HTMLFormElement>) {
    ev.preventDefault();
    if (sending) return;

    const found = validate();
    setErrors(found);
    if (Object.keys(found).length) return;

    // Bots fill hidden fields; people never see this one. Pretend it worked.
    if (honeypot) {
      setSent(true);
      return;
    }

    setSending(true);
    try {
      await bff.post("contact/", {
        name: current.name.trim(),
        email: current.email.trim(),
        subject: current.subject.trim(),
        message: current.message.trim(),
      });
      setSent(true);
      setValues({ name: null, email: null, subject: null, message: null });
    } catch (err) {
      toast(errorMessage(err, t("error")), "error");
    } finally {
      setSending(false);
    }
  }

  return (
    <MovingBorderCard radius={28} duration={6000} className="p-6 sm:p-8">
      <AnimatePresence mode="wait" initial={false}>
        {sent ? (
          <SuccessPanel key="success" onAgain={() => setSent(false)} />
        ) : (
          <motion.div key="form" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} transition={{ duration: 0.2 }}>
            <div className="mb-6">
              <h2 className="text-xl font-semibold tracking-tight text-zinc-900">{t("title")}</h2>
              <p className="mt-1 text-sm text-zinc-500">{t("subtitle")}</p>
            </div>

            <form onSubmit={onSubmit} noValidate className="space-y-4">
              <div className="grid gap-4 sm:grid-cols-2">
                <AuthInput
                  label={t("name")}
                  name="name"
                  autoComplete="name"
                  maxLength={limits.name}
                  value={current.name}
                  onChange={(e) => set("name", e.target.value)}
                  error={errors.name}
                />
                <AuthInput
                  label={t("email")}
                  name="email"
                  type="email"
                  autoComplete="email"
                  inputMode="email"
                  value={current.email}
                  onChange={(e) => set("email", e.target.value)}
                  error={errors.email}
                />
              </div>

              <div className="space-y-2">
                <span className="text-sm font-medium text-zinc-700">{t("topicLabel")}</span>
                <div className="flex flex-wrap gap-2">
                  {TOPICS.map((k) => {
                    const label = t(`topics.${k}`);
                    const active = current.subject === label;
                    return (
                      <button
                        key={k}
                        type="button"
                        aria-pressed={active}
                        onClick={() => set("subject", label)}
                        className={cn(
                          "rounded-full border px-3.5 py-1.5 text-sm transition-all focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-sky-500",
                          active
                            ? "border-sky-500 bg-sky-50 font-medium text-sky-700 shadow-[0_0_0_3px_rgb(14_165_233/0.12)]"
                            : "border-zinc-200 text-zinc-600 hover:border-zinc-300 hover:bg-zinc-50"
                        )}
                      >
                        {label}
                      </button>
                    );
                  })}
                </div>
              </div>

              <AuthInput
                label={t("subject")}
                name="subject"
                maxLength={limits.subject}
                value={current.subject}
                onChange={(e) => set("subject", e.target.value)}
                error={errors.subject}
              />

              <GlowTextarea
                label={t("message")}
                name="message"
                rows={5}
                maxLength={limits.messageMax}
                placeholder={t("messagePlaceholder")}
                value={current.message}
                onChange={(e) => set("message", e.target.value)}
                error={errors.message}
                counter={`${current.message.length} / ${limits.messageMax}`}
              />

              {/* honeypot — hidden from people and assistive tech */}
              <div aria-hidden className="absolute -left-[9999px] h-0 w-0 overflow-hidden">
                <label>
                  Website
                  <input type="text" name="website" tabIndex={-1} autoComplete="off" value={honeypot} onChange={(e) => setHoneypot(e.target.value)} />
                </label>
              </div>

              <SubmitButton loading={sending}>
                {!sending && <Send className="size-4" />}
                {sending ? t("sending") : t("send")}
              </SubmitButton>
            </form>
          </motion.div>
        )}
      </AnimatePresence>
    </MovingBorderCard>
  );
}
