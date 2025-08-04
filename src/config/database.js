import mongoose from "mongoose";

const connectDB = async()=>{
  await mongoose.connect("mongodb+srv://seotrial2000:Seo_2000@kustom.tjcby3q.mongodb.net/");
}

export default connectDB;