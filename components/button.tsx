import React from "react";

type Props = {
  label: string;
  clickHandler: Function;
  active: boolean;
};

export default function button({ label, clickHandler, active }: Props) {
  return (
    <>
      {active ? (
        <button
          onClick={() => clickHandler()}
          className="bg-gray-400 p-1 rounded-sm text-xl"
        >
          <div className="py-2 px-4 relative overflow-hidden bg-gray-100 font-custom text-gray-900">
            <div className="w-4 h-4 rounded-full  absolute -top-2 -left-2 bg-gray-400 z-10" />
            <div className="w-4 h-4 rounded-full  absolute -bottom-2 -left-2 bg-gray-400 z-10" />
            <div className="w-4 h-4 rounded-full  absolute -bottom-2 -right-2 bg-gray-400 z-10" />
            <div className="w-4 h-4 rounded-full  absolute -top-2 -right-2 bg-gray-400 z-10" />
            {label}
          </div>
        </button>
      ) : (
        <button className="bg-gray-600 p-1 rounded-sm text-xl">
          <div className="py-2 px-4 relative overflow-hidden bg-gray-500 font-custom text-gray-900">
            <div className="w-4 h-4 rounded-full  absolute -top-2 -left-2 bg-gray-600 z-10" />
            <div className="w-4 h-4 rounded-full  absolute -bottom-2 -left-2 bg-gray-600 z-10" />
            <div className="w-4 h-4 rounded-full  absolute -bottom-2 -right-2 bg-gray-600 z-10" />
            <div className="w-4 h-4 rounded-full  absolute -top-2 -right-2 bg-gray-600 z-10" />
            {label}
          </div>
        </button>
      )}
    </>
  );
}
