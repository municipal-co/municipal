import React from "preact/compat";

export default function Arrow ({className}) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width="90"
      height="90"
      viewBox="0 0 90 90"
      className={`icon icon-arrow ${className ? className : ''}`}
      fill="currentcolor"
    >
      <g fill="none" fill-rule="evenodd">
        <path
          d="M64.948 19l24.873 25.813L90 45 65.193 71l-6.682-7.003L71.863 50H0V40h71.866L58.511 26.004 64.948 19z"
        />
      </g>
    </svg>
  );
}