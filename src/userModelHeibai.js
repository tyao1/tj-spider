import mongoose from 'mongoose';

const {Schema} = mongoose;


const userSchema = new Schema({
  user_id: {
    type: String,
    index: true,
    unique: true,
  },
	user_name: String,
	"user_sex": String,
	"user_age": Number,
	"user_v": Number,
	"school": {
    type: String,
    index: true,
  },
	"schoolid": Number,
	"major": String,
	"desc": String,
	"user_icon": String,
	"user_icon_b": String,
	"user_icon_m": String,
	"bg_img": String,
	"pictopic_count": Number,
	"liketopic_count": Number,
	"user_status": Schema.Types.Mixed,
	"total_attention_me": Number,
	"total_attention": Number,
	"is_attention": Number
});

const userModel = mongoose.model('UserHeibai', userSchema);

export default userModel;
