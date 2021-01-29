const express = require("express")

const app = express()

app.get('', (req, res, next) => {
    res.send(200)
})

app.listen(80, () => {
    console.log('Listening ...')
})