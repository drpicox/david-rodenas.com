import React from "react";
import { css } from "@emotion/core";
import { Link } from "../shared";

const navCss = css`
  margin-bottom: -4.5em;

  .prev {
    margin-right: 0.3em;
  }
  .next {
    margin-left: 0.3em;
  }
`;

export function NavIndex({ index, prev, next }) {
  return (
    <>
      {index && (
        <div css={navCss}>
          {prev && (
            <Link className="prev" to={`/${prev}`}>
              «
            </Link>
          )}
          <Link className="index" to={`/${index}`}>
            {index}
          </Link>
          {next && (
            <Link className="next" to={`/${next}`}>
              »
            </Link>
          )}
        </div>
      )}
    </>
  );
}
