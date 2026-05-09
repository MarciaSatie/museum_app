import { v4 } from "uuid";
// Note: We import the Model as 'UserModel' to avoid name collision with the 'UserType' type
import { SocialModel, type SocialType} from "./social"; 

const normalizeUser = (user: any): SocialType | null => {
    if (user && user._id) {
      return { ...user, _id: String(user._id) };
    }
    return user;
  };

  
  export const socialMongoStore = {
    // ADD THIS FUNCTION
    async getAllComments() {
      return await SocialModel.find().lean();
    },
  
    async getCommentsByGalleryId(id: string) {
      return await SocialModel.find({ galleryOwnerId: id }).lean();
    },
  
    async addComment(commentData: any) {
      const newComment = new SocialModel(commentData);
      const commentObj = await newComment.save();
      return commentObj;
    },
  };
  