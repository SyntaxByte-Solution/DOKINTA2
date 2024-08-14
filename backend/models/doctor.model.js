const mongoose = require("mongoose");
const { DOCTOR_PAYMENT_TYPE, DOCTOR_TYPE } = require("../types/constant");

const doctorSchema = new mongoose.Schema(
  {
    uniqueId: {
      type: Number,
      default: null,
    },

    name: { type: String, default: "" },
    image: { type: String, default: "" },
    email: { type: String, default: "" },
    password: String,
    age: { type: Number },
    mobile: { type: String, default: "" },
    gender: { type: String, default: "" },
    dob: { type: String, default: "" },

    isBlock: { type: Boolean, default: false },
    fcmToken: { type: String, default: "" },
    isDelete: { type: Boolean, default: false },

    bookingCount: { type: Number, default: 0 },
    currentBookingCount: { type: Number, default: 0 },
    wallet: { type: Number, default: 0 },
    totalWallet: { type: Number, default: 0 },

    service: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Service",
      },
    ],

    charge: { type: Number, default: 0 },
    commission: { type: Number, default: 0 },
    designation: { type: String, default: "" },
    degree: [{ type: String, default: "" }],
    language: [{ type: String, default: "" }],
    experience: { type: Number, default: 1 },
    type: { type: Number, default: 3, enum: DOCTOR_TYPE }, //offline online both

    latitude: { type: String, default: "" },
    longitude: { type: String, default: "" },
    country: { type: String, default: "" },
    clinicName: { type: String, default: "" },
    address: { type: String, default: "" },

    awards: [{ type: String, default: "" }],
    expertise: [{ type: String, default: "" }],
    yourSelf: { type: String, default: "" },
    education: { type: String, default: "" },
    experienceDetails: [{ type: String, default: "" }],

    reviewCount: { type: Number, default: 0 },
    rating: { type: Number, default: 0 },

    timeSlot: { type: Number, default: 30 },
    
    schedule: [
      {
        day: { type: String, default: "" },
        startTime: { type: String, default: "" },
        endTime: { type: String, default: "" },
        breakStartTime: { type: String, default: "" },
        breakEndTime: { type: String, default: "" },
        timeSlot: { type: Number, default: 30 },
      },
    ],

    paymentType: { type: Number, default: 1, enum: DOCTOR_PAYMENT_TYPE },
    bankDetails: {
      bankName: { type: String, default: "" },
      accountNumber: { type: String, default: "" },
      IFSCCode: { type: String, default: "" },
      branchName: { type: String, default: "" },
      image: { type: String, default: "" },
      name: { type: String, default: "" }
    },
    upiId: { type: String, default: "" },

    isAttend: { type: Boolean, default: false },
    showDialog: { type: Boolean, default: false },

    isBusy: { type: Boolean, default: false },
    isOnline:{ type: Boolean, default: false },
    callId: { type: String, default: "" }, //for videoCall

    oneSignalId: { type: String, default: "" },
  },
  {
    timestamps: true,
    versionKey: false,
  }
);

module.exports = mongoose.model("Doctor", doctorSchema);
