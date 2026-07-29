import { Link } from "wouter";
import { Card, CardContent } from "@/components/ui/card";
import { AlertCircle, ArrowLeft } from "lucide-react";
import { useSEO } from "@/lib/useSEO";

export default function NotFoundPage() {
  useSEO({
    title: "404 Page Not Found | Pacific Sea Level Anomalies",
    noindex: true,
  });

  return (
    <div className="min-h-screen w-full flex items-center justify-center bg-[#070913] text-[#f8fafc] font-sans antialiased relative overflow-hidden">
      {/* Ambient background glow */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[500px] rounded-full bg-cyan-500/5 blur-[120px] pointer-events-none" />

      <Card className="w-full max-w-md mx-4 bg-slate-900/40 border border-slate-800/80 backdrop-blur-xl relative z-10">
        <CardContent className="pt-8 pb-8 px-8 flex flex-col items-center text-center">
          <div className="w-16 h-16 rounded-full bg-red-500/10 border border-red-500/20 flex items-center justify-center mb-6">
            <AlertCircle className="h-8 w-8 text-red-500" />
          </div>

          <h1 className="text-3xl font-bold font-serif text-slate-100 mb-3 tracking-tight">
            Page Not Found
          </h1>

          <p className="text-sm text-slate-400 mb-8 max-w-xs leading-relaxed">
            The page you are looking for doesn't exist or has been moved.
          </p>

          <Link
            href="/"
            className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-slate-900 hover:bg-slate-800 border border-slate-800 hover:border-slate-700 text-slate-300 hover:text-slate-100 text-xs font-semibold transition cursor-pointer"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Back to Story</span>
          </Link>
        </CardContent>
      </Card>
    </div>
  );
}

