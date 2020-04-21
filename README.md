# Learn vanilla single-page apps

Learn how to build a single-page app using an external JSON API with token-based authentication.

## Setup

1. Clone this repo
1. `npm install`
1. `npm run dev` to start the local server

### Project structure

The `workshop/` directory contains the initial structure we'll be working with. `index.html` renders some static navigation links and an empty `<div id="app">` for us to render our UI into. `app.js` imports our `router` from `router.js`. This is where we'll define our different routes. Each route handler should live in the `routes/` directory.

## Authenticating

### Rendering the form

Our app needs a way for users to sign up and log in. Let's do signing up first. Create a new route handler in `routes/sign-up.js` and export it. Create a new route for `"/sign-up"` in `app.js` and register the new handler.

<details>
<summary>Solution</summary>

```js
// app.js
//...
import signUp from "./routes/sign-up.js";

const app = router();

//...
app.get("/sign-up", signUp);
```

</details>

`routes/sign-up.js` should render a form with inputs for the user's name, email and password, plus a submit button.

<details>
<summary>Solution</summary>

```js
// sign-up.js
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
  
  <button type="submit">Sign up</button>
</form>
`;

function signUp() {
  app.innerHTML = html;
}

export default signUp;
```

</details>

### Handling form submission

Once the form is rendered we need to make it work. Add an event listener for the "submit" event to the form. When the form is submitted prevent the default request being sent, then grab the values for the name, email and password from the form.

We need to submit them to the API using `fetch`. Send a `POST` request to `"https://fac-dogs.herokuapp.com/v1/users"` with the user data as the request body (don't forget to `JSON.stringify` it).

We should also always tell the server we're sending it JSON by using the `content-type` header.

For now when you receive a response just console log it. **Hint**: don't forget you have to parse a JSON response body like this:

```js
fetchStuff()
  .then((res) => res.json())
  .then((json) => console.log(json));
```

<details>
<summary>Solution</summary>

```js
//...
function signUp() {
  app.innerHTML = html;
  app.querySelector("form").addEventListener("submit", (event) => {
    event.preventDefault();
    const formData = new FormData(event.target);
    const formObject = Object.fromEntries(formData);

    fetch("https://fac-dogs.herokuapp.com/v1/users", {
      method: "POST",
      body: JSON.stringify(formObject),
      headers: { "content-type": "application/json" },
    })
      .then((res) => res.json())
      .then((json) => {
        console.log(json);
      })
      .catch((error) => {
        console.error(error);
      });
  });
}
```

</details>

### Keeping the user logged in

If your request was successful you should see an access token in the response object:

```json
{ "access_token": "eyJhbGci..." }
```

We need to keep this token around, as we'll have to send it with every request to the API to prove our current user is authenticated. A convenient place to store the token is [`localStorage`](https://developer.mozilla.org/en-US/docs/Web/API/Window/localStorage). If we put it there the user can close their browser and come back and they'll stil be logged in.

Use `localStorage.setItem` to store the token you receive from the API.

<details>
<summary>Solution</summary>

```js
// ...
  .then((json) => {
    localStorage.setItem("token", json.access_token);
  });
```

</details>

### Redirecting the user

Once the user has logged in it would be nice to send them to another page. We could manually set `window.location` to do this, but that would be bypassing our nice client-side router, causing a full page reload.

Luckily our router exposes a `redirect` method to all the routes, kind of like Express. The route callbacks receive a single object argument, containing useful properties like this. You can use destructuring to access them like this:

```js
function myRoute({ redirect }) {
  redirect("/some-page");
}
```

Use `redirect` to send the user back to the home page after they log in successfully.

<details>
<summary>Solution</summary>

```js
function signUp({ redirect }) {
// ...
  .then((json) => {
    localStorage.setItem("token", json.access_token);
    redirect("/");
  });
```

</details>

### Error-handling

We should let the user know if something went wrong with their request, so they can try again. Add a div with an ID of "message" to the form. When you catch an error submitting to the API put a message inside the div.

<details>
<summary>Solution</summary>

```js
//...
const html = /*html*/ `

  <div id="message"></div>

  <button type="submit">Sign up</button>
</form>
`;

//...
  .catch(error => {
    console.error(error);
    app.querySelector("#message").append("Something went wrong");
  })
```

</details>

### Logging in

Now repeat this process for the `/log-in` route. The only difference is you don't need an input for the user's name, and you should submit the POST request to this endpoint: `https://fac-dogs.herokuapp.com/v1/users/login`.

<details>
<summary>Solution</summary>

```js
// log-in.js
const app = document.querySelector("#app");

const html = /*html*/ `
<h1>Log in to your account</h1>
<form>
  <label for="email">Email</label>
  <input type="email" id="email" name="email">
  
  <label for="password">Password</label>
  <input type="password" id="password" name="password">
  
  <div id="message"></div>
  
  <button type="submit">Log in</button>
</form>
`;

function logIn({ redirect }) {
  app.innerHTML = html;
  app.querySelector("form").addEventListener("submit", (event) => {
    event.preventDefault();
    const formData = new FormData(event.target);
    const formObject = Object.fromEntries(formData);

    query("https://fac-dogs.herokuapp.com/v1/users/login", {
      method: "POST",
      body: JSON.stringify(formObject),
      headers: { "content-type": "application/json" },
    })
      .then((body) => {
        window.localStorage.setItem("token", body.access_token);
        redirect("/");
      })
      .catch((error) => {
        console.error(error);
        app.querySelector("#message").append("Something went wrong");
      });
  });
}

export default logIn;
```

</details>

### Rendering based on auth state

Our home page currently always shows the sign up/log in links. If the user is currently logged in (i.e. has a token in localStorage) we should instead show a button they can use to log out.

Grab the token using `localStorage.getItem`, then if the token exists render a log out button. This button should clear the token from storage using `localStorage.removeItem`, then redirect back to the same page (to refresh the view).

If there is no token render the sign up/log in links same as before.

<details>
<summary>Solution</summary>

```js
//...

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
```

</details>

## Fetching data

### Making `fetch` more useful

We're going to be making quite a lot of `fetch` calls in our app. Fetch requests don't error on non-200 status codes (since the response was successfully retrieved, it's just not the response you wanted). We should be checking the status code and throwing an error if it's a non-200.

Also if we try to parse a response that isn't JSON with `res.json()` it'll throw an error. So we should check the content-type header to make sure we actually have JSON.

Our `fetch` requests should really all look like this:

```js
fetch("blah").then((res) => {
  if (!res.ok) {
    const error = new Error("HTTP Error");
    error.status = res.status;
    throw error;
  }
  const contentType = res.headers.get("content-type");
  if (contentType && contentType.includes("json")) {
    return res.json();
  } else {
    return res.text();
  }
});
```

This is a lot of boilerplate to repeat every time we make a request, so lets make a little utility function that handles this for us. Create a new file named `query.js` containing an exported function named `query`.

This `query` function should take the [same two arguments as `fetch`](https://developer.mozilla.org/en-US/docs/Web/API/WindowOrWorkerGlobalScope/fetch#Parameters). It should call `fetch` with those arguments and return the promise that `fetch` returns. Add a `.then` to the `fetch` to do all the error-handling from above.

<details>
<summary>Solution</summary>

```js
function query(url, options) {
  return fetch(url, options).then((res) => {
    if (!res.ok) {
      const error = new Error("HTTP Error");
      error.status = res.status;
      throw error;
    }
    const contentType = res.headers.get("content-type");
    if (contentType && contentType.includes("json")) {
      return res.json();
    } else {
      return res.text();
    }
  });
}

export default query;
```

</details>

Now we can import and use `query` whenever we need to make a request, and it'll handle some of the annoying stuff for us. Go back and refactor your `signUp` and `logIn` handlers to use `query`.

### Getting dog data

We can log in, but our app currently doesn't fetch and render any data from the API. Add an `/all-dogs` route and handler function. The handler should immediately render a title and empty `ul` to the page.

Then use `query` to send a request to `"https://fac-dogs.herokuapp.com/v1/dogs"`. When you get a successful response render an `li` for each dog into the `ul` already on the page.

Each `li` should contain the dog's name and breed.

If something goes wrong we should tell the user, so again add an empty div to the page. When the request fails put a message inside the div.

<details>
<summary>Solution</summary>

```js
import query from "../query.js";

const app = document.querySelector("#app");

const html = /*html*/ `
  <h1>All the dogs</h1>
  <div id="message"></div>
  <ul></ul>
`;

function createDogElement(dog) {
  const li = document.createElement("li");
  const h2 = document.createElement("h2");
  h2.append(dog.name);
  const p = document.createElement("p");
  p.append(dog.breed);
  li.append(h2, p);
  return li;
}

function allDogsRoute() {
  app.innerHTML = html;
  const token = localStorage.getItem("token");

  query("https://fac-dogs.herokuapp.com/v1/dogs")
    .then((dogs) => {
      const dogList = dogs.map((dog) => createDogElement(dog, token));
      app.querySelector("ul").append(...dogList);
    })
    .catch((error) => {
      console.error(error);
      app.querySelector("#message").append("Loading dogs failed");
    });
}

export default allDogsRoute;
```

</details>

## Creating new dogs

We should provide a form for the user to submit a new dog. This request will have to be authenticated with the token. Create a new route and handler for `/new-dog`.

The user must be logged in to create a dog, so check if there's a token in localStorage. If there isn't render a message asking the user to log in (with a link to the right page). Otherwise the handler should render a form containing fields for the new dog's name and breed.

When this form is submitted send a `POST` request to `"https://fac-dogs.herokuapp.com/v1/dogs/"`. The POST body should be a JSON object containing the name and breed.

Since this request must be authenticated we need to send an `authorization` header with a value like this: `Bearer ey683q...` (insert the current token from localStorage). Don't forget to also set the `content-type` header so the server knows you're sending JSON. Otherwise it may not parse the body properly.

When the request succeeds redirect to `/all-dogs` so the user can see their dog in the list.

<details>
<summary>Solution</summary>

```js
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
```

</details>

## Stretch goal: Deleting dogs

The owner of a dog should be able to delete it. We should render a delete button next to each dog on the `/all-dogs` page. However we currently have no way of knowing if our logged in user owns each dog—we only have a JWT in localStorage. We should also keep track of the user ID returned by the API along with the token.

Edit your `signUp` and `logIn` handlers to store an extra property in localStorage: the user's ID.

<details>
<summary>Solution</summary>

```js
//...
  .then((body) => {
    window.localStorage.setItem("token", body.access_token);
    window.localStorage.setItem("userId", body.id);
    redirect("/");
  })
//....
```

</details>

Next edit the `allDogs` handler to grab this ID from localStorage. We can use this to conditionally render delete buttons next to each dog that has a matching `owner` property.

Add an event listener to each delete button that sends a `DELETE` request to `"https://fac-dogs.herokuapp.com/v1/dogs/:id"` (where `:id` is the ID of the dog that button relates to). Don't forget you'll need to send an `authorization` header with the token from localStorage.

If the delete request is successful remove that dog `li` from the page. If it fails put an error message in the message div.

**Hint**: you can remove a node from the DOM by calling its remove method: `node.remove()`.

<details>
<summary>Solution</summary>

```js
function createDogElement(dog, token, userId) {
  const li = document.createElement("li");
  //...

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

  query("https://fac-dogs.herokuapp.com/v1/dogs").then((dogs) => {
    const dogList = dogs.map((dog) => createDogElement(dog, token, userId));
    app.querySelector("ul").append(...dogList);
  });
  //...
}

export default allDogsRoute;
```

</details>
