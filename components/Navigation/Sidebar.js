import React, { useState } from 'react'
import {
    Flex,
    Text,
    IconButton,
    Divider,
    Avatar,
    Heading
} from '@chakra-ui/react';
import {
    FiMenu,
    FiHome,
    FiCalendar,
    FiUser,
    FiDollarSign,
    FiBriefcase,
    FiSettings
} from 'react-icons/fi';
import { IoPawOutline } from 'react-icons/io5';
import NavItem from './NavItem';
import Link from 'next/link';

// Getting user data for sidebar
import { useAddress, useNetworkMismatch, useNetwork, ConnectWallet, ChainId, MediaRenderer } from '@thirdweb-dev/react';
import useLensUser from '../../lib/auth/useLensUser';
import useLogin from '../../lib/auth/useLogin';
import SignInButton from '../SignInButton';

export default function Sidebar() {
    const address = useAddress(); // Detect connected wallet
    const isOnWrongNetwork = useNetworkMismatch(); // Is different to `activeChainId` in `_app.tsx`
    const [, switchNetwork] = useNetwork(); // Switch network to `activeChainId`
    const { isSignedInQuery, profileQuery } = useLensUser();
    const { mutate: requestLogin } = useLogin();

    const [navSize, changeNavSize] = useState("small");

    return (
        <Flex
            pos="sticky"
            left="5"
            h="95vh"
            marginTop="2.5vh"
            boxShadow="0 4px 12px 0 rgba(0, 0, 0, 0.05)"
            borderRadius={navSize == "small" ? "15px" : "30px"}
            w={navSize == "small" ? "75px" : "200px"}
            flexDir="column"
            justifyContent="space-between"
            position='fixed'
        >
            <Flex
                p="5%"
                flexDir="column"
                w="100%"
                alignItems={navSize == "small" ? "center" : "flex-start"}
                as="nav"
            >
                <IconButton
                    background="none"
                    mt={5}
                    _hover={{ background: 'none' }}
                    icon={<FiMenu />}
                    onClick={() => {
                        if (navSize == "small")
                            changeNavSize("large")
                        else
                            changeNavSize("small")
                    }}
                />
                <NavItem navSize={navSize} icon={FiHome} title="Dashboard" active description="This is the description for the dashboard." />
                <Link href='/'><NavItem navSize={navSize} icon={FiCalendar} title="Feed" /></Link>
                <Link href="/profile/parselay.lens"><NavItem navSize={navSize} icon={FiUser} title="Profile" href="/profile/parselay.lens"/></Link>
                <NavItem navSize={navSize} icon={FiDollarSign} title="Stocks" />
                <NavItem navSize={navSize} icon={FiBriefcase} title="Reports" />
                <NavItem navSize={navSize} icon={FiSettings} title="Settings" />
                <Flex
                p="5%"
                flexDir="column"
                w="100%"
                alignItems={navSize == "small" ? "center" : "flex-start"}
                mb={4}
            ></Flex>
                <Divider display={navSize == 'small' ? 'none' : 'flex'} />
                
                <Flex mt={4} align="center">
                    <SignInButton />
                    <Flex flexDir="column" ml={4} display={navSize == "small" ? "none" : "flex"}>
                        <Heading as="h3" size="sm">Liam Arbuckle</Heading>
                        <Text color="gray">@parselay.lens</Text>
                    </Flex>
                </Flex>
            </Flex>

            <Flex
                p="5%"
                flexDir="column"
                w="100%"
                alignItems={navSize == "small" ? "center" : "flex-start"}
                mb={4}
            >
                <Divider display={navSize == "small" ? "none" : "flex"} />
                
            </Flex>
        </Flex>
    )
}