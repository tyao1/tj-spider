import mongoose from 'mongoose';

const {Schema} = mongoose;

function randomLoc() {
  return [Math.random(), 0];
}

const userSchema = new Schema({
  // 用户名 最长10字符
  id: {
    type: String,
    index: true,
    unique: true,
  },
  birthday: String,
  sections: [{
    type: String,
    index: true,
  }],
  phone: {
    type: String,
    index: true,
  },
  department: String,
  emails: {
    type: String,
    index: true,
  },
  gender: {
    type: Number,
    index: true,
  },
  isAdmin: {
    type: Number,
  },
  isPartJob: {
    type: Number,
  },
  jobTitle: {
    type: String,
  },
  lastUpdateTime: {
    type: Date,
    default: Date.now,
  },
  name: String,
  oId: String,
  officePhone1: String,
  openId: String,
  orgId: String,
  orgInfoId: String,
  orgLongName: String,
  orgUserType: {
    type: Number,
  },
  photoUrl: String,
  status: Number,
  userType: Number,
  wbNetworkId: String,
  wbUserId: String,
  weights: Number,
});

const userModel = mongoose.model('User', userSchema);

export default userModel;
