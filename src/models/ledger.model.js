import mongoose from "mongoose";
const ledgerSchema = new mongoose.Schema({
  account: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "account",
    required: [true, "ledger must be associated with an account"],
    immutable: true,
    index: true,
  },
  transaction: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "transaction",
    required: [true, "Ledger must be associated with a transaction"],
    index: true,
    immutable: true,
  },
  amount: {
    type: Number,
    required: [true, "Amount is required for ledger"],
    min: [1, "Amount can not be less than 1"],
    immutable: true,
  },
  type: {
    type: String,
    enum: {
      values: ["CREDIT", "DEBIT"],
      message: "Type can be either credit or debit",
    },
    required: [true, "Ledger type is required"],
    immutable: true,
  },
},{
    timestamps:true
});

const preventLedgerModification = () => {
  throw new Error("Ledger are immutable and can not be edited or deleted");
};
ledgerSchema.pre('findOneAndUpdate',preventLedgerModification);
ledgerSchema.pre('findOneAndReplace',preventLedgerModification);
ledgerSchema.pre('updateOne',preventLedgerModification);
ledgerSchema.pre('updateMany',preventLedgerModification);
ledgerSchema.pre('findOneAndDelete',preventLedgerModification);
ledgerSchema.pre('deleteMany',preventLedgerModification);
ledgerSchema.pre('deleteOne',preventLedgerModification);


const ledgerModel = mongoose.model("ledger",ledgerSchema);
export default ledgerModel;