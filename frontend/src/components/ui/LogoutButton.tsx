import { LogOut } from "lucide-react";

export default function LogoutButton() {
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
      className="
        absolute top-6 right-6
        flex items-center gap-2
        px-4 py-2
        rounded-xl
        font-semibold text-sm
        bg-gradient-to-r from-red-500 to-red-600
        text-white
        shadow-lg shadow-red-500/30
        transition-all duration-300
        hover:scale-105 hover:shadow-red-500/60
        active:scale-95
      "
    >
      <LogOut size={18} />
      Sair
    </button>
  );
}
