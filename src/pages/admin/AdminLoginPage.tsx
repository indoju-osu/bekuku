import { useEffect, useState } from "react";
import { Link, Navigate, useLocation, useNavigate } from "react-router-dom";
import { ArrowLeft, Eye, EyeOff, Info, Lock, ShieldAlert, User } from "lucide-react";
import { Brand } from "@/components/Brand";
import { ProductImage } from "@/components/ui/ProductImage";
import { getSession, signIn } from "@/lib/adminAuth";
import { useToast } from "@/store/ToastContext";

export function AdminLoginPage() {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();
  const { notify } = useToast();
  const redirectTo = (location.state as { from?: string } | null)?.from ?? "/admin";

  useEffect(() => {
    document.title = "Login Administrator — Toko Frozen Food";
  }, []);

  if (getSession()) return <Navigate to="/admin" replace />;

  const handleSubmit = (event: React.FormEvent) => {
    event.preventDefault();
    setSubmitting(true);
    const result = signIn(username, password);
    setSubmitting(false);
    if (!result.ok) {
      setError(result.error ?? "Login gagal.");
      return;
    }
    notify("Login berhasil. Selamat datang kembali!", "success");
    navigate(redirectTo, { replace: true });
  };

  return (
    <div className="grid min-h-dvh lg:grid-cols-2">
      {/* Brand panel */}
      <div className="relative hidden overflow-hidden bg-navy lg:block">
        <ProductImage
          image={{ kind: "asset", path: "/images/editorial/toko-frozen-food.webp" }}
          alt="Etalase produk frozen food"
          priority
          sizes="50vw"
          className="absolute inset-0 size-full opacity-60"
        />
        <div className="absolute inset-0 bg-gradient-to-b from-navy/85 via-navy/70 to-navy/95" aria-hidden />
        <div className="relative flex h-full flex-col justify-between p-10 text-cream">
          <Brand variant="light" />
          <div className="max-w-md">
            <p className="text-[11px] font-semibold uppercase tracking-[0.24em] text-terracotta">
              Dashboard administrator
            </p>
            <h1 className="mt-3 font-display text-4xl leading-tight text-offwhite">
              Kelola katalog, stok, dan konten toko dari satu tempat.
            </h1>
            <p className="mt-4 text-sm leading-relaxed text-cream/70">
              Perubahan produk, kategori, artikel, dan pengaturan toko langsung tercermin pada halaman
              publik.
            </p>
          </div>
          <p className="text-xs text-cream/50">
            © {new Date().getFullYear()} Toko Frozen Food · Demo lokal
          </p>
        </div>
      </div>

      {/* Form panel */}
      <div className="flex items-center justify-center bg-offwhite px-5 py-12">
        <div className="w-full max-w-md">
          <div className="lg:hidden">
            <Brand />
          </div>

          <div className="mt-8 lg:mt-0">
            <p className="text-[11px] font-semibold uppercase tracking-[0.22em] text-olive">Masuk dashboard</p>
            <h2 className="mt-2 font-display text-3xl">Login Administrator</h2>
            <p className="mt-2 text-sm text-charcoal/65">
              Gunakan akun demo di bawah untuk mencoba seluruh fitur pengelolaan.
            </p>
          </div>

          <form onSubmit={handleSubmit} className="mt-7 space-y-4" noValidate>
            <div>
              <label htmlFor="username" className="field-label">
                Username
              </label>
              <div className="relative">
                <User className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted" aria-hidden />
                <input
                  id="username"
                  className="field !pl-9"
                  value={username}
                  onChange={(event) => {
                    setUsername(event.target.value);
                    setError(null);
                  }}
                  placeholder="admin"
                  autoComplete="username"
                  autoCapitalize="none"
                  aria-invalid={Boolean(error)}
                />
              </div>
            </div>

            <div>
              <label htmlFor="password" className="field-label">
                Password
              </label>
              <div className="relative">
                <Lock className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted" aria-hidden />
                <input
                  id="password"
                  type={showPassword ? "text" : "password"}
                  className="field !px-9"
                  value={password}
                  onChange={(event) => {
                    setPassword(event.target.value);
                    setError(null);
                  }}
                  placeholder="•••••"
                  autoComplete="current-password"
                  aria-invalid={Boolean(error)}
                  aria-describedby={error ? "login-error" : undefined}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword((value) => !value)}
                  className="absolute right-2 top-1/2 -translate-y-1/2 rounded-full p-1.5 text-muted transition hover:bg-navy/5 hover:text-navy"
                  aria-label={showPassword ? "Sembunyikan password" : "Tampilkan password"}
                  aria-pressed={showPassword}
                >
                  {showPassword ? <EyeOff className="size-4" aria-hidden /> : <Eye className="size-4" aria-hidden />}
                </button>
              </div>
            </div>

            {error && (
              <p
                id="login-error"
                role="alert"
                className="flex items-start gap-2 rounded-xl bg-terracotta-soft px-3 py-2.5 text-xs text-terracotta-dark"
              >
                <ShieldAlert className="mt-0.5 size-4 shrink-0" aria-hidden />
                {error}
              </p>
            )}

            <button type="submit" className="btn btn-primary w-full" disabled={submitting}>
              {submitting ? "Memeriksa…" : "Login"}
            </button>
          </form>

          <div className="mt-5 rounded-2xl border border-navy/10 bg-cream-100 p-4">
            <p className="flex items-center gap-2 text-xs font-semibold text-navy">
              <Info className="size-3.5" aria-hidden /> Kredensial demo
            </p>
            <p className="mt-1 text-xs text-charcoal/70">
              Username: <code className="font-semibold text-navy">admin</code> · Password:{" "}
              <code className="font-semibold text-navy">admin</code>
            </p>
            <p className="mt-2 text-[11px] leading-relaxed text-charcoal/60">
              Autentikasi berbasis browser ini hanya untuk demonstrasi. Untuk penggunaan produksi diperlukan
              backend autentikasi, password hashing, dan session management di server.
            </p>
          </div>

          <Link to="/" className="mt-6 inline-flex items-center gap-1.5 text-sm font-medium text-navy hover:text-terracotta-dark">
            <ArrowLeft className="size-4" aria-hidden /> Kembali ke website
          </Link>
        </div>
      </div>
    </div>
  );
}
