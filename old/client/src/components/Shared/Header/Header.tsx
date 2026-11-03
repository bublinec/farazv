import React from "react";
import { Navbar } from "./Navbar/Navbar";

export interface HeaderProps {
  className?: string;
}

export const Header = (props: HeaderProps) => {
  const { className = "" } = props;

  return (
    <header className={`${className}`}>
      <Navbar />
    </header>
  );
};
