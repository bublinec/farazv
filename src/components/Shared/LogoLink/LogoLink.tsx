import { Link } from "gatsby";
import React from "react";
import { routes } from "../../../lib/conts/routes";
import { Logo } from "./Logo";

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
      <Logo />
    </Link>
  );
};
