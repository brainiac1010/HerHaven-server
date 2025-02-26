const verifyAdmin = (req, res, next) => {

    if (req.role !== 'admin') {
        return res.status(403).send({ success: false, massage: "you are not allow to perform this action" })
    }

    next();
}

module.exports = verifyAdmin
