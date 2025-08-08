import { createContext, useContext, useEffect, useMemo, useState } from "react";
import type { Session, User } from "@supabase/supabase-js";
import { supabase } from "@/integrations/supabase/client";

export type AppRole = "admin" | "merchant" | "user";

type AuthContextType = {
  user: User | null;
  session: Session | null;
  roles: AppRole[];
  loading: boolean;
  signOut: () => Promise<void>;
};

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider = ({ children }: { children: React.ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [roles, setRoles] = useState<AppRole[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchRoles = async (uid: string) => {
    const { data, error } = await supabase
      .from("user_roles")
      .select("role")
      .eq("user_id", uid);
    if (!error && data) {
      const rs = data.map((r) => r.role) as AppRole[];
      setRoles(rs.length ? rs : ["user"]);
    } else {
      setRoles(["user"]);
    }
  };

  useEffect(() => {
    // Listener first
    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, ses) => {
      setSession(ses);
      setUser(ses?.user ?? null);
      if (ses?.user) {
        setTimeout(() => {
          fetchRoles(ses.user!.id);
        }, 0);
      } else {
        setRoles([]);
      }
    });

    // Then load existing session
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
      setUser(session?.user ?? null);
      if (session?.user) {
        fetchRoles(session.user.id);
      }
      setLoading(false);
    });

    return () => subscription.unsubscribe();
  }, []);

  const value = useMemo<AuthContextType>(() => ({
    user,
    session,
    roles,
    loading,
    signOut: async () => {
      await supabase.auth.signOut();
    },
  }), [user, session, roles, loading]);

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuth = () => {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used within AuthProvider");
  return ctx;
};

export const RequireRole = ({ children, allow, fallback }: { children: React.ReactNode; allow: AppRole[]; fallback?: React.ReactNode; }) => {
  const { user, roles, loading } = useAuth();
  if (loading) return null;
  if (!user) return <>{fallback ?? null}</>;
  const ok = roles.some((r) => allow.includes(r));
  return ok ? <>{children}</> : <>{fallback ?? null}</>;
};
