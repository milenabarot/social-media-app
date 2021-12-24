const express = require("express");
const router = express.Router();
const { check, validationResult } = require("express-validator");
const auth = require("../../middleware/auth");
const Profile = require("../../models/Profile");
const User = require("../../models/User");
const Post = require("../../models/Post");

// @route   POST api/posts
// @desc    Create a post
// @access  Private

router.post(
  "/",
  [auth, [check("text", "Text is required").notEmpty()]],

  async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    try {
      // need to get the user itself
      // we are logged in, so have the token, which gives us the user ID
      // and puts it inside of the request user ID so we can use that
      const user = await User.findById(req.user.id).select("-password");

      const newPost = new Post({
        text: req.body.text,
        name: user.name,
        avatar: user.avatar,
        user: req.user.id,
      });

      const post = await newPost.save();
      res.json(post);
    } catch (err) {
      console.error(err.message);
      res.status(500).send("Server Error");
    }
  }
);

// @route   GET api/posts
// @desc    Get all posts
// @access  Private

router.get("/", auth, async (req, res) => {
  try {
    const posts = await Post.find().sort({ date: -1 });
    res.json(posts);
  } catch (err) {
    console.error(err.message);
    res.status(500).send("Server Error");
  }
});

// @route   GET api/posts/:id
// @desc    Get post by ID
// @access  Private

router.get("/:id", auth, async (req, res) => {
  try {
    // req.params.id allows us to get the id from the URL
    const post = await Post.findById(req.params.id);

    if (!post) {
      return res.status(404).json({ msg: "Post not found" });
    }

    res.json(post);
  } catch (err) {
    console.error(err.message);
    // check to see if its the correct formatted ID passed in
    if (err.kind === "ObjectId") {
      return res.status(404).json({ msg: "Post not found" });
    }

    res.status(500).send("Server Error");
  }
});

// @route   DELETE api/posts/:id
// @desc    Delete a post
// @access  Private

router.delete("/:id", auth, async (req, res) => {
  try {
    const post = await Post.findById(req.params.id);

    // if the post doesn't exist
    if (!post) {
      return res.status(404).json({ msg: "Post not found" });
    }

    //Check user
    //need to make sure the user that owns the post is able to delete their own post
    // have to convert the post.user to a string as it is currently an object, as
    // comparing it to req.user.id which is a string
    if (post.user.toString() !== req.user.id) {
      return res.status(401).json({ msg: "User not authorized" });
    }

    await post.remove();

    res.json({ msg: "Post removed" });
  } catch (err) {
    console.error(err.message);
    if (err.kind === "ObjectId") {
      return res.status(404).json({ msg: "Post not found" });
    }
    res.status(500).send("Server Error");
  }
});

//** LIKES **

// @route   PUT api/like/:id
// @desc    Like a post
// @access  Private

router.put("/like/:id", auth, async (req, res) => {
  try {
    const post = await Post.findById(req.params.id);

    //Check if the post has already been liked by this user
    console.log(post.likes, req.user.id);
    if (post.likes.some((like) => like.user.toString() === req.user.id)) {
      return res.status(400).json({ msg: "Post already liked" });
    }
    post.likes.unshift({ user: req.user.id });
    await post.save();
    return res.json(post.likes);
  } catch (err) {
    console.error(err.message);
    res.status(500).send("Server Error");
  }
});

// @route   PUT api/unlike/:id
// @desc    Unlike a post
// @access  Private

router.put("/unlike/:id", auth, async (req, res) => {
  try {
    const post = await Post.findById(req.params.id);
    const userOfUnliker = await User.findById(req.user.id);
    const { name: nameOfUnliker } = userOfUnliker;
    // const nameOfUnliker = userOfUnliker.name;

    //Check if the post has already been liked by this user
    // because user can't dislike a post they haven't liked

    const hasUserLikedPost = post.likes.some(
      (like) => like.user.toString() === req.user.id
    );
    console.log(post.likes, req.user.id);

    if (hasUserLikedPost === false) {
      return res
        .status(400)
        .json({ msg: `Post has not yet been liked by ${nameOfUnliker}` });
    }

    // remove the like
    // update the like array with only the users that still like the post

    post.likes = post.likes.filter((like) => {
      const isUserUnlikingPost = like.user.toString() === req.user.id;
      if (isUserUnlikingPost) {
        return false;
      }
      return true;
      // like.user.toString() !== req.user.id
    });

    await post.save();

    return res.json(post.likes);
  } catch (err) {
    console.error(err.message);
    res.status(500).send("Server Error");
  }
});

module.exports = router;
