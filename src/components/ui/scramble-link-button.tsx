import {
  useCallback,
  useEffect,
  useRef,
  useState,
  type CSSProperties,
  type MouseEventHandler,
  type ReactNode,
} from "react";
import { cn } from "@/lib/utils";

const GLYPHS = "!<>-_\\/[]{}—=+*^?#________";
const TICK_MS = 30;
const CHARS_PER_TICK = 3;

type ScrambleLinkButtonProps = {
  btnText: string;
  href?: string;
  hoverColor?: string;
  showLine?: boolean;
  showArrow?: boolean;
  eyebrow?: string;
  caption?: string;
  external?: boolean;
  className?: string;
  onClick?: MouseEventHandler<HTMLAnchorElement>;
};

export default function ScrambleLinkButton({
  btnText,
  href,
  hoverColor,
  showLine = false,
  showArrow = false,
  eyebrow,
  caption,
  external = true,
  className,
  onClick,
}: ScrambleLinkButtonProps) {
  const [text, setText] = useState(btnText);
  const timerRef = useRef<number | null>(null);

  const stopScramble = useCallback(() => {
    if (timerRef.current !== null) {
      window.clearInterval(timerRef.current);
      timerRef.current = null;
    }
    setText(btnText);
  }, [btnText]);

  const startScramble = useCallback(() => {
    if (timerRef.current !== null) window.clearInterval(timerRef.current);
    let tick = 0;
    timerRef.current = window.setInterval(() => {
      tick += 1;
      const revealed = tick * CHARS_PER_TICK;
      if (revealed >= btnText.length) {
        if (timerRef.current !== null) window.clearInterval(timerRef.current);
        timerRef.current = null;
        setText(btnText);
        return;
      }
      setText(
        btnText
          .split("")
          .map((char, index) => {
            if (index < revealed) return char;
            if (char === " ") return " ";
            return GLYPHS[Math.floor(Math.random() * GLYPHS.length)];
          })
          .join(""),
      );
    }, TICK_MS);
  }, [btnText]);

  useEffect(() => {
    if (timerRef.current !== null) window.clearInterval(timerRef.current);
    timerRef.current = null;
    setText(btnText);
  }, [btnText]);

  useEffect(
    () => () => {
      if (timerRef.current !== null) window.clearInterval(timerRef.current);
    },
    [],
  );

  const isExternal = external && /^https?:\/\//i.test(href ?? "");

  return (
    <a
      href={href ?? "#"}
      onClick={onClick}
      onMouseEnter={startScramble}
      onMouseLeave={stopScramble}
      onFocus={startScramble}
      onBlur={stopScramble}
      className={cn(
        "group/scramble relative inline-flex flex-col focus-visible:outline-none",
        className,
      )}
      style={hoverColor ? ({ "--scramble-color": hoverColor } as CSSProperties) : undefined}
      target={isExternal ? "_blank" : undefined}
      rel={isExternal ? "noreferrer noopener" : undefined}
    >
      {eyebrow ? (
        <span className="font-mono text-[10px] uppercase tracking-[0.3em] text-muted-foreground transition-colors duration-300 group-hover/scramble:text-[var(--scramble-color,inherit)]">
          {eyebrow}
        </span>
      ) : null}
      <span className="flex min-h-14 w-full flex-col justify-end gap-1">
        <span className="flex items-baseline gap-1 font-display text-xl">
          <span className="transition-colors duration-300 group-hover/scramble:text-[var(--scramble-color,inherit)]">
            {text}
          </span>
          {showArrow ? (
            <span
              aria-hidden="true"
              className="inline-block transition-[transform,color] duration-300 group-hover/scramble:translate-x-1 group-hover/scramble:text-[var(--scramble-color,inherit)]"
            >
              ↗
            </span>
          ) : null}
        </span>
        {caption ? (
          <span className="truncate font-mono text-[11px] text-muted-foreground opacity-0 transition-opacity duration-300 group-hover/scramble:opacity-100">
            {caption}
          </span>
        ) : null}
        {showLine ? (
          <span aria-hidden="true" className="mt-3 block h-px w-full overflow-hidden bg-border">
            <span className="block h-px w-0 bg-[var(--scramble-color,inherit)] transition-[width] duration-300 ease-out group-hover/scramble:w-full" />
          </span>
        ) : null}
      </span>
    </a>
  );
}
