const express = require("express");
const Products = require("./products.model");
const Reviews = require("../reviews/reviews.model");
const { verify } = require("jsonwebtoken");
const verifyToken = require("../middleware/verifyToken");
const verifyAdmin = require("../middleware/verifyAdmin");
const router = express.Router();

//post a product 

router.post("/create-product", async (req, res) => {
    try {
        const newProduct = new Products({
            ...req.body
        })
        const savedProduct = await newProduct.save();
        //calculate reviews
        const reviews = await Reviews.find({ ProductId: savedProduct.id });
        if (reviews.length > 0) {
            const totalRting = reviews.reduce(
                (acc, review) => acc + review.rating, 0);
            const averageRating = totalRting / reviews.length;
            savedProduct.rating = averageRating;
            await savedProduct.save();
        }

        res.status(201).send(savedProduct);

    } catch (error) {
        console.error("Error creating product:", error);
        res.status(500).send({
            message: "An error occurred while creating the product.",
            error: error.message,
        });
    }
});

//get all products
router.get("/", async (req, res) => {

    try {
        const {
            category,
            color,
            minPrice,
            maxPrice,
            page = 1,
            limit = 10,
        } = req.query;
        let filter = {};
        if (category && category !== "all") {
            filter.category = category;
        }
        if (color && color !== "all") {
            filter.color = color;
        }
        if (minPrice && maxPrice) {
            const min = parseFloat(minPrice);
            const max = parseFloat(maxPrice);
            if (!isNaN(min) && !isNaN(max)) {
                filter.price = { $gte: min, $lte: max };
            }
        }

        const skip = (parseInt(page) - 1) * parseInt(limit);
        const totalProducts = await Products.countDocuments(filter);
        const totalPages = Math.ceil(totalProducts / parseInt(limit));
        const products = await Products
            .find(filter)
            .skip(skip)
            .limit(parseInt(limit))
            .populate("author", "email")
            .sort({ createdAt: -1 });
        res.status(200).send({ products, totalPages, totalProducts })

    } catch (error) {
        console.error("Error frtching products", error);
        res.status(500).send({
            message: "An error occurred while frtching the products.",
            error: error.message,
        });
    }
})

//get single product
router.get("/:id", async (req, res) => {
    try {

        const productId = req.params.id;
        console.log("Product ID from route:", productId);
        const product = await Products.findById(productId).populate("author", "email username")

        if (!product) {
            return res.status(404).send({ message: "Product not found" })
        }
        const reviews = await Reviews.find({ productId }).populate("userId", "username email");
        res.status(200).send({ product, reviews })
    } catch (error) {
        console.error("Error frtching product", error);
        res.status(500).send({
            message: "An error occurred while frtching the product.",
            error: error.message,
        });
    }

})

//update a product  
router.patch("/update-product/:id", verifyToken, verifyAdmin, async (req, res) => {
    try {

        const productId = req.params.id;
        const updatedProduct = await Products.findByIdAndUpdate(productId, { ...req.body }, { new: true })

        if (!updatedProduct) {
            return res.status(404).send({ message: "Product not found" });
        }

        res.status(200).send({
            message: "Product updated seccussfull",
            product: updatedProduct
        })


    } catch (error) {
        console.error("Error updating the product", error);
        res.status(500).send({
            message: "An error occurred while update the product.",
            error: error.message,
        });
    }

})

//delete a product routes

router.delete("/:id", async (req, res) => {


    try {
        const productId = req.params.id;
        const deletedProduct = await Products.findByIdAndDelete(productId);
        await Reviews.deleteMany({ productId: productId })
        return res.status(404).send({ message: "Product not found" });
      

    } catch (error) {
        console.error("Error Deleting the product", error);
        res.status(500).send({
            message: "An error occurred Deleting the product.",
            error: error.message,
        });
    }
})
//get related product
router.get("/related/:id", async (req, res) => {

    try {

        const { id } = req.params;
        if (!id) {
            return res.status(400).send({ message: "Product ID is not found" });
        }
        const product = await Products.findById(id)
        if (!product) {
            return res.status(404).send({ message: "Product is not found" });
        }

        const titleRegex = new RegExp(
            product.name
                .split(" ")
                .filter((word) => word.length > 1)
                .join("|"),
            "i"
        );
        const relatedProducts = await Products.find({
            id: { $ne: id },
            $or: [
                { name: { $regex: titleRegex } },
                { category: product.category },
            ]
        })


        res.status(200).send(relatedProducts);


    } catch (error) {
        console.error("Error fetching related product", error);
        res.status(500).send({
            message: "Failed to fetching related product.",
            error: error.message,
        });
    }

})



module.exports = router