import Link from "next/link";
import Row from "react-bootstrap/Row";
import Col from "react-bootstrap/Col";
import Layout from "./Layout";

export default function SubPage ({ header, children }: {header: string, children: any }) {
    return (
        <Layout>
            <Row>
                <Col><h1 className="display-4">Hello {header}</h1></Col>
            </Row>
            {children}
        </Layout>
    )
}