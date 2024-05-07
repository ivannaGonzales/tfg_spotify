
const { Schema, model } = require("mongoose");
const mongoosePaginate = require('mongoose-paginate-v2');


const UserSchema = Schema({
    name: {
        type: String,
        required: true,
    },

    surname: String,

    bio: String,

    nick: {
        type: String,
        required: true,
    },

    email: {
        type: String,
        required: true,
    },

    password: {
        type: String,
        required: true,
        select: false
    },

    role: {
        type: String,
        default: "role_user",
        select: false
    },

    image: {
        type: String,
        default: "default.png",
    },

    created_at: {
        type: Date,
        default: Date.now,
    },
});

UserSchema.plugin(mongoosePaginate);
module.exports = model("User", UserSchema, "users"); // aqui por defecto pero yo se lo puse por si acaso

// coleccion : User --> user --> users (por defecto)
