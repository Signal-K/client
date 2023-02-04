import Layout from "../components/Layout";
import PostFormCard from "../components/Posts/PostFormCard";
import PostCard from "../components/Posts/PostCard";

export default function Home() {
  return (
    <Layout hideNavigation={false}>
      <PostFormCard />
      <PostCard />
    </Layout>
  )
}