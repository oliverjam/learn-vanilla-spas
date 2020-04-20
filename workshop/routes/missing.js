const app = document.querySelector("#app");

const html = /*html*/ `
  <h1>Page not found</h1>
`;

function missing() {
  document.title = "Page not found";
  app.innerHTML = html;
}

export default missing;
