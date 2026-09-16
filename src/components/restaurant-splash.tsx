import { useEffect, useState } from "react";

const SPLASH_SESSION_KEY = "kantin-inyong-splash-seen";

type SplashPhase = "checking" | "entering" | "leaving" | "hidden";

export function RestaurantSplash() {
  const [phase, setPhase] = useState<SplashPhase>("checking");

  useEffect(() => {
    if (window.sessionStorage.getItem(SPLASH_SESSION_KEY)) {
      setPhase("hidden");
      return;
    }

    window.sessionStorage.setItem(SPLASH_SESSION_KEY, "true");
    setPhase("entering");

    const leaveTimer = window.setTimeout(() => setPhase("leaving"), 760);
    const hideTimer = window.setTimeout(() => setPhase("hidden"), 1080);

    return () => {
      window.clearTimeout(leaveTimer);
      window.clearTimeout(hideTimer);
    };
  }, []);

  if (phase === "hidden") return null;

  return (
    <div
      aria-hidden="true"
      className={`restaurant-splash ${phase === "leaving" ? "restaurant-splash-leaving" : ""}`}
    >
      <div className="restaurant-splash-mark">
        <span className="restaurant-splash-rule" />
        <p className="restaurant-splash-kicker">Umaeh Inyong</p>
        <p className="restaurant-splash-title">Kantin Inyong</p>
        <span className="restaurant-splash-rule restaurant-splash-rule-end" />
      </div>
    </div>
  );
}