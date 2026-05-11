"use client";

import { signOut } from "next-auth/react";
import { cn } from "@/components/ui/Button";
import { ChevronDown, LogOut } from "lucide-react";
import { useEffect, useRef, useState, type ReactNode } from "react";

/** Double neon rim + black fill inside a left-pointed tag (clip-path). */
function NeonProfileTagShell({
  children,
  className,
}: {
  children: ReactNode;
  className?: string;
}) {
  return (
    <div
      className={cn(
        "discord-profile-tag-clip bg-[color:var(--discord-profile-neon)] p-px",
        className
      )}
    >
      <div className="discord-profile-tag-clip flex min-h-0 w-full bg-[color:var(--discord-profile-gap)] p-px">
        <div className="discord-profile-tag-clip min-h-0 w-full bg-[color:var(--discord-profile-neon)] p-px">
          <div className="discord-profile-tag-clip flex min-h-0 w-full min-w-0 items-center bg-[color:var(--discord-profile-bg)]">
            {children}
          </div>
        </div>
      </div>
    </div>
  );
}

const neonText =
  "font-rajdhani font-bold uppercase tracking-[0.12em] text-[13px] leading-none text-[color:var(--discord-profile-neon)] [text-shadow:0_0_14px_rgba(0,251,255,0.35)]";

const interactiveBtn =
  "block cursor-pointer border-0 bg-transparent p-0 text-left transition-[filter,transform] duration-200 ease-out hover:[filter:drop-shadow(0_0_16px_rgba(0,251,255,0.5))] hover:scale-[1.02] active:scale-[0.98] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[color:var(--discord-profile-neon)] focus-visible:ring-offset-2 focus-visible:ring-offset-[color:var(--discord-profile-bg)]";

export type DiscordHeaderProfileProps = {
  variant: "nav" | "mobile";
  user: {
    name?: string | null;
    image?: string | null;
  };
  onNavigate?: () => void;
};

export function DiscordHeaderProfile({
  variant,
  user,
  onNavigate,
}: DiscordHeaderProfileProps) {
  const [open, setOpen] = useState(false);
  const wrapRef = useRef<HTMLDivElement>(null);

  const name = user.name?.trim().toUpperCase() || "DISCORD USER";
  const image = user.image;

  useEffect(() => {
    if (!open) return;
    const onDoc = (e: MouseEvent) => {
      if (
        wrapRef.current &&
        !wrapRef.current.contains(e.target as Node)
      ) {
        setOpen(false);
      }
    };
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setOpen(false);
    };
    document.addEventListener("mousedown", onDoc);
    document.addEventListener("keydown", onKey);
    return () => {
      document.removeEventListener("mousedown", onDoc);
      document.removeEventListener("keydown", onKey);
    };
  }, [open]);

  const handleSignOut = () => {
    setOpen(false);
    onNavigate?.();
    void signOut({ callbackUrl: "/" });
  };

  const avatarNav = (
    <div className="relative shrink-0 size-[34px] overflow-hidden rounded-full bg-black/80 ring-1 ring-[color:var(--discord-profile-neon)]/35">
      {image ? (
        <img
          src={image}
          alt=""
          width={34}
          height={34}
          className="size-full rounded-full object-cover"
        />
      ) : null}
    </div>
  );

  const avatarMobile = (
    <div className="relative shrink-0 size-11 overflow-hidden rounded-full bg-black/80 ring-1 ring-[color:var(--discord-profile-neon)]/35">
      {image ? (
        <img
          src={image}
          alt=""
          width={44}
          height={44}
          className="size-full rounded-full object-cover"
        />
      ) : null}
    </div>
  );

  const menuPanel = (
    <div
      role="menu"
      className="absolute right-0 top-[calc(100%+10px)] z-[100] min-w-[196px] border border-[color:var(--discord-profile-neon)]/45 bg-black/92 py-1 shadow-[0_0_32px_rgba(0,251,255,0.18),inset_0_0_0_1px_rgba(0,251,255,0.12)] backdrop-blur-md before:pointer-events-none before:absolute before:inset-0 before:shadow-[inset_0_0_20px_rgba(0,251,255,0.06)] before:content-['']"
    >
      <button
        type="button"
        role="menuitem"
        onClick={handleSignOut}
        className="relative flex w-full items-center gap-2.5 px-4 py-2.5 text-left text-[13px] font-rajdhani font-bold uppercase tracking-[0.18em] text-[color:var(--discord-profile-neon)] transition-colors hover:bg-[color:var(--discord-profile-neon)]/12"
      >
        <LogOut className="size-[15px] shrink-0 opacity-90" strokeWidth={2.25} aria-hidden />
        Sign out
      </button>
    </div>
  );

  if (variant === "mobile") {
    return (
      <div className="flex w-full flex-col gap-3">
        <div className="pointer-events-none w-full">
          <NeonProfileTagShell className="w-full [&_.discord-profile-tag-clip:last-child]:min-h-[52px]">
            <span className="flex w-full min-w-0 items-center gap-3.5 px-3 py-3 pl-2">
              {avatarMobile}
              <span
                className={cn(neonText, "min-w-0 flex-1 truncate tracking-[0.2em] text-[15px]")}
              >
                {name}
              </span>
            </span>
          </NeonProfileTagShell>
        </div>
        <button
          type="button"
          onClick={handleSignOut}
          className="discord-profile-tag-clip flex w-full items-center justify-center gap-2 border border-[color:var(--discord-profile-neon)]/55 bg-transparent py-3.5 text-[15px] font-rajdhani font-bold uppercase tracking-[0.2em] text-[color:var(--discord-profile-neon)] shadow-[inset_0_0_0_1px_rgba(0,251,255,0.08)] transition-[background,filter] hover:bg-[color:var(--discord-profile-neon)]/10 hover:[filter:drop-shadow(0_0_14px_rgba(0,251,255,0.35))] active:scale-[0.99]"
        >
          <LogOut className="size-5 shrink-0" strokeWidth={2.25} aria-hidden />
          Sign out
        </button>
      </div>
    );
  }

  return (
    <div className="relative" ref={wrapRef}>
      <button
        type="button"
        aria-haspopup="menu"
        aria-expanded={open}
        onClick={() => setOpen((v) => !v)}
        className={cn(
          interactiveBtn,
          "min-h-[46px] min-w-0 w-max max-w-[min(calc(100vw-96px),20rem)]"
        )}
      >
        <NeonProfileTagShell className="min-w-0 max-w-full">
          <span className="flex min-h-[40px] min-w-0 max-w-full items-center gap-x-2 gap-y-0 py-2 px-2">
            {avatarNav}
            <span
              className={cn(
                neonText,
                "min-w-0 max-w-[min(18rem,calc(100vw-7.75rem))] truncate whitespace-nowrap"
              )}
            >
              {name}
            </span>
            <ChevronDown
              className={cn(
                "size-[18px] shrink-0 text-[color:var(--discord-profile-neon)] opacity-95 transition-transform duration-200",
                open && "rotate-180"
              )}
              strokeWidth={2.75}
              aria-hidden
            />
          </span>
        </NeonProfileTagShell>
      </button>

      {open && menuPanel}
    </div>
  );
}
