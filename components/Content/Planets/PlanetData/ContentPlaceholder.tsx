import { CloudArrowUpIcon, LockClosedIcon, ServerIcon } from '@heroicons/react/20/solid';
import React, { useEffect, useState } from 'react';
import LightcurveGenerator from './PopulatePlanetData';
import { useSupabaseClient } from '@supabase/auth-helpers-react';

export default function ContentPlaceholder(planetIdDeepnote) {
  return (
    <center>
      <div className="max-w-2xl w-full bg-white p-8 rounded-lg shadow-xl z-50 mt-10">
        <p className="text-base font-semibold leading-7 text-indigo-600">Planet type</p>
        <h1 className="mt-2 text-3xl font-bold tracking-tight text-gray-900 sm:text-4xl">Planet name</h1>
        <p className="mt-6 text-xl leading-8 text-gray-700">
          Brief summary
        </p>

        <div className="text-gray-700">
            <div className="pt-10">
                {/* <center><iframe title="Embedded cell output" src={planetIdDeepnote}/></center> */}
                <iframe src="https://embed.deepnote.com/f8de697b-ba49-4014-b2b2-fe5f4cc3c026/3c7a3d159d33438fae3b08ca3e5aa88e/9a872bcf31674fcf8f46c75daf205168?height=264.1875" />
            </div>

          <ul role="list" className="mt-8 space-y-8 text-gray-600">
            <li className="flex gap-x-3">
              <CloudArrowUpIcon className="mt-1 h-5 w-5 flex-none text-indigo-600" aria-hidden="true" />
              <span>
                <strong className="font-semibold text-gray-900">Push to deploy.</strong> Lorem ipsum, dolor sit amet consectetur adipisicing elit. Maiores impedit perferendis suscipit eaque, iste dolor cupiditate blanditiis ratione.
              </span>
            </li>
            <li className="flex gap-x-3">
              <LockClosedIcon className="mt-1 h-5 w-5 flex-none text-indigo-600" aria-hidden="true" />
              <span>
                <strong className="font-semibold text-gray-900">SSL certificates.</strong> Anim aute id magna aliqua ad ad non deserunt sunt. Qui irure qui lorem cupidatat commodo.
              </span>
            </li>
            <li className="flex gap-x-3">
              <ServerIcon className="mt-1 h-5 w-5 flex-none text-indigo-600" aria-hidden="true" />
              <span>
                <strong className="font-semibold text-gray-900">Database backups.</strong> Ac tincidunt sapien vehicula erat auctor pellentesque rhoncus. Et magna sit morbi lobortis.
              </span>
            </li>
          </ul>

          <p className="mt-8">
            Et vitae blandit facilisi magna lacus commodo. Vitae sapien duis odio id et. Id blandit molestie auctor fermentum dignissim. Lacus diam tincidunt ac cursus in vel. Mauris varius vulputate et ultrices hac adipiscing egestas. Iaculis convallis ac tempor et ut. Ac lorem vel integer orci.
          </p>
        </div>
      </div>
      </center>
  );
};

export function LightkurveBaseGraph({ planetId }: { planetId: { planetId: string } }) {
  const supabase = useSupabaseClient();
  const [planetData, setPlanetData] = useState(null);

  // Extract the planetId from the object
  const extractedPlanetId = planetId.planetId;

  return (
    <center>
      <div className="max-w-2xl w-full bg-white p-8 rounded-lg shadow-xl z-50 mt-10">
      <p className="mt-6 text-xl leading-8 text-gray-700">
        Brief summaary: owner, sectors, etc
      </p>

      <div className="text-gray-700">
        <div className="pt-10">
          <LightcurveGenerator planetId={extractedPlanetId} />
        </div>
      </div>
      </div>
    </center>
  );
};