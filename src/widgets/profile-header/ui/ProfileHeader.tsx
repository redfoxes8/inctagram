"use client"

import { useRouter } from "next/navigation"
import Link from "next/link"
import * as Avatar from "@radix-ui/react-avatar"
import clsx from "clsx"

import { SchemaUserMeResponseDto } from "@/shared/api/schema"
import { Button } from "@/shared/ui"
import { Icon } from "@/shared/ui/Icon"

import s from "./ProfileHeader.module.css"

type ProfileHeaderProps = {
  user: SchemaUserMeResponseDto
  isOwner?: boolean
}

export const ProfileHeader = ({ user, isOwner = true }: ProfileHeaderProps) => {
  const router = useRouter()

  const stats = {
    following: 0,
    followers: 0,
    publications: 0,
  }

  const handleSettingsClick = () => {
    router.push("/settings?part=info")
  }

  return (
    <div className={s.container}>
      <div className={s.userBlock}>
        <Avatar.Root className={s.avatarRoot}>
          <Avatar.Image src={user.avatarUrl || undefined} alt={user.username} className={s.avatarImage} />

          <Avatar.Fallback className={s.avatarFallback} delayMs={600}>
            <Icon name="person-outline" />
          </Avatar.Fallback>
        </Avatar.Root>

        <Link href={`/@${user.username}`} className={clsx(s.mobileUserName, "bold_text_16")}>
          {user.username}
        </Link>
      </div>

      <div className={s.userInfo}>
        <div className={s.user}>
          <div className={s.userNameBlock}>
            <h1 className="h1">{user.username}</h1>

            <div className={s.verifiedBadge}>
              <Icon name="done-all-outline" className={s.verifiedIcon} />
            </div>
          </div>

          {isOwner && (
            <Button type="button" variant="secondary" className="h3" onClick={handleSettingsClick}>
              Profile Settings
            </Button>
          )}
        </div>

        <div className={s.statisticsBlock}>
          <div className={s.stat}>
            <span className="bold_text_14">{stats.following}</span>
            <span className="regular_text_14">Following</span>
          </div>

          <div className={s.stat}>
            <span className="bold_text_14">{stats.followers}</span>
            <span className="regular_text_14">Followers</span>
          </div>

          <div className={s.stat}>
            <span className="bold_text_14">{stats.publications}</span>
            <span className="regular_text_14">Publications</span>
          </div>
        </div>

        {user.aboutMe && <p className={s.aboutMe}>{user.aboutMe}</p>}
      </div>
    </div>
  )
}
