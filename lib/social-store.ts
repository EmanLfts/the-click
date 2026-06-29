export type Community = {
  id: string;
  name: string;
  description: string;
  category: string;
  private: boolean;
  inviteCode?: string;
  expiresAt?: string;
  ownerId: string;
  bannerImage?: string;
};

export type AvatarStyle = {
  skin: string;
  hair: string;
  shirt: string;
  accent: string;
  accessory: string;
};

export type UserProfile = {
  userId: string;
  name: string;
  interests: string[];
  joinedCommunityIds: string[];
  avatarStyle?: AvatarStyle;
  username?: string;
  contact?: string;
  birthdate?: string;
  bio?: string;
  mood?: string;
  bannerColor?: string;
};

export type SocialPost = {
  id: string;
  userId: string;
  authorName: string;
  content: string;
  moodLabel: string;
  moodEmoji: string;
  moodPicture?: string;
  fontFamily: string;
  fontSize: string;
  fontStyle: string;
  link?: string;
  createdAt: string;
  visibility: "public" | "community";
  communityId?: string;
};

const STORAGE_KEY = "the-click-social-state";

export const defaultAvatarStyle: AvatarStyle = {
  skin: "#f2c8a2",
  hair: "#2d1a12",
  shirt: "#ff6b6b",
  accent: "#ffd166",
  accessory: "sparkles",
};

export const defaultProfileTheme = {
  bannerColor: "#ff8fab",
};

type SocialState = {
  communities: Community[];
  posts: SocialPost[];
  profiles: UserProfile[];
};

const defaultCommunities: Community[] = [
  {
    id: "music-hub",
    name: "Band Practice",
    description: "Live sets, rehearsal notes, and backstage chaos.",
    category: "Music",
    private: false,
    ownerId: "system",
  },
  {
    id: "game-night",
    name: "Game Night",
    description: "Quick reactions, new releases, and high scores.",
    category: "Gaming",
    private: false,
    ownerId: "system",
  },
  {
    id: "film-club",
    name: "Film Club",
    description: "Scene breakdowns, favorite frames, and late-night reviews.",
    category: "Film",
    private: false,
    ownerId: "system",
  },
  {
    id: "studio-circle",
    name: "Studio Circle",
    description: "A private place for art, sketches, and creative drops.",
    category: "Art",
    private: true,
    inviteCode: "STUDIO24",
    expiresAt: new Date(Date.now() + 1000 * 60 * 60 * 24).toISOString(),
    ownerId: "system",
  },
];

function readState(): SocialState {
  if (typeof window === "undefined") {
    return { communities: defaultCommunities, posts: [], profiles: [] };
  }

  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (!raw) {
      return { communities: defaultCommunities, posts: [], profiles: [] };
    }

    const parsed = JSON.parse(raw) as Partial<SocialState>;
    return {
      communities: parsed.communities?.length ? parsed.communities : defaultCommunities,
      posts: parsed.posts ?? [],
      profiles: parsed.profiles ?? [],
    };
  } catch {
    return { communities: defaultCommunities, posts: [], profiles: [] };
  }
}

function writeState(state: SocialState) {
  if (typeof window === "undefined") {
    return;
  }

  window.localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
}

export function getCommunities(): Community[] {
  return readState().communities;
}

export function saveCommunity(community: Community) {
  const state = readState();
  const updated = [community, ...state.communities.filter((item) => item.id !== community.id)];
  writeState({ ...state, communities: updated });
  return updated;
}

export function getUserProfile(userId: string): UserProfile | null {
  return readState().profiles.find((profile) => profile.userId === userId) ?? null;
}

export function saveUserProfile(profile: UserProfile) {
  const state = readState();
  const existing = state.profiles.filter((item) => item.userId !== profile.userId);
  writeState({ ...state, profiles: [...existing, profile] });
  return profile;
}

export function savePost(post: SocialPost) {
  const state = readState();
  writeState({ ...state, posts: [post, ...state.posts] });
  return post;
}

export function getPosts(): SocialPost[] {
  return readState().posts.sort((a, b) => b.createdAt.localeCompare(a.createdAt));
}

export function joinCommunity(userId: string, inviteCode: string) {
  const state = readState();
  const community = state.communities.find((item) => item.inviteCode?.toLowerCase() === inviteCode.toLowerCase());

  if (!community) {
    return null;
  }

  if (community.expiresAt && new Date(community.expiresAt).getTime() < Date.now()) {
    return null;
  }

  const profile = state.profiles.find((item) => item.userId === userId);
  if (!profile) {
    return null;
  }

  const alreadyJoined = profile.joinedCommunityIds.includes(community.id);
  const updatedProfile = {
    ...profile,
    joinedCommunityIds: alreadyJoined ? profile.joinedCommunityIds : [...profile.joinedCommunityIds, community.id],
  };

  const updatedProfiles = state.profiles.map((item) => (item.userId === userId ? updatedProfile : item));
  const updatedCommunities = state.communities.map((item) => (item.id === community.id ? { ...item, inviteCode: undefined, expiresAt: undefined } : item));
  writeState({ ...state, profiles: updatedProfiles, communities: updatedCommunities });
  return community;
}

export function getRecommendedCommunities(interests: string[]) {
  const communities = getCommunities();
  if (!interests.length) {
    return communities.slice(0, 3);
  }

  const interestSet = new Set(interests.map((item) => item.toLowerCase()));
  return communities.filter((community) => interestSet.has(community.category.toLowerCase()));
}
