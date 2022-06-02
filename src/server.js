const { Logger } = require("@wizo06/logger");
const express = require("express");
const { form } = require('./html.js')

const app = express();
const logger = new Logger();

app.get("/", (req, res) => {
    res.send(form)
})

app.listen(50057, () => logger.success(`Express server listening on port 50057`));
