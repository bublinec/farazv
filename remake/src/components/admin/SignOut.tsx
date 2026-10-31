"use client";

import { useState } from "react";
import styles from "./Admin.module.css";

export function SignOut() {
  const [state, setState] = useState("");

  return (
    <>
      <button
        className={styles.secondary}
        type="button"
        disabled={state === "busy"}
        onClick={async () => {
          if (
            !window.dispatchEvent(
              new Event("admin:before-leave", { cancelable: true })
            )
          )
            return;
          setState("busy");
          try {
            const response = await fetch("/api/auth/sign-out", {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              body: "{}"
            });
            if (!response.ok) throw new Error();
            window.location.assign("/admin/login");
          } catch {
            setState("Odhlásenie zlyhalo. Skúste znova.");
          }
        }}
      >
        {state === "busy" ? "Odhlasujem…" : "Odhlásiť sa"}
      </button>
      {state && state !== "busy" ? <span role="alert">{state}</span> : null}
    </>
  );
}
