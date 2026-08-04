import * as React from "react";
import { cn } from "@/lib/utils";

const baseControl =
  "w-full rounded-lg border border-[var(--color-borde)] bg-white px-3 py-2.5 text-[var(--color-tinta)] placeholder:text-zinc-400 focus:border-[var(--color-marca)] focus:outline-none focus:ring-2 focus:ring-[var(--color-marca)]/20 disabled:bg-[var(--color-fondo)] disabled:text-[var(--color-tinta-suave)]";

export const Input = React.forwardRef<
  HTMLInputElement,
  React.InputHTMLAttributes<HTMLInputElement>
>(({ className, ...props }, ref) => (
  <input ref={ref} className={cn(baseControl, className)} {...props} />
));
Input.displayName = "Input";

export const Textarea = React.forwardRef<
  HTMLTextAreaElement,
  React.TextareaHTMLAttributes<HTMLTextAreaElement>
>(({ className, ...props }, ref) => (
  <textarea
    ref={ref}
    className={cn(baseControl, "min-h-24 resize-y", className)}
    {...props}
  />
));
Textarea.displayName = "Textarea";

export const Select = React.forwardRef<
  HTMLSelectElement,
  React.SelectHTMLAttributes<HTMLSelectElement>
>(({ className, ...props }, ref) => (
  <select ref={ref} className={cn(baseControl, "h-11 py-0", className)} {...props} />
));
Select.displayName = "Select";

interface CampoProps {
  etiqueta: string;
  htmlFor?: string;
  ayuda?: string;
  requerido?: boolean;
  children: React.ReactNode;
}

/** Etiqueta + control + texto de ayuda, con el espaciado uniforme de los formularios. */
export function Campo({
  etiqueta,
  htmlFor,
  ayuda,
  requerido,
  children,
}: CampoProps) {
  return (
    <div className="space-y-1.5">
      <label
        htmlFor={htmlFor}
        className="block text-sm font-medium text-[var(--color-tinta)]"
      >
        {etiqueta}
        {requerido && <span className="ml-0.5 text-[var(--color-alerta)]">*</span>}
      </label>
      {children}
      {ayuda && (
        <p className="text-xs leading-relaxed text-[var(--color-tinta-suave)]">
          {ayuda}
        </p>
      )}
    </div>
  );
}
