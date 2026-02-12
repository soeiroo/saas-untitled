import { LogOut } from "lucide-react";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "./alert-dialog";

interface LogoutButtonProps {
  className?: string;
  floating?: boolean;
}

export default function LogoutButton({ className = "", floating = true }: LogoutButtonProps) {
  const handleLogout = () => {
    localStorage.clear();
    sessionStorage.clear();
    window.location.href = "/login";
  };

  return (
    <AlertDialog>
      <AlertDialogTrigger asChild>
        <button
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
      </AlertDialogTrigger>
      <AlertDialogContent className="bg-zinc-900 border-zinc-800 text-white">
        <AlertDialogHeader>
          <AlertDialogTitle className="text-white">Deseja sair da conta?</AlertDialogTitle>
          <AlertDialogDescription className="text-zinc-400">
            Voce sera desconectado e precisara entrar novamente para continuar.
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel className="bg-zinc-800 border-zinc-700 text-white hover:bg-zinc-700">
            Cancelar
          </AlertDialogCancel>
          <AlertDialogAction
            onClick={handleLogout}
            className="bg-emerald-600 hover:bg-emerald-700 text-white"
          >
            Sair
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}
