import Card, { ProfileCard } from "./Card";
import ClickOutHandler from 'react-clickout-handler';
import React, { useContext, useEffect, useState } from "react";
import Link from "next/link";
import AccountAvatar, { PostCardAvatar } from "./AccountAvatar";
import { useSession, useSupabaseClient } from "@supabase/auth-helpers-react";
import { UserContext } from "../context/UserContext";

import en from 'javascript-time-ago/locale/en.json';
import TimeAgo from "javascript-time-ago";
TimeAgo.addDefaultLocale(en);
import ReactTimeAgo from "react-time-ago";
import { planetsImagesCdnAddress } from "../constants/cdn";

// type Profiles = Database['public']['Tables']['profiles']['Row'];

export function PostModal ( { content, created_at, media, profiles:authorProfile, planets2 } ) {
  const [loading, setLoading] = useState(false);
  const { profile: myProfile } = useContext(UserContext);
  const [profiles, setProfiles] = useState();
  const supabase = useSupabaseClient();
  const session = useSession();

  const [dropdownOpen, setDropdownOpen] = useState(false);

  function openDropdown(e) {
    e.stopPropagation();
    setDropdownOpen(true);
  };

  function handleClickOutsideDropdown(e) {
    e.stopPropagation();
    setDropdownOpen(false);
  };

  return (
    <div className="overflow-y-auto" aria-labelledby="modal-title" role="dialog" aria-modal="true">
    <div className="flex items-end justify-center min- px-4 pb-20 text-center sm:block sm:p-0">
    
        <div className="transition-opacity bg-gray-500 bg-opacity-75" aria-hidden="true"></div>
        <span className="hidden sm:inline-block sm:align-middle sm:" aria-hidden="true">​</span>
        
        <div className="inline-block p-5 overflow-hidden text-left align-bottom transition-all transform bg-white rounded-lg shadow-2xl lg:p-16 sm:my-8 sm:align-middle sm:max-w-xl sm:w-full">
            <div>
                <div className="mt-3 text-left sm:mt-5">
                    <div className="py-6 text-center">
                      <div className="flex text-center">
                        <Link href={'/posts/profile/'+authorProfile?.id}>
                          <PostCardAvatar
                            url={authorProfile?.avatar_url}
                            size={45}
                          />
                        </Link>
                      </div>
                      {authorProfile !== null && (
                        <center><p className="mb-8 text-2xl font-semibold leading-none tracking-tighter text-neutral-600">Classification by {authorProfile.username}</p></center>
                      )}
                      {authorProfile === null && (
                        <center><p className="mb-8 text-2xl font-semibold leading-none tracking-tighter text-neutral-600">Classification by Anon</p></center>
                      )}
                      <p className="mt-1 text-sm text-gray-500">{content} (Planet {planets2}) {planets2?.temperature}</p>
                      <center><div className="flex gap-4"><div className="rounded-md overflow-hidden"><img src={planetsImagesCdnAddress + planets2 + '/' + 'download.png'} height='80%' width='80%' /></div></div></center>
                        {media?.length > 0 && (
                          <div className="flex gap-4">
                            {media?.length > 0 && media.map(media => (
                              <div key={media} className="rounded-md overflow-hidden"><img src={media} /></div>
                            ))}
                          </div>
                        )}
                    </div>
                </div>
            </div>
            <div className="justify-between w-full mx-auto mt-4 overflow-hidden rounded-lg wt-10 sm:flex">
                <div className="flex flex-row w-full">
                    <a href={'planets/' + planets2} className="flex items-center justify-center px-4 py-4 text-base font-normal text-white bg-blue-500 border border-transparent lg:w-1/3 hover:bg-gray-800 sm:text-sm">
                    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width="24" height="24">
  <circle cx="12" cy="12" r="10" fill="#f9dc9c" />
  <path d="M11.847 14.872c-.875-.054-1.738-.365-2.545-.918-1.243-.863-2.184-2.209-2.605-3.777-.374-1.312-.321-2.7.113-3.959.434-1.258 1.26-2.379 2.413-3.119.826-.474 1.74-.731 2.662-.743.212-.002.422-.01.631-.023.379-.03.758-.08 1.13-.152.98-.23 1.94-.67 2.812-1.28l-.011.012c.982-.69 1.907-1.582 2.749-2.639 1.181-1.495 2.014-3.13 2.427-4.878.008-.03.013-.06.02-.089l.001-.004c.198-.675.284-1.39.248-2.106-.055-1.123-.449-2.214-1.15-3.124-.65-.841-1.5-1.5-2.438-1.955-.24-.115-.482-.215-.727-.3-.165-.058-.332-.107-.5-.15-.47-.115-.94-.18-1.416-.193l-.298-.002c-.25.004-.5.029-.746.074-1.142.226-2.212.766-3.116 1.587-.842.791-1.523 1.762-1.937 2.844-.238.647-.392 1.321-.454 2.013-.046.487-.014.975.083 1.449.183.867.53 1.677 1.018 2.408.621.912 1.447 1.628 2.399 2.088.219.089.443.167.67.231.113.032.226.06.34.084.457.1.922.15 1.386.154h.181c.243-.002.485-.018.725-.048.771-.103 1.526-.348 2.239-.725 1.191-.582 2.186-1.488 2.914-2.631l.002-.003c.898 1.195 1.19 2.707.843 4.11-.204 1.036-.727 2.025-1.492 2.878-.813 1-1.875 1.774-3.07 2.282l-.007.002c-.088.029-.176.057-.264.083-.339.1-.684.19-1.033.268-.08.018-.16.035-.24.05-.508.096-1.023.16-1.54.192z" fill="#e3c7a2" />
</svg>
                    </a>

                    <a href="#" className="flex items-center justify-center px-4 py-4 text-base font-normal text-white bg-blue-500 border border-transparent lg:w-1/3 hover:bg-gray-800 sm:text-sm">
                        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                            <path d="M8.5 2C6.84315 2 5.5 3.34315 5.5 5C5.5 6.65685 6.84315 8 8.5 8H15.5C17.1569 8 18.5 6.65685 18.5 5C18.5 3.34315 17.1569 2 15.5 2H8.5Z" fill="currentColor"></path>
                            <path d="M15.5 9C13.8431 9 12.5 10.3431 12.5 12C12.5 13.6569 13.8431 15 15.5 15C17.1569 15 18.5 13.6569 18.5 12C18.5 10.3431 17.1569 9 15.5 9Z" fill="currentColor"></path>
                            <path d="M5.5 12C5.5 10.3431 6.84315 9 8.5 9H11.5V15H8.5C6.84315 15 5.5 13.6569 5.5 12Z" fill="currentColor"></path>
                            <path d="M8.5 16C6.84315 16 5.5 17.3431 5.5 19C5.5 20.6569 6.84315 22 8.5 22C10.1569 22 11.5 20.6569 11.5 19V16H8.5Z" fill="currentColor"></path>
                        </svg>
                    </a>

                    <a href="#" className="flex items-center justify-center px-4 py-4 text-base font-normal text-white bg-blue-500 border border-transparent lg:w-1/3 hover:bg-gray-800 sm:text-sm">
                        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                            <path d="M14.8284 12.0259L16.2426 13.4402L12 17.6828L7.75733 13.4402L9.17155 12.0259L11 13.8544V6.31724H13V13.8544L14.8284 12.0259Z" fill="currentColor"></path>
                            <path fillRule="evenodd" clipRule="evenodd" d="M1 5C1 2.79086 2.79086 1 5 1H19C21.2091 1 23 2.79086 23 5V19C23 21.2091 21.2091 23 19 23H5C2.79086 23 1 21.2091 1 19V5ZM5 3H19C20.1046 3 21 3.89543 21 5V19C21 20.1046 20.1046 21 19 21H5C3.89543 21 3 20.1046 3 19V5C3 3.89543 3.89543 3 5 3Z" fill="currentColor"></path>
                        </svg>
                    </a>
                </div>
            </div>
        </div>
    </div>
  </div>
  )
}

export default function PostCard ( { content, created_at, media, profiles:authorProfile, planets2 } ) {
  const [loading, setLoading] = useState(false);
  //const [avatar_url, setAvatarUrl] = useState<Profiles['avatar_url']>();
  const { profile: myProfile } = useContext(UserContext);
  const [profiles, setProfiles] = useState();
  const supabase = useSupabaseClient();
  const session = useSession();

  const [dropdownOpen,setDropdownOpen] = useState(false);

  function openDropdown(e) {
    e.stopPropagation();
    setDropdownOpen(true);
  }

  function handleClickOutsideDropdown(e) {
    e.stopPropagation();
    setDropdownOpen(false);
  }

  return (
    <Card noPadding={false}>
      <div className="flex gap-3">
        <div>
          <Link href={'/posts/profile/'+authorProfile?.id}>
            <span className="cursor-pointer">
              <PostCardAvatar url={authorProfile?.avatar_url}
                size={50} />
            </span>
          </Link>
        </div>
        <div className="grow">
          <p>
            <Link href={'/posts/profile/'+authorProfile?.id}>
              <span className="mr-1 font-semibold cursor-pointer hover:underline">
                {authorProfile?.username}
              </span>
            </Link>
            shared a <Link legacyBehavior href='/posts/'><a className="text-socialBlue">post</a></Link> on <Link legacyBehavior href="https://play.skinetics.tech/planets/{planets2}"><a className="text-socialBlue">planet {planets2}</a></Link> {/* Add link to ORCHID publication ID/Lens ID */}
          </p>
          <p className="text-gray-500 text-sm"><ReactTimeAgo date={ ( new Date(created_at)).getTime() } /></p>{/* <ReactTimeAgo date={ ( created_at instanceof Date ? created_at.getTime() : created_at ) } /> */}
        </div>
        <div className="relative">
          <button className="text-gray-400" onClick={openDropdown}>
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-6 h-6">
              <path strokeLinecap="round" strokeLinejoin="round" d="M6.75 12a.75.75 0 11-1.5 0 .75.75 0 011.5 0zM12.75 12a.75.75 0 11-1.5 0 .75.75 0 011.5 0zM18.75 12a.75.75 0 11-1.5 0 .75.75 0 011.5 0z" />
            </svg>
          </button>
          {dropdownOpen && (
            <div className="bg-red w-5 h-5 absolute top-0"></div>
          )} {/* Add a button/handler to show Sandbox info if available */}
          <ClickOutHandler onClickOut={handleClickOutsideDropdown}>
            <div className="relative">
              {dropdownOpen && (
                <div className="absolute -right-6 bg-white shadow-md shadow-gray-300 p-3 rounded-sm border border-gray-100 w-52">
                  <a href="" className="flex gap-3 py-2 my-2 hover:bg-socialBlue hover:text-white -mx-4 px-4 rounded-md transition-all hover:scale-110 hover:shadow-md shadow-gray-300">
                    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-6 h-6">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M17.593 3.322c1.1.128 1.907 1.077 1.907 2.185V21L12 17.25 4.5 21V5.507c0-1.108.806-2.057 1.907-2.185a48.507 48.507 0 0111.186 0z" />
                    </svg>
                    Save post</a>
                  <a href="" className="flex gap-3 py-2 my-2 hover:bg-socialBlue hover:text-white -mx-4 px-4 rounded-md transition-all hover:scale-110 hover:shadow-md shadow-gray-300">
                    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-6 h-6">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M14.857 17.082a23.848 23.848 0 005.454-1.31A8.967 8.967 0 0118 9.75v-.7V9A6 6 0 006 9v.75a8.967 8.967 0 01-2.312 6.022c1.733.64 3.56 1.085 5.455 1.31m5.714 0a24.255 24.255 0 01-5.714 0m5.714 0a3 3 0 11-5.714 0M3.124 7.5A8.969 8.969 0 015.292 3m13.416 0a8.969 8.969 0 012.168 4.5" />
                    </svg>
                    Turn notifications</a>
                  <a href="" className="flex gap-3 py-2 my-2 hover:bg-socialBlue hover:text-white -mx-4 px-4 rounded-md transition-all hover:scale-110 hover:shadow-md shadow-gray-300">
                    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-6 h-6">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                    </svg>
                    Hide post</a>
                  <a href="" className="flex gap-3 py-2 my-2 hover:bg-socialBlue hover:text-white -mx-4 px-4 rounded-md transition-all hover:scale-110 hover:shadow-md shadow-gray-300">
                    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-6 h-6">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M14.74 9l-.346 9m-4.788 0L9.26 9m9.968-3.21c.342.052.682.107 1.022.166m-1.022-.165L18.16 19.673a2.25 2.25 0 01-2.244 2.077H8.084a2.25 2.25 0 01-2.244-2.077L4.772 5.79m14.456 0a48.108 48.108 0 00-3.478-.397m-12 .562c.34-.059.68-.114 1.022-.165m0 0a48.11 48.11 0 013.478-.397m7.5 0v-.916c0-1.18-.91-2.164-2.09-2.201a51.964 51.964 0 00-3.32 0c-1.18.037-2.09 1.022-2.09 2.201v.916m7.5 0a48.667 48.667 0 00-7.5 0" />
                    </svg>
                    Delete</a>
                  <a href="" className="flex gap-3 py-2 my-2 hover:bg-socialBlue hover:text-white -mx-4 px-4 rounded-md transition-all hover:scale-110 hover:shadow-md shadow-gray-300">
                    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-6 h-6">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v3.75m-9.303 3.376c-.866 1.5.217 3.374 1.948 3.374h14.71c1.73 0 2.813-1.874 1.948-3.374L13.949 3.378c-.866-1.5-3.032-1.5-3.898 0L2.697 16.126zM12 15.75h.007v.008H12v-.008z" />
                    </svg>
                    Report
                  </a>
                </div>
              )}
            </div>
          </ClickOutHandler>
        </div>
      </div>
      <div>
        <p className="my-3 text-sm">{content}</p>
        {media?.length > 0 && (
          <div className="flex gap-4">
            {media?.length > 0 && media.map(media => (
              <div key={media} className="rounded-md overflow-hidden"><img src={media} /></div>
            ))}
          </div>
        )}
      </div>
      {/*<div className="mt-5 flex gap-8">
        <button className="flex gap-2 items-center">
          <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-6 h-6">
            <path strokeLinecap="round" strokeLinejoin="round" d="M21 8.25c0-2.485-2.099-4.5-4.688-4.5-1.935 0-3.597 1.126-4.312 2.733-.715-1.607-2.377-2.733-4.313-2.733C5.1 3.75 3 5.765 3 8.25c0 7.22 9 12 9 12s9-4.78 9-12z" />
          </svg>
          72
        </button>
        <button className="flex gap-2 items-center">
          <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-6 h-6">
            <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 12.76c0 1.6 1.123 2.994 2.707 3.227 1.087.16 2.185.283 3.293.369V21l4.076-4.076a1.526 1.526 0 011.037-.443 48.282 48.282 0 005.68-.494c1.584-.233 2.707-1.626 2.707-3.228V6.741c0-1.602-1.123-2.995-2.707-3.228A48.394 48.394 0 0012 3c-2.392 0-4.744.175-7.043.513C3.373 3.746 2.25 5.14 2.25 6.741v6.018z" />
          </svg>
          11
        </button>
        <button className="flex gap-2 items-center">
          <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-6 h-6">
            <path strokeLinecap="round" strokeLinejoin="round" d="M7.217 10.907a2.25 2.25 0 100 2.186m0-2.186c.18.324.283.696.283 1.093s-.103.77-.283 1.093m0-2.186l9.566-5.314m-9.566 7.5l9.566 5.314m0 0a2.25 2.25 0 103.935 2.186 2.25 2.25 0 00-3.935-2.186zm0-12.814a2.25 2.25 0 103.933-2.185 2.25 2.25 0 00-3.933 2.185z" />
          </svg>
          4
        </button>
      </div>
      {/*<UtterancesComments />*/}
      <div className="flex mt-4 gap-3">
        <div className="mt-1">
          <AccountAvatar uid={session?.user?.id}
              url={authorProfile?.avatar_url}
              size={45} />
        </div>
        <div className="border grow rounded-full relative">
          <textarea className="block w-full p-3 px-4 overflow-hidden h-12 rounded-full" placeholder="Leave a comment"/>
          <button className="absolute top-3 right-3 text-gray-400">
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-6 h-6">
              <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 15.75l5.159-5.159a2.25 2.25 0 013.182 0l5.159 5.159m-1.5-1.5l1.409-1.409a2.25 2.25 0 013.182 0l2.909 2.909m-18 3.75h16.5a1.5 1.5 0 001.5-1.5V6a1.5 1.5 0 00-1.5-1.5H3.75A1.5 1.5 0 002.25 6v12a1.5 1.5 0 001.5 1.5zm10.5-11.25h.008v.008h-.008V8.25zm.375 0a.375.375 0 11-.75 0 .375.375 0 01.75 0z" />
            </svg>
          </button>
        </div>
        {/*<script src="https://utteranc.es/client.js"
          repo="signal-k/starsailors"
          issue-term="title"
          label="ansible"
          theme="github-light"
          crossorigin="anonymous"
          async>
        </script>*/}
      </div>
    </Card>
  );
}

export function PlanetPostCard ( { content, created_at, media, profiles:authorProfile, planets2 } ) {
  const [loading, setLoading] = useState(false);
  //const [avatar_url, setAvatarUrl] = useState<Profiles['avatar_url']>();
  const { profile: myProfile } = useContext(UserContext);
  const [profiles, setProfiles] = useState();
  const supabase = useSupabaseClient();
  const session = useSession();

  const [dropdownOpen,setDropdownOpen] = useState(false);

  function openDropdown(e) {
    e.stopPropagation();
    setDropdownOpen(true);
  }

  function handleClickOutsideDropdown(e) {
    e.stopPropagation();
    setDropdownOpen(false);
  }

  return (
    <Card noPadding={false}>
      <div className="flex gap-3">
        <div>
          <Link href={'/posts/profile/'+authorProfile?.id}>
            <span className="cursor-pointer">
              <PostCardAvatar url={authorProfile?.avatar_url}
                size={50} />
            </span>
          </Link>
        </div>
        <div className="grow">
          <p>
            <Link href={'/posts/profile/'+authorProfile?.id}>
              <span className="mr-1 font-semibold cursor-pointer hover:underline">
                {authorProfile?.username}
              </span>
            </Link>
            shared a <Link legacyBehavior href='/posts/'><a className="text-socialBlue">post</a></Link> {/* Add link to ORCHID publication ID/Lens ID */}
          </p>
          <p className="text-gray-500 text-sm"><ReactTimeAgo date={ ( new Date(created_at)).getTime() } /></p>{/* <ReactTimeAgo date={ ( created_at instanceof Date ? created_at.getTime() : created_at ) } /> */}
        </div>
        <div className="relative">
          <button className="text-gray-400" onClick={openDropdown}>
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-6 h-6">
              <path strokeLinecap="round" strokeLinejoin="round" d="M6.75 12a.75.75 0 11-1.5 0 .75.75 0 011.5 0zM12.75 12a.75.75 0 11-1.5 0 .75.75 0 011.5 0zM18.75 12a.75.75 0 11-1.5 0 .75.75 0 011.5 0z" />
            </svg>
          </button>
          {dropdownOpen && (
            <div className="bg-red w-5 h-5 absolute top-0"></div>
          )} {/* Add a button/handler to show Sandbox info if available */}
          <ClickOutHandler onClickOut={handleClickOutsideDropdown}>
            <div className="relative">
              {dropdownOpen && (
                <div className="absolute -right-6 bg-white shadow-md shadow-gray-300 p-3 rounded-sm border border-gray-100 w-52">
                  <a href="" className="flex gap-3 py-2 my-2 hover:bg-socialBlue hover:text-white -mx-4 px-4 rounded-md transition-all hover:scale-110 hover:shadow-md shadow-gray-300">
                    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-6 h-6">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M17.593 3.322c1.1.128 1.907 1.077 1.907 2.185V21L12 17.25 4.5 21V5.507c0-1.108.806-2.057 1.907-2.185a48.507 48.507 0 0111.186 0z" />
                    </svg>
                    Save post</a>
                  <a href="" className="flex gap-3 py-2 my-2 hover:bg-socialBlue hover:text-white -mx-4 px-4 rounded-md transition-all hover:scale-110 hover:shadow-md shadow-gray-300">
                    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-6 h-6">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M14.857 17.082a23.848 23.848 0 005.454-1.31A8.967 8.967 0 0118 9.75v-.7V9A6 6 0 006 9v.75a8.967 8.967 0 01-2.312 6.022c1.733.64 3.56 1.085 5.455 1.31m5.714 0a24.255 24.255 0 01-5.714 0m5.714 0a3 3 0 11-5.714 0M3.124 7.5A8.969 8.969 0 015.292 3m13.416 0a8.969 8.969 0 012.168 4.5" />
                    </svg>
                    Turn notifications</a>
                  <a href="" className="flex gap-3 py-2 my-2 hover:bg-socialBlue hover:text-white -mx-4 px-4 rounded-md transition-all hover:scale-110 hover:shadow-md shadow-gray-300">
                    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-6 h-6">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                    </svg>
                    Hide post</a>
                  <a href="" className="flex gap-3 py-2 my-2 hover:bg-socialBlue hover:text-white -mx-4 px-4 rounded-md transition-all hover:scale-110 hover:shadow-md shadow-gray-300">
                    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-6 h-6">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M14.74 9l-.346 9m-4.788 0L9.26 9m9.968-3.21c.342.052.682.107 1.022.166m-1.022-.165L18.16 19.673a2.25 2.25 0 01-2.244 2.077H8.084a2.25 2.25 0 01-2.244-2.077L4.772 5.79m14.456 0a48.108 48.108 0 00-3.478-.397m-12 .562c.34-.059.68-.114 1.022-.165m0 0a48.11 48.11 0 013.478-.397m7.5 0v-.916c0-1.18-.91-2.164-2.09-2.201a51.964 51.964 0 00-3.32 0c-1.18.037-2.09 1.022-2.09 2.201v.916m7.5 0a48.667 48.667 0 00-7.5 0" />
                    </svg>
                    Delete</a>
                  <a href="" className="flex gap-3 py-2 my-2 hover:bg-socialBlue hover:text-white -mx-4 px-4 rounded-md transition-all hover:scale-110 hover:shadow-md shadow-gray-300">
                    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-6 h-6">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v3.75m-9.303 3.376c-.866 1.5.217 3.374 1.948 3.374h14.71c1.73 0 2.813-1.874 1.948-3.374L13.949 3.378c-.866-1.5-3.032-1.5-3.898 0L2.697 16.126zM12 15.75h.007v.008H12v-.008z" />
                    </svg>
                    Report
                  </a>
                </div>
              )}
            </div>
          </ClickOutHandler>
        </div>
      </div>
      <div>
        <p className="my-3 text-sm">{content}</p>
        {media?.length > 0 && (
          <div className="flex gap-4">
            {media?.length > 0 && media.map(media => (
              <div key={media} className="rounded-md overflow-hidden"><img src={media} /></div>
            ))}
          </div>
        )}
      </div>
    </Card>
  );
}

export function AvatarPostCard ( { profiles:authorProfile } ) {
  const [loading, setLoading] = useState(false);
  //const [avatar_url, setAvatarUrl] = useState<Profiles['avatar_url']>();
  const { profile: myProfile } = useContext(UserContext);
  const [profiles, setProfiles] = useState();
  const supabase = useSupabaseClient();
  const session = useSession();

  return (
    <span className="cursor-pointer">
      <PostCardAvatar url={authorProfile?.avatar_url}
        size={50} />
    </span>
  );
}

export function PostCardProfile ( { content, created_at, media, profiles:authorProfile } ) {
  const [loading, setLoading] = useState(false);
  //const [avatar_url, setAvatarUrl] = useState<Profiles['avatar_url']>();
  const { profile: myProfile } = useContext(UserContext);
  const [profiles, setProfiles] = useState();
  const supabase = useSupabaseClient();
  const session = useSession();

  const [dropdownOpen,setDropdownOpen] = useState(false);

  function openDropdown(e) {
    e.stopPropagation();
    setDropdownOpen(true);
  }

  function handleClickOutsideDropdown(e) {
    e.stopPropagation();
    setDropdownOpen(false);
  }

  return (
    <ProfileCard noPadding={false}>
      <div className="flex gap-3">
        <div>
          <Link href={'/posts/profile/'+authorProfile?.id}>
            <span className="cursor-pointer">
              <PostCardAvatar url={authorProfile?.avatar_url}
                size={50} />
            </span>
          </Link>
        </div>
        <div className="grow">
          <p>
            <Link href={'/posts/profile/'+authorProfile?.id}>
              <span className="mr-1 font-semibold cursor-pointer hover:underline">
                {authorProfile?.username}
              </span>
            </Link>
            shared a <Link legacyBehavior href='/posts/'><a className="text-socialBlue">post</a></Link> {/* Add link to ORCHID publication ID/Lens ID */}
          </p>
          <p className="text-gray-500 text-sm"><ReactTimeAgo date={ ( new Date(created_at)).getTime() } /></p>{/* <ReactTimeAgo date={ ( created_at instanceof Date ? created_at.getTime() : created_at ) } /> */}
        </div>
        <div className="relative">
          <button className="text-gray-400" onClick={openDropdown}>
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-6 h-6">
              <path strokeLinecap="round" strokeLinejoin="round" d="M6.75 12a.75.75 0 11-1.5 0 .75.75 0 011.5 0zM12.75 12a.75.75 0 11-1.5 0 .75.75 0 011.5 0zM18.75 12a.75.75 0 11-1.5 0 .75.75 0 011.5 0z" />
            </svg>
          </button>
          {dropdownOpen && (
            <div className="bg-red w-5 h-5 absolute top-0"></div>
          )} {/* Add a button/handler to show Sandbox info if available */}
          <ClickOutHandler onClickOut={handleClickOutsideDropdown}>
            <div className="relative">
              {dropdownOpen && (
                <div className="absolute -right-6 bg-white shadow-md shadow-gray-300 p-3 rounded-sm border border-gray-100 w-52">
                  <a href="" className="flex gap-3 py-2 my-2 hover:bg-socialBlue hover:text-white -mx-4 px-4 rounded-md transition-all hover:scale-110 hover:shadow-md shadow-gray-300">
                    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-6 h-6">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M17.593 3.322c1.1.128 1.907 1.077 1.907 2.185V21L12 17.25 4.5 21V5.507c0-1.108.806-2.057 1.907-2.185a48.507 48.507 0 0111.186 0z" />
                    </svg>
                    Save post</a>
                  <a href="" className="flex gap-3 py-2 my-2 hover:bg-socialBlue hover:text-white -mx-4 px-4 rounded-md transition-all hover:scale-110 hover:shadow-md shadow-gray-300">
                    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-6 h-6">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M14.857 17.082a23.848 23.848 0 005.454-1.31A8.967 8.967 0 0118 9.75v-.7V9A6 6 0 006 9v.75a8.967 8.967 0 01-2.312 6.022c1.733.64 3.56 1.085 5.455 1.31m5.714 0a24.255 24.255 0 01-5.714 0m5.714 0a3 3 0 11-5.714 0M3.124 7.5A8.969 8.969 0 015.292 3m13.416 0a8.969 8.969 0 012.168 4.5" />
                    </svg>
                    Turn notifications</a>
                  <a href="" className="flex gap-3 py-2 my-2 hover:bg-socialBlue hover:text-white -mx-4 px-4 rounded-md transition-all hover:scale-110 hover:shadow-md shadow-gray-300">
                    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-6 h-6">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                    </svg>
                    Hide post</a>
                  <a href="" className="flex gap-3 py-2 my-2 hover:bg-socialBlue hover:text-white -mx-4 px-4 rounded-md transition-all hover:scale-110 hover:shadow-md shadow-gray-300">
                    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-6 h-6">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M14.74 9l-.346 9m-4.788 0L9.26 9m9.968-3.21c.342.052.682.107 1.022.166m-1.022-.165L18.16 19.673a2.25 2.25 0 01-2.244 2.077H8.084a2.25 2.25 0 01-2.244-2.077L4.772 5.79m14.456 0a48.108 48.108 0 00-3.478-.397m-12 .562c.34-.059.68-.114 1.022-.165m0 0a48.11 48.11 0 013.478-.397m7.5 0v-.916c0-1.18-.91-2.164-2.09-2.201a51.964 51.964 0 00-3.32 0c-1.18.037-2.09 1.022-2.09 2.201v.916m7.5 0a48.667 48.667 0 00-7.5 0" />
                    </svg>
                    Delete</a>
                  <a href="" className="flex gap-3 py-2 my-2 hover:bg-socialBlue hover:text-white -mx-4 px-4 rounded-md transition-all hover:scale-110 hover:shadow-md shadow-gray-300">
                    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-6 h-6">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v3.75m-9.303 3.376c-.866 1.5.217 3.374 1.948 3.374h14.71c1.73 0 2.813-1.874 1.948-3.374L13.949 3.378c-.866-1.5-3.032-1.5-3.898 0L2.697 16.126zM12 15.75h.007v.008H12v-.008z" />
                    </svg>
                    Report
                  </a>
                </div>
              )}
            </div>
          </ClickOutHandler>
        </div>
      </div>
      <div>
        <p className="my-3 text-sm">{content}</p>
        {media?.length > 0 && (
          <div className="flex gap-4">
            {media?.length > 0 && media.map(media => (
              <div key={media} className="rounded-md overflow-hidden"><img src={media} /></div>
            ))}
          </div>
        )}
      </div>
      <div className="mt-5 flex gap-8">
        <button className="flex gap-2 items-center">
          <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-6 h-6">
            <path strokeLinecap="round" strokeLinejoin="round" d="M21 8.25c0-2.485-2.099-4.5-4.688-4.5-1.935 0-3.597 1.126-4.312 2.733-.715-1.607-2.377-2.733-4.313-2.733C5.1 3.75 3 5.765 3 8.25c0 7.22 9 12 9 12s9-4.78 9-12z" />
          </svg>
          72
        </button>
        <button className="flex gap-2 items-center">
          <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-6 h-6">
            <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 12.76c0 1.6 1.123 2.994 2.707 3.227 1.087.16 2.185.283 3.293.369V21l4.076-4.076a1.526 1.526 0 011.037-.443 48.282 48.282 0 005.68-.494c1.584-.233 2.707-1.626 2.707-3.228V6.741c0-1.602-1.123-2.995-2.707-3.228A48.394 48.394 0 0012 3c-2.392 0-4.744.175-7.043.513C3.373 3.746 2.25 5.14 2.25 6.741v6.018z" />
          </svg>
          11
        </button>
        <button className="flex gap-2 items-center">
          <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-6 h-6">
            <path strokeLinecap="round" strokeLinejoin="round" d="M7.217 10.907a2.25 2.25 0 100 2.186m0-2.186c.18.324.283.696.283 1.093s-.103.77-.283 1.093m0-2.186l9.566-5.314m-9.566 7.5l9.566 5.314m0 0a2.25 2.25 0 103.935 2.186 2.25 2.25 0 00-3.935-2.186zm0-12.814a2.25 2.25 0 103.933-2.185 2.25 2.25 0 00-3.933 2.185z" />
          </svg>
          4
        </button>
      </div>
      {/*<UtterancesComments />*/}
      <div className="flex mt-4 gap-3">
        <div className="mt-1">
          <AccountAvatar uid={session?.user?.id}
              url={authorProfile?.avatar_url}
              size={45} />
        </div>
        <div className="border grow rounded-full relative">
          <textarea className="block w-full p-3 px-4 overflow-hidden h-12 rounded-full" placeholder="Leave a comment"/>
          <button className="absolute top-3 right-3 text-gray-400">
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-6 h-6">
              <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 15.75l5.159-5.159a2.25 2.25 0 013.182 0l5.159 5.159m-1.5-1.5l1.409-1.409a2.25 2.25 0 013.182 0l2.909 2.909m-18 3.75h16.5a1.5 1.5 0 001.5-1.5V6a1.5 1.5 0 00-1.5-1.5H3.75A1.5 1.5 0 002.25 6v12a1.5 1.5 0 001.5 1.5zm10.5-11.25h.008v.008h-.008V8.25zm.375 0a.375.375 0 11-.75 0 .375.375 0 01.75 0z" />
            </svg>
          </button>
        </div>
        {/*<script src="https://utteranc.es/client.js"
          repo="signal-k/starsailors"
          issue-term="title"
          label="ansible"
          theme="github-light"
          crossorigin="anonymous"
          async>
        </script>*/}
      </div>
    </ProfileCard>
  );
}

      {/*<div className="mt-5 flex gap-8">
        <button className="flex gap-2 items-center">
          <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-6 h-6">
            <path strokeLinecap="round" strokeLinejoin="round" d="M21 8.25c0-2.485-2.099-4.5-4.688-4.5-1.935 0-3.597 1.126-4.312 2.733-.715-1.607-2.377-2.733-4.313-2.733C5.1 3.75 3 5.765 3 8.25c0 7.22 9 12 9 12s9-4.78 9-12z" />
          </svg>
          72
        </button>
        <button className="flex gap-2 items-center">
          <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-6 h-6">
            <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 12.76c0 1.6 1.123 2.994 2.707 3.227 1.087.16 2.185.283 3.293.369V21l4.076-4.076a1.526 1.526 0 011.037-.443 48.282 48.282 0 005.68-.494c1.584-.233 2.707-1.626 2.707-3.228V6.741c0-1.602-1.123-2.995-2.707-3.228A48.394 48.394 0 0012 3c-2.392 0-4.744.175-7.043.513C3.373 3.746 2.25 5.14 2.25 6.741v6.018z" />
          </svg>
          11
        </button>
        <button className="flex gap-2 items-center">
          <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-6 h-6">
            <path strokeLinecap="round" strokeLinejoin="round" d="M7.217 10.907a2.25 2.25 0 100 2.186m0-2.186c.18.324.283.696.283 1.093s-.103.77-.283 1.093m0-2.186l9.566-5.314m-9.566 7.5l9.566 5.314m0 0a2.25 2.25 0 103.935 2.186 2.25 2.25 0 00-3.935-2.186zm0-12.814a2.25 2.25 0 103.933-2.185 2.25 2.25 0 00-3.933 2.185z" />
          </svg>
          4
        </button>
      </div>
      {/*<UtterancesComments />*/}
      {/*<div className="flex mt-4 gap-3">
        <div className="mt-1">
          <AccountAvatar uid={session?.user?.id}
              url={authorProfile?.avatar_url}
              size={45} />
        </div>
         <div className="border grow rounded-full relative">
          <textarea className="block w-full p-3 px-4 overflow-hidden h-12 rounded-full" placeholder="Leave a comment"/>
          <button className="absolute top-3 right-3 text-gray-400">
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-6 h-6">
              <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 15.75l5.159-5.159a2.25 2.25 0 013.182 0l5.159 5.159m-1.5-1.5l1.409-1.409a2.25 2.25 0 013.182 0l2.909 2.909m-18 3.75h16.5a1.5 1.5 0 001.5-1.5V6a1.5 1.5 0 00-1.5-1.5H3.75A1.5 1.5 0 002.25 6v12a1.5 1.5 0 001.5 1.5zm10.5-11.25h.008v.008h-.008V8.25zm.375 0a.375.375 0 11-.75 0 .375.375 0 01.75 0z" />
            </svg>
          </button>
        </div> */}
        {/*<script src="https://utteranc.es/client.js"
          repo="signal-k/starsailors"
          issue-term="title"
          label="ansible"
          theme="github-light"
          crossorigin="anonymous"
          async>
        </script>*/}
      {/* </div> */}