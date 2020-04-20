import query from "../query.js";

const app = document.querySelector("#app");

const html = /*html*/ `
  <h1>All the dogs</h1>
  <div id="message"></div>
  <ul></ul>
`;

function createDogElement(dog, token, userId) {
  const li = document.createElement("li");
  const h2 = document.createElement("h2");
  h2.append(dog.name);
  const p = document.createElement("p");
  p.append(dog.breed);
  li.append(h2, p);

  if (dog.owner === parseInt(userId)) {
    const button = document.createElement("button");
    button.append("Delete");
    button.addEventListener("click", () => {
      query(`https://fac-dogs.herokuapp.com/v1/dogs/${dog.id}`, {
        method: "DELETE",
        headers: { authorization: `Bearer ${token}` },
      })
        .then(() => {
          li.remove();
        })
        .catch((error) => {
          console.error(error);
          app.querySelector("#message").append("Deleting dog failed");
        });
    });
    li.append(button);
  }
  return li;
}

function allDogsRoute() {
  app.innerHTML = html;
  const token = localStorage.getItem("token");
  const userId = localStorage.getItem("userId");

  query("https://fac-dogs.herokuapp.com/v1/dogs")
    .then((dogs) => {
      const dogList = dogs.map((dog) => createDogElement(dog, token, userId));
      app.querySelector("ul").append(...dogList);
    })
    .catch((error) => {
      console.error(error);
      app.querySelector("#message").append("Loading dogs failed");
    });
}

export default allDogsRoute;
