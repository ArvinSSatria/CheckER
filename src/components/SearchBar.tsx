"use client";

import { useState, useRef } from "react";
import { Search, ArrowRight, Loader2, AtSign } from "lucide-react";

interface SearchBarProps {
  onSearch: (username: string) => void;
  isLoading: boolean;
  placeholder?: string;
  platform?: "instagram" | "tiktok";
}

export function SearchBar({
  onSearch,
  isLoading,
  placeholder = "Search username...",
  platform = "tiktok",
}: SearchBarProps) {
  const [username, setUsername] = useState("");
  const [isFocused, setIsFocused] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (username.trim() && !isLoading) {
      onSearch(username.trim());
    }
  };

  const hasValue = username.trim().length > 0;

  return (
    <form
      onSubmit={handleSubmit}
      className="relative w-full max-w-2xl mx-auto"
    >
      {/* Ambient glow on focus */}
      <div
        className={`absolute -inset-1 rounded-[22px] transition-all duration-500 pointer-events-none ${
          isFocused
            ? "bg-primary/[0.06] blur-xl scale-105 opacity-100"
            : "opacity-0 scale-100"
        }`}
      />

      {/* Main container */}
      <div
        className={`
          search-bar-container
          relative flex items-center gap-2
          rounded-2xl
          border
          px-4 py-1.5
          transition-all duration-300 ease-out
          ${
            isFocused
              ? "bg-card border-primary/25 shadow-[0_8px_32px_rgba(0,0,0,0.06)] dark:shadow-[0_8px_32px_rgba(0,0,0,0.2)]"
              : "bg-card/80 border-border/60 shadow-[0_2px_8px_rgba(0,0,0,0.03)] dark:shadow-[0_2px_8px_rgba(0,0,0,0.1)] hover:border-border hover:shadow-[0_4px_16px_rgba(0,0,0,0.05)]"
          }
          backdrop-blur-xl
        `}
        onClick={() => inputRef.current?.focus()}
      >
        {/* @ prefix icon */}
        <div
          className={`flex-shrink-0 flex items-center justify-center w-9 h-9 rounded-xl transition-all duration-300 ${
            isFocused
              ? "bg-primary/10 text-primary"
              : "bg-muted/50 text-muted-foreground/50"
          }`}
        >
          <AtSign className="w-[18px] h-[18px]" strokeWidth={2.2} />
        </div>

        {/* Input field */}
        <input
          ref={inputRef}
          type="text"
          value={username}
          onChange={(e) => setUsername(e.target.value)}
          onFocus={() => setIsFocused(true)}
          onBlur={() => setIsFocused(false)}
          placeholder={placeholder}
          disabled={isLoading}
          autoComplete="off"
          spellCheck={false}
          className={`
            flex-1 min-w-0
            bg-transparent border-none outline-none
            text-[15px] font-medium
            text-foreground
            placeholder:text-muted-foreground/40
            disabled:opacity-50 disabled:cursor-not-allowed
            py-3
            tracking-tight
          `}
        />

        {/* Action button */}
        <button
          type="submit"
          disabled={isLoading || !hasValue}
          className={`
            flex-shrink-0
            flex items-center justify-center gap-2
            h-10 rounded-xl
            text-[13px] font-semibold tracking-tight
            transition-all duration-300 ease-out
            disabled:opacity-0 disabled:scale-95 disabled:pointer-events-none
            ${
              hasValue && !isLoading
                ? "opacity-100 scale-100 px-5 bg-foreground text-background hover:bg-foreground/90 active:scale-[0.97] shadow-sm"
                : ""
            }
          `}
        >
          {isLoading ? (
            <div className="flex items-center gap-2 px-5">
              <Loader2 className="w-4 h-4 animate-spin" />
              <span className="text-[13px]">Analyzing</span>
            </div>
          ) : (
            <>
              <span>Search</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </>
          )}
        </button>
      </div>

      {/* Subtle helper text */}
      <div
        className={`flex items-center justify-center gap-1.5 mt-3 transition-all duration-300 ${
          isFocused && !hasValue ? "opacity-60 translate-y-0" : "opacity-0 -translate-y-1"
        }`}
      >
        <Search className="w-3 h-3 text-muted-foreground/50" />
        <span className="text-[11px] text-muted-foreground/50 font-medium">
          Enter a {platform === "instagram" ? "Instagram" : "TikTok"} username to analyze
        </span>
      </div>
    </form>
  );
}
