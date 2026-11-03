import React, { Dispatch, SetStateAction } from "react";

export interface NavbarItemButtonProps {
  className?: string;
  label: string;
  setIsDropdownOpen?: Dispatch<SetStateAction<boolean>>;
}

export const NavbarItemButton = (props: NavbarItemButtonProps) => {
  const { className = "", label, setIsDropdownOpen } = props;
  return (
    <div
      className={`${className} px-6 h-full cursor-pointer text-xl hover:text-secondary text-white font-light
      flex items-center
      transition duration-200 ease-in-out
      `}
      onClick={() => {
        if (setIsDropdownOpen) setIsDropdownOpen(true);
      }}
      onMouseEnter={() => {
        if (setIsDropdownOpen) setIsDropdownOpen(true);
      }}
    >
      {label}
    </div>
  );
};
