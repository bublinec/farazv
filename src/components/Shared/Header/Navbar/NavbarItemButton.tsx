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
      className={`${className} px-8 py-4 cursor-pointer uppercase text-2xl hover:bg-black hover:bg-opacity-40 text-white`}
      onClick={() => setIsDropdownOpen(true)}
      onMouseEnter={() => setIsDropdownOpen(true)}
    >
      {label}
    </div>
  );
};
