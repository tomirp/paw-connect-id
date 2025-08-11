import { Link, NavLink, useNavigate } from "react-router-dom";
import { useAuth } from "@/hooks/useAuth";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";

const Header = () => {
  const { user, roles, signOut } = useAuth();
  const navigate = useNavigate();
  const navLinkCls = ({ isActive }: { isActive: boolean }) =>
    isActive ? "text-primary" : "hover:underline";

  const initials = user?.email?.[0]?.toUpperCase() ?? "U";
  const isAdmin = roles.includes("admin");
  const isMerchant = roles.includes("merchant");

  return (
    <header className="sticky top-0 z-50 bg-background/80 backdrop-blur supports-[backdrop-filter]:bg-background/60 border-b">
      <div className="container flex h-14 items-center justify-between">
        <Link to="/" aria-label="Beranda PetConnect ID" className="font-semibold text-base">
          PetConnect ID
        </Link>
        <nav className="flex gap-4 text-sm items-center">
          <NavLink to="/" className={navLinkCls} end>
            Beranda
          </NavLink>
          <NavLink to="/search" className={navLinkCls} end>
            Telusuri
          </NavLink>
          <NavLink to="/tentang" className={navLinkCls} end>
            Tentang
          </NavLink>

          {!user ? (
            <Button variant="outline" size="sm" onClick={() => navigate("/auth")}>Sign Up / Sign In</Button>
          ) : (
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <button aria-label="Menu profil" className="inline-flex items-center">
                  <Avatar className="h-8 w-8">
                    <AvatarFallback>{initials}</AvatarFallback>
                  </Avatar>
                </button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuLabel>Menu</DropdownMenuLabel>
                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={() => navigate("/profile")}>Profil</DropdownMenuItem>
                <DropdownMenuItem onClick={() => navigate("/profile")}>Pesanan & Booking</DropdownMenuItem>
                {isMerchant && (
                  <DropdownMenuItem onClick={() => navigate("/dashboard/merchant")}>Dashboard Merchant</DropdownMenuItem>
                )}
                {isAdmin && (
                  <DropdownMenuItem onClick={() => navigate("/dashboard/admin")}>Admin</DropdownMenuItem>
                )}
                {!isMerchant && (
                  <DropdownMenuItem onClick={() => navigate("/auth")}>Jadi Merchant</DropdownMenuItem>
                )}
                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={() => signOut()}>Keluar</DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          )}
        </nav>
      </div>
    </header>
  );
};

export default Header;
