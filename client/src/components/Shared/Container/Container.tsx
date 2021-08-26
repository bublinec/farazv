import React, { ReactNode } from "react";

export interface ContainerProps {
  className?: string;
  children?: ReactNode;
}

export const Container = (props: ContainerProps) => {
  const { className = "", children } = props;
  return (
    <div {...props} className={`container mx-auto px-6 ${className}`}>
      {children}
    </div>
  );
};
