import { useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Icon } from "@/components/ui/icon";

const WHATSAPP_NUMBER = "51951123456"; // placeholder — replace with real number
const WHATSAPP_MSG = encodeURIComponent("Hola, me interesa el proyecto inmobiliario. ¿Podrían darme más información?");

interface ContactFormData {
  nombre: string;
  email: string;
  telefono: string;
  mensaje: string;
}

export function Contacto() {
  const [form, setForm] = useState<ContactFormData>({
    nombre: "",
    email: "",
    telefono: "",
    mensaje: "",
  });
  const [submitted, setSubmitted] = useState(false);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setForm((prev) => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // TODO: integrate with Supabase or email service
    setSubmitted(true);
  };

  return (
    <section className="py-16">
      <div className="text-center mb-10">
        <h2 className="typo-headline-lg text-foreground mb-2">Contáctanos</h2>
        <p className="typo-body-md text-muted-foreground max-w-2xl mx-auto">
          Estamos aquí para responder todas tus preguntas
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-5 gap-8">
        {/* Form — 3 cols */}
        <Card className="lg:col-span-3 glass-panel border-0 shadow-card">
          <CardContent className="pt-6">
            {submitted ? (
              <div className="flex flex-col items-center justify-center py-12 text-center">
                <div className="flex items-center justify-center size-14 rounded-full bg-status-success/10 mb-4">
                  <Icon name="check_circle" size={32} className="text-status-success" />
                </div>
                <h3 className="typo-headline-md text-foreground mb-2">¡Mensaje enviado!</h3>
                <p className="typo-body-md text-muted-foreground mb-6">
                  Nos pondremos en contacto contigo pronto.
                </p>
                <Button
                  variant="outline"
                  onClick={() => {
                    setSubmitted(false);
                    setForm({ nombre: "", email: "", telefono: "", mensaje: "" });
                  }}
                  className="cursor-pointer"
                >
                  Enviar otro mensaje
                </Button>
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <label htmlFor="nombre" className="typo-label-md text-foreground block mb-1.5">
                    Nombre completo
                  </label>
                  <Input
                    id="nombre"
                    name="nombre"
                    placeholder="Tu nombre"
                    value={form.nombre}
                    onChange={handleChange}
                    required
                    className="h-10"
                  />
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label htmlFor="email" className="typo-label-md text-foreground block mb-1.5">
                      Correo electrónico
                    </label>
                    <Input
                      id="email"
                      name="email"
                      type="email"
                      placeholder="correo@ejemplo.com"
                      value={form.email}
                      onChange={handleChange}
                      required
                      className="h-10"
                    />
                  </div>
                  <div>
                    <label htmlFor="telefono" className="typo-label-md text-foreground block mb-1.5">
                      Teléfono
                    </label>
                    <Input
                      id="telefono"
                      name="telefono"
                      type="tel"
                      placeholder="+51 951 123 456"
                      value={form.telefono}
                      onChange={handleChange}
                      className="h-10"
                    />
                  </div>
                </div>

                <div>
                  <label htmlFor="mensaje" className="typo-label-md text-foreground block mb-1.5">
                    Mensaje
                  </label>
                  <textarea
                    id="mensaje"
                    name="mensaje"
                    rows={4}
                    placeholder="Cuéntanos en qué podemos ayudarte..."
                    value={form.mensaje}
                    onChange={handleChange}
                    required
                    className="w-full min-h-[100px] rounded-lg border border-input bg-transparent px-2.5 py-2 text-base transition-colors outline-none placeholder:text-muted-foreground focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50 md:text-sm dark:bg-input/30"
                  />
                </div>

                <Button type="submit" size="lg" className="w-full sm:w-auto cursor-pointer">
                  <Icon name="send" size={18} />
                  Enviar mensaje
                </Button>
              </form>
            )}
          </CardContent>
        </Card>

        {/* Contact info sidebar — 2 cols */}
        <div className="lg:col-span-2 space-y-4">
          {/* Info cards */}
          <Card className="glass-panel border-0 shadow-card">
            <CardContent className="pt-6 space-y-5">
              <ContactInfoRow
                icon="location_on"
                label="Dirección"
                value="Ayacucho, Perú"
              />
              <ContactInfoRow
                icon="call"
                label="Teléfono"
                value="+51 951 123 456"
                href="tel:+51951123456"
              />
              <ContactInfoRow
                icon="mail"
                label="Correo"
                value="info@proyecto-inmobiliario.com"
                href="mailto:info@proyecto-inmobiliario.com"
              />
              <ContactInfoRow
                icon="schedule"
                label="Horario"
                value="Lun — Vie: 9:00 a.m. — 6:00 p.m."
              />
            </CardContent>
          </Card>

          {/* WhatsApp CTA */}
          <a
            href={`https://wa.me/${WHATSAPP_NUMBER}?text=${WHATSAPP_MSG}`}
            target="_blank"
            rel="noopener noreferrer"
            className="block"
          >
            <Card className="glass-panel border-0 shadow-card hover:shadow-card-hover transition-all group cursor-pointer">
              <CardContent className="pt-6 flex items-center gap-4">
                <div className="flex items-center justify-center size-12 rounded-xl bg-[#25D366]/10 group-hover:bg-[#25D366]/20 transition-colors shrink-0">
                  {/* WhatsApp SVG icon */}
                  <svg
                    viewBox="0 0 24 24"
                    className="size-6 text-[#25D366]"
                    fill="currentColor"
                  >
                    <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413Z" />
                  </svg>
                </div>
                <div>
                  <p className="typo-label-md text-foreground group-hover:text-[#25D366] transition-colors">
                    WhatsApp
                  </p>
                  <p className="typo-body-md text-muted-foreground">
                    Respuesta inmediata
                  </p>
                </div>
                <Icon
                  name="open_in_new"
                  size={18}
                  className="text-muted-foreground ml-auto"
                />
              </CardContent>
            </Card>
          </a>
        </div>
      </div>
    </section>
  );
}

/* ── Helper ────────────────────────────────────────────── */

function ContactInfoRow({
  icon,
  label,
  value,
  href,
}: {
  icon: string;
  label: string;
  value: string;
  href?: string;
}) {
  const content = (
    <div className="flex items-start gap-3">
      <div className="flex items-center justify-center size-10 rounded-lg bg-primary/10 shrink-0 mt-0.5">
        <Icon name={icon} size={20} className="text-primary" />
      </div>
      <div>
        <p className="typo-label-md text-foreground">{label}</p>
        <p className="typo-body-md text-muted-foreground">{value}</p>
      </div>
    </div>
  );

  if (href) {
    return (
      <a href={href} className="block hover:opacity-80 transition-opacity">
        {content}
      </a>
    );
  }

  return content;
}
