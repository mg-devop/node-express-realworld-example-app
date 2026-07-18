import { User } from '../auth/user.model';
import { Profile } from './profile.model';

const profileMapper = (user: any, id?: number) => {
  return {
    username: user.username,
    bio: user.bio,
    // Add this fallback logic:
    image: user.image || 'https://static.productionready.io/images/smiley-cyrus.jpg',
    following: id ? user.followedBy.some((follow: any) => follow.id === id) : false,
  };
};

export default profileMapper;
