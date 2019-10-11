import React from "react"
import { Link } from "gatsby"
import BasicLayout from "../layouts/BasicLayout"

export default () => (
  <BasicLayout>
    Go <Link to="/Home">Home</Link>.
  </BasicLayout>
)
