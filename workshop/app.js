import router from "./router.js";
import home from "./routes/home.js";
import missing from "./routes/missing.js";

const app = router();

app.get("/", home);
app.get("default", missing);

app.listen();
