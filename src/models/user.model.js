import mongoose from "mongoose";
import bcrypt from "bcrypt";
const userSchema = new mongoose.Schema(
  {
    email: {
      type: String,
      required: [true, "Email is necessary for creating an account"],
      trim: true,
      lowercase: true,
      match: [
        /^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/,
        "Invalid email address",
      ],
      unique: [true, "Email is already exists"],
    },
    name: {
      type: String,
      required: [true, "Name is necessary for creating an account"],
    },
    password: {
      type: String,
      required: [true, "Password is necessary for creating a account"],
      minlength: [5, "Password must be 5 or more characters long"],
      select: false, // By doing this unless i am calling password exclusively it will not appear inside user's data
    },
    systemUser: {
      type: Boolean,
      default: false,
      immutable: true,
      select: false,
    },
  },
  {
    timestamps: true,
  }
);

// This is called a pre-save hook.
//It runs automatically before saving a document.

userSchema.pre("save", async function () {
  if (!this.isModified("password")) return;
  const hash = await bcrypt.hash(this.password, 10);
  this.password = hash;
});

//This creates a custom method on every user document
userSchema.methods.comparePassword = async function (password) {
  return await bcrypt.compare(password, this.password);
};

const userModel = mongoose.model("user", userSchema);
export default userModel;
