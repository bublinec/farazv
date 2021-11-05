import { Link } from "gatsby";
import React from "react";
import { Route } from "../../../../lib/routes";

export interface NavbarDropdownProps {
  className?: string;
  onMouseEnter: any;
  routes: Route[];
}

export const NavbarDropdown = (props: NavbarDropdownProps) => {
  const { className = "", onMouseEnter, routes } = props;

  return (
    <section
      className="absolute top-0 left-0 w-full mt-16 cursor-pointer z-20"
      onMouseEnter={onMouseEnter}
    >
      <div className="flex flex-col">
        {routes.map((r) => (
          <Link to={r.to}>
            <div className="bg-black bg-opacity-60 hover:bg-opacity-90 py-2 pl-2 text-lg text-white">
              {r.label}
            </div>
          </Link>
        ))}
      </div>
    </section>
  );
};
