import mongoose from "mongoose";

//video의 형식 정의(실제 object는 아님)
const videoSchema = new mongoose.Schema({
  title: { type: String, required: true, trim: true, maxLength: 80 },
  fileUrl: { type: String, require: true },
  thumbUrl: { type: String, required: true },
  description: { type: String, required: false, trim: true },
  createdAt: { type: Date, required: true, default: Date.now },
  hashtags: [{ type: String, trim: true }],
  meta: {
    views: { type: Number, default: 0, required: true },
    rating: { type: Number, default: 0, required: true },
  },
  comments: [{ type: mongoose.Schema.Types.ObjectId, ref: "Comment" }],
  owner: { type: mongoose.Schema.Types.ObjectId, required: true, ref: "User" },
});

videoSchema.static("formatHashtags", function (hashtags) {
  return hashtags
    .split(",")
    .map((word) => (word.startsWith("#") ? word : `#${word}`));
});

const Video = mongoose.model("Video", videoSchema); //만든 형식으로 model 만들어줌 (modelname, schema=data 형태)
export default Video; //default로 export
