//append custom javascrpt
let js = document.createElement("script");
js.setAttribute("src", "/javascripts/script.js");
js.setAttribute("type", "text/javascript");
document.head.appendChild(js);

//append custom stylesheets
let css = document.createElement("link");
css.setAttribute("href", "/stylesheets/style.css");
css.setAttribute("rel", "stylesheet");
document.head.appendChild(css);