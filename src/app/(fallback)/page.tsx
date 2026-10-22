import { AlertTriangle } from "lucide-react";
import { Metadata } from "next";

export const metadata: Metadata = {
  title: "404",
};

export default function NotFoundPage() {
  return (
    <main className="min-h-screen bg-[#FFF4E0] text-black font-sans flex items-center justify-center p-4 sm:p-6 selection:bg-[#FF6B6B] selection:text-black">
      <div className="w-full max-w-2xl">
        {/* Main Neo-brutalism Card */}
        <div className="relative bg-white border-4 border-black rounded-xl p-6 sm:p-10 shadow-[8px_8px_0px_0px_rgba(0,0,0,1)] transition-all">
          {/* Top Window Bar ala Retro Desktop */}
          <div className="flex items-center justify-between pb-4 mb-6 border-b-4 border-black">
            <div className="flex items-center gap-2">
              <span className="w-3.5 h-3.5 rounded-full bg-[#FF6B6B] border-2 border-black inline-block" />
              <span className="w-3.5 h-3.5 rounded-full bg-[#FFDE59] border-2 border-black inline-block" />
              <span className="w-3.5 h-3.5 rounded-full bg-[#70E000] border-2 border-black inline-block" />
            </div>
            <div className="text-xs sm:text-sm font-mono font-black uppercase tracking-wider bg-[#FFDE59] border-2 border-black px-2 py-0.5 rounded shadow-[2px_2px_0px_0px_rgba(0,0,0,1)]">
              404
            </div>
          </div>

          {/* Badge Alert Floating */}
          <div className="inline-flex items-center gap-2 bg-[#FF6B6B] text-black border-2 border-black font-black px-3 py-1 text-sm rounded-md shadow-[3px_3px_0px_0px_rgba(0,0,0,1)] -rotate-2 mb-4">
            <AlertTriangle className="w-4 h-4 stroke-[2.5]" />
            LINK TIDAK VALID
          </div>

          {/* Big Bold Typography */}
          <div className="space-y-2">
            <h1 className="text-6xl sm:text-8xl font-black tracking-tight leading-none text-black drop-shadow-[2px_2px_0px_rgba(0,0,0,0.2)]">404</h1>
            <h2 className="text-2xl sm:text-3xl font-extrabold uppercase">Waduh, Nyasar Kemana Nih?</h2>
            <p className="text-base sm:text-lg font-medium text-neutral-800 leading-relaxed">
              Tautan yang kamu tuju sepertinya sudah dihapus, kedaluwarsa, atau ada sedikit kesalahan ketik pada URL-nya.
            </p>
          </div>
        </div>

        {/* Floating Footer Note */}
        <div className="mt-4 text-center">
          <p className="text-xs font-mono font-bold text-neutral-700 bg-white inline-block border-2 border-black px-3 py-1 rounded shadow-[2px_2px_0px_0px_rgba(0,0,0,1)]">
            Tip: Coba periksa kembali ejaan link di address bar browser kamu.
          </p>
        </div>
      </div>
    </main>
  );
}
