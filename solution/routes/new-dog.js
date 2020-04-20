import query from "../query.js";

const app = document.querySelector("#app");

const loggedOut = /*html*/ `
  <h1>Create a new dog</h1>
  <p>You must be logged in to do this.</p>
  <nav>
    <a href="/sign-up">Create an account</a>
    <a href="/log-in">Log in</a>
  </nav>
`;

const loggedIn = /*html*/ `
<h1>Add a new dog</h1>
<form>
  <label for="name">Name</label>
  <input type="text" id="name" name="name">
  
  <label for="breed">Breed</label>
  <input type="text" id="breed" name="breed">
  
  <div id="message"></div>
  
  <button type="submit">Add dog</button>
</form>
`;

function newDog({ redirect }) {
  const token = localStorage.getItem("token");
  if (!token) {
    app.innerHTML = loggedOut;
  } else {
    app.innerHTML = loggedIn;
    app.querySelector("form").addEventListener("submit", (event) => {
      event.preventDefault();
      const formData = new FormData(event.target);
      const formObject = Object.fromEntries(formData);

      query("https://fac-dogs.herokuapp.com/v1/dogs", {
        method: "POST",
        body: JSON.stringify(formObject),
        headers: {
          authorization: `Bearer ${token}`,
          "content-type": "application/json",
        },
      })
        .then(() => {
          redirect("/all-dogs");
        })
        .catch((error) => {
          console.error(error);
          app.querySelector("#message").append("Something went wrong");
        });
    });
  }
}

export default newDog;
