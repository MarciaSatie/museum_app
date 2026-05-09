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

    async incrementLike(commentId: string, userId: string) {
        await SocialModel.findByIdAndUpdate(commentId, {
          // $inc: MongoDb Operator, used to increase or decrease values (1 -> to increase; -1 -> to decrease)  
          $inc: { like: 1 },
          // $addToSet: MongoDb Operator, only adds if the ID isn't already there
          $addToSet: { likedList: userId }
        });
      },
    
      // Remove a user from the like list (if they "unlike")
      async decrementLike(commentId: string, userId: string) {
        await SocialModel.findByIdAndUpdate(commentId, {
          $inc: { like: -1 },
          // $pull: MongoDb Operator, removes all instances of this value from the array
          $pull: { likedList: userId }
        });
      },

      async incrementDislike(commentId: string, userId: string) {
        await SocialModel.findByIdAndUpdate(commentId, {
          // $inc: MongoDb Operator, used to increase or decrease values (1 -> to increase; -1 -> to decrease)  
          $inc: { dislike: 1 },
          // $addToSet: MongoDb Operator, only adds if the ID isn't already there
          $addToSet: { dislikedList: userId }
        });
      },
    
      // Remove a user from the like list (if they "unlike")
      async decrementDislike(commentId: string, userId: string) {
        await SocialModel.findByIdAndUpdate(commentId, {
          $inc: { dislike: -1 },
          // $pull: MongoDb Operator, removes all instances of this value from the array
          $pull: { dislikedList: userId }
        });
      },


      async isLikedByUser(commentId: string, userId: string): Promise<boolean> {
        try {
          // 1. Search by _id (which is what MongoDB uses)
          const comment: any = await SocialModel.findById(commentId).lean();
          if (!comment || !comment.likedList) return false;
      
          // 2. Check if the string exists in the array
          return comment.likedList.includes(String(userId));
        } catch (error) {
          return false;
        }
      },
      

    async isDislikedByUser(commentId: string, userId: string): Promise<boolean> {
        try {
            // 1. Search by _id (which is what MongoDB uses)
            const comment: any = await SocialModel.findById(commentId).lean();
            if (!comment || !comment.dislikedList) return false;
        
            // 2. Check if the string exists in the array
            return comment.dislikedList.includes(String(userId));
          } catch (error) {
            return false;
          }
    },
      
  };
  