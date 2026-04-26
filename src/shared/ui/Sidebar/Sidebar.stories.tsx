import { Sidebar } from "./index"

export default {
  title: "Sidebar",
  component: Sidebar,
  parameters: {
    layout: "fullscreen",
  },
}

export const Feed = () => <Sidebar />
Feed.parameters = {
  nextjs: { navigation: { pathname: "/" } },
}

export const Create = () => <Sidebar />
Create.parameters = {
  nextjs: { navigation: { pathname: "/create" } },
}

export const Profile = () => <Sidebar />
Profile.parameters = {
  nextjs: { navigation: { pathname: "/profile" } },
}

export const Messenger = () => <Sidebar />
Messenger.parameters = {
  nextjs: { navigation: { pathname: "/messenger" } },
}

export const Search = () => <Sidebar />
Search.parameters = {
  nextjs: { navigation: { pathname: "/search" } },
}

export const Statistics = () => <Sidebar />
Statistics.parameters = {
  nextjs: { navigation: { pathname: "/statistics" } },
}

export const Favorites = () => <Sidebar />
Favorites.parameters = {
  nextjs: { navigation: { pathname: "/favorites" } },
}

export const WithLogout = () => <Sidebar onLogout={() => alert("Logout")} />
