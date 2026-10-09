/** The page as the build writes it, made for tests, as much of it as a search touches: the header's session and its button, and the prompt. */
export const SEARCH_PAGE = `
<header class="site-header">
  <a class="mark" href="/"></a>
  <div class="session"><p class="ran"><a class="brand" href="/">@drpicox</a> <span class="ps1">~ $</span> ls</p><nav><a class="navlink" href="/">README.md</a></nav></div>
  <button class="theme-toggle" type="button">&#9680;</button>
</header>
<main></main>
<section class="terminal"><div class="column"><form class="prompt"><span class="ps1">~ $</span><span class="line"><input type="text" aria-label="Command"><span class="cursor"></span><span class="suggest">help</span></span></form></div></section>`;
