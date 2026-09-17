import Db from "./db";
import DashboardLayout from "../../components/Tests/Layout/Horizontal";

const DashboardPage: React.FC = () => {
  return (
    <DashboardLayout>
      <Db />
    </DashboardLayout>
  );
};

export default DashboardPage;