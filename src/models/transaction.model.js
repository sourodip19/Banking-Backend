import mongoose from "mongoose";
const transactionSchema = new mongoose.Schema({
    fromAccount:{
        type:mongoose.Schema.Types.ObjectId,
        ref:'account',
        required:[true,'Transaction should be associated with a from account'],
        index:true
    },
    toAccount:{
        type:mongoose.Schema.Types.ObjectId,
        ref:'account',
        required:[true,'Transaction should be associated with a to account'],
        index:true
    },
    status:{
        type:String,
        enum:{
            values:["PENDING","COMPLETED","FAILED","REVERSED"]
        },
        default:'PENDING'
    },
    amount:{
        type:Number,
        required:[true,'An amount is required to initiate a transaction'],
        min:[1,'Transaction amount can not less than be 1']
    },
    idempotencykey:{
        type:String,
        required:[true,'IdemPotencyKey is required for a valid transaction'],
        unique:true,
        index:true
    }
},{
    timestamps:true
})

const transactionModel = mongoose.model("transaction",transactionSchema);
export default transactionModel;