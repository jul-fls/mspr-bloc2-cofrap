import { LogOut, User } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useAuth } from "@/contexts/auth-context";
import { cn } from "@/lib/utils";
import { Logo } from "../components/logo";

export function Dashboard({
  className,
  ...props
}: React.ComponentProps<"div">) {
  const { user, logout } = useAuth();

  const handleLogout = () => {
    logout();
  };

  return (
    <div className={cn("flex flex-col gap-6 m-3", className)} {...props}>
      <div className="flex flex-col items-center gap-2">
        <Logo />
        <h1 className="text-xl font-bold">Connexion réussie</h1>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <User className="size-5" />
            Profil utilisateur
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <p className="text-sm text-muted-foreground">Nom d'utilisateur</p>
            <p className="font-medium">{user?.username}</p>
          </div>
        </CardContent>
      </Card>

      <Button onClick={handleLogout} variant="outline" className="w-full">
        <LogOut className="size-4 mr-2" />
        Se déconnecter
      </Button>
    </div>
  );
}
