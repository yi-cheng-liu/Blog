import { Outlet } from "react-router";
import Header from "./Header";

export default function Layout() {
    return (
        <main>
            <Header />
            <Outlet />
        </main>
    );
}