export class PostEntity {
  id: string;
  content: string;
  createdAt: Date;
  user: {
    username: string;
    profileImg: string | null;
  };
  images: any[];
}
