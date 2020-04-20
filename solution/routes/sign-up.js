import query from "../query.js";

const app = document.querySelector("#app");

const html = /*html*/ `
<h1>Create an account</h1>
<form>
  <label for="name">Name</label>
  <input type="text" id="name" name="name">
  
  <label for="email">Email</label>
  <input type="email" id="email" name="email">
  
  <label for="password">Password</label>
  <input type="password" id="password" name="password">
  
  <div id="message"></div>
  
  <button type="submit">Sign up</button>
</form>
`;

function signUp({ redirect }) {
  app.innerHTML = html;
  app.querySelector("form").addEventListener("submit", (event) => {
    event.preventDefault();
    const formData = new FormData(event.target);
    const formObject = Object.fromEntries(formData);

    query("https://fac-dogs.herokuapp.com/v1/users", {
      method: "POST",
      body: JSON.stringify(formObject),
    })
      .then((body) => {
        window.localStorage.setItem("token", body.access_token);
        window.localStorage.setItem("userId", body.id);
        redirect("/");
      })
      .catch((error) => {
        console.error(error);
        app.querySelector("#message").append("Something went wrong");
      });
  });
}

export default signUp;
