const app = document.querySelector("#app");

const loggedOut = /*html*/ `
  <h1>Welcome to dog app</h1>
  <nav>
    <a href="/sign-up">Create an account</a>
    <a href="/log-in">Log in</a>
  </nav>
`;

function home() {
  app.innerHTML = loggedOut;
}

export default home;
