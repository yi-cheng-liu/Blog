const express = require('express');
const app = express();

const cors = require('cors');
const User = require("./models/User");
const Post = require("./models/Post");
const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const cookieParser = require('cookie-parser');
const multer = require('multer');
const uploadMiddleware = multer({ dest: 'uploads/' })

const fs = require('fs');

const salt = bcrypt.genSaltSync(10);
const secret = "mysecretssdfgdsfgdsghhh";

app.use(cors({credentials: true, origin: 'http://localhost:3000'}));
app.use(express.json());
app.use(cookieParser());
app.use('/uploads', express.static(__dirname + '/uploads'));


mongoose
  .connect(
    "mongodb+srv://liuyiche:mGgOLYs4zDC2BQMh@cluster0.lr5dipb.mongodb.net/?retryWrites=true&w=majority"
  )
  .then(() => {
    console.log("Connected to MongoDB");
  })
  .catch((error) => {
    console.error("MongoDB connection error:", error);
  });

app.post("/register", async (req, res) => {
  try {
    const { username, password } = req.body;
    const userDoc = await User.create({
      username,
      password: bcrypt.hashSync(password, salt),
    });
    res.json(userDoc);
  } catch (error) {
    console.error("Error creating user:", error);
    console.log(error);
    res.status(500).json({ error: "Error creating user" });
  }
});

app.post("/login", async (req, res) => {
  try {
    const { username, password } = req.body;
    const userDoc = await User.findOne({ username });
    const passOk = bcrypt.compareSync(password, userDoc.password);

    if (!userDoc) {
      return res.status(404).json({ error: "User not found" });
    }

    const passwordMatch = bcrypt.compareSync(password, userDoc.password);
    if (!passwordMatch) {
      return res.status(401).json({ error: "Invalid password" });
    }

    // logged in
    if (passOk) {
      jwt.sign({ username, id: userDoc._id }, secret, {}, (err, token) => {
        if (err) throw err;
        res.cookie('token', token).json({
          id: userDoc._id,
          username,
        });
      });
    }
  }
  catch (error) {
    console.error("Error logging in:", error);
    res.status(500).json({ error: "Error logging in" });
  } 
});

app.get('/profile', (req, res) => { 
  const { token } = req.cookies;
  jwt.verify(token, secret, {}, (err, info) => {
    if (err) throw err;
    res.json(info);
  });
})

app.post('/logout', (req, res) => {
  res.cookie('token', '').json('logged out');
})

app.post('/post', uploadMiddleware.single('file'), async (req, res) => { 
  if (req.file) {
    const { originalname, path } = req.file;
    const parts = originalname.split(".");
    const ext = parts[parts.length - 1];
    newPath = path + "." + ext;
    fs.renameSync(path, newPath);
    const { token } = req.cookies;
    jwt.verify(token, secret, {}, async(err, info) => {
      if (err) throw err;
      const { title, summary, content } = req.body;
      const postDoc = await Post.create({
        title, summary, content, cover: newPath, author:info.id,
      })
      res.json(postDoc);
    });
  }

  
})

app.get('/post', async (req, res) => { 
  res.json(
    await Post.find()
      .populate('author', ['username'])
      .sort({ createdAt: -1 })
      .limit(20)
  );
})

app.get('/post/:id', async (req, res) => {
  const { id } = req.params;
  const postDoc = await Post.findById(id).populate('author', ['username']);
  res.json(postDoc);
});
 
app.put("/post", uploadMiddleware.single("file"), async (req, res) => {
  // let newPath = null;
  // if (req.file) {
  //   const { originalname, path } = req.file;
  //   const parts = originalname.split(".");
  //   const ext = parts[parts.length - 1];
  //   newPath = path + "." + ext;
  //   fs.renameSync(path, newPath);
  // }

  // const { token } = req.cookies;
  // jwt.verify(token, secret, {}, async (err, info) => {
  //   if (err) throw err;
  //   const { id, title, summary, content } = req.body;
  //   const postDoc = await Post.findById(id);
  //   const isAuthor = JSON.stringify(postDoc.author) === JSON.stringify(info.id);
  //   if (!isAuthor) {
  //     return res.status(400).json("you are not the author");
  //   }
  //   await postDoc.update({
  //     title,
  //     summary,
  //     content,
  //     cover: newPath ? newPath : postDoc.cover,
  //   });

    res.json(postDoc);
  // });
});

app.listen(4000, () => {
  console.log("Server listening on port 4000");
});