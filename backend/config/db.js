import mongoose from "mongoose";

const connectDB = async () => {
  mongoose.connection.on("connected", () => {
    console.log("Database is connected");
  });
  await mongoose.connect(`${process.env.MONGO_URI}/manish-project`);
};

export default connectDB;
