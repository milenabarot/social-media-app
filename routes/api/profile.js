const express = require("express");
const router = express.Router();
const axios = require("axios");
const config = require("config");
const auth = require("../../middleware/auth");
const Profile = require("../../models/Profile");
const User = require("../../models/User");
const Post = require("../../models/Post");

const { check, validationResult } = require("express-validator");
// bring in normalize to give us a proper url, regardless of what user entered
// TO DO normalize stuff later on
// import normalizeUrl from "normalize-url";

// @route   GET api/profile/me
// @desc    get current users profile
// @access  Private - so will use auth

router.get("/me", auth, async (req, res) => {
  try {
    // find by user, the user is pertaining to profile model user field, which is object ID of the user
    // so set that to the user.id that comes with the token
    // populate this with the name of user & avatar, which are in the user model
    // 1st parameter is the user and 2nd is the array of fields want to bring in from user
    const profile = await Profile.findOne({ user: req.user.id }).populate(
      "user",
      ["name", "avatar"]
    );
    if (!profile) {
      return res.status(400).json({ msg: "There is no profile for this user" });
    }
    res.json(profile);
  } catch (err) {
    console.error(err.message);
    res.status(500).send("Server Error");
  }
});

// @route   POST api/profile
// @desc    Create or update a user profile
// @access  Private - so will use auth

router.post(
  "/",

  auth,
  check("status", "Status is required").notEmpty(),
  check("skills", "Skills is required").notEmpty(),

  async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      console.log(req.body);

      return res.status(400).json({ errors: errors.array() });
    }

    const {
      company,
      website,
      location,
      bio,
      status,
      githubusername,
      skills,
      youtube,
      facebook,
      twitter,
      instagram,
      linkedin,
    } = req.body;

    // Build profile object
    const profileFields = {};
    profileFields.user = req.user.id;
    if (company) profileFields.company = company;
    if (website) profileFields.website = website;
    if (location) profileFields.location = location;
    if (bio) profileFields.bio = bio;
    if (status) profileFields.status = status;
    if (githubusername) profileFields.githubusername = githubusername;
    if (skills)
      profileFields.skills = skills.split(",").map((skill) => skill.trim());

    //Build social object
    profileFields.social = {};
    if (youtube) profileFields.social.youtube = youtube;
    if (twitter) profileFields.social.twitter = twitter;
    if (facebook) profileFields.social.facebook = facebook;
    if (linkedin) profileFields.social.linkedin = linkedin;
    if (instagram) profileFields.social.instagram = instagram;

    try {
      // user.id coming from token
      let profile = await Profile.findOne({ user: req.user.id });

      if (profile) {
        //if there is a profile then update it
        profile = await Profile.findOneAndUpdate(
          { user: req.user.id },
          { $set: profileFields },
          { new: true }
        );

        return res.json(profile);
      }
      // Create a profile
      profile = new Profile(profileFields);

      await profile.save();
      res.json(profile);
    } catch (err) {
      console.error(err.message);
      res.status(500).send("Server Error");
    }
  }
);

// @route   GET api/profile
// @desc    Get all profiles
// @access  Public

router.get("/", async (req, res) => {
  try {
    // finds profiles, and use populate to populate the user key with the name
    // and avatar from the User schema
    const profiles = await Profile.find().populate("user", ["name", "avatar"]);
    res.json(profiles);
  } catch (err) {
    console.error(err.message);
    res.status(500).send("Server Error");
  }
});

// @route   GET api/profile/user/:user_id
// @desc    Get profile by user ID
// @access  Public

router.get("/user/:user_id", async (req, res) => {
  try {
    const profile = await Profile.findOne({
      user: req.params.user_id,
    }).populate("user", ["name", "avatar"]);
    if (!profile) return res.status(400).json({ msg: "Profile not found" });

    res.json(profile);
  } catch (err) {
    console.error(err.message);
    if (err.kind == "ObjectId") {
      return res.status(400).json({ msg: "Profile not found" });
    }
    res.status(500).send("Server Error");
  }
});

// @route   DELETE api/profile
// @desc    Delete profile, user and posts
// @access  Private

router.delete("/", auth, async (req, res) => {
  try {
    // pass in user which is object ID, which we match to the request user ID
    // as this is private, so we have access to the token

    // Remove user posts
    await Post.deleteMany({ user: req.user.id });

    // Remove profile
    // ** TO DO - remove users posts
    await Profile.findOneAndRemove({ user: req.user.id });
    // Remove user, but going into the _id property which is in the User model
    await User.findOneAndRemove({ _id: req.user.id });

    res.json({ msg: "User deleted" });
  } catch (err) {
    console.error(err.message);
    res.status(500).send("Server Error");
  }
});

//EXPERIENCE

// @route   PUT api/profile/experience
// @desc    Add profile experience (so updating the profile model)
// @access  Private

// need validation, as on the FE we will have a form to add experience fields

router.put(
  "/experience",
  [
    auth,
    check("title", "Title is required").notEmpty(),
    check("company", "Company is required").notEmpty(),
    check("from", "From date is required").notEmpty(),
  ],
  async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { title, company, location, from, to, current, description } =
      req.body;

    // creates new Experience object
    const newExp = {
      // title: req.body.title,
      title,
      company,
      location,
      from,
      to,
      current,
      description,
    };

    try {
      const profile = await Profile.findOne({ user: req.user.id });

      // pushes the most recent newExp onto the beginning
      profile.experience.unshift(newExp);

      await profile.save();
      res.json(profile);
    } catch (err) {
      console.error(err.message);
      res.status(400).json("Server Error");
    }
  }
);

// @route   DELETE api/profile/experience/:exp_id  (colon as its a placeholder)
// @desc    Delete experience from profile
// @access  Private

router.delete("/experience/:exp_id", auth, async (req, res) => {
  try {
    const profile = await Profile.findOne({ user: req.user.id });

    // need to get correct experience to remove
    // Get remove Index
    const arrayOfIds = profile.experience.map((item) => item.id);

    const removeIndex = arrayOfIds.indexOf(req.params.exp_id);

    profile.experience.splice(removeIndex, 1);

    await profile.save();
    res.json(profile);
  } catch {
    console.error(err.message);
    res.status(400).json("Server Error");
  }
});

//EDUCATION

// @route   PUT api/profile/education
// @desc    Add profile education (so updating the profile model)
// @access  Private

// need validation, as on the FE we will have a form to add education fields

router.put(
  "/education",
  [
    auth,
    check("school", "School is Required").notEmpty(),
    check("degree", "Degree is required").notEmpty(),
    check("fieldofstudy", "Field Of Study is required").notEmpty(),
    check("from", "From date is required").notEmpty(),
  ],
  async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { school, degree, fieldofstudy, from, to, current, description } =
      req.body;

    // creates new Experience object
    const newEdu = {
      // title: req.body.title,
      school,
      degree,
      fieldofstudy,
      from,
      to,
      current,
      description,
    };

    try {
      const profile = await Profile.findOne({ user: req.user.id });

      // pushes the most recent newEdu onto the beginning
      profile.education.unshift(newEdu);

      await profile.save();
      res.json(profile);
    } catch (err) {
      console.error(err.message);
      res.status(400).json("Server Error");
    }
  }
);

// @route   DELETE api/profile/education/:edu_id  (colon as its a placeholder)
// @desc    Delete education from profile
// @access  Private

router.delete("/education/:edu_id", auth, async (req, res) => {
  try {
    const profile = await Profile.findOne({ user: req.user.id });

    // need to get correct education to remove
    // Get remove Index
    const arrayOfIds = profile.education.map((item) => item.id);

    const removeIndex = arrayOfIds.indexOf(req.params.edu_id);

    profile.education.splice(removeIndex, 1);

    await profile.save();
    res.json(profile);
  } catch {
    console.error(err.message);
    res.status(400).json("Server Error");
  }
});

// To take a Github username, make a request to our BE, and then make a request
// to the GitHub API to get the repositories

// @route   GET api/profile/github/:username
// @desc    Get user repos from Github
// @access  Public

router.get("/github/:username", async (req, res) => {
  try {
    const uri = encodeURI(
      `https://api.github.com/users/${req.params.username}/repos?per_page=5&sort=created:asc`
    );

    const headers = {
      "user-agent": "node.js",
      Authorization: `token ${config.get("githubToken")}`,
    };

    const gitHubResponse = await axios.get(uri, { headers });
    return res.json(gitHubResponse.data);
  } catch (err) {
    console.error(err.message);
    return res.status(404).json({ msg: "No Github profile found" });
  }
});

module.exports = router;
