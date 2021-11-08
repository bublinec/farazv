import React, { Dispatch, SetStateAction } from "react";

export interface NavbarItemButtonProps {
  className?: string;
  label: string;
  setIsDropdownOpen: Dispatch<SetStateAction<boolean>>;
}

export const NavbarItemButton = (props: NavbarItemButtonProps) => {
  const { className = "", label, setIsDropdownOpen } = props;
  return (
    <div
      className={`${className} px-8 h-full cursor-pointer uppercase text-xl hover:bg-black hover:bg-opacity-20 text-white
      flex items-center
      transition duration-200 ease-in-out
      `}
      onClick={() => setIsDropdownOpen(true)}
      onMouseEnter={() => setIsDropdownOpen(true)}
    >
      {label}
    </div>
  );
};
