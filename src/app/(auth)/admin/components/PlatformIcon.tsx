import React from "react";

interface PlatformIconProps {
  platform: string;
  className?: string;
}

const PlatformIcon: React.FC<PlatformIconProps> = ({
  platform,
  className = "",
}) => {
  const getPlatformIcon = () => {
    const platformLower = platform.toLowerCase();

    if (platformLower.includes("paypal")) {
      return (
        <svg viewBox="0 0 24 24" className={`h-5 w-5 ${className}`}>
          <path
            fill="#253B80"
            d="M7.23 9.41h3.12c3.18 0 5.42-1.36 5.42-4.23C15.77 2.5 13.53 1 10.35 1H2v16h5.23V9.41z"
          />
          <path
            fill="#179BD7"
            d="M15.77 5.18c0 2.87-2.24 4.23-5.42 4.23H7.23V1h3.12c3.18 0 5.42 1.5 5.42 4.18z"
          />
          <path
            fill="#222D65"
            d="M17.77 9.41h3.12c3.18 0 5.42-1.36 5.42-4.23C26.31 2.5 24.07 1 20.89 1h-8.35v16h5.23V9.41z"
          />
          <path
            fill="#253B80"
            d="M22.23 5.18c0 2.87-2.24 4.23-5.42 4.23h-3.12V1h3.12c3.18 0 5.42 1.5 5.42 4.18z"
          />
        </svg>
      );
    }

    if (platformLower.includes("paytm")) {
      return (
        <svg viewBox="0 0 24 24" className={`h-5 w-5 ${className}`}>
          <path
            fill="#00B9F5"
            d="M12 0C5.37 0 0 5.37 0 12s5.37 12 12 12 12-5.37 12-12S18.63 0 12 0zm5.5 16.5h-11v-9h11v9z"
          />
          <path
            fill="#FFF"
            d="M16.5 7.5h-11v9h11v-9zM10.12 14.25H8.25v-4.5h1.87c1.03 0 1.88.85 1.88 1.88v.75c0 1.02-.85 1.87-1.88 1.87zm5.25 0h-2.25v-4.5h2.25v4.5z"
          />
        </svg>
      );
    }

    if (platformLower.includes("stripe")) {
      return (
        <svg viewBox="0 0 24 24" className={`h-5 w-5 ${className}`}>
          <path
            fill="#6772E5"
            d="M13.55 11.68c-.12-.3-.4-.5-.7-.5h-2.3c-.4 0-.7.2-.8.6l-1.9 5.6c0 .1 0 .2.1.3.1.1.2.1.3.1h1.5c.3 0 .6-.2.7-.5l.3-.9c.1-.3.4-.5.7-.5h.9l-.3.9c-.1.3 0 .6.2.8.2.2.5.3.8.2l1.2-.4c.3-.1.5-.4.4-.7l-1.5-4.2zm-.8 2.2l.5-1.5.5 1.5h-1z"
          />
          <path
            fill="#6772E5"
            d="M19.5 3h-15C3.7 3 3 3.7 3 4.5v15c0 .8.7 1.5 1.5 1.5h15c.8 0 1.5-.7 1.5-1.5v-15c0-.8-.7-1.5-1.5-1.5zm-8.1 8.2c0-.1 0-.2-.1-.3-.1-.1-.2-.1-.3-.1h-1.5c-.3 0-.6.2-.7.5l-1.9 5.6c0 .1 0 .2.1.3.1.1.2.1.3.1h1.2c.3 0 .6-.2.7-.5l1.9-5.6zm5.6 5.6c0 .1 0 .2-.1.3-.1.1-.2.1-.3.1h-1.2c-.3 0-.6-.2-.7-.5l-1.9-5.6c0-.1 0-.2.1-.3.1-.1.2-.1.3-.1h1.5c.3 0 .6.2.7.5l1.9 5.6z"
          />
        </svg>
      );
    }

    if (platformLower.includes("razorpay")) {
      return (
        <svg viewBox="0 0 24 24" className={`h-5 w-5 ${className}`}>
          <path
            fill="#2D8FF0"
            d="M12 0C5.37 0 0 5.37 0 12s5.37 12 12 12 12-5.37 12-12S18.63 0 12 0zm4.5 16.5h-9v-9h9v9z"
          />
          <path
            fill="#FFF"
            d="M16.5 7.5h-9v9h9v-9zM10.12 14.25H8.25v-4.5h1.87c1.03 0 1.88.85 1.88 1.88v.75c0 1.02-.85 1.87-1.88 1.87zm5.25 0h-2.25v-4.5h2.25v4.5z"
          />
        </svg>
      );
    }

    // Default icon (first letter of platform)
    return (
      <span className={`font-medium ${className}`}>
        {platform.charAt(0).toUpperCase()}
      </span>
    );
  };

  return getPlatformIcon();
};

export default PlatformIcon;
