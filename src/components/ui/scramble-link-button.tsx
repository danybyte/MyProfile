import {
  useCallback,
  useEffect,
  useRef,
  useState,
  type CSSProperties,
  type MouseEventHandler,
} from "react";
import { cn } from "@/lib/utils";

const GLYPHS = "!<>-_\\/[]{}=+*^?#";
const TICK_MS = 30;
const TICKS_TOTAL = 22;

function canHover() {
  return typeof window !== "undefined" && window.matchMedia("(hover: hover)").matches;
}

type ScrambleLinkButtonProps = {
  btnText: string;
  hoverText?: string;
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
  hoverText,
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
  const [hovered, setHovered] = useState(false);
  const textRef = useRef(btnText);
  const timerRef = useRef<number | null>(null);

  const updateText = useCallback((value: string) => {
    textRef.current = value;
    setText(value);
  }, []);

  const scrambleTo = useCallback(
    (target: string) => {
      if (timerRef.current !== null) window.clearInterval(timerRef.current);
      const source = textRef.current;
      let tick = 0;
      timerRef.current = window.setInterval(() => {
        tick += 1;
        if (tick >= TICKS_TOTAL) {
          if (timerRef.current !== null) window.clearInterval(timerRef.current);
          timerRef.current = null;
          updateText(target);
          return;
        }
        const revealed = Math.floor((tick / TICKS_TOTAL) * target.length);
        updateText(
          target
            .split("")
            .map((char, index) => {
              if (index < revealed) return char;
              if (char === " ") return " ";
              return GLYPHS[Math.floor(Math.random() * GLYPHS.length)];
            })
            .join(""),
        );
      }, TICK_MS);
    },
    [updateText],
  );

  const startScramble = useCallback(() => {
    setHovered(true);
    scrambleTo(hoverText ?? btnText);
  }, [hoverText, btnText, scrambleTo]);

  const stopScramble = useCallback(() => {
    setHovered(false);
    scrambleTo(btnText);
  }, [btnText, scrambleTo]);

  useEffect(() => {
    if (timerRef.current !== null) window.clearInterval(timerRef.current);
    timerRef.current = null;
    updateText(btnText);
  }, [btnText, updateText]);

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
      onMouseEnter={canHover() ? startScramble : undefined}
      onMouseLeave={canHover() ? stopScramble : undefined}
      onFocus={canHover() ? startScramble : undefined}
      onBlur={canHover() ? stopScramble : undefined}
      className={cn(
        "group/scramble relative inline-flex flex-col overflow-hidden focus-visible:outline-none",
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
        <span className="flex items-baseline gap-1 whitespace-nowrap font-display text-xl">
          <span
            className={cn(
              "overflow-hidden whitespace-nowrap transition-[color,font-size] duration-300 group-hover/scramble:text-[var(--scramble-color,inherit)]",
              hovered && hoverText ? "font-mono text-xs tracking-tight" : "",
            )}
          >
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
          <span
            className={cn(
              "truncate font-mono text-[11px] text-muted-foreground transition-opacity duration-300",
              hovered ? "opacity-0" : "opacity-0 group-hover/scramble:opacity-100",
            )}
          >
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
