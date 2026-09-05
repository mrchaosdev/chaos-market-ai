"use client";

import { Terminal } from "lucide-react";

type ChaosCommandInputProps = {
  value: string;
  disabled?: boolean;
  onChange: (value: string) => void;
  onSubmit: () => void;
};

export function ChaosCommandInput({ value, disabled = false, onChange, onSubmit }: ChaosCommandInputProps) {
  return (
    <form
      className="cm-command-input flex items-center gap-3 border border-border bg-background px-4 py-3 font-mono text-sm focus-within:border-border-strong"
      onSubmit={(event) => {
        event.preventDefault();
        onSubmit();
      }}
    >
      {/* The prompt line is a label, not a bare row: the input's own box is 20px
          tall, so on a phone every tap that landed on the icon or the padding
          around the text hit dead space instead of focusing the field. Wrapping
          them makes the whole line the target without changing how it looks. */}
      <label className="cm-command-input__line flex min-w-0 flex-1 cursor-text items-center gap-3 py-1">
        <Terminal aria-hidden className="cm-command-input__icon size-4 shrink-0 text-primary" />
        <input
          aria-label="Agent command"
          className="cm-command-input__field min-w-0 flex-1 bg-transparent text-foreground outline-none placeholder:text-subtle-foreground"
          disabled={disabled}
          onChange={(event) => onChange(event.target.value)}
          placeholder="Analyze BTC on 4H"
          // An input carries an intrinsic width of about twenty characters, and that
          // survives `min-w-0` when the browser works out the column's min-content.
          // On a 390px screen it pushed the whole agent grid 18px past the viewport.
          size={1}
          spellCheck={false}
          value={value}
        />
      </label>
      <button
        className="cm-command-input__submit shrink-0 border border-border-strong px-2 py-1 text-[11px] uppercase tracking-[0.14em] text-muted-foreground transition-colors hover:bg-surface-hover disabled:opacity-50"
        disabled={disabled || value.trim().length === 0}
        type="submit"
      >
        {disabled ? "Running" : "Enter"}
      </button>
    </form>
  );
}
