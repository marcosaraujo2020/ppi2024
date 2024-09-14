import { port } from "./config";
import { app } from "./server";

app.listen(port, () => {
    console.log("Escutando na porta " + port);
});
