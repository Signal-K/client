import ProfileButton from './Button';
import ProfileOptions from './ProfileOptions';
import clsx from 'clsx';
import { CreditCardIcon } from '@heroicons/react/24/outline';
import { InstagramLogoIcon } from '@radix-ui/react-icons';
import { GiftIcon } from '@heroicons/react/24/solid';
import { faEarthAmerica } from '@fortawesome/free-solid-svg-icons';
import { faLocation } from '@fortawesome/free-solid-svg-icons';
import { faCameraRetro } from '@fortawesome/free-solid-svg-icons';
import Masonry from 'react-masonry-css';
import React, { useEffect, useState } from 'react';
import Divider from './Divider';
import { useSession, useSupabaseClient } from '@supabase/auth-helpers-react';

export function UserProfileComp ({ user }: userProps) {
    const session = useSession();
    const supabase = useSupabaseClient();

    const [windowWidth, setWindowWidth] = useState<number>(0);
    let getWidth = window.innerWidth;

    window.addEventListener('resize', () => {
        if (getWidth > 768) {
            setWindowWidth(3)
        } else if (getWidth > 476) {
            setWindowWidth(2)
        } else {
            setWindowWidth(1)
        }
    })
    
      useEffect(() => {
        if (getWidth > 768) {
            setWindowWidth(3)
        } else if (getWidth > 476) {
            setWindowWidth(2)
        } else {
            setWindowWidth(1)
        }
    }, [getWidth]);

    return (
<div className="w-full flex flex-col ">
      <div className="flex-col sm:flex-row md:flex lg:flex xl:flex justify-between">
        <div className="flex flex-col sm:flex-row items-center">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={user?.profile_image?.large}
            alt=""
            className="w-48 h-48 rounded-[45px] object-cover mr-4"
          />
          <div className="pl-1 w-full text-center sm:text-left sm:w-4/6 mt-4 sm:mt-0">
            <h1 className="text-4xl font-semibold">
              {user?.first_name} {` `} {user?.last_name}
            </h1>
            <p className="mt-2 text-slate-500">@{user?.username}</p>
            <p className="my-3 text-slate-500 text-sm">{user?.bio}</p>
            <ProfileButton label="Follow" size="xs" padding="md" outline={false} />
            <ProfileButton label="Message" size="xs" padding="md" outline={true} />
          </div>
        </div>
        <div className="md:w-[25%] w-full px-4 flex flex-col items-center mt-4 md:mt-0">
          <div>
            {user?.for_hire ? (
              <ProfileOptions
                Icon={faCameraRetro}
                label="Available for hire"
                color="text-blue-500"
              />
            ) : (
              ''
            )}
            {user?.location ? (
              <ProfileOptions
                Icon={faCameraRetro}
                label={user?.location}
                color="text-slate-600"
              />
            ) : (
              ''
            )}
            {user?.tags?.custom.length ? (
              <ProfileOptions
                Icon={faCameraRetro}
                label="Interests"
                color="text-slate-600"
              />
            ) : null}
            <div className="flex flex-wrap cursor-pointer">
              {user?.tags?.custom.map((item: tagProps) => (
                <div
                  key={item?.title}
                  className="text-xs bg-slate-200 rounded-md text-slate-700 py-1 px-4 mr-2 mt-2 border"
                >
                  <p>{item?.title}</p>
                </div>
              ))}
            </div>
            <div className="flex">
              <div
                className={clsx(
                  user?.social?.instagram_username ? 'block' : 'hidden',
                  'bg-slate-200 text-slate-800 mr-1 mt-2 p-2 text-lg rounded-lg'
                )}
              >
                <a
                  target="blank"
                  href={`https://www.instagram.com/${user?.social?.instagram_username}`}
                >
                  <faLocation />
                </a>
              </div>
              <div
                className={clsx(
                  user?.social?.paypal_email ? 'block' : 'hidden',
                  'bg-slate-200 text-slate-800 mr-1 mt-2 p-2 text-lg rounded-lg'
                )}
              >
                <a target="blank" href={user?.social?.paypal_email}>
                  <RiPaypalFill />
                </a>
              </div>
              <div
                className={clsx(
                  user?.social?.portfolio_url ? 'block' : 'hidden',
                  'bg-slate-200 text-slate-800 mr-1 mt-2 p-2 text-lg rounded-lg'
                )}
              >
                <a target="blank" href={user?.social?.portfolio_url}>
                  <GiEarthAmerica />
                </a>
              </div>
              <div
                className={clsx(
                  user?.social?.twitter_username ? 'block' : 'hidden',
                  'bg-slate-200 text-slate-800 mr-1 mt-2 p-2 text-lg rounded-lg'
                )}
              >
                <a
                  target="blank"
                  href={`https://twitter.com/${user?.social?.twitter_username}`}
                >
                  <BsTwitter />
                </a>
              </div>
            </div>
          </div>
        </div>
      </div>
      <div className="mt-4">
        <Divider height="xs" />
      </div>
      <div className="mt-4">
        <Masonry
          breakpointCols={windowWidth}
          className="my-masonry-grid"
          columnClassName="my-masonry-grid_column"
        >
          {user?.photos?.map((item: photosProps) => {
            return (
              <div className="flex items-center justify-between" key={item.id}>
                <img
                  src={item?.urls?.regular}
                  alt=""
                  className="w-full rounded-lg"
                />
              </div>
            )
          })}
        </Masonry>
      </div>
    </div>
    );
};