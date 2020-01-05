import React from "react"
import { Helmet } from "react-helmet"
import Header from "../components/Header"
import Footer from "../components/Footer"

export default function BasicLayout({ children, title, canonical }) {
  return (
    <>
      <Helmet>
        <meta charSet="utf-8" />
        <title>{title ? `${title} — ` : ""}@drpicox</title>
        {canonical && <link rel="canonical" href={canonical} />}
      </Helmet>
      <Header />
      {children}
      <Footer />
    </>
  )
}
