import { useState } from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { LoginForm } from "./LoginForm";
import { RegisterForm } from "./RegisterForm";
import { Home } from "lucide-react";

interface AuthPageProps {
  onLogin?: () => void;
  defaultTab?: "login" | "register";
}

export function AuthPage({ onLogin, defaultTab = "login" }: AuthPageProps) {
  const [activeTab, setActiveTab] = useState(defaultTab);

  return (
    <div className="min-h-screen flex items-center justify-center bg-background p-4">
      <div className="w-full max-w-md relative z-10 animate-fade-in">
        {/* Brand */}
        <div className="text-center mb-6">
          <div className="flex items-center justify-center size-12 mx-auto mb-3 rounded-xl bg-primary text-primary-foreground">
            <Home className="size-6" />
          </div>
          <h1 className="font-headline-md text-headline-md font-bold text-primary mb-1">
            Showroom Inmobiliario
          </h1>
          <p className="text-sm text-muted-foreground">
            Accede a tu cuenta o regístrate para comenzar
          </p>
        </div>

        {/* Auth Card */}
        <Card className="border-border/50 shadow-lg">
          <CardContent className="p-6">
            <Tabs value={activeTab} onValueChange={(v) => setActiveTab(v as "login" | "register")}>
              <TabsList className="grid w-full grid-cols-2 mb-6">
                <TabsTrigger value="login">Iniciar Sesión</TabsTrigger>
                <TabsTrigger value="register">Registrarse</TabsTrigger>
              </TabsList>

              <TabsContent value="login">
                <LoginForm onSuccess={onLogin} />
              </TabsContent>

              <TabsContent value="register">
                <RegisterForm onSuccess={() => setActiveTab("login")} />
              </TabsContent>
            </Tabs>
          </CardContent>
        </Card>

        {/* Footer */}
        <div className="mt-6 text-center">
          <p className="text-xs text-muted-foreground">
            Al continuar, aceptas nuestros{" "}
            <button
              onClick={() => (window.location.hash = "#privacidad")}
              className="text-primary hover:underline"
            >
              Términos y Privacidad
            </button>
          </p>
        </div>
      </div>
    </div>
  );
}
