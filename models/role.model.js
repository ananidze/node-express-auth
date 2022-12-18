const mongoose = require("mongoose")

const RoleSchmea = new mongoose.Schema({
    role: { type: String, required: true, unique: true },
    permissions: [String]
}, { versionKey: false })

module.exports = mongoose.model("Role", RoleSchmea)