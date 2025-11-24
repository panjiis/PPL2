"use client";
import * as React from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { useToast } from "@/components/ui/use-toast";
import { SquareAsterisk, UserIcon } from "lucide-react";
import { Loader2 } from "lucide-react";

import { login } from "@/lib/utils/api";
import { useSession } from "@/lib/context/session";
import Image from "next/image";

// Placeholder
function FullPageLoader() {
  return (
    <main className="flex flex-col items-center justify-center min-h-screen">
      <Loader2 className="h-12 w-12 animate-spin text-primary" />
    </main>
  );
}

export default function LoginPage() {
  const router = useRouter();
  const { toast } = useToast();
  const { session, setSession, isLoading } = useSession();

  const [username, setUsername] = React.useState("");
  const [password, setPassword] = React.useState("");
  const [loading, setLoading] = React.useState(false);

  const handleLogin = async () => {
    setLoading(true);
    try {
      const sessionData = await login(username, password);

      setSession(sessionData);

      toast({
        variant: "success",
        title: "Login Successful",
        description: `Welcome back, ${sessionData.user.username || sessionData.user.firstname}.`,
      });

      router.push("/"); 
    } catch (err: unknown) {
      if (err instanceof Error) {
        toast({
          variant: "danger",
          title: "Login Failed",
          description: err.message || "An unknown error occurred.",
        });
      }
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = () => {
    setSession(null);
    toast({
      title: "Logged Out",
      description: "You have been successfully logged out.",
    });
  };

  if (isLoading) {
    return <FullPageLoader />;
  }
  
  if (session && !loading) {
    return (
      <main className="flex flex-col items-center justify-center min-h-screen">
        <Card className="w-full max-w-sm rounded-2xl p-4">
          <CardHeader>
            <CardTitle>Welcome, {session.user.username || session.user.firstname}</CardTitle>
            <CardDescription>You are logged in as {session.user.role?.role_name}</CardDescription>
          </CardHeader>
          <CardContent>
            <p><strong>Email:</strong> {session.user.email}</p>
            <p><strong>Active:</strong> {session.user.is_active ? "Yes" : "No"}</p>
            <p>
              <strong>Last login:</strong>{" "}
              {session.user.last_login
                ? new Date(session.user.last_login.seconds * 1000).toLocaleString()
                : "N/A"}
            </p>
            <p>
              <strong>Session expires at:</strong>{" "}
              {new Date(session.expiresAt).toLocaleString()}
            </p>
          </CardContent>
          <CardFooter className="justify-end">
            <Button variant="destructive" onClick={handleLogout}>
              Logout
            </Button>
          </CardFooter>
        </Card>
      </main>
    );
  }

  return (
    <main className="flex flex-col items-center justify-center min-h-screen">
      <Image priority src="https://placehold.co/256x256" alt="" width={256} height={256} className="w-full aspect-[3/2] object-cover -mb-4 md:hidden"/>
      <Card className="w-full flex-1 md:flex-0 md:max-w-sm rounded-b-none rounded-t-2xl md:rounded-b-2xl">
        <CardHeader>
          <CardTitle>SYNTRA Login Portal</CardTitle>
          <CardDescription>
            Enter your credentials to access SYNTRA.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid w-full items-center gap-4">
            <Image priority src="https://placehold.co/256x256" alt="" width={256} height={256} className="justify-self-center rounded hidden md:block"/>
            <Input
              id="username"
              type="username"
              placeholder="Enter username"
              value={username}
              label="Username"
              icon={<UserIcon size={16} />}
              onChange={(e) => setUsername(e.target.value)}
            />
            <Input
              id="password"
              type="password"
              placeholder="Enter password"
              value={password}
              label="Password"
              icon={<SquareAsterisk size={16} />}
              onChange={(e) => setPassword(e.target.value)}
            />
          </div>
        </CardContent>
        <CardFooter className="flex justify-between w-full gap-2">
          <Button variant="link" className="p-0 h-auto">
            Forgot password?
          </Button>
          <Button onClick={handleLogin} disabled={loading}>
            {loading ? "Logging in..." : "Login"}
          </Button>
        </CardFooter>
      </Card>
    </main>
  );
}