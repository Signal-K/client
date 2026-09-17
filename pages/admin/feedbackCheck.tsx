import Card from "../../components/Card";
import CoreLayout from "../../components/Core/Layout";

export default function FeedbackChecklist () {
    return (
        <CoreLayout>
            <Card noPadding={false}><iframe src="https://www.widgetscripts.com/dashboard" width="100%" height="1000px" /></Card>
        </CoreLayout>
    );
};