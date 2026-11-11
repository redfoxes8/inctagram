"use client"

import { gql, type TypedDocumentNode } from "@apollo/client"
import { useQuery } from "@apollo/client/react"
import type { DetailsTab, PageInput, TabData, UserDetails } from "@/features/superadmin-users/model/user-details.types"

type TabVariables = { userId: string; input: PageInput }
const USER_DETAILS: TypedDocumentNode<{ superadminUser: UserDetails | null }, { userId: string }> = gql`
  query SuperadminUserDetails($userId: ID!) {
    superadminUser(userId: $userId) {
      userId
      username
      avatarUrl
      profileUrl
      createdAt
      state
    }
  }
`
const USER_PAYMENTS: TypedDocumentNode<TabData, TabVariables> = gql`
  query SuperadminUserDetailsPayments($userId: ID!, $input: PageInput!) {
    superadminUser(userId: $userId) {
      userId
      connection: payments(input: $input) {
        items {
          transactionId
          createdAt
          paidAt
          subscriptionEndsAt
          amountMinor
          currency
          billingInterval
          billingIntervalCount
          provider
        }
        totalCount
        pageInfo {
          page
          pageSize
          pagesCount
          hasNextPage
        }
      }
    }
  }
`
const USER_FOLLOWERS: TypedDocumentNode<TabData, TabVariables> = gql`
  query SuperadminUserDetailsFollowers($userId: ID!, $input: PageInput!) {
    superadminUser(userId: $userId) {
      userId
      connection: followers(input: $input) {
        items {
          userId
        }
        totalCount
        pageInfo {
          page
          pageSize
          pagesCount
          hasNextPage
        }
      }
    }
  }
`
const USER_FOLLOWING: TypedDocumentNode<TabData, TabVariables> = gql`
  query SuperadminUserDetailsFollowing($userId: ID!, $input: PageInput!) {
    superadminUser(userId: $userId) {
      userId
      connection: following(input: $input) {
        items {
          userId
        }
        totalCount
        pageInfo {
          page
          pageSize
          pagesCount
          hasNextPage
        }
      }
    }
  }
`

const tabQueries = { payments: USER_PAYMENTS, followers: USER_FOLLOWERS, following: USER_FOLLOWING }
const readOptions = {
  ssr: false,
  fetchPolicy: "no-cache",
  errorPolicy: "all",
  notifyOnNetworkStatusChange: true,
} as const

export function useSuperadminUserDetails(userId: string) {
  return useQuery(USER_DETAILS, { ...readOptions, variables: { userId } })
}

export function useSuperadminUserTab(userId: string, tab: DetailsTab, input: PageInput, enabled: boolean) {
  return useQuery(tabQueries[tab], { ...readOptions, variables: { userId, input }, skip: !enabled })
}
