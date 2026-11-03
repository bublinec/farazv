import { useEffect, useRef } from "react";

/** Cancel pending work when leaving, after the editor's unsaved-change guard. */
export function useCancelOnNavigation(onCancel: () => void) {
  const cancel = useRef(onCancel);
  cancel.current = onCancel;

  useEffect(() => {
    function followLink(event: MouseEvent) {
      // Next Link prevents default itself. A declined leave prompt instead
      // stops propagation in capture, before this listener receives the click.
      if (
        event.button !== 0 ||
        event.metaKey ||
        event.ctrlKey ||
        event.shiftKey ||
        event.altKey ||
        !(event.target instanceof Element)
      )
        return;

      const anchor = event.target.closest<HTMLAnchorElement>("a[href]");
      if (
        !anchor ||
        (anchor.target && anchor.target !== "_self") ||
        anchor.hasAttribute("download")
      )
        return;

      const url = new URL(anchor.href, window.location.href);
      if (
        url.origin !== window.location.origin ||
        url.pathname !== window.location.pathname ||
        url.search !== window.location.search
      )
        cancel.current();
    }

    function cancelWork() {
      cancel.current();
    }

    function leave(event: Event) {
      if (!event.defaultPrevented) cancelWork();
    }

    document.addEventListener("click", followLink);
    window.addEventListener("popstate", cancelWork);
    window.addEventListener("admin:before-leave", leave);
    return () => {
      document.removeEventListener("click", followLink);
      window.removeEventListener("popstate", cancelWork);
      window.removeEventListener("admin:before-leave", leave);
    };
  }, []);
}
