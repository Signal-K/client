import { useRouter } from "next/router";
import Link from "next/link";
import { Navbar, Button, Text } from "@nextui-org/react";

import { useSession, useSupabaseClient } from "@supabase/auth-helpers-react";

const JournalNavbarComponent = () => {
    const supabaseClient = useSupabaseClient();
    const session = useSession();
    const router = useRouter();

    function signOutUser() {
        supabaseClient.auth.signOut();
        router.push("/"); // localhost:3000
    }

    return (
        <Navbar isBordered isCompact>
            <Navbar.Brand as={Link} href="/">
                ShareArticles
            </Navbar.Brand>
            <Navbar.Content hideIn="xs" variant="highlight-rounded">
                <Navbar.Link href="/journal/">Main Feed</Navbar.Link>
                <Navbar.Link href="/journal/createArticle">Create Article</Navbar.Link>
            </Navbar.Content>

            <Navbar.Content>
                {!session?.user ?  /*User doesnt exist*/
                    <>
                        <Navbar.Link href="/login">
                            <Button auto flat>
                                Login
                            </Button>
                        </Navbar.Link>
                    </>
                :         /* User does exist */
                    <>
                        <Navbar.Item>
                            <Text>Hey, {session?.user?.email}</Text>
                        </Navbar.Item>
                        <Navbar.Item>
                            <Button auto flat onPress={() => signOutUser()}>
                                Sign Out
                            </Button>
                        </Navbar.Item>
                    </>
                }  
            </Navbar.Content>
        </Navbar>
    )
}

export default JournalNavbarComponent;