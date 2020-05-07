import React from "react"
import { css } from "@emotion/core"

const myCss = css`
  table {
    text-align: right;
    border: none;
  }
  th,
  td {
    border: none;
  }

  thead tr td {
    font-weight: bold;
    border-bottom: solid 0.1rem var(--primary-light-color);
  }
`

function SequenceList({ rule, sequences }) {
  return (
    <div css={myCss}>
      <table>
        <thead>
          <tr>
            <td>a,</td>
            <td>b,</td>
            <td>c</td>
          </tr>
        </thead>
        <tbody>
          {sequences.map(([a, b, c]) => (
            <tr key={`${a},${b},${c}`}>
              <td>{a},</td>
              <td>{b},</td>
              <td>{c}</td>
              <td>{rule(a, b, c) ? "✅" : "❌"}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}

export default SequenceList
