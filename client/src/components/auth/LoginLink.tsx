import React from 'react';
import { Link } from 'wouter';

interface LoginLinkProps {
  className?: string;
  redirectPath?: string;
  children?: React.ReactNode;
}

const LoginLink: React.FC<LoginLinkProps> = ({
  className = '',
  redirectPath = window.location.pathname,
  children
}) => {
  const encodedRedirect = encodeURIComponent(redirectPath);
  
  return (
    <Link href={`/login?redirect=${encodedRedirect}`}>
      <a className={`text-primary hover:text-primary-dark hover:underline cursor-pointer ${className}`}>
        {children || 'Login'}
      </a>
    </Link>
  );
};

export default LoginLink;