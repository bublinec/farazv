import React from "react";

export interface LogoProps {
  className?: string;
}

export const Logo = (props: LogoProps) => {
  const { className = "" } = props;
  return (
    <div className={`${className} uppercase text-2xl`}>Farnosť sv. Alžbety</div>
  );
};
