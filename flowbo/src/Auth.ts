export type Result = { ok: boolean; message: string };

export const fakeAuthCall = (payload: unknown): Promise<Result> =>
  new Promise((resolve) => {
    setTimeout(() => {
      const email =
        typeof payload === "object" && payload && "email" in (payload as any)
          ? String((payload as any).email).toLowerCase()
          : "";

      if (email.includes("error")) {
        resolve({ ok: false, message: "Demo-Fehler: Bitte erneut versuchen." });
      } else {
        resolve({ ok: true, message: "Erfolg (Demo) – keine echte Anmeldung/Registrierung." });
      }
    }, 800);
  });
