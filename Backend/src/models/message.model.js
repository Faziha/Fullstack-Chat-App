import mongoose from "mongoose";


//creation of schema
const messageScheme = new mongoose.Schema({
    senderId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User", //reference to User model
        required: true
    },

    receiverId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User", //reference to User model
        required: true
    },

    text: {
        type: String
    },

    image: {
        type: String
    },
},
{
    timestamps: true
});

//creation of model
const Message = mongoose.model("Message",messageScheme)

export default Message;
