"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import { navigation } from "@/content/navigation";
import { siteConfig } from "@/content/site";
import { containDialogFocus } from "@/lib/dialog";
import { Icon } from "@/components/ui/Icon";
import { LectorScheduleDialog } from "@/components/lectors/LectorScheduleDialog";
import { ParishLogo } from "./ParishLogo";
import styles from "./Header.module.css";

export function Header() {
  const pathname = usePathname();
  const header = useRef<HTMLElement>(null);
  const dialog = useRef<HTMLDialogElement>(null);
  const menuButton = useRef<HTMLButtonElement>(null);
  const [menuOpen, setMenuOpen] = useState(false);

  function closeMenu() {
    dialog.current?.close();
    setMenuOpen(false);
  }

  function closeDropdowns() {
    header.current
      ?.querySelectorAll("details[open]")
      .forEach((details) => details.removeAttribute("open"));
  }

  useEffect(() => {
    function keyDown(event: KeyboardEvent) {
      if (event.key !== "Escape") return;
      const active =
        header.current?.querySelector<HTMLDetailsElement>("details[open]");
      if (active) {
        active.open = false;
        active.querySelector("summary")?.focus();
      }
    }

    function outside(event: PointerEvent) {
      if (
        event.target instanceof Node &&
        !header.current?.contains(event.target)
      )
        closeDropdowns();
    }

    document.addEventListener("keydown", keyDown);
    document.addEventListener("pointerdown", outside);

    return () => {
      document.removeEventListener("keydown", keyDown);
      document.removeEventListener("pointerdown", outside);
    };
  }, []);

  const active = (href: string) =>
    href === "/" ? pathname === "/" : pathname.startsWith(href);

  return (
    <>
      <a href="#main" className="skipLink">
        Preskočiť na obsah
      </a>
      <header className={styles.header} ref={header}>
        <div className={`container ${styles.inner}`}>
          <Link href="/" className={styles.brand} onClick={closeDropdowns}>
            <ParishLogo />
          </Link>
          <nav className={styles.desktop} aria-label="Hlavná navigácia">
            {navigation.map((item) =>
              item.href ? (
                <Link
                  key={item.label}
                  href={item.href}
                  className={active(item.href) ? styles.active : undefined}
                  aria-current={active(item.href) ? "page" : undefined}
                >
                  {item.label}
                </Link>
              ) : (
                <details
                  key={item.label}
                  className={styles.dropdown}
                  onToggle={(event) => {
                    if (event.currentTarget.open)
                      header.current
                        ?.querySelectorAll("details[open]")
                        .forEach((other) => {
                          if (other !== event.currentTarget)
                            other.removeAttribute("open");
                        });
                  }}
                >
                  <summary>
                    {item.label}
                    <Icon name="chevron" size={14} />
                  </summary>
                  <div className={styles.dropdownPanel}>
                    {item.children?.map((child) => (
                      <Link
                        key={child.href}
                        href={child.href}
                        aria-current={active(child.href) ? "page" : undefined}
                        onClick={closeDropdowns}
                      >
                        {child.label}
                        {child.href.startsWith("http") ? (
                          <Icon name="external" size={13} />
                        ) : null}
                      </Link>
                    ))}
                  </div>
                </details>
              )
            )}
          </nav>
          <Link href="/farnost/farske-oznamy" className={styles.quickLink}>
            <Icon name="calendar" size={17} />
            <span>Farské oznamy</span>
          </Link>
          <button
            type="button"
            className={styles.menuButton}
            ref={menuButton}
            aria-label="Otvoriť menu"
            aria-expanded={menuOpen}
            aria-controls="mobile-navigation"
            onClick={() => {
              dialog.current?.showModal();
              setMenuOpen(true);
            }}
          >
            <Icon name="menu" size={25} />
          </button>
        </div>
      </header>
      <dialog
        id="mobile-navigation"
        className={styles.mobileDialog}
        ref={dialog}
        onKeyDown={containDialogFocus}
        onClose={() => {
          setMenuOpen(false);
          if (!document.querySelector("dialog[open]"))
            menuButton.current?.focus();
        }}
        onClick={(event) => {
          if (event.target === event.currentTarget) closeMenu();
        }}
        aria-label="Navigácia"
      >
        <div className={styles.mobileTop}>
          <span>
            {siteConfig.name}
            <small>{siteConfig.city}</small>
          </span>
          <button type="button" onClick={closeMenu} aria-label="Zavrieť menu">
            <Icon name="close" size={24} />
          </button>
        </div>
        <Link
          href="/farnost/farske-oznamy"
          className="button"
          onClick={closeMenu}
        >
          Farské oznamy
          <Icon name="arrow-right" size={17} />
        </Link>
        <nav aria-label="Mobilná navigácia" className={styles.mobileNav}>
          {navigation.map((item) =>
            item.href ? (
              <Link
                key={item.label}
                href={item.href}
                onClick={closeMenu}
                aria-current={active(item.href) ? "page" : undefined}
              >
                {item.label}
                <Icon name="arrow-right" size={18} />
              </Link>
            ) : (
              <details key={item.label}>
                <summary>
                  {item.label}
                  <Icon name="chevron" size={18} />
                </summary>
                <div>
                  {item.children?.map((child) => (
                    <Link
                      key={child.href}
                      href={child.href}
                      onClick={closeMenu}
                      aria-current={active(child.href) ? "page" : undefined}
                    >
                      {child.label}
                    </Link>
                  ))}
                </div>
              </details>
            )
          )}
        </nav>
        <LectorScheduleDialog
          variant="navigation"
          onOpen={closeMenu}
          onReturnFocus={() => menuButton.current?.focus()}
        />
      </dialog>
    </>
  );
}
