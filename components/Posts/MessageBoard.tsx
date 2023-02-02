
import React, { useContext } from "react";
import { Link, Outlet } from "react-router-dom";
import { UserContextProvider } from "@supabase/auth-ui-react/dist/esm/src/components/Auth/UserContext";

export default function MessageBoard() {
    //const userProfile = useContext(UserContext);
    return (
        <div className="message-board-container">
            <Link to='/1'>
                <h2 className="message-board-header-link">Message Board</h2>
            </Link>
            {/*{userProfile.session ? (
                <></>
            ) : (
                <h2 className="message-board-login-message" data-e2e='message-board-login'>You'll need to <Login /> to join the discussions</h2>
            )}
            <Outlet />*/}
        </div>
    )
}