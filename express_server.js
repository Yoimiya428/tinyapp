//SETUP
const express = require("express");
const app = express();
const PORT = 8080; // default port 8080

app.use(express.urlencoded({ extended: true }));
app.set("view engine", "ejs");

//DB configuration
const urlDatabase = {
  b2xVn2: "http://www.lighthouselabs.ca",
  "9sm5xK": "http://www.google.com",
};


//Function Area
function generateRandomString() {
  return Math.random().toString(36).slice(2,8);
}


//GET
app.get("/", (req, res) => {
  res.send("Hello!");
});

app.get("/urls.json", (req, res) => {
  res.json(urlDatabase);
});

app.get("/hello", (req, res) => {
  res.send("<html><body>Hello <b>World</b></body></html>\n");
});

// app.get("/set", (req, res) => {
//   const a = 1;
//   res.send(`a = ${a}`);
// });

// app.get("/fetch", (req, res) => {
//   res.send(`a = ${a}`);
// });
app.get("/urls", (req, res) => {
  const templateVars = { urls: urlDatabase }; 
  res.render("urls_index", templateVars);
});

app.get("/urls/new", (req, res) => {
  res.render("urls_new");
});

app.get("/urls/:id", (req, res) => {
  const id = req.params.id;
  const templateVars = { id: id, longURL: urlDatabase[id] };
  res.render("urls_show", templateVars);
});

app.get("/u/:id", (req, res) => {
  const id = req.params.id;
  const longURL = urlDatabase[id];
  res.redirect(longURL);
});

//POST
app.post("/urls", (req, res) => {
  const longURL = req.body.longURL; 
  const id = generateRandomString();

  urlDatabase[id] = longURL;

  res.redirect(`/urls/${id}`);
  //console.log(req.body); // Log the POST request body to the console
  //res.send("Ok"); // Respond with 'Ok' (we will replace this)
});

//delete
app.post("/urls/:id/delete", (req, res) => {
  const id = req.params.id;

  delete urlDatabase[id];

  res.redirect("/urls");
});

//edit
app.post('/urls/:id', (req, res) => {
  const id = req.params.id;
  const updatedURL = req.body.longURL;

  if (urlDatabase[id]) {
    urlDatabase[id].long = updatedURL;
  }

  res.redirect('/urls');
});



//Actions
app.listen(PORT, () => {
  console.log(`Example app listening on port ${PORT}!`);
});