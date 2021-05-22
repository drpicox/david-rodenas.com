import React from "react";
import { css } from "@emotion/core";
import { Link } from "../shared";

const navCss = css`
  display: grid;
  grid-template-areas: "prev index next";
  grid-gap: 0.5em;

  .prev {
    grid-area: prev;
    text-align: left;
  }
  .next {
    grid-area: next;
    text-align: right;
  }
  .index {
    grid-area: index;
    text-align: center;
  }
`;

export function NavTopics({ prev, next, index }) {
  if (index === prev)
    return (
      <div css={navCss}>
        {index && (
          <Link className="prev" to={`/${index}`}>
            ← Index
          </Link>
        )}
        {next && (
          <Link className="next" to={`/${next}`}>
            {next.replace(index, "")} →
          </Link>
        )}
      </div>
    );

  return (
    <div css={navCss}>
      {index && (
        <Link className="index" to={`/${index}`}>
          {index}
        </Link>
      )}
      {prev && (
        <Link className="prev" to={`/${prev}`}>
          ← {prev.replace(index, "")}
        </Link>
      )}
      {next && (
        <Link className="next" to={`/${next}`}>
          {next.replace(index, "")} →
        </Link>
      )}
    </div>
  );
}
