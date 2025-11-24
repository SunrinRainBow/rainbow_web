import { useState } from "react";
import { Link, useLocation } from "react-router-dom";
import Button from "@/components/ui/button";
import Auth from "@/components/ui/widget/auth";
import s from "./styles.module.scss";
import { Clock, User } from "lucide-react";

export default function Header() {
  const location = useLocation();
  const [showAuth, setShowAuth] = useState(false);

  const isActive = (path: string) => {
    return location.pathname === path;
  };

  const handleLoginClick = () => {
    setShowAuth(true);
  };

  const handleCloseAuth = () => {
    setShowAuth(false);
  };

  return (
    <>
      <div className={s.container}>
        <div className={s.main}>
          <Link to="/" className={s.logo}>
            Logo
          </Link>
          <div className={s.menu}>
            <Link
              to="/"
              className={isActive("/") ? s.menu_item_active : s.menu_item}
            >
              Video Chat
            </Link>
            <Link
              to="/profile"
              className={
                isActive("/profile") ? s.menu_item_active : s.menu_item
              }
            >
              Profile
            </Link>
            <Link
              to="/type"
              className={isActive("/type") ? s.menu_item_active : s.menu_item}
            >
              Type
            </Link>
            <Link
              to="/about"
              className={isActive("/about") ? s.menu_item_active : s.menu_item}
            >
              About
            </Link>
          </div>
        </div>
        <div className={s.items}>
          <div className={s.item}>
            <Button leadingIcon={<Clock />} size="medium" variant="secondary">
              지난 대화 상대
            </Button>
          </div>
          <div className={s.login}>
            <Button
              leadingIcon={<User />}
              size="medium"
              variant="secondary"
              onClick={handleLoginClick}
            >
              로그인
            </Button>
          </div>
        </div>
      </div>
      {showAuth && <Auth onClose={handleCloseAuth} />}
    </>
  );
}
