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
  b6UTxQ: {
    longURL: "https://www.tsn.ca",
    userID: "aJ48lW",
  },
  i3BoGr: {
    longURL: "https://www.google.ca",
    userID: "aJ48lW",
  },
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

const urlsForUser = (id) => {
  const outcome = {};
  for (const shortLink in urlDatabase) {
    if (urlDatabase[shortLink].userID === id) {
      outcome[shortLink] = urlDatabase[shortLink].longURL;
    }
  }
  return outcome;
};

const checkPermission = (user, urlInfo, userID) => {
  if (!user) {
    return "please log in!";

  }

  if (!urlInfo) {
    return "Short URL Ids do not exist";

  }
  if (userID !== urlInfo.userID) {
    return "You can not edit/delete URLs not belonging to you!"
  }
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

app.get("/urls", (req, res) => {
  //const templateVars = { urls: urlDatabase }; 
  //res.render("urls_index", templateVars);

  const userID = req.cookies["user_id"]
  const user = users[userID];

  if (!user) {
    return res.render("error", {user: user, error: "please log in."});
  }

  const userURLs = urlsForUser(userID);
  const templateVars = {
    user,
    urls: userURLs,
  };
  res.render("urls_index", templateVars);

});

app.get("/urls/new", (req, res) => {

  const templateVars = {
    user: users[req.cookies["user_id"]],
  };
  if (!users[req.cookies["user_id"]]) {
    return res.redirect("/login");
  }
  res.render("urls_new", templateVars);

});

app.get("/urls/:id", (req, res) => {

  const id = req.params.id;
  const urlInfo = urlDatabase[id];
  const userID = req.cookies["user_id"];
  const user = users[userID];

  const permissionError = checkPermission (user, urlInfo, userID)
    if (permissionError) {
      return res.render("error", {user: user, error: permissionError});
    }
  const templateVars = { id: id, longURL: urlDatabase[id].longURL, user: user};

  
  res.render("urls_show", templateVars);
});

app.get("/u/:id", (req, res) => {
  const id = req.params.id;
  const urlInfo = urlDatabase[id];

  const uid = req.cookies["user_id"];
  const user = users[uid];

  if (!urlInfo) {
    return res.render("error", {user: user, error: "Short URL Ids do not exist"});

  }

  res.redirect(urlInfo.longURL);
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
  const templateVars = {
    user: users[req.cookies["user_id"]],
  };
  if (users[req.cookies["user_id"]]) {
    return res.redirect("/urls");
  }
  res.render("register", templateVars);
});

app.get("/login", (req, res) => {
  const templateVars = {
    user: users[req.cookies["user_id"]],
  };
  if (users[req.cookies["user_id"]]) {
    return res.redirect("/urls");
  }
  res.render("login", templateVars);

});





//POST
app.post("/urls", (req, res) => {

  const userID = req.cookies["user_id"];
  const user = users[userID];

  if (!user) {

    return res.render("error", {user: user, error: "Only Registered Users Can Shorten URLs"});
  }

  const longURL = req.body.longURL; 
  const id = generateRandomString();

  urlDatabase[id] = {longURL, userID};

  res.redirect(`/urls/${id}`);

});

//delete
app.post("/urls/:id/delete", (req, res) => {

  const id = req.params.id;
  const urlInfo = urlDatabase[id];
  const userID = req.cookies["user_id"];
  const user = users[userID];

  const permissionError = checkPermission (user, urlInfo, userID)
    if (permissionError) {
      return res.render("error", {user: user, error: permissionError});
    }

  delete urlDatabase[id];

  res.redirect("/urls");
});

//edit
app.post('/urls/:id', (req, res) => {

  const id = req.params.id;
  const urlInfo = urlDatabase[id];
  const userID = req.cookies["user_id"];
  const user = users[userID];

  const permissionError = checkPermission (user, urlInfo, userID)
    if (permissionError) {
      return res.render("error", {user: user, error: permissionError});
    }


  const longURL = req.body.longURL;

  urlDatabase[id].longURL = longURL;
  
  res.redirect('/urls');
});

//cookies
app.post('/login', (req, res) => {
  const { email, password } = req.body;
  const user = getUserByEmail(email, users);

  if (user.password !== password) {
    return res.status(403).send("Password is incorrect.");
  }

  if (!user) {
    return res.status(403).send("User not found.");
  }

  res.cookie("user_id", user.id); 

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

  const userID = generateRandomString();
  const newUser = {
    id: userID,
    email,
    password
  };

  users[userID] = newUser;
  console.log("New user:", users);
  res.cookie("user_id", userID); 

  res.redirect("/urls");        
});

//Actions
app.listen(PORT, () => {
  console.log(`Example app listening on port ${PORT}!`);
});