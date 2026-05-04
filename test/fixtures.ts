import { User } from "../src/api/jwt-utils";
import { Museum } from "../src/api/museum-api";
import { Exhibition } from "../src/api/exhibition-api";
import { Category } from "../src/api/category-api";

export const serviceUrl = "http://localhost:3000";

// Define a type for Credentials since it's a subset of User
export interface Credentials {
  email: string;
  password?: string;
}

export const maggie: User = {
  _id: "", // Initializing with empty strings as User interface likely requires them
  firstName: "Maggie",
  lastName: "Simpson",
  email: "maggie@simpson.com",
  password: "secret",
};

export const maggieCredentials: Credentials = {
  email: "maggie@simpson.com",
  password: "secret",
};

export const homerCredentials: Credentials = {
  email: "homer@simpson.com",
  password: "secret",
};

export const testUsers: User[] = [
  {
    _id: "",
    firstName: "Homer",
    lastName: "Simpson",
    email: "homer@simpson.com",
    password: "secret",
  },
  {
    _id: "",
    firstName: "Marge",
    lastName: "Simpson",
    email: "marge@simpson.com",
    password: "secret",
  },
  {
    _id: "",
    firstName: "Bart",
    lastName: "Simpson",
    email: "bart@simpson.com",
    password: "secret",
  },
];

export const testMuseums: Museum[] = [
  {
    title: "National Art Gallery",
    description: "A gallery featuring modern and contemporary art",
    latitude: 53.3498,
    longitude: -6.2603,
  },
  {
    title: "History Museum",
    description: "Discover the rich history of our nation",
    latitude: 53.2707,
    longitude: -9.1193,
  },
  {
    title: "Science Center",
    description: "Interactive exhibits and science demonstrations",
    latitude: 53.4129,
    longitude: -8.2439,
  },
];

export const testExhibitions: Exhibition[] = [
  {
    title: "Modern Masters",
    artist: "Various Artists",
    duration: 6,
  },
  {
    title: "Renaissance Revival",
    artist: "Leonardo da Vinci",
    duration: 8,
  },
  {
    title: "Space Exploration",
    artist: "NASA",
    duration: 12,
  },
];

export const testCategories: Category[] = [
  {
    name: "Art",
    description: "Fine arts and paintings",
    location: "Gallery Wing",
  },
  {
    name: "History",
    description: "Historical artifacts and exhibits",
    location: "Heritage Hall",
  },
  {
    name: "Science",
    description: "Scientific discoveries and experiments",
    location: "Discovery Center",
  },
];
