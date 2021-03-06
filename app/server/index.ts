import express, { Application, Request, Response } from "express";
const curlRouter =  require('../routes/curlRouter');
import path from "path";
import fetch from 'node-fetch';
const app: Application = express();
const PORT: number = 3000;

//Serve Static file
app.use("/dist", express.static(path.join(__dirname, "../dist")));

//Parse Incoming body requests
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

//Route handlers
app.use('/server', curlRouter);

setInterval(() => {
  fetch("http://localhost:3000/server/dev")
  .then(result => result.json())
  .then(json => console.log(json))
}, 60000);


//Main Get Request, Send html file
app.get("/", (req: Request, res: Response) => {
  //return res.sendFile(path.resolve(__dirname, '../src/index.html'));
  return res.sendFile(path.resolve(__dirname, '../../src/index.html'));
});

//Catch all error handler
app.all("*", (req: Request, res: Response) => {
  return res.status(404).send("Page not found");
});

//Global Error Handler
app.use((err, req: Request, res: Response) => {
  console.log(err);
  return res.status(400).send(err);
});

app.listen(PORT, () => console.log(`Listening on port ${PORT}`));
