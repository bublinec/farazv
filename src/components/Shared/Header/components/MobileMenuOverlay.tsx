import { Link } from "gatsby";
import { StaticImage } from "gatsby-plugin-image";
import React from "react";
import { routes } from "../../../../lib/conts/routes";
import { Container } from "../../Container/Container";
import { LogoLink } from "../../LogoLink/LogoLink";
import { MobileMenuAccordionItem } from "./MobileMenuAccordionItem";

export interface MobileMenuOverlayProps {
  className?: string;
  open?: boolean;
  setOpen?: (open: boolean) => void;
}

const renderMobileMenuLinkItems = () =>
  Object.values(routes)
    .filter((item) => item?.showInMenu != false)
    .map((route) => {
      if (route.children) {
        return (
          <div className="py-4 px-10 ">
            <MobileMenuAccordionItem route={route} key={route.label} />
          </div>
        );
      }
      return (
        <Link
          className="uppercase"
          activeClassName="text-secondary"
          to={route.to}
          key={route.label}
        >
          <div className="py-5 px-10 text-center">{route.label}</div>
        </Link>
      );
    });

const MobileMenuOverlayInner = (props: MobileMenuOverlayProps) => {
  return (
    <div
      className={`${
        props.open ? "left-0" : "-left-full"
      } fixed top-0  bg-white h-screen w-screen z-40 transition-all duration-200 py-4`}
    >
      <Container>
        <div className="flex items-center text-black text-2xl mt-3">
          <LogoLink />
        </div>
        <div className="flex justify-center flex-col items-start text-2xl mt-14 space-y-1 z-50 absolute">
          {renderMobileMenuLinkItems()}
        </div>
      </Container>
      <div className="opacity-5 absolute bottom-0 right-0 w-full mb-10 z-0">
        <StaticImage
          src={"../../../../assets/other/churchWatermark.png"}
          alt="church watermark"
        />
      </div>
    </div>
  );
};

export const MobileMenuOverlay = MobileMenuOverlayInner;
