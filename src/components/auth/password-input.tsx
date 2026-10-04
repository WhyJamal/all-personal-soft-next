"use client";

import { useState, type InputHTMLAttributes } from "react";
import { Eye, EyeOff } from "lucide-react";
import { useTranslations } from "next-intl";
import { AuthInput } from "./auth-input";

type Props = Omit<InputHTMLAttributes<HTMLInputElement>, "type"> & {
  label: string;
  error?: string;
  hint?: string;
};

export function PasswordInput(props: Props) {
  const [visible, setVisible] = useState(false);
  const t = useTranslations("auth");
  return (
    <AuthInput
      {...props}
      type={visible ? "text" : "password"}
      trailing={
        <button
          type="button"
          onClick={() => setVisible((v) => !v)}
          aria-label={visible ? t("hide") : t("show")}
          className="grid size-8 place-items-center rounded-lg text-zinc-400 transition-colors hover:text-zinc-700 focus-visible:outline-2 focus-visible:outline-sky-500"
        >
          {visible ? <EyeOff className="size-4" /> : <Eye className="size-4" />}
        </button>
      }
    />
  );
}
