import {app, port} from "./server";

app.listen(port, () => {
    console.log("Escutando na porta " + port);
});
