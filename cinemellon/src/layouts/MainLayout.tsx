import { Outlet } from "react-router-dom";
import Navbar from "@/components/Navbar";

export default function MainLayout() {
  return (
    <div className="min-h-screen bg-surface text-bone font-body">
      <Navbar />
      <main>
        <Outlet />
      </main>
      <footer className="border-t border-surface-line/60 py-8 text-center text-sm text-faint">
        <p>Cinemellon — A Parzival Product</p>
      </footer>
    </div>
  );
}
