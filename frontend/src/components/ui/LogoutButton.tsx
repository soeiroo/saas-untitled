import { LogOut } from "lucide-react";

interface LogoutButtonProps {
  className?: string;
  floating?: boolean;
}

export default function LogoutButton({ className = "", floating = true }: LogoutButtonProps) {
  const handleLogout = () => {
    const confirmLogout = window.confirm("Deseja realmente sair?");
    if (!confirmLogout) return;
    localStorage.clear();
    sessionStorage.clear();
    window.location.href = "/login";
  };

  return (
    <button
      onClick={handleLogout}
      className={`
        ${floating ? "absolute top-6 right-6" : ""}
        flex items-center gap-2
        px-4 py-2
        rounded-xl
        font-semibold text-sm
        bg-card
        text-foreground
        border
        shadow-sm
        transition-all duration-300
        hover:bg-accent
        active:scale-95
        ${className}
      `}
    >
      <LogOut size={18} />
      Sair
    </button>
  );
}
