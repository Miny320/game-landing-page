import Image from "next/image";
import Link from "next/link";
import { Plus } from "lucide-react";
import { ULTIMATE_PREVIEW_SCRIPTS } from "@/lib/pricing";

const CARD_CLASS =
  "relative w-[140px] shrink-0 overflow-hidden border border-amber-400/40 bg-black/50 sm:w-[160px]";
const MORE_CARD_CLASS =
  "relative flex w-[140px] shrink-0 flex-col items-center justify-center border border-dashed border-cyan-accent/45 bg-cyan-accent/[0.06] p-4 text-center sm:w-[160px]";

type Props = {
  /** Wrap each preview card in a link (homepage store section). */
  linkCards?: boolean;
  className?: string;
};

function PreviewCard({
  script,
  asLink,
}: {
  script: (typeof ULTIMATE_PREVIEW_SCRIPTS)[number];
  asLink: boolean;
}) {
  const inner = (
    <>
      <div className="absolute right-2 top-2 z-10 bg-amber-400 px-2 py-0.5 font-rajdhani text-[9px] font-black uppercase tracking-widest text-black">
        Ultimate
      </div>
      <div className="relative aspect-[4/5] w-full">
        <Image
          src={script.image}
          alt={`${script.name} — ${script.game}`}
          fill
          className={`object-cover opacity-90 ${asLink ? "transition duration-300 group-hover:scale-105" : ""}`}
          sizes="160px"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black via-black/40 to-transparent" />
        <div className="absolute bottom-0 left-0 right-0 p-2 sm:p-3">
          <p className="font-rajdhani text-[9px] font-bold uppercase tracking-wider text-gray-400 sm:text-[10px]">
            {script.game}
          </p>
          <p className="font-rajdhani text-xs font-bold text-white sm:text-sm">{script.name}</p>
        </div>
      </div>
    </>
  );

  if (asLink) {
    return (
      <Link
        href="/subscribe"
        className={`group ${CARD_CLASS} no-underline`}
      >
        {inner}
      </Link>
    );
  }

  return <div className={CARD_CLASS}>{inner}</div>;
}

function MoreScriptsCard() {
  return (
    <div className={`${MORE_CARD_CLASS} aspect-[4/5]`}>
      <Plus className="mb-2 size-8 text-cyan-accent" aria-hidden />
      <p className="font-rajdhani text-lg font-black uppercase leading-tight text-white sm:text-xl">
        &amp; MORE
      </p>
      <p className="font-rajdhani text-sm font-bold uppercase tracking-wider text-cyan-accent">
        scripts
      </p>
      <p className="mt-3 font-sans text-[10px] leading-snug text-gray-400 sm:text-xs">
        200+ in the library
        <br />
        New drops added frequently
      </p>
    </div>
  );
}

export function UltimateScriptPreviewRow({ linkCards = false, className = "" }: Props) {
  return (
    <div className={className}>
      <p className="mb-3 font-rajdhani text-[10px] font-black uppercase tracking-[0.2em] text-gray-500">
        Preview — full library unlocks with Ultimate
      </p>
      <div className="flex gap-4 overflow-x-auto pb-2 md:flex-wrap md:overflow-visible">
        {ULTIMATE_PREVIEW_SCRIPTS.map((script) => (
          <PreviewCard
            key={`${script.game}-${script.name}`}
            script={script}
            asLink={linkCards}
          />
        ))}
        <MoreScriptsCard />
      </div>
    </div>
  );
}
