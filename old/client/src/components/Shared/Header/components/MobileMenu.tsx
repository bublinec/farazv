import React, { useEffect, useState } from "react";
import HamburgerMenu from "react-hamburger-menu";
import { MobileMenuOverlay } from "./MobileMenuOverlay";

export type MobileMenuProps = React.HTMLAttributes<HTMLElement>;

export const MobileMenu: React.FC<MobileMenuProps> = (
  props: MobileMenuProps
) => {
  const [mobileMenuIsOpen, setMobileMenuIsOpen] = useState(false);

  useEffect(() => {
    setTimeout(() => {
      if (mobileMenuIsOpen) {
        document.body.style.height = "100vh";
        document.body.style.overflowY = "hidden";
      } else {
        document.body.style.height = "";
        document.body.style.overflowY = "initial";
      }
    }, 230);
  }, [mobileMenuIsOpen]);

  const handleChangeMenuOpenedClicked = () => {
    setMobileMenuIsOpen(!mobileMenuIsOpen);
  };

  return (
    <div className={""}>
      <div className="relative z-50">
        <HamburgerMenu
          isOpen={mobileMenuIsOpen}
          color={mobileMenuIsOpen ? "black" : "white"}
          menuClicked={handleChangeMenuOpenedClicked}
          width={20}
          height={15}
          strokeWidth={2}
          animationDuration={0.23}
        />
      </div>
      <MobileMenuOverlay open={mobileMenuIsOpen} />
    </div>
  );
};
