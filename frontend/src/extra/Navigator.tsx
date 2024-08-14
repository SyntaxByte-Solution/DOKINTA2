import { Tooltip } from "@mui/material";
import Link from "next/link";
import { usePathname } from "next/navigation";

const Navigator = (props: any) => {
  const location = usePathname();

  const { name, path, navIcon, onClick, navSVG, navIconImg, key } = props;

  return (
    <>
      <li onClick={onClick} key={key}>
        <Tooltip title={name} placement="right">
          <Link
            href={{ pathname: path }}
            className={`${location === path ? "activeMenu" : ""} betBox`}
          >
            <div>
              {navIconImg ? (
                <>
                  <img src={navIconImg} alt="" />
                </>
              ) : navIcon ? (
                <>
                  <i className={navIcon}></i>
                </>
              ) : (
                <>{navSVG}</>
              )}
              <span className="text-capitalize ms-3 my-auto">{name}</span>
            </div>
            {props?.children && <i className="ri-arrow-right-s-line fs-18"></i>}
          </Link>
        </Tooltip>
        {/* If Submenu */}
        <Tooltip title={name} placement="right">
          {props.children}
        </Tooltip>
      </li>
    </>
  );
};

export default Navigator;
