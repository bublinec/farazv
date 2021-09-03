import { routes } from "@/lib/routes";
import { Link } from "gatsby";
import React from "react";
import LogoWhite from "./assets/logo-white.svg";
import Logo from "./assets/logo.svg";

export interface LogoLinkProps extends React.HTMLAttributes<HTMLElement> {
  light?: boolean;
}

export const LogoLink: React.FC<LogoLinkProps> = (props: LogoLinkProps) => {
  const { light = false } = props;

  return (
    <Link
      to={routes.home.to}
      className={props.className + " flex items-center"}
    >
      <img src={light ? LogoWhite : Logo} alt="logo" className="w-36" />
    </Link>
  );
};
