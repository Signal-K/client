import { Fragment, forwardRef, useState, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/router";
import { ConnectWallet, useAddress, /* useEditionDrop, */ useOwnedNFTs, useContract } from "@thirdweb-dev/react";
import styles from '../../styles/Staking-P2E/planetInteraction.module.css';

import {
    Bars3CenterLeftIcon,
    PencilIcon,
    ChevronDownIcon,
    CreditCardIcon,
    UserIcon,
    HomeIcon,
    Cog8ToothIcon,
} from "@heroicons/react/24/solid";
import { BellIcon, CheckIcon } from "@heroicons/react/24/outline";
import { Menu, Transition, Popover } from "@headlessui/react";

import { useSession, useSupabaseClient } from "@supabase/auth-helpers-react";

export default function CoreNavigation ({ showNav, setShowNav }) {
    const session = useSession();
    const supabase = useSupabaseClient();
    const address = useAddress();
    const router = useRouter();

    const [loading, setLoading] = useState(false);
    const [username, setUsername] = useState(null);
    const [avatar_url, setAvatarUrl] = useState(null);

    useEffect(() => {
        getProfile();
    }, [session]);

    async function getProfile () {
        try {
            setLoading(true);
            if (!session) throw new Error('No user authenticated');
            let { data, error, status } = await supabase
                .from('profiles')
                .select(`username, avatar_url`)
                .eq('id', session?.user?.id)
                .single()

            if (error && status !== 406) { throw error; };
            if ( data ) {
                setUsername(data.username);
                setAvatarUrl(data.avatar_url);
            };
        } catch (error) {
            //alert('Error loading your user data');
            console.log(error);
        } finally {
            setLoading(false);
        }
    }

    return (
      <>
      <div className="navbar bg-base-100"> {/* TODO: Put this inside the drawer open icon */}
  <div className="flex-1">
    <a className="btn btn-ghost normal-case text-xl">daisyUI</a>
  </div>
  <div className="flex-none gap-2">
    <div className="form-control">
      <input type="text" placeholder="Search" className="input input-bordered" />
    </div>
    <div className="dropdown dropdown-end">
      <label tabIndex={0} className="btn btn-ghost btn-circle avatar">
        <div className="w-10 rounded-full">
          <img src="/images/stock/photo-1534528741775-53994a69daeb.jpg" />
        </div>
      </label>
      <ul tabIndex={0} className="mt-3 p-2 shadow menu menu-compact dropdown-content bg-base-100 rounded-box w-52">
        <li>
          <a className="justify-between">
            Profile
            <span className="badge">New</span>
          </a>
        </li>
        <li><a>Settings</a></li>
        <li><a>Logout</a></li>
      </ul>
    </div>
  </div>
</div>
        <div
            className={`fixed w-full h-16 flex justify-between items-center transition-all duration-[400ms] ${
                showNav ? "pl-56" : ""
            }`}
        >
            <div className="pl-4 md:pl-16">
                <Bars3CenterLeftIcon
                    className="h-8 w-8 text-gray-700 cursor-pointer"
                    onClick={() => setShowNav(!showNav)}
                />
            </div>
            <div className="flex items-center pr-4 md:pr-16">
                <Popover className="relative">
                    <Popover.Button className="outline-none mr-5 md:mr-8 cursor-pointer text-gray-700">
                        <BellIcon className="h-6 w-6" />
                    </Popover.Button>
                    <Transition
                        as={Fragment}
                        enter="transition ease-out duration-100"
                        enterFrom="transform scale-95"
                        enterTo="transform scale-100"
                        leave="transition ease-in duration=75"
                        leaveFrom="transform scale-100"
                        leaveTo="transform scale-95"
                    >
                        <Popover.Panel className="absolute -right-16 sm:right-4 z-50 mt-2 bg-white shadow-sm rounded max-w-xs sm:max-w-sm w-screen">
                            <div className="relative p-3">
                                <div className="flex justify-between items-center w-full">
                                <p className="text-gray-700 font-medium">Notifications</p>
                      <a className="text-sm text-orange-500" href="#">
                        Mark all as read
                      </a>
                    </div>
                    <div className="mt-4 grid gap-4 grid-cols-1 overflow-hidden">
                      <div className="flex">
                        <div className="rounded-full shrink-0 bg-green-200 h-8 w-8 flex items-center justify-center">
                          <CheckIcon className="h-4 w-4 text-green-600" />
                        </div>
                        <div className="ml-4">
                          <p className="font-medium text-gray-700">
                            Notification Title
                          </p>
                          <p className="text-sm text-gray-500 truncate">
                            Test Notification text for design
                          </p>
                        </div>
                      </div>
                      <div className="flex">
                        <div className="rounded-full shrink-0 bg-green-200 h-8 w-8 flex items-center justify-center">
                          <CheckIcon className="h-4 w-4 text-green-600" />
                        </div>
                        <div className="ml-4">
                          <p className="font-medium text-gray-700">
                            Notification Title
                          </p>
                          <p className="text-sm text-gray-500 truncate">
                            Test Notification text for design
                          </p>
                        </div>
                      </div>
                      <div className="flex">
                        <div className="rounded-full shrink-0 bg-green-200 h-8 w-8 flex items-center justify-center">
                          <CheckIcon className="h-4 w-4 text-green-600" />
                        </div>
                        <div className="ml-4">
                          <p className="font-medium text-gray-700">
                            Notification Title
                          </p>
                          <p className="text-sm text-gray-500 truncate">
                            Test Notification text for design
                          </p>
                        </div>
                      </div>
                      <div className="flex">
                        <div className="rounded-full shrink-0 bg-green-200 h-8 w-8 flex items-center justify-center">
                          <CheckIcon className="h-4 w-4 text-green-600" />
                        </div>
                        <div className="ml-4">
                          <p className="font-medium text-gray-700">
                            Notification Title
                          </p>
                          <p className="text-sm text-gray-500 truncate">
                            Test Notification text for design
                          </p>
                        </div>
                      </div>
                    </div>
                  </div>
                </Popover.Panel>
              </Transition>
            </Popover>
            <Menu as="div" className="relative inline-block text-left">
              <div>
                <Menu.Button className="inline-flex w-full justify-center items-center">
                  <picture>
                    <img
                        src="https://user-images.githubusercontent.com/31812229/222339335-ae57fdb9-6fbd-4d26-9225-a18c02b6edeb.png"
                      //src={avatar_url}
                        className="rounded-full h-8 md:mr-4 border-2 border-white shadow-sm"
                        alt="profile picture"
                    />
                  </picture>
                  <span className="hidden md:block font-medium text-gray-700">
                    {username}
                  </span>
                  <ChevronDownIcon className="ml-2 h-4 w-4 text-gray-700" />
                </Menu.Button>
              </div>
              <Transition
                as={Fragment}
                enter="transition ease-out duration-100"
                enterFrom="transform scale-95"
                enterTo="transform scale-100"
                leave="transition ease-in duration=75"
                leaveFrom="transform scale-100"
                leaveTo="transform scale-95"
              >
                <Menu.Items className="absolute right-0 w-56 z-50 mt-2 origin-top-right bg-white rounded shadow-sm">
                  <div className="p-1">
                    <Menu.Item>
                      <Link
                        href="#"
                        className="flex hover:bg-orange-500 hover:text-white text-gray-700 rounded p-2 text-sm group transition-colors items-center"
                      >
                        <PencilIcon className="h-4 w-4 mr-2" />
                        Edit
                      </Link>
                    </Menu.Item>
                    <Menu.Item>
                      <Link
                        href="https://orcid.org/my-orcid?orcid=0009-0000-9139-5148"
                        className="flex hover:bg-orange-500 hover:text-white text-gray-700 rounded p-2 text-sm group transition-colors items-center"
                      >
                        <CreditCardIcon className="h-4 w-4 mr-2" />
                        ORCID
                      </Link>
                    </Menu.Item>
                    <Menu.Item>
                                    <Link
                                        href="#"
                                        className="flex hover:bg-orange-500 hover:text-white text-gray-700 rounded p-2 text-sm group transition-colors items-center"
                                    >
                                        <Cog8ToothIcon className="h-4 w-4 mr-2" />
                                        Settings
                                    </Link>
                                </Menu.Item>
                                <Menu.Item>
                                {/*<div className={styles.container}>*/}
                                  <ConnectWallet /> {/* OnClick -> add the returned signature & address to the user's supabase "address" field on table "profiles" */}
                              </Menu.Item>
                            </div>
                        </Menu.Items>
                    </Transition>
                </Menu>
            </div>
        </div>
      </>
    );
}