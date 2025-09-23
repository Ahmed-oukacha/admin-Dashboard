import React from "react";
import {
  Box,
  Divider,
  Drawer,
  IconButton,
  List,
  ListItem,
  ListItemButton,
  ListItemIcon,
  ListItemText,
  Typography,
  useTheme,
  Button,
} from "@mui/material";
import {
  SettingsOutlined,
  ChevronLeft,
  ChevronRightOutlined,
  HomeOutlined,
  FolderOutlined,
  InsertDriveFileOutlined,
  LogoutOutlined,
} from "@mui/icons-material";
import { useEffect, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import { logoutUser } from "state/authSlice";
import FlexBetween from "./FlexBetween";
import UserAvatar from "components/UserAvatar";

const navItems = [
  {
    text: "Dashboard",
    icon: <HomeOutlined />,
  },
  {
    text: "RAG System",
    icon: null,
  },
  {
    text: "Projects",
    icon: <FolderOutlined />,
  },
  {
    text: "Files",
    icon: <InsertDriveFileOutlined />,
  },
  {
    text: "Settings",
    icon: <SettingsOutlined />,
  },
];

const Sidebar = ({
  user,
  drawerWidth,
  isSidebarOpen,
  setIsSidebarOpen,
  isNonMobile,
}) => {
  const { pathname } = useLocation();
  const [active, setActive] = useState("");
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const theme = useTheme();
  
  // Récupérer les informations utilisateur depuis Redux
  const { user: authUser } = useSelector((state) => state.auth);

  const handleLogout = async () => {
    try {
      await dispatch(logoutUser());
      navigate("/login");
    } catch (error) {
      console.error("Erreur lors de la déconnexion:", error);
    }
  };

  useEffect(() => {
    setActive(pathname.substring(1));
  }, [pathname]);

  return (
    <Box component="nav">
      {isSidebarOpen && (
        <Drawer
          open={isSidebarOpen}
          onClose={() => setIsSidebarOpen(false)}
          variant="persistent"
          anchor="left"
          sx={{
            width: drawerWidth,
            "& .MuiDrawer-paper": {
              color: theme.palette.secondary[200],
              backgroundColor: theme.palette.background.alt,
              boxSixing: "border-box",
              borderWidth: isNonMobile ? 0 : "2px",
              width: drawerWidth,
            },
          }}
        >
          <Box width="100%">
            <Box m="1.5rem 2rem 2rem 3rem">
              <FlexBetween color={theme.palette.secondary.main}>
                <Box display="flex" alignItems="center" gap="0.5rem">
                  <Typography variant="h4" fontWeight="bold">
                    ASKSOURCE
                  </Typography>
                </Box>
                {!isNonMobile && (
                  <IconButton onClick={() => setIsSidebarOpen(!isSidebarOpen)}>
                    <ChevronLeft />
                  </IconButton>
                )}
              </FlexBetween>
            </Box>
            <List>
              {navItems.map(({ text, icon }) => {
                if (!icon) {
                  return (
                    <Typography key={text} sx={{ m: "2.25rem 0 1rem 3rem" }}>
                      {text}
                    </Typography>
                  );
                }
                const lcText = text.toLowerCase();

                return (
                  <ListItem key={text} disablePadding>
                    <ListItemButton
                      onClick={() => {
                        // تعطيل النقر على زر "Files" - يجب الوصول إليه من صفحة Projects فقط
                        if (lcText === "files") {
                          return;
                        }
                        navigate(`/${lcText}`);
                        setActive(lcText);
                      }}
                      disabled={lcText === "files"}
                      sx={{
                        backgroundColor:
                          active === lcText
                            ? theme.palette.secondary[300]
                            : "transparent",
                        color:
                          active === lcText
                            ? theme.palette.primary[600]
                            : lcText === "files"
                            ? theme.palette.grey[500] // لون باهت للزر المعطل
                            : theme.palette.secondary[100],
                        opacity: lcText === "files" ? 0.5 : 1, // شفافية للزر المعطل
                        cursor: lcText === "files" ? "not-allowed" : "pointer",
                      }}
                    >
                      <ListItemIcon
                        sx={{
                          ml: "2rem",
                          color:
                            active === lcText
                              ? theme.palette.primary[600]
                              : lcText === "files"
                              ? theme.palette.grey[500] // لون باهت للأيقونة المعطلة
                              : theme.palette.secondary[200],
                        }}
                      >
                        {icon}
                      </ListItemIcon>
                      <ListItemText primary={text} />
                      {active === lcText && (
                        <ChevronRightOutlined sx={{ ml: "auto" }} />
                      )}
                    </ListItemButton>
                  </ListItem>
                );
              })}
            </List>
          </Box>

          <Box position="absolute" bottom="2rem">
            <Divider />
            
            {/* Informations utilisateur */}
            <FlexBetween textTransform="none" gap="1rem" m="1.5rem 2rem 1rem 3rem">
              <UserAvatar 
                user={authUser || { name: user?.name || "Utilisateur" }} 
                size={40} 
                fontSize="1.1rem" 
              />
              <Box textAlign="left" flexGrow={1}>
                <Typography
                  fontWeight="bold"
                  fontSize="0.9rem"
                  sx={{ color: theme.palette.secondary[100] }}
                >
                  {authUser ? `${authUser.firstName} ${authUser.lastName}` : user?.name || "Utilisateur"}
                </Typography>
                <Typography
                  fontSize="0.8rem"
                  sx={{ color: theme.palette.secondary[200] }}
                >
                  {authUser ? authUser.role === "superadmin" ? "Super Administrateur" : "Administrateur" : user?.occupation || "Admin"}
                </Typography>
              </Box>
              <SettingsOutlined
                sx={{
                  color: theme.palette.secondary[300],
                  fontSize: "20px",
                  cursor: "pointer",
                }}
                onClick={() => navigate("/settings")}
              />
            </FlexBetween>

            {/* Bouton de déconnexion */}
            <Box m="0 2rem 1rem 3rem">
              <Button
                fullWidth
                onClick={handleLogout}
                startIcon={<LogoutOutlined />}
                sx={{
                  backgroundColor: theme.palette.secondary[600],
                  color: theme.palette.secondary[100],
                  fontSize: "0.8rem",
                  fontWeight: "bold",
                  padding: "8px 16px",
                  "&:hover": {
                    backgroundColor: theme.palette.secondary[700],
                  },
                }}
              >
                Déconnexion
              </Button>
            </Box>
          </Box>
        </Drawer>
      )}
    </Box>
  );
};

export default Sidebar;
