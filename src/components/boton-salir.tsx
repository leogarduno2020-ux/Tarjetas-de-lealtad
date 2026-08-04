import { cerrarSesion } from "@/app/login/actions";
import { Button } from "@/components/ui/button";

export function BotonSalir() {
  return (
    <form action={cerrarSesion}>
      <Button type="submit" variant="secundario" size="sm">
        Salir
      </Button>
    </form>
  );
}
