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
        bg-zinc-900/80
        text-zinc-200
        border border-zinc-800
        shadow-md shadow-black/30
        transition-all duration-300
        hover:scale-105 hover:border-purple-500/50 hover:text-white hover:shadow-purple-500/20
        active:scale-95
        ${className}
      `}
    >
      <LogOut size={18} />
      Sair
    </button>
  );
}
