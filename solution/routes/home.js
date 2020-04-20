const app = document.querySelector("#app");

const loggedOut = /*html*/ `
  <h1>Welcome to dog app</h1>
  <nav>
    <a href="/sign-up">Create an account</a>
    <a href="/log-in">Log in</a>
  </nav>
`;

const loggedIn = /*html*/ `
  <h1>Welcome to dog app</h1>
  <button id="logOut">Log out</button>
`;

function home({ redirect }) {
  const token = localStorage.getItem("token");
  if (!token) {
    app.innerHTML = loggedOut;
  } else {
    app.innerHTML = loggedIn;
    app.querySelector("#logOut").addEventListener("click", () => {
      window.localStorage.removeItem("token");
      redirect("/");
    });
  }
}

export default home;
