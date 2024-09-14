import { PORT } from "./config";
import { app } from "./server";

// roda o servidor e avisa que estamos online
app.listen(PORT, () => {
    console.log("Escutando na porta " + PORT);
});
