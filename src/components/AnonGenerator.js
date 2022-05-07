import React, { useRef, useState } from "react";
import SparkMD5 from "spark-md5";
import { css } from "@emotion/core";

const myCss = css`
  .grid {
    display: grid;
    grid-template-columns: max-content auto;
    align-items: baseline;
    gap: 1rem;
  }

  input {
    flex: 1;
  }

  h4 {
    margin: 0;
  }

  code {
    color: var(--text-color);
    font-family: Consolas, Monaco, "Andale Mono", "Ubuntu Mono", monospace;
    background-color: var(--light-background-color);
    font-weight: normal;
  }

  .code {
    margin-top: 3rem;
    padding: 1rem;
    text-align: center;
    border: 3px solid var(--light-background-color);
  }
  .code button {
    border: 0;
  }
`;

export default function AnonGenerator() {
  const usernameRef = useRef(null);
  const dniRef = useRef(null);
  const niaRef = useRef(null);
  const [working, setWorking] = useState(false);
  const [anon, setAnon] = useState(null);

  const generate = () => {
    setWorking(true);
    setTimeout(() => {
      const r = `${usernameRef.current.value}#${dniRef.current.value}#${niaRef.current.value}`;
      const hash = SparkMD5.hash(r.toUpperCase()).slice(0, 7);
      setAnon(hash);
      setWorking(false);
    }, 5000);
  };

  return (
    <div css={myCss}>
      <div className="grid">
        <h4>Enter your GitHub user:</h4>
        <input disabled={working} ref={usernameRef} />
        <h4>Enter your DNI/NIE/…:</h4>
        <input disabled={working} ref={dniRef} />
        <h4>Enter your NIU/NIA:</h4>
        <input disabled={working} ref={niaRef} />
        <span> </span>
        <button disabled={working} onClick={generate}>
          {working ? "...working..." : "Generate!"}
        </button>
      </div>
      {anon && (
        <>
          <p className="code">
            Your code is: <code>{anon}</code>{" "}
            <button onClick={() => setAnon("")}>[ Clear ]</button>
          </p>
        </>
      )}
    </div>
  );
}
