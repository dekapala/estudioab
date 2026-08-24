import { login } from "@/lib/auth-actions";

export default async function LoginPage({
  searchParams,
}: {
  searchParams: Promise<{ error?: string }>;
}) {
  const { error } = await searchParams;

  return (
    <div className="login-shell">
      <div className="login-card">
        <div className="eyebrow" style={{ fontFamily: "var(--font-mono)", fontSize: 11, letterSpacing: ".12em", textTransform: "uppercase", color: "var(--accent)", marginBottom: 6 }}>
          Beta funcional
        </div>
        <h1>Sistema de gestión de casos</h1>
        <p className="hint">Ingresá con el usuario que te dio el estudio.</p>

        <form action={login}>
          <div className="field-group">
            <label htmlFor="email">Email</label>
            <input id="email" name="email" type="email" required autoFocus />
          </div>
          <div className="field-group">
            <label htmlFor="password">Contraseña</label>
            <input id="password" name="password" type="password" required />
          </div>
          <button type="submit" className="btn">Entrar</button>
        </form>

        {error ? <p className="error-text">{error}</p> : null}
      </div>
    </div>
  );
}
