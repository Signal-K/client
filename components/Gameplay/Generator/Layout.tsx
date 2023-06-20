import Head from "next/head";
import Container from "react-bootstrap/Container";
import GitHubCorner from "./GithubCorner";

export default function Layout ( props: { children: any[] } ) {
    return <>
        <Head><title>World Generation</title></Head>
        <GitHubCorner />
        <Container fluid>
            {props.children};
        </Container>
    </>;
};