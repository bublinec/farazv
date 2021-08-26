import { routes } from "@/lib/routes";
import { Link } from "gatsby";
import React from "react";
import { Container } from "../Container/Container";
import { LogoLink } from "../LogoLink/LogoLink";
import { MobileMenu } from "./components/MobileMenu";

const renderNavItems = () =>
  Object.values(routes)
    .filter((route) => route.showInMenu !== false)
    .map((route) => (
      <Link
        key={route.to}
        activeClassName={"text-secondary"}
        className={
          "text-primary hover:text-secondary transition duration-200 font-medium"
        }
        to={route.to}
      >
        {route.label}
      </Link>
    ));

export const Header = (props) => {
  return (
    <header className={"flex flex-col"}>
      <nav className="bg-white py-8">
        <Container className="flex justify-between">
          <div className="">
            <LogoLink />
          </div>
          <div className="hidden nav-items xl:flex justify-end space-x-5 text-primary items-center font-medium ">
            {renderNavItems()}
          </div>
          <div className="mm xl:hidden flex justify-end items-center">
            <MobileMenu />
          </div>
        </Container>
      </nav>
    </header>
  );
};
