import React from "react";
import { routesArray } from "../../../../lib/routes";
import { Container } from "../../Container/Container";
import { LogoLink } from "../../LogoLink/LogoLink";
import { MobileMenu } from "../components/MobileMenu";
import { NavbarItem } from "./NavbarItem";

export interface NavbarProps {
  className?: string;
}

export const Navbar = (props: NavbarProps) => {
  const { className = "" } = props;
  return (
    <nav className={`${className} w-full bg-black bg-opacity-60 h-16`}>
      <Container className="flex justify-between items-center w-full h-full">
        <LogoLink className="text-2xl md:text-3xl z-10 text-white" />

        <div className="mm xl:hidden flex justify-end items-center">
          <MobileMenu />
        </div>
        <div className="hidden lg:flex h-full">
          {routesArray.map((r) => (
            <NavbarItem route={r} key={r.to} />
          ))}
        </div>
      </Container>
    </nav>
  );
};
