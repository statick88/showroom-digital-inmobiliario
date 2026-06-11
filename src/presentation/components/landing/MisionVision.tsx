import { Card, CardContent } from "@/components/ui/card";
import { Icon } from "@/components/ui/icon";

export function MisionVision() {
  return (
    <section className="py-16">
      <div className="text-center mb-10">
        <h2 className="typo-headline-lg text-foreground mb-2">Misión & Visión</h2>
        <p className="typo-body-md text-muted-foreground max-w-2xl mx-auto">
          Conoce los valores que guían nuestro proyecto inmobiliario
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Misión */}
        <Card className="glass-panel border-0 shadow-card hover:shadow-card-hover transition-shadow">
          <CardContent className="pt-6">
            <div className="flex items-center gap-3 mb-4">
              <div className="flex items-center justify-center size-11 rounded-xl bg-primary/10">
                <Icon name="flag" size={24} className="text-primary" />
              </div>
              <h3 className="typo-headline-md text-foreground">Misión</h3>
            </div>
            <p className="typo-body-md text-muted-foreground leading-relaxed">
              Brindar soluciones habitacionales de calidad, accesibles y sostenibles, que mejoren la
              calidad de vida de las familias mediante espacios seguros, modernos y bien ubicados,
              respaldados por un servicio integral y transparente.
            </p>
          </CardContent>
        </Card>

        {/* Visión */}
        <Card className="glass-panel border-0 shadow-card hover:shadow-card-hover transition-shadow">
          <CardContent className="pt-6">
            <div className="flex items-center gap-3 mb-4">
              <div className="flex items-center justify-center size-11 rounded-xl bg-accent/30">
                <Icon name="visibility" size={24} className="text-secondary" />
              </div>
              <h3 className="typo-headline-md text-foreground">Visión</h3>
            </div>
            <p className="typo-body-md text-muted-foreground leading-relaxed">
              Ser reconocidos como el líder en desarrollo inmobiliario en la región, innovando
              constantemente con tecnologías de vanguardia y prácticas sostenibles, creando
              comunidades que inspiren el bienestar y la conexión con el entorno natural.
            </p>
          </CardContent>
        </Card>
      </div>
    </section>
  );
}
