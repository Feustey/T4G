import React from "react";

interface IconProps {
  className?: string;
  size: "small" | "medium" | "large";
  variant?: string;
}

export const SpinnerIconElement: React.FC<IconProps> = function ({
  className,
  variant = "dark",
  size,
}: IconProps) {
  const dimensions =
    size === "medium" ? "w-3 h-5" : size === "large" ? "w-9 h-9" : "w-md h-md";

  return (
    <>
      <div className={`SpinnerIconElement1 ${variant}`}>
        <div className="sk-circle relative w-6 h-6">
          <div className="sk-circle1 sk-child absolute left-0 top-0 w-full h-full" />
          <div className="sk-circle2 sk-child absolute left-0 top-0 w-full h-full" />
          <div className="sk-circle3 sk-child absolute left-0 top-0 w-full h-full" />
          <div className="sk-circle4 sk-child absolute left-0 top-0 w-full h-full" />
          <div className="sk-circle5 sk-child absolute left-0 top-0 w-full h-full" />
          <div className="sk-circle6 sk-child absolute left-0 top-0 w-full h-full" />
          <div className="sk-circle7 sk-child absolute left-0 top-0 w-full h-full" />
          <div className="sk-circle8 sk-child absolute left-0 top-0 w-full h-full" />
          <div className="sk-circle9 sk-child absolute left-0 top-0 w-full h-full" />
          <div className="sk-circle10 sk-child absolute left-0 top-0 w-full h-full" />
          <div className="sk-circle11 sk-child absolute left-0 top-0 w-full h-full" />
          <div className="sk-circle12 sk-child absolute left-0 top-0 w-full h-full" />
        </div>
      </div>
    </>
  );
};
/*
      <style>
        {`
            .${variant} .sk-circle .sk-child::before {
              content: '';
              display: block;
              margin: 0 auto;
              width: 17%;
              height: 17%;
              background-color: ${
                variant === 'dark' ? 'rgba(49,194,122,1)' : '#ffffff'
              };
              border-radius: 100%;
              -webkit-animation: sk-circleBounceDelay 1.2s infinite ease-in-out
                both;
              animation: sk-circleBounceDelay 1.2s infinite ease-in-out both;
            }
            .${variant} .sk-circle .sk-circle2 {
              -webkit-transform: rotate(30deg);
              -ms-transform: rotate(30deg);
              transform: rotate(30deg);
            }
            .${variant} .sk-circle .sk-circle3 {
              -webkit-transform: rotate(60deg);
              -ms-transform: rotate(60deg);
              transform: rotate(60deg);
            }
            .${variant} .sk-circle .sk-circle4 {
              -webkit-transform: rotate(90deg);
              -ms-transform: rotate(90deg);
              transform: rotate(90deg);
            }
            .${variant} .sk-circle .sk-circle5 {
              -webkit-transform: rotate(120deg);
              -ms-transform: rotate(120deg);
              transform: rotate(120deg);
            }
            .${variant} .sk-circle .sk-circle6 {
              -webkit-transform: rotate(150deg);
              -ms-transform: rotate(150deg);
              transform: rotate(150deg);
            }
            .${variant} .sk-circle .sk-circle7 {
              -webkit-transform: rotate(180deg);
              -ms-transform: rotate(180deg);
              transform: rotate(180deg);
            }
            .${variant} .sk-circle .sk-circle8 {
              -webkit-transform: rotate(210deg);
              -ms-transform: rotate(210deg);
              transform: rotate(210deg);
            }
            .${variant} .sk-circle .sk-circle9 {
              -webkit-transform: rotate(240deg);
              -ms-transform: rotate(240deg);
              transform: rotate(240deg);
            }
            .${variant} .sk-circle .sk-circle10 {
              -webkit-transform: rotate(270deg);
              -ms-transform: rotate(270deg);
              transform: rotate(270deg);
            }
            .${variant} .sk-circle .sk-circle11 {
              -webkit-transform: rotate(300deg);
              -ms-transform: rotate(300deg);
              transform: rotate(300deg);
            }
            .${variant} .sk-circle .sk-circle12 {
              -webkit-transform: rotate(330deg);
              -ms-transform: rotate(330deg);
              transform: rotate(330deg);
            }
            .${variant} .sk-circle .sk-circle2:before {
              -webkit-animation-delay: -1.1s;
              animation-delay: -1.1s;
            }
            .${variant} .sk-circle .sk-circle3:before {
              -webkit-animation-delay: -1s;
              animation-delay: -1s;
            }
            .${variant} .sk-circle .sk-circle4:before {
              -webkit-animation-delay: -0.9s;
              animation-delay: -0.9s;
            }
            .${variant} .sk-circle .sk-circle5:before {
              -webkit-animation-delay: -0.8s;
              animation-delay: -0.8s;
            }
            .${variant} .sk-circle .sk-circle6:before {
              -webkit-animation-delay: -0.7s;
              animation-delay: -0.7s;
            }
            .${variant} .sk-circle .sk-circle7:before {
              -webkit-animation-delay: -0.6s;
              animation-delay: -0.6s;
            }
            .${variant} .sk-circle .sk-circle8:before {
              -webkit-animation-delay: -0.5s;
              animation-delay: -0.5s;
            }
            .${variant} .sk-circle .sk-circle9:before {
              -webkit-animation-delay: -0.4s;
              animation-delay: -0.4s;
            }
            .${variant} .sk-circle .sk-circle10:before {
              -webkit-animation-delay: -0.3s;
              animation-delay: -0.3s;
            }
            .${variant} .sk-circle .sk-circle11:before {
              -webkit-animation-delay: -0.2s;
              animation-delay: -0.2s;
            }
            .${variant} .sk-circle .sk-circle12:before {
              -webkit-animation-delay: -0.1s;
              animation-delay: -0.1s;
            }

            @-webkit-keyframes sk-circleBounceDelay {
              0%,
              80%,
              100% {
                -webkit-transform: scale(0);
                transform: scale(0);
              }
              40% {
                -webkit-transform: scale(1);
                transform: scale(1);
              }
            }

            @keyframes sk-circleBounceDelay {
              0%,
              80%,
              100% {
                -webkit-transform: scale(0);
                transform: scale(0);
              }
              40% {
                -webkit-transform: scale(1);
                transform: scale(1);
              }
            }
          `}
      </style>

 */
