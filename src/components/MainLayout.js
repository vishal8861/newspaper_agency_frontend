import { Layout, Drawer, Button } from "antd";
import { MenuOutlined } from "@ant-design/icons";
import SideNav from "./SideNav";
import { Outlet, useLocation } from "react-router-dom";
import { useState } from "react";

const { Sider, Content, Header } = Layout;

const routeTitles = {
  "/users/new": "Add User",
  "/users/list": "View Users",
  "/papers/new": "Add Paper",
  "/papers/list": "View Papers",
  "/papers/price": "Paper Price",
  "papers/price/list": "View Paper Prices",
  "/billing": "Generate Bill",
  "/payment/new": "Add Payment",
  "/payment/list": "View Payments",
  "/subscription/new": "Add Subscription",
  "/subscription/list": "View Subscriptions",
  "/exclusion/new": "Add Exclusion",
  "/exclusion/list": "View Exclusions",
  "/indent": "Generate Indent"
};

const MainLayout = () => {
  const location = useLocation();
  const title = routeTitles[location.pathname] || "";
  const [drawerVisible, setDrawerVisible] = useState(false);

  // Detect mobile screen
  const isMobile = window.innerWidth < 768;

  return (
    <Layout style={{ minHeight: "100vh" }}>
      {/* Sidebar for desktop, Drawer for mobile */}
      {isMobile ? (
        <>
          <Drawer
            placement="left"
            closable={false}
            onClose={() => setDrawerVisible(false)}
            open={drawerVisible}
            styles={{body: {padding: 0, background: "#001529"}}}
            width={220}
          >
            <div style={{ height: 32, margin: 16, marginLeft: 30, color: "white" }}>
              <p style={{ textAlign: "center" }}>News Paper Agency</p>
            </div>
            <SideNav onClick={() => setDrawerVisible(false)} />
          </Drawer>
        </>
      ) : (
        <Sider
          width={250}
          style={{ background: "#001529" }}
          breakpoint="md"
        >
          <div style={{ height: 32, margin: 16, marginLeft: 30, color: "white" }}>
            <p style={{ textAlign: "center" }}>News Paper Agency</p>
          </div>
          <SideNav />
        </Sider>
      )}

      {/* Main content area */}
      <Layout>
        <Header
          style={{
            background: "#001529",
            color: "white",
            textAlign: "center",
            fontWeight: "bold",
            fontSize: 18,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            position: "relative",
            paddingLeft: isMobile ? 48 : 0,
            minHeight: 56
          }}
        >
          {isMobile && (
            <Button
              type="text"
              icon={<MenuOutlined style={{ color: "white", fontSize: 22 }} />}
              onClick={() => setDrawerVisible(true)}
              style={{
                position: "absolute",
                left: 16,
                top: "50%",
                transform: "translateY(-50%)"
              }}
            />
          )}
          {title}
        </Header>
        <Content
          style={{
            margin: isMobile ? "8px" : "16px",
            background: "#fff",
            padding: isMobile ? 8 : 16
          }}
        >
          <Outlet />
        </Content>
      </Layout>
    </Layout>
  );
};

export default MainLayout;
