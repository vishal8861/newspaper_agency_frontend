import React from "react";
import { Menu, Drawer, Button } from "antd";
import {
  UserOutlined,
  FileTextOutlined,
  DollarOutlined,
  MoneyCollectOutlined,
  MenuOutlined,
} from "@ant-design/icons";
import { useNavigate } from "react-router-dom";

const SideNavMenu = ({ onClick }) => {
  // ✅ v5 Menu API using "items"
  const menuItems = [
    {
      key: "users",
      icon: <UserOutlined />,
      label: "Users",
      children: [
        { key: "add-user", label: "Add User", onClick: () => onClick("/users/new") },
        { key: "list-users", label: "View Users", onClick: () => onClick("/users/list") },
      ],
    },
    {
      key: "papers",
      icon: <FileTextOutlined />,
      label: "Papers",
      children: [
        { key: "add-paper", label: "Add Paper", onClick: () => onClick("/papers/new") },
        { key: "list-papers", label: "View Papers", onClick: () => onClick("/papers/list") },
        { key: "paper-price", label: "Paper Price", onClick: () => onClick("/papers/price") },
        { key: "list-paper-price", label: "View Paper Price", onClick: () => onClick("/papers/price/list") },
      ],
    },
    {
      key: "subscription",
      icon: <MoneyCollectOutlined />,
      label: "Subscription",
      children: [
        { key: "add-subscription", label: "Add Subscription", onClick: () => onClick("/subscription/new") },
        { key: "list-subscription", label: "View Subscriptions", onClick: () => onClick("/subscription/list") },
        { key: "add-exclusion", label: "Add Exclusion", onClick: () => onClick("/exclusion/new") },
        { key: "list-exclusion", label: "View Exclusions", onClick: () => onClick("/exclusion/list") },
      ],
    },
    {
      key: "indent",
      icon: <MoneyCollectOutlined />,
      label: "Indent",
      children: [
        { key: "generate-indent", label: "Generate Indent", onClick: () => onClick("/indent") },
      ],
    },
    {
      key: "billing",
      icon: <DollarOutlined />,
      label: "Billing",
      children: [
        { key: "generate-bill", label: "Generate Bill", onClick: () => onClick("/billing") },
        { key: "bulk-bill", label: "Bulk Bill Generation", onClick: () => onClick("/billing/bulk") },
      ],
    },
    {
      key: "payment",
      icon: <MoneyCollectOutlined />,
      label: "Payment",
      children: [
        { key: "add-payment", label: "Add Payment", onClick: () => onClick("/payment/new") },
        { key: "list-payments", label: "View Payments", onClick: () => onClick("/payment/list") },
      ],
    },
  ];

  return (
    <Menu
      mode="inline"
      theme="dark"
      style={{ height: "100%", borderRight: 0 }}
      items={menuItems} // ✅ new v5 API
    />
  );
};

const SideNav = ({ visible, setVisible, isMobile }) => {
  const navigate = useNavigate();

  const handleMenuClick = (path) => {
    navigate(path);
    if (isMobile) setVisible(false); // close drawer on mobile
  };

  return (
    <>
      {isMobile ? (
        <>
          <Button
            type="primary"
            icon={<MenuOutlined />}
            onClick={() => setVisible(true)}
            style={{ margin: 16 }}
          />
          <Drawer
            title="Menu"
            placement="left"
            onClose={() => setVisible(false)}
            open={visible}
            styles={{ body: { padding: 0 } }}
          >
            <SideNavMenu onClick={handleMenuClick} />
          </Drawer>
        </>
      ) : (
        <SideNavMenu onClick={handleMenuClick} />
      )}
    </>
  );
};

export default SideNav;
