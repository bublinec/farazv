import React from "react";
import { LogoLink } from "../../LogoLink/LogoLink";

export interface FooterCompanyProps {
  className?: string;
}

export const FooterCompany = (props: FooterCompanyProps) => {
  const { className = "" } = props;
  return (
    <div className={`${className}`}>
      <LogoLink light />
    </div>
  );
};
