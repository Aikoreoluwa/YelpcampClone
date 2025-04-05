import mongoose from "mongoose";
const { Schema } = mongoose;

const reviewSchema = new Schema({
    body: String,
    rating: Number,
    creator: {
        type: Schema.Types.ObjectId,
        ref: "User"
    }
});

export default mongoose.model("Review", reviewSchema);