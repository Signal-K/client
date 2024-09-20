import Db from "./db";
import DashboardLayout from "../../components/Tests/Layout/Dashboard";

const DashboardPage: React.FC = () => {
  return (
    <DashboardLayout>
      <Db />
    </DashboardLayout>
  );
};

export default DashboardPage;