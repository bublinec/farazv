import { Link } from "gatsby";
import React from "react";
import { routes } from "../../../../lib/routes";
import { Container } from "../../Container/Container";
import { LogoLink } from "../../LogoLink/LogoLink";

export interface MobileMenuOverlayProps {
  className?: string;
  open?: boolean;
  setOpen?: (open: boolean) => void;
}

const renderMobileMenuLinkItems = () =>
  Object.values(routes)
    .filter((item) => item?.showInMenu != false)
    .map((route) => (
      <div key={route.to}>
        <Link
          className="uppercase"
          activeClassName="text-secondary"
          to={route.to}
        >
          {route.label}
        </Link>
      </div>
    ));

const MobileMenuOverlayInner = (props: MobileMenuOverlayProps) => {
  return (
    <div
      className={`${
        props.open ? "left-0" : "-left-full"
      } fixed top-0  bg-white h-screen w-screen z-40 transition-all duration-200 py-4`}
    >
      <Container>
        <div className="flex items-center space-x-5 py-4">
          <LogoLink />
        </div>
        <div className="flex justify-center flex-col items-center space-y-4 mt-10 font-bold text-lg">
          {renderMobileMenuLinkItems()}
        </div>
      </Container>
    </div>
  );
};

export const MobileMenuOverlay = MobileMenuOverlayInner;
