export interface UserInterface  {
    _id?: string;
    firstName: string;
    lastName: string;
    email: string;
    password?: string;
    role?: string;
  }
  
export interface MuseumInterface {
    _id?: string;
    userid: string; 
    title: string;
    description: string;
    categoryId: string;
    latitude: number;
    longitude: number;
    museumVisitCount:number;
}
  
export interface ExhibitionInterface {
    _id?: string;
    museumid: string;
    title: string;
    artist: string;
    duration: number;
    description: string;
    startDate: string;
    endDate: string;
}

export interface CategoryInterface {
      _id?:string;
      name: string;
      location: string;
      description: string;
      createdAt: Date;
      updatedAt: Date;
}