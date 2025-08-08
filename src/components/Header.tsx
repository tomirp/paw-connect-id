import { Link, NavLink } from "react-router-dom";

const Header = () => {
  const navLinkCls = ({ isActive }: { isActive: boolean }) =>
    isActive ? "text-primary" : "hover:underline";

  return (
    <header className="sticky top-0 z-50 bg-background/80 backdrop-blur supports-[backdrop-filter]:bg-background/60 border-b">
      <div className="container flex h-14 items-center justify-between">
        <Link to="/" aria-label="Beranda PetConnect ID" className="font-semibold text-base">
          PetConnect ID
        </Link>
        <nav className="flex gap-4 text-sm">
          <NavLink to="/direktori" className={navLinkCls} end>
            Direktori
          </NavLink>
          <NavLink to="/dashboard/merchant" className={navLinkCls} end>
            Dashboard Merchant
          </NavLink>
          <NavLink to="/dashboard/admin" className={navLinkCls} end>
            Admin
          </NavLink>
        </nav>
      </div>
    </header>
  );
};

export default Header;
