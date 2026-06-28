'use client';

import { ProfileHeader } from '@/widgets/profile-header';
import { PostFeed } from '@/widgets/post-feed';
import { PostModal } from '@/widgets/post-modal/ui';
import { useRouter, usePathname, useSearchParams } from 'next/navigation';
import { useMeQuery } from '@/features/auth/api/use-me';
import { useState, useEffect, useCallback } from 'react';
import s from './ProfilePage.module.css';

type ProfilePageProps = {
  userId: string;
  postId?: string;
};

const TEST_POST_ID = '0215102c-af52-43e1-b0d2-e73d7f63bb97'  //удалить

export const ProfilePage = ({
  userId: propUserId,
  postId: initialPostId,
}: ProfilePageProps) => {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  const [selectedPostId, setSelectedPostId] = useState<string | undefined>(
    initialPostId || searchParams.get('postId') || undefined
  );

  const { data: me, isLoading, error } = useMeQuery();

  useEffect(() => {
    const postIdFromUrl = searchParams.get('postId');
    if (postIdFromUrl && postIdFromUrl !== selectedPostId) {
      setSelectedPostId(postIdFromUrl);
    }
  }, [searchParams, selectedPostId]);

  const handlePostClick = useCallback((postId: string) => {
    setSelectedPostId(postId);
    router.push(`${pathname}?postId=${postId}`);
  }, [pathname, router]);

  const handlePostModalClose = useCallback(() => {
    setSelectedPostId(undefined);
    router.push(pathname);
  }, [pathname, router]);


  if (isLoading) {
    return (
      <div className={s.loading}>
        <div className="spinner">Loading...</div>
      </div>
    );
  }


  if (error) {
    return (
      <div className={s.userNotFound}>
        <h3 className='h3'>Please log in</h3>
        <p>You need to be logged in to view this profile</p>
        <button onClick={() => router.push('/login')}>Log in</button>
      </div>
    );
  }


  if (!me) {
    return (
      <div className={s.userNotFound}>
        <h3 className='h3'>User not found</h3>
        <p>The user you are looking for does not exist</p>
      </div>
    );
  }

  const userId = propUserId || me.userId;

  if (!userId || !me.username) {
    return (
      <div className={s.userNotFound}>
        <h3 className='h3'>Error</h3>
      </div>
    );
  }

  return (
    <div className={s.container}>
      <ProfileHeader
        user={me}
        isOwner={true}
      />

      <PostFeed
        userId={userId}
        // user={me}  
        isOwner={true}
        pageSize={8}
        onPostClick={handlePostClick}
        useFeedEndpoint={true}
      />

      {selectedPostId && (
        <PostModal
          postId={TEST_POST_ID}
          // postId={selectedPostId} 
          isOpen={!!selectedPostId}
          onClose={handlePostModalClose}
          isOwnProfile={true}
        />
      )}
    </div>
  );
};