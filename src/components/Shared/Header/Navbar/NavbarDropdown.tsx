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
      className="absolute top-0 left-1/2 transform -translate-x-1/2 w-48 mt-16 cursor-pointer text-center z-20 "
      onMouseEnter={onMouseEnter}
    >
      <div
        className="flex flex-col mt-2 bg-black bg-opacity-80 backdrop-blur-3xl py-2"
        style={{
          backdropFilter: "blur(4px)"
        }}
      >
        {route.children?.map((childRoute, i) => (
          <Link to={`${route.to}${childRoute.to}`} key={childRoute.to}>
            <div
              className={`py-2 text-md text-white hover:text-secondary font-light
              mx-6 ${!(route.children && i === route.children.length - 1) && ""}
              transition duration-300 ease-in-out`}
            >
              {childRoute.label}
            </div>
          </Link>
        ))}
      </div>
    </section>
  );
};
