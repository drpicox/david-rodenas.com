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

  .highlight {
    background: yellow;
  }
`

function SequenceList({ rule, sequences }) {
  function compareSequences([x0, x1, x2], [y0, y1, y2]) {
    const xPassess = rule(x0, x1, x2)
    const yPassess = rule(y0, y1, y2)
    if (xPassess !== yPassess) return yPassess - xPassess

    if (x0 !== y0) return x0 - y0
    if (x1 !== y1) return x1 - y1
    return x2 - y2
  }

  sequences.sort(compareSequences)

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
          {sequences.map(([a, b, c, highlight]) => (
            <tr key={`${a},${b},${c}`} className={highlight ? "highlight" : ""}>
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
