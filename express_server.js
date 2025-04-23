//SETUP
const express = require("express");
const cookieParser = require('cookie-parser');

const app = express();
const PORT = 8080; // default port 8080



app.use(express.urlencoded({ extended: true }));
app.set("view engine", "ejs");
app.use(cookieParser());

//DB configuration
const urlDatabase = {
  b2xVn2: "http://www.lighthouselabs.ca",
  "9sm5xK": "http://www.google.com",
};

const users = {
  userRandomID: {
    id: "userRandomID",
    email: "user@example.com",
    password: "purple-monkey-dinosaur",
  },
  user2RandomID: {
    id: "user2RandomID",
    email: "user2@example.com",
    password: "dishwasher-funk",
  },
};


//Function Area
function generateRandomString() {
  return Math.random().toString(36).slice(2,8);
}

const getUserByEmail = (email, users) => {
  for (const id in users) {
    if (users[id].email === email) {
      return users[id];
    }
  }
  return null;
};


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

// app.get("/urls", (req, res) => {
//   const templateVars = { urls: urlDatabase }; 
//   res.render("urls_index", templateVars);
// });

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

//pass in the username
app.get("/urls", (req, res) => {

  const uid = req.cookies["user_id"];
  const user = users[uid];

  const templateVars = {
    user,
    urls: urlDatabase,
  };
  res.render("urls_index", templateVars);
});

app.get("/register", (req, res) => {
  res.render("register");
});

app.get("/login", (req, res) => {
  const templateVars = {
    user: users[req.cookies["user_id"]],
  };
  res.render("login", templateVars);
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
  const longURL = req.body.longURL;

  urlDatabase[id] = longURL;
  
  res.redirect('/urls');
});

//cookies
app.post('/login', (req, res) => {
  const { email, password } = req.body;
  const user = getUserByEmail(email, users);

  if (user.password !== password) {
    return res.status(403).send("Password is incorrect.");
  }

  if (user === null) {
    return res.status(403).send("User not found.");
  }

  res.cookie("user_id", uid); 
  res.redirect("/urls");         
});

//logout
app.post("/logout", (req, res) => {
  res.clearCookie("user_id");
  res.redirect("/urls");
});

//register
app.post("/register", (req, res) => {
  const { email, password } = req.body;

  if (email === '' || password === '') {
    return res.status(400).send("Email/password is empty, please try again.");
  }

  if (getUserByEmail(email, users)) {
    return res.status(400).send("email already registered.");
  }

  const uid = generateRandomString();
  const newUser = {
    id: uid,
    email,
    password
  };

  users[uid] = newUser;
  console.log("New user:", users);
  res.cookie("user_id", uid); 
  res.redirect("/urls");        
});

//Actions
app.listen(PORT, () => {
  console.log(`Example app listening on port ${PORT}!`);
});