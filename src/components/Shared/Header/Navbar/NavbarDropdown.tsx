import { Link } from "gatsby";
import React from "react";
import { Route } from "../../../../lib/conts/routes";

export interface NavbarDropdownProps {
  className?: string;
  onMouseEnter: any;
  route: Route;
}

export const NavbarDropdown = (props: NavbarDropdownProps) => {
  const { className = "", onMouseEnter, route } = props;

  return (
    <section
      className="absolute top-0 left-0 w-60 mt-16 cursor-pointer z-20"
      onMouseEnter={onMouseEnter}
    >
      <div className="flex flex-col">
        {route.children?.map((childRoute) => (
          <Link to={`${route.to}${childRoute.to}`} key={childRoute.to}>
            <div
              className="bg-black bg-opacity-100 hover:bg-opacity-100 
            py-2 pl-4 text-lg text-white hover:text-secondary font-light
            transition duration-200 ease-in-out
            "
            >
              {childRoute.label}
            </div>
          </Link>
        ))}
      </div>
    </section>
  );
};
