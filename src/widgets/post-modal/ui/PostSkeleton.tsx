
"use client"

import s from "./PostSkeleton.module.css"
export const PostSkeleton = () => {
  return (
    <div className={s.skeletonContainer}>
      <div className={s.skeletonImage} />
      <div className={s.skeletonRight}>
        <div className={s.skeletonHeader}>
          <div className={s.skeletonAvatar} />
          <div className={s.skeletonLine} style={{ width: '60%' }} />
        </div>
        <div className={s.skeletonContent}>
          <div className={s.skeletonLine} style={{ width: '80%' }} />
          <div className={s.skeletonLine} style={{ width: '40%' }} />
        </div>
        <div className={s.skeletonActions}>
          <div className={s.skeletonIcon} />
          <div className={s.skeletonIcon} />
        </div>
        <div className={s.skeletonLine} style={{ width: '30%' }} />
        <div className={s.skeletonComment}>
          <div className={s.skeletonLine} style={{ width: '70%' }} />
        </div>
      </div>
    </div>
  )
}