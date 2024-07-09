import express from "express"

const app = express();
const PORT = 3000;
app.get("/", (req, res)=>{
    res.send("Welcome to Contact Database Please navigate to /identify")
})

app.listen(PORT, ()=> console.log(`Port is running at port ${PORT}`))