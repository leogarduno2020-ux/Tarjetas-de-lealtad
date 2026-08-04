import * as React from "react";
import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "@/lib/utils";

const estilos = cva(
  "inline-flex items-center justify-center gap-2 rounded-lg font-medium transition-colors disabled:pointer-events-none disabled:opacity-50 whitespace-nowrap",
  {
    variants: {
      variant: {
        primario:
          "bg-[var(--color-marca)] text-white hover:bg-[var(--color-marca-oscuro)]",
        secundario:
          "border border-[var(--color-borde)] bg-white text-[var(--color-tinta)] hover:bg-[var(--color-fondo)]",
        fantasma:
          "text-[var(--color-tinta-suave)] hover:bg-[var(--color-fondo)] hover:text-[var(--color-tinta)]",
        peligro: "bg-[var(--color-alerta)] text-white hover:bg-red-800",
      },
      size: {
        // 44px de alto: el mínimo táctil cómodo en móvil.
        md: "h-11 px-4 text-sm",
        sm: "h-9 px-3 text-sm",
        lg: "h-14 px-6 text-base",
        icono: "h-11 w-11",
      },
      ancho: {
        auto: "",
        completo: "w-full",
      },
    },
    defaultVariants: { variant: "primario", size: "md", ancho: "auto" },
  },
);

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof estilos> {}

export const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant, size, ancho, ...props }, ref) => (
    <button
      ref={ref}
      className={cn(estilos({ variant, size, ancho }), className)}
      {...props}
    />
  ),
);
Button.displayName = "Button";
