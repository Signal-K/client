import Head from "next/head";
import Container from 'react-bootstrap/Container';
import GithubCorner from './GithubCorner';

export default function Layout(props: {children: any[]}) {
    return <>
        <Head><title>World Generation</title></Head>
        <GithubCorner />
        <Container fluid>
            {props.children}
        </Container>
    </>;
}