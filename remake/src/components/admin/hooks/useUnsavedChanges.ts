import { useEffect } from "react";

const leavePrompt = "Máte neuložené zmeny. Naozaj chcete odísť bez uloženia?";

/** Protect the editor's own draft across links, browser traversal and sign-out. */
export function useUnsavedChanges(dirty: boolean) {
  useEffect(() => {
    if (!dirty) return;

    function unload(event: BeforeUnloadEvent) {
      event.preventDefault();
      event.returnValue = "";
    }

    function click(event: MouseEvent) {
      if (
        event.defaultPrevented ||
        event.button !== 0 ||
        event.metaKey ||
        event.ctrlKey ||
        event.shiftKey ||
        event.altKey
      )
        return;

      if (!(event.target instanceof Element)) return;

      const anchor = event.target.closest<HTMLAnchorElement>("a[href]");
      if (
        !anchor ||
        anchor.target === "_blank" ||
        anchor.hasAttribute("download")
      )
        return;

      const url = new URL(anchor.href, window.location.href);
      if (
        url.pathname === window.location.pathname &&
        url.search === window.location.search
      )
        return;

      if (!window.confirm(leavePrompt)) {
        event.preventDefault();
        event.stopPropagation();
      }
    }

    function leave(event: Event) {
      if (!window.confirm(leavePrompt)) event.preventDefault();
    }

    function traversal(event: Event) {
      if (
        event.cancelable &&
        (event as Event & { navigationType?: string }).navigationType ===
          "traverse" &&
        !window.confirm(leavePrompt)
      )
        event.preventDefault();
    }

    const navigation = (window as Window & { navigation?: EventTarget })
      .navigation;
    navigation?.addEventListener("navigate", traversal);
    window.addEventListener("beforeunload", unload);
    window.addEventListener("admin:before-leave", leave);
    window.document.addEventListener("click", click, true);

    return () => {
      navigation?.removeEventListener("navigate", traversal);
      window.removeEventListener("beforeunload", unload);
      window.removeEventListener("admin:before-leave", leave);
      window.document.removeEventListener("click", click, true);
    };
  }, [dirty]);
}
