import React from "react";
import { css } from "@emotion/core";
import { Link } from "../shared";

const navCss = css`
  margin-bottom: -4.5em;
`;

export function NavIndex({ index }) {
  return (
    <>
      {index && (
        <div css={navCss}>
          <Link className="index" to={`/${index}`}>
            {index}
          </Link>
        </div>
      )}
    </>
  );
}
