import router from "./router.js";
import home from "./routes/home.js";
import signUp from "./routes/sign-up.js";
import logIn from "./routes/log-in.js";
import allDogs from "./routes/all-dogs.js";
import newDog from "./routes/new-dog.js";
import missing from "./routes/missing.js";

const app = router();

app.get("/", home);
app.get("/sign-up", signUp);
app.get("/log-in", logIn);
app.get("/all-dogs", allDogs);
app.get("/new-dog", newDog);
app.get("default", missing);

app.listen();
