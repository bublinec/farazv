import { Link } from "gatsby";
import React, { useState } from "react";
import { Route } from "../../../../lib/conts/routes";
import { NavbarDropdown } from "./NavbarDropdown";
import { NavbarItemButton } from "./NavbarItemButton";

export interface NavbarItemProps {
  className?: string;
  route: Route;
}

export const NavbarItem = (props: NavbarItemProps) => {
  const { className = "", route } = props;
  const [isDropdownOpen, setIsDropdownOpen] = useState<boolean>(false);

  return (
    <div
      className={` ${className} relative`}
      onMouseLeave={() => setIsDropdownOpen(false)}
    >
      {route.children ? (
        <>
          <NavbarItemButton
            label={route.label}
            setIsDropdownOpen={setIsDropdownOpen}
            className={isDropdownOpen ? "bg-black bg-opacity-20" : ""}
          />
          <div
            className={`${isDropdownOpen || "hidden"}`}
            onMouseLeave={() => setIsDropdownOpen(false)}
            onMouseEnter={() => setIsDropdownOpen(true)}
          >
            <NavbarDropdown
              route={route}
              onMouseEnter={() => setIsDropdownOpen(true)}
            />
          </div>
        </>
      ) : (
        <Link to={route.to}>
          <NavbarItemButton
            label={route.label}
            setIsDropdownOpen={setIsDropdownOpen}
          />
        </Link>
      )}
    </div>
  );
};
