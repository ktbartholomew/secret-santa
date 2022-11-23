import Image from "next/image";
import Link from "next/link";
import React from "react";
import stamp from "../../images/secret-santa-stamp.png";

export default function MainLayout({
  children,
}: {
  children: React.ReactElement | React.ReactElement[];
}): React.ReactElement {
  return (
    <>
      <div className="flex justify-end mb-2">
        <button className="text-slate-300 py-3 px-4 bg-transparent hover:bg-slate-700 transition-color rounded-md">
          Preferences
        </button>
        <a href="/logout">
          <button className="text-slate-300 py-3 px-4 bg-transparent hover:bg-slate-700 rounded-md">
            Log Out
          </button>
        </a>
      </div>
      <div className="max-w-3xl flex flex-wrap flex-row mx-auto justify-center">
        <div className="basis-full flex-grow text-center">
          <h1 className="hidden">Secret Santa</h1>
          <Image
            {...stamp}
            alt="Secret Santa Logo"
            width={stamp.width / 2}
            height={stamp.height / 2}
            className="block mx-auto"
            style={{ transform: "rotate(6deg)" }}
            priority
          />
        </div>
        <div className="my-8 basis-full flex-grow bg-white drop-shadow-lg rounded-lg">
          {children}
        </div>
        <div className="my-8 text-slate-300">
          &copy; {new Date().getFullYear()} Keith Bartholomew
        </div>
      </div>
    </>
  );
}
