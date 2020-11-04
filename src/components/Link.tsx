import React from 'react';

interface LinkProps {
  active: boolean;
  children: Array<unknown>;
  onClick: () => void;
}

const Link = ({ active, children, onClick }: LinkProps) => {
  if (active) {
    return <span>{children}</span>;
  }

  return (
    <a
      href=""
      onClick={(e) => {
        e.preventDefault();
        onClick();
      }}>
      {children}
    </a>
  );
};

export default Link;
