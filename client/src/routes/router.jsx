import { createBrowserRouter } from "react-router-dom";
import Home from "../pages/Home";
import Login from "../pages/Login";
import Registration from "../pages/Registration";
import Profile from "../pages/Profile";
import MyPost from "../pages/MyPost";
import AddPost from "../pages/AddPost";
import UserSideBar from "../layouts/UserSideBar";
import TaskManager from "../pages/TaskManager";
import { DndProvider } from "react-dnd";
import { HTML5Backend } from "react-dnd-html5-backend";
import AddProduct from "../pages/AddProduct";
import AdminSideBar from "../layouts/AdminSideBar";
import NotFound from "../pages/NotFound";
import Setting from "../pages/Setting";
import Users from "../pages/dashboard/Users";
import Dashboard from "../pages/dashboard/Dashboard";
import Post from "../pages/Post";
import MyProduct from "../pages/MyProduct";
import PublicRoute from "../layouts/PublicRoute";
import Product from "../pages/Product";
import Subscription from "../pages/Subscription";
import Analytics from "../pages/Analytics";
import AdminRoute from "../layouts/AdminRoute";
import UserRoute from "../layouts/UserRoute";

const router = createBrowserRouter([
  {
    path: "/",
    element: <Home />,
  },
  {
    path: "/login",
    element: <Login />,
  },
  {
    path: "/registration",
    element: <Registration />,
  },
  {
    path: "/profile",
    element: (
      <UserRoute>
        <UserSideBar>
          <Profile />
        </UserSideBar>
      </UserRoute>
    ),
  },
  {
    path: "/my-post",
    element: (
      <UserRoute>
        <UserSideBar>
          <MyPost />
        </UserSideBar>
      </UserRoute>
    ),
  },
  {
    path: "/add-post",
    element: (
      <UserRoute>
        <UserSideBar>
          <AddPost />
        </UserSideBar>
      </UserRoute>
    ),
  },
  {
    path: "/task-management",
    element: (
      <UserRoute>
        <UserSideBar>
          <DndProvider backend={HTML5Backend}>
            <TaskManager />
          </DndProvider>
        </UserSideBar>
      </UserRoute>
    ),
  },
  {
    path: "/add-product",
    element: (
      <UserRoute>
        <UserSideBar>
          <AddProduct />
        </UserSideBar>
      </UserRoute>
    ),
  },
  {
    path: "/my-product",
    element: (
      <UserRoute>
        <UserSideBar>
          <MyProduct />
        </UserSideBar>
      </UserRoute>
    ),
  },
  {
    path: "/setting",
    element: (
      <UserRoute>
        <UserSideBar>
          <Setting />
        </UserSideBar>
      </UserRoute>
    ),
  },
  {
    path: "/posts/:postId",
    element: (
      <PublicRoute>
        <Post />
      </PublicRoute>
    ),
  },
  {
    path: "/products/:productId",
    element: (
      <PublicRoute>
        <Product />
      </PublicRoute>
    ),
  },
  {
    path: "/subscription",
    element: (
      <PublicRoute>
        <Subscription />
      </PublicRoute>
    ),
  },
  {
    path: "/dashboard",
    element: (
      <AdminRoute>
        <AdminSideBar />
      </AdminRoute>
    ),
    children: [
      {
        path: "",
        element: <Dashboard />,
      },
      {
        path: "users",
        element: <Users />,
      },
      {
        path: "analytics",
        element: <Analytics />,
      },
    ],
  },
  {
    path: "*",
    element: <NotFound />,
  },
]);

export default router;
