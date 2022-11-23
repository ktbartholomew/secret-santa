import { MouseEventHandler } from "react";

type ButtonProps = {
  className?: string;
  design?: "gray" | "blue" | "green" | "red" | "yellow" | "transparent";
  children: string | React.ReactNode | React.ReactNode[];
  inProgress?: boolean;
  onClick?: MouseEventHandler<HTMLButtonElement>;
  type?: "button" | "submit" | "reset";
  value?: string;
};

const common =
  "relative font-bold p-2 px-4 rounded-md transition-colors border-b-2 ";

const classes = {
  gray:
    common +
    "bg-gray-300 text-gray-900 border-gray-400 hover:bg-gray-200 active:bg-gray-300",
  blue:
    common +
    "bg-blue-400 text-blue-900 border-blue-500 hover:bg-blue-300 active:bg-blue-400",
  green:
    common +
    "bg-green-400 text-green-900 border-green-500 hover:bg-green-300 active:bg-green-400",
  red:
    common +
    "bg-red-400 text-red-900 border-red-500 hover:bg-red-300 active:bg-red-400",
  yellow:
    common +
    "bg-yellow-400 text-yellow-900 border-yellow-500 hover:bg-yellow-300 active:bg-yellow-400",
  transparent: common + "border-b-0 hover:bg-blue-100",
};

export default function Button({
  className,
  design,
  children,
  type,
  onClick,
  inProgress,
  value,
}: ButtonProps): React.ReactElement<HTMLButtonElement> {
  const designClass = classes[design] || classes["gray"];
  return (
    <button
      type={type || "button"}
      value={value || ""}
      onClick={(e) => {
        !inProgress && onClick && onClick(e);
      }}
      className={className ? designClass + " " + className : designClass}
    >
      {children}
      {inProgress && <LoadingCover design={design} />}
    </button>
  );
}

function LoadingCover({ design }) {
  let bgClass = "bg-white";

  switch (design) {
    case "gray":
      bgClass = "bg-gray-300";
      break;
    case "blue":
      bgClass = "bg-blue-400";
      break;
    case "green":
      bgClass = "bg-green-400";
      break;
    case "red":
      bgClass = "bg-red-400";
      break;
    case "yellow":
      bgClass = "bg-yellow-400";
      break;
  }

  return (
    <div
      className={`${bgClass} absolute flex items-center justify-center rounded-md`}
      style={{ top: "0", left: "0", width: "100%", height: "100%" }}
    >
      <svg
        xmlns="http://www.w3.org/2000/svg"
        fill="none"
        viewBox="0 0 24 24"
        strokeWidth={1.5}
        stroke="currentColor"
        className="w-6 h-6 animate-pulse"
      >
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          d="M3 7.5L7.5 3m0 0L12 7.5M7.5 3v13.5m13.5 0L16.5 21m0 0L12 16.5m4.5 4.5V7.5"
        />
      </svg>
    </div>
  );
}
