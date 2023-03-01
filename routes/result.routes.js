const router = require("express").Router();
const Result = require("../models/result.model");

router.post("/result", async (req, res) => {
  try {
    const { titleEn, titleRu, descriptionEn, descriptionRu } = req.body;
    await Result.create({ titleEn, titleRu, descriptionEn, descriptionRu });
    res.status(201).json({ message: "Result created" });
  } catch (error) {
    console.log(error.message);
    res.status(500).send("Server Error");
  }
});

router.get("/result", async (req, res) => {
  try {
    const result = await Result.find().select("titleEn titleRu");
    if (!result) {
      return res.status(404).json({ message: "Result not found" });
    }

    res.json(result);
  } catch (error) {
    console.log(error.message);
    res.status(500).send("Server Error");
  }
});

router.get("/result/paginate/:page", async (req, res) => {
  try {
    const page = parseInt(req.params.page) || 1;
    const limit = parseInt(req.query.limit) || 10;

    const skip = (page - 1) * limit;
    const results = await Result.find()
      .select("titleEn titleRu")
      .skip(skip)
      .limit(limit);

    const totalResults = await Result.countDocuments().exec();
    const totalPages = Math.ceil(totalResults / limit);

    res.status(200).json({ results, totalPages });
  } catch (error) {
    console.log(error.message);
    res.status(500).send("Server Error");
  }
});

router.get("/result/:id", async (req, res) => {
  try {
    const result = await Result.findById(req.params.id).select(
      "descriptionEn descriptionRu"
    );
    if (!result) {
      return res.status(404).json({ message: "Result not found" });
    }

    res.json(result);
  } catch (error) {
    console.log(error.message);
    res.status(500).send("Server Error");
  }
});

router.get("/results/:title?", async (req, res) => {
  try {
    const title = req.params.title || "";
    const normalizedTitle = title
      .toUpperCase()
      .replace(/[-\/\\^$*+?.()|[\]{}]/g, "\\$&");
    if (title.length === 0) {
      const result = await Result.find()
        .select({
          title: {
            $cond: {
              if: {
                $regexMatch: { input: "$titleEn", regex: normalizedTitle },
              },
              then: "$titleEn",
              else: "$titleRu",
            },
          },
        })
        .limit(10);
      return res.json(result);
    }

    const result = await Result.find({
      $or: [
        { titleEn: { $regex: new RegExp(normalizedTitle, "i") } },
        { titleRu: { $regex: new RegExp(normalizedTitle, "i") } },
      ],
    })
      .select({
        title: {
          $cond: {
            if: {
              $regexMatch: {
                input: { $toLower: "$titleEn" },
                regex: new RegExp(normalizedTitle, "i"),
              },
            },
            then: "$titleEn",
            else: "$titleRu",
          },
        },
      })
      .limit(10);

    res.json(result);
  } catch (error) {
    console.log(error.message);
    res.status(500).send("Server Error");
  }
});

router.patch("/result/:id", async (req, res) => {
  try {
    const result = await Result.findById(req.params.id);
    if (!result) {
      return res.status(404).json({ message: "Result not found" });
    }

    await result.updateOne({ ...req.body });

    res.json(result);
  } catch (error) {
    console.log(error.message);
    res.status(500).send("Server Error");
  }
});

router.delete("/result/:id", async (req, res) => {
  try {
    const result = await Result.findById(req.params.id);
    if (!result) {
      return res.status(404).json({ message: "Result not found" });
    }

    await result.remove();
    res.json({ message: "Result deleted" });
  } catch (error) {
    console.log(error.message);
    res.status(500).send("Server Error");
  }
});

module.exports = router;
