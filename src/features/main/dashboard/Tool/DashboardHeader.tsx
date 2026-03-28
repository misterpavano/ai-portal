import { IconHome } from "@tabler/icons-react";
import HeaderTitleText from "../../../../components/layouts/HeaderTitleText";

const DashboardHeader = () => {
  return (
    <HeaderTitleText
      title="Dashboard"
      icon={<IconHome size={18} color="white" />}
    />
  );
};

export default DashboardHeader;
