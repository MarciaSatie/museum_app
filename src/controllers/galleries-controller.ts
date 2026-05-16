import * as nodemailer from "nodemailer";
import dotenv from "dotenv";
import { Request, ResponseToolkit } from "@hapi/hapi";
import { db } from "../models/db";
import type { UserType } from "../models/mongo/user";
import type { MuseumType } from "../models/mongo/museum";
import type { ExhibitionType } from "../models/mongo/exhibition";
import type { CategoryType } from "../models/mongo/category";

dotenv.config();

interface EnrichedImage {
  id: string;
  image: string | undefined;
  url: string;
  museumTitle: string;
  exhibitionTitle: string;
  date: string;
  userName: string;
  userEmail: string;
  size: string;
  user: UserType | null;
  museum: MuseumType | null;
  exhibition: ExhibitionType | null;
  categories: CategoryType[];
}

interface UserGallery {
  userId: string;
  userName: string;
  userEmail: string;
  images: EnrichedImage[];
  comments?: any[];
}

interface MuseumWithOwnerAndLatestImage extends MuseumType {
  ownerFirstName: string;
  ownerLastName: string;
  latestImageUrl: string | null;
  latestImageName: string;
}

/**
 * Build a fast lookup map from user id to user object.
 * This makes it easy to find the owner of a museum or image without looping
 * through the whole users array every time.
 */
function buildUserMap(users: UserType[]) {
  // Fast lookup: user id -> user object.
  return new Map<string, UserType>(users.map((user: UserType) => [user._id!, user]));
}

/**
 * Build a fast lookup map from museum id to museum object.
 * This is used when we need to attach museum data to an image or comment.
 */
function buildMuseumMap(museums: MuseumType[]) {
  // Fast lookup: museum id -> museum object.
  return new Map<string, MuseumType>(museums.map((museum: MuseumType) => [museum._id!, museum]));
}

/**
 * Extract the ids of all public museums into a Set.
 * The Set lets us check `has()` quickly when we decide which images are allowed.
 */
function getPublicMuseumIds(museums: MuseumType[]) {
  // Set gives quick `.has()` checks when we filter images.
  return new Set(museums.filter((museum: any) => museum.status === "public").map((museum: any) => museum._id));
}

/**
 * Find the newest image for each public museum.
 * The result is stored in a Map so we can later attach the latest image URL
 * to the matching museum in constant time.
 */
function getLatestImageByMuseum(mongoImages: any[], publicMuseumIds: Set<string>) {
  // Map lets us keep only the newest image for each museum.
  const latestImageByMuseum = new Map<string, any>();

  for (const image of mongoImages) {
    if (!image.museum || !publicMuseumIds.has(image.museum)) continue;

    const currentImage = latestImageByMuseum.get(image.museum);
    const currentTime = new Date(image.createdAt || image.uploadDate || 0).getTime();
    const savedTime = currentImage ? new Date(currentImage.createdAt || currentImage.uploadDate || 0).getTime() : 0;

    if (!currentImage || currentTime > savedTime) {
      latestImageByMuseum.set(image.museum, image);
    }
  }

  return latestImageByMuseum;
}

/**
 * Add owner name and latest image information to each museum.
 * This prepares the data for the template so the view stays simple.
 */
function enrichMuseumsWithOwnerAndImage(
  museums: MuseumType[],
  userMap: Map<string, UserType>,
  latestImageByMuseum: Map<string, any>
) {
  return museums.map((museum: any) => {
    const owner = userMap.get(museum.userid) || null;
    const latestImage = latestImageByMuseum.get(museum._id);

    const starList = museum.reviewList;
    const countingStart = starList.reduce((total:Number, item:any)=> total +item.starNumber,0 );
    const rawAVG = starList.length > 0 ? countingStart / starList.length : 0;
    const starsAVG = Number(rawAVG.toFixed(1)); // Number() converts the string from toFixed back into a number
    
    return {
      ...museum,
      ownerFirstName: owner?.firstName || "Unknown",
      ownerLastName: owner?.lastName || "Unknown",
      latestImageUrl: latestImage?.url || null,
      latestImageName: latestImage?.image || "",
      starsAVG : starsAVG,
      totalRating: starList.length ||0,
    } as MuseumWithOwnerAndLatestImage;
  });
}

/**
 * Convert raw image documents into view-friendly image objects.
 * We also attach the owner, museum, and category data so the template can
 * render richer information without extra logic.
 */
function buildEnrichedImages(
  mongoImages: any[],
  userMap: Map<string, UserType>,
  museumMap: Map<string, MuseumType>,
  categories: CategoryType[],
  currentUser: any
) {
  return mongoImages.map((image: any) => {
    const userData = image.userId ? userMap.get(image.userId) ?? null : null;

    return {
      id: image.publicId,
      image: image.image,
      url: image.url,
      museumTitle: image.museumTitle || "Unknown museum",
      exhibitionTitle: image.exhibitionTitle || "Unknown exhibition",
      date: image.date || "",
      userName: image.userName || "Unknown",
      userEmail: userData?.email || "",
      size: image.size ? `${Math.round(image.size / 1024)} KB` : "",
      user: userData,
      museum: image.museum ? museumMap.get(image.museum) ?? null : null,
      exhibition: null,
      likes: image.likeCount || 0,
      isLiked: image.likedBy?.includes(currentUser._id) || false,
      categories,
    } as EnrichedImage;
  });
}

/**
 * Group images by owner so the gallery page can show one section per user.
 */
function buildUserGalleryMap(images: EnrichedImage[]) {
  const userGalleryMap = new Map<string, UserGallery>();

  for (const image of images) {
    const userId = image.user?._id || "unknown-user";
    const existingGallery = userGalleryMap.get(userId);

    if (existingGallery) {
      existingGallery.images.push(image);
      continue;
    }

    userGalleryMap.set(userId, {
      userId,
      userName: image.user ? `${image.user.firstName} ${image.user.lastName}` : image.userName,
      userEmail: image.user?.email || "",
      images: [image],
      comments: [],
    });
  }

  return userGalleryMap;
}

/**
 * Format comment timestamps into a readable date string for the view.
 */
function formatCommentDates(comments: any[]) {
  for (const comment of comments) {
    try {
      const date = comment.createdAt ? new Date(comment.createdAt) : new Date();
      comment.displayDate = date.toLocaleString("en-IE", {
        weekday: "short",
        day: "2-digit",
        month: "short",
        year: "numeric",
        hour: "2-digit",
        minute: "2-digit",
      });
    } catch (error) {
      comment.displayDate = String(comment.createdAt || "");
    }
  }
}

/**
 * Attach the correct comments to each user gallery and sort them newest first.
 */
function attachCommentsToUserGalleries(userGalleryMap: Map<string, UserGallery>, comments: any[]) {
  for (const gallery of Array.from(userGalleryMap.values())) {
    const userComments = comments
      .filter((comment: any) => String(comment.galleryOwnerId) === String(gallery.userId))
      .sort((left: any, right: any) => {
        const leftTime = left.createdAt ? new Date(left.createdAt).getTime() : 0;
        const rightTime = right.createdAt ? new Date(right.createdAt).getTime() : 0;
        return rightTime - leftTime;
      });

    gallery.comments = userComments;
  }
}

export const galleriesController = {
  index: {
    /**
     * Load the gallery page data, enrich museums and images, and render the view.
     */
    handler: async function (request: Request, h: ResponseToolkit) {
      const user = request.auth.credentials as any;
      const isAdmin = user && user.role === "admin";

      let museums = await db.museumStore!.getAllMuseums();
      const exhibitions = await db.exhibitionStore!.getAllExhibitions();
      const allUsers = await db.userStore!.getAllUsers();
      const mongoImages = await db.imageStore!.getAllImages();
      const categories = await db.categoryStore!.getAllCategories();
      const query = request.query as any;
      const categoryId = query.categoryId;

      if (categoryId) {
        museums = museums.filter((museum: any) => museum.categoryId === categoryId);
      }

      const userMap = buildUserMap(allUsers);
      const museumMap = buildMuseumMap(museums);
      const publicMuseumIds = getPublicMuseumIds(museums);
      const latestImageByMuseum = getLatestImageByMuseum(mongoImages as any[], publicMuseumIds);

      // Add display-friendly owner and image info to each museum.
      const enrichedMuseums = enrichMuseumsWithOwnerAndImage(museums, userMap, latestImageByMuseum);
      const enrichedPublicMuseums = enrichedMuseums.filter((museum: any) => museum.status === "public");

      // Add user/museum details to each image so the gallery cards can show richer text.
      const images: EnrichedImage[] = buildEnrichedImages(mongoImages as any[], userMap, museumMap, categories, user);

      // Group images into galleries per user.
      const userGalleryMap = buildUserGalleryMap(images);

      // Load comments once, format them once, then attach them to each gallery owner.
      const comments = await db.socialStore!.getAllComments();
      formatCommentDates(comments);
      attachCommentsToUserGalleries(userGalleryMap, comments);

      // Send the view everything it needs, already prepared and easy to render.
      return h.view("galleries-view", {
        title: "Museum Gallery",
        images,
        userGalleries: Array.from(userGalleryMap.values()),
        museums: enrichedMuseums,
        categories,
        exhibitions,
        user,
        isAdmin,
        allUsers,
        allComments: comments,
        publicMuseums: enrichedPublicMuseums,
      });
    },
  },

  leaveComment: {
    handler: async function (request: Request, h: ResponseToolkit) {
      const user = request.auth.credentials as any;
      const { userText, galleryOwnerId } = request.payload as any;

      console.log("📝 Form text received:", userText);
      console.log("👤 Posted by user:", user?._id);
      console.log("🎯 Target gallery owner id:", galleryOwnerId);

      // Validate input
      if (!userText || userText.trim().length === 0) {
        console.log("❌ Empty text submitted, ignoring");
        return h.redirect("/galleries");
      }

      try {
        // 1. Prepare the data object
        const commentPayload = {
          firstName: user.firstName,
          lastName: user.lastName,
          comment: userText,
          like: 0,
          dislike: 0,
        };
        // Associate the comment with the target gallery owner (from the form)
        const ownerIdToUse = galleryOwnerId || (user && user._id);
        if (ownerIdToUse) {
          (commentPayload as any).galleryOwnerId = ownerIdToUse;
        }
        // 2. Saving at sociala db (social-mongo-store)
        await db.socialStore.addComment(commentPayload);

        console.log("✅ Comment saved to MongoDB!");
        return h.redirect("/galleries");
      } catch (error: any) {
        console.error("❌ Error saving comment:", error.message);
        return h.redirect("/galleries");
      }
    },
  },

  incrementLikeComment: {
    handler: async function (request: Request, h: ResponseToolkit) {
      const user = request.auth.credentials as any;
      const commentId = request.params.id; // Corrected variable
      console.log("DEBUG: Liking Comment ID:", commentId);
      console.log("DEBUG: Current User ID:", user?._id);

      if (!user?._id) {
        console.error("❌ USER ID IS MISSING!");
        return h.redirect("/galleries");
      }

      const alreadyLiked = await db.socialStore.isLikedByUser(commentId, user._id);

      if (alreadyLiked) {
        await db.socialStore.decrementLike(commentId, user._id);
        console.log("The ID being liked is:", commentId);
      } else {
        await db.socialStore.incrementLike(commentId, user._id);
        console.log("User already liked this post");
      }

      return h.redirect("/galleries");
    },
  },

  incrementDislikeComment: {
    handler: async function (request: Request, h: ResponseToolkit) {
      const user = request.auth.credentials as any;
      const commentId = request.params.id; // Corrected variable
      console.log("DEBUG: Disliking Comment ID:", commentId);
      console.log("DEBUG: Current User ID:", user?._id);

      if (!user?._id) {
        console.error("❌ USER ID IS MISSING!");
        return h.redirect("/galleries");
      }

      const alreadyLiked = await db.socialStore.isDislikedByUser(commentId, user._id);

      if (alreadyLiked) {
        await db.socialStore.decrementDislike(commentId, user._id);
        console.log("The ID being liked is:", commentId);
      } else {
        await db.socialStore.incrementDislike(commentId, user._id);
        console.log("User already liked this post");
      }

      return h.redirect("/galleries");
    },
  },

  sendPostcard: {
    handler: async function (request: Request, h: ResponseToolkit) {
      const transporter = nodemailer.createTransport({
        service: "gmail",
        auth: {
          user: process.env.EMAIL,
          pass: process.env.EMAIL_PASSWORD,
        },
      });

      const payload = request.payload as any;
      const recipientEmail = payload.recipientEmail;
      const imageId = request.params.id;

      try {
        // Get the image from MongoDB (has denormalized data)
        const foundImage = await db.imageStore!.getImageByPublicId(imageId);

        if (!foundImage) {
          console.error("Image not found in MongoDB");
          return h.redirect("/galleries");
        }

        // Get user data for email
        let userData = null;
        if (foundImage.userId) {
          userData = await db.userStore!.getUserById(foundImage.userId);
        }

        // Build email content with denormalized data from the image document
        const senderName = userData ? `${userData.firstName} ${userData.lastName}` : foundImage.userName || "A museum visitor";
        const museumTitle = foundImage.museumTitle || "Museum";
        const exhibitionTitle = foundImage.exhibitionTitle || "Exhibition";

        await transporter.sendMail({
          from: process.env.EMAIL,
          to: recipientEmail,
          subject: `A Postcard from ${museumTitle}`,
          html: `
            <h1>Someone sent you a postcard!</h1>
            <p><strong>From:</strong> ${senderName}</p>
            <p><strong>Museum:</strong> ${museumTitle}</p>
            <p><strong>Exhibition:</strong> ${exhibitionTitle}</p>
            <img src="${foundImage.url}" alt="Postcard" style="max-width: 500px; margin: 20px 0;">
            <p>Visit us at the museum!</p>
          `,
        });
      } catch (error) {
        console.error("Email error:", error);
      }

      return h.redirect("/galleries");
    },
  },

  likeImage: {
    handler: async function (request: Request, h: ResponseToolkit) {
      const user = request.auth.credentials as any;
      const imageId = request.params.id; // from /galleries/like/{id}

      const alreadyLiked = await db.imageStore.isLikedByUser(imageId, user._id);

      if (alreadyLiked) {
        await db.imageStore.unlikeImage(imageId, user._id);
      } else {
        await db.imageStore.likeImage(imageId, user._id);
      }

      return h.redirect("/galleries");
    },
  },

  listCategories: {
    handler: async function (request: Request, h: ResponseToolkit) {
      const loggedInUser = request.auth.credentials as any;

      // Use ! to unlock the store
      const categories = await db.categoryStore!.getAllCategories();
      const viewData = {
        title: "Categories",
        user: loggedInUser,
        categories: categories,
      };
      return h.view("galleries-view", viewData);
    },
  },

  reviewPOI:{
    handler: async function (request: Request, h: ResponseToolkit) {
      // request.params, takes information from URL
      // requeest.payload, takes information from body of request.
      const payload = request.payload as any;
      const museumId = request.params.id || payload.museumId;
      const review = payload.userText;
      const reviewStar = parseInt(payload.ratingValue) ||0;
      // To "collect" the authenticated user
      const credentials = request.auth.credentials as any;

      const userId = credentials._id; 
      const userFirstName = credentials.firstName;
      const userLastName = credentials.lastName;

      

      if (!museumId || !review) {
        return h.redirect("/galleries");
      }

      const reviewObject = {
        text: review,
        authorName: `${userFirstName} ${userLastName}`,
        authorId: userId,
        date: new Date(),
        starNumber: reviewStar
      };

      await db.museumStore!.addReviewById(museumId, reviewObject);
      return h.redirect("/galleries");
    },
  },
};
