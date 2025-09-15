import "./App.css";
import { BrowserRouter as Router, Route, Switch, Link } from "react-router-dom";
import Sidebar from "./components/Sidebar";
import Home from "./pages/Home";
import MemberMaintenance from "./pages/MemberMaintenance";
import MemberForm from "./pages/MemberForm";
import ProductMaintenance from "./pages/ProductMaintenance";
import ProductForm from "./pages/ProductForm";
import AccountsManagement from "./pages/AccountsManagement";
import AccountForm from "./pages/AccountForm";
import RoleMaintenance from "./pages/RoleMaintenance";
import SaccoMaintenance from "./pages/SaccoMaintenance";
import SaccoForm from "./pages/SaccoForm";
import BranchMaintenance from "./pages/BranchMaintenance";
import BranchForm from "./pages/BranchForm";
import Admin from "./pages/Admin";
import LoanCalculator from "./pages/LoanCalculator";
import CreatePost from "./pages/CreatePost";
import Post from "./pages/Post";
import Registration from "./pages/Registration";
import Login from "./pages/Login";
import PageNotFound from "./pages/PageNotFound";
import Profile from "./pages/Profile";
import ChangePassword from "./pages/ChangePassword";
import UserMaintenance from "./pages/UserMaintenance";
import UserForm from "./pages/UserForm";
import SetupPassword from "./pages/SetupPassword";

import { AuthContext } from "./helpers/AuthContext";
import { SidebarProvider } from "./helpers/SidebarContext";
import NavbarWrapper from "./components/NavbarWrapper";
import { useState, useEffect, useRef } from "react";
import axios from "axios";

function App() {
  const [authState, setAuthState] = useState({
    username: "",
    id: 0,
    status: false,
  });
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const checkAuth = async () => {
      const token = localStorage.getItem("accessToken");
      
      if (!token) {
        setIsLoading(false);
        return;
      }

      try {
        const response = await axios.get("http://localhost:3001/auth/auth", {
          headers: {
            accessToken: token,
          },
        });
        
        if (response.data.error) {
          // Clear invalid token
          localStorage.removeItem("accessToken");
          setAuthState({ username: "", id: 0, status: false });
        } else {
          setAuthState({
            username: response.data.username,
            id: response.data.id,
            status: true,
          });
        }
      } catch (error) {
        // Only clear token if it's definitely invalid (401/403)
        if (error.response && (error.response.status === 401 || error.response.status === 403)) {
          localStorage.removeItem("accessToken");
          setAuthState({ username: "", id: 0, status: false });
        } else {
          // For any other error, fall back to client-side token decoding
          try {
            const tokenPayload = JSON.parse(atob(token.split('.')[1]));
            setAuthState({
              username: tokenPayload.username,
              id: tokenPayload.id,
              status: true,
            });
          } catch (decodeError) {
            localStorage.removeItem("accessToken");
            setAuthState({ username: "", id: 0, status: false });
          }
        }
      } finally {
        setIsLoading(false);
      }
    };

    checkAuth();
  }, []);

  const logout = () => {
    localStorage.removeItem("accessToken");
    setAuthState({ username: "", id: 0, status: false });
    window.location.href = "/login";
  };

  const [isAvatarMenuOpen, setIsAvatarMenuOpen] = useState(false);
  const avatarMenuRef = useRef(null);
  useEffect(() => {
    function handleClickOutside(event) {
      if (avatarMenuRef.current && !avatarMenuRef.current.contains(event.target)) {
        setIsAvatarMenuOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // Show loading screen while checking authentication
  if (isLoading) {
    return (
      <div className="App">
        <div style={{ 
          display: 'flex', 
          justifyContent: 'center', 
          alignItems: 'center', 
          height: '100vh',
          fontSize: '18px',
          color: '#666'
        }}>
          Loading...
        </div>
      </div>
    );
  }

  return (
    <div className="App">
      <AuthContext.Provider value={{ authState, setAuthState, logout, isLoading }}>
        <SidebarProvider>
          <Router>
            <Sidebar />
          <NavbarWrapper>
            <div className="brand">
              <img src="/craftLogo2.png" alt="Craft Silicon" className="brandLogo" />
              <strong className="brandTitle">Sacco Sphere</strong>
            </div>
            <div className="links">
              {!authState.status ? (
                <>
                  {/* <Link to="/login"> Login</Link>
                  <Link to="/registration"> Registration</Link> */}
                </>
              ) : (
                <>
                  {/* <Link to="/"> Home Page</Link>
                  <Link to="/member-maintenance"> Member Maintenance</Link> */}
                </>
              )}
            </div>
            <div className="loggedInContainer">
              {authState.status && (
                <div className="avatarMenu" ref={avatarMenuRef}>
                  {/* <button className="avatarButton" > */}
                    <div className="avatar" onClick={() => setIsAvatarMenuOpen(v => !v)} aria-haspopup="true" aria-expanded={isAvatarMenuOpen}>{authState?.username?.[0]?.toUpperCase() || "U"}</div>
                  {/* </button> */}
                  {isAvatarMenuOpen && (
                    <div className="avatarDropdown" role="menu">
                      <button className="dropdownItem" onClick={logout}>Logout</button>
                    </div>
                  )}
                </div>
              )}
            </div>
          </NavbarWrapper>
          <Switch>
            <Route path="/" exact component={Home} />
            <Route path="/createpost" exact component={CreatePost} />
            <Route path="/admin" exact component={Admin} />
            <Route path="/member-maintenance" exact component={MemberMaintenance} />
            <Route path="/member/:id" exact component={MemberForm} />
            <Route path="/product-maintenance" exact component={ProductMaintenance} />
            <Route path="/product/:id" exact component={ProductForm} />
            <Route path="/accounts-management" exact component={AccountsManagement} />
            <Route path="/account-form/:id" exact component={AccountForm} />
            <Route path="/role-maintenance" exact component={RoleMaintenance} />
            <Route path="/sacco-maintenance" exact component={SaccoMaintenance} />
            <Route path="/sacco/:id" exact component={SaccoForm} />
            <Route path="/branch-maintenance" exact component={BranchMaintenance} />
            <Route path="/branch-form/:id" exact component={BranchForm} />
            <Route path="/loan-calculator" exact component={LoanCalculator} />
            <Route path="/post/:id" exact component={Post} />
            <Route path="/registration" exact component={Registration} />
            <Route path="/login" exact component={Login} />
            <Route path="/profile/:id" exact component={Profile} />
            <Route path="/changepassword" exact component={ChangePassword} />
            <Route path="/user-maintenance" exact component={UserMaintenance} />
            <Route path="/user-form/:id" exact component={UserForm} />
            <Route path="/setup-password" exact component={SetupPassword} />
            <Route path="*" exact component={PageNotFound} />
          </Switch>
        </Router>
        </SidebarProvider>
      </AuthContext.Provider>
    </div>
  );
}

export default App;
