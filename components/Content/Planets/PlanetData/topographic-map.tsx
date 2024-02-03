import React from "react";

export function TopographicMap() {
  return (
<div className="flex-col justify-center">
      <style jsx global>
        {`
          body {
            background: url('https://cdn.cloud.scenario.com/assets/W-75HHaTTKCFP_P51OMQVA?p=100&Policy=eyJTdGF0ZW1lbnQiOlt7IlJlc291cmNlIjoiaHR0cHM6Ly9jZG4uY2xvdWQuc2NlbmFyaW8uY29tL2Fzc2V0cy9XLTc1SEhhVFRLQ0ZQX1A1MU9NUVZBP3A9MTAwKiIsIkNvbmRpdGlvbiI6eyJEYXRlTGVzc1RoYW4iOnsiQVdTOkVwb2NoVGltZSI6MTcxMDQ2MDc5OX19fV19&Key-Pair-Id=K36FIAB9LE2OLR&Signature=uKevl4LFfDomkvnHRbSQEjUjm5GC4eeTxD4xq-gGmt55GtBDaWe2HmcOcPDhh-2j9HqRKjBQXSjEJJMikk5wnxTMiYobp0l9K-M9WSnj-t6RPQVUpLzfy7foMSMwoMhGbsZ-pDDbyX9IMu-Q0yJKSEWhGsKXCmxv26UyV4qIMevDZvSbr3b8cFg6z90oliOi3DwROTswg9BHbk-iMTGm3vNgck4UIA5jerWXvojzH7y~zSHCtD2A4bkLv-eDOGyB3I~8LrfIDnE6bDgxbEgl2f1QRQl0N2HpDD6liXhgAZHmHGYjGFZv1ill4bHFKr5Ti7qQELGR1hax3sm9-he9tQ__') center/cover;
          }
          @media only screen and (max-width: 1000px) {
            body {
              background: url('/void.png') center/cover;
            }
          }
          @media only screen and (max-width: 767px) {
            .planet-heading {
              color: white;
              font-size: 24px;
              text-align: center;
              margin-bottom: 10px;
            }
          }
        `}
      </style>
      <div className="relative text-white h-screen w-full overflow-hidden">
        <img
          alt="Planet Mycelium"
          className="object-cover h-full w-full"
          height="1080"
          src="/placeholder.svg"
          style={{
            aspectRatio: "1920/1080",
            objectFit: "cover",
          }}
          width="1920"
        />
        <div className="absolute inset-0 grid grid-cols-3 grid-rows-3 gap-4 p-8">
          <button className="justify-self-start self-start">
            <img
              alt="Structure 1"
              className="w-12 h-12"
              height="50"
              src="https://qwbufbmxkjfaikoloudl.supabase.co/storage/v1/object/public/planets/71/TOI%20700.png"
              style={{
                aspectRatio: "50/50",
                objectFit: "cover",
              }}
              width="50"
            />
          </button>
          <button className="justify-self-center self-start">
            <img
              alt="Structure 2"
              className="w-12 h-12"
              height="50"
              src="https://qwbufbmxkjfaikoloudl.supabase.co/storage/v1/object/public/planets/71/TOI%20700.png"
              style={{
                aspectRatio: "50/50",
                objectFit: "cover",
              }}
              width="50"
            />
          </button>
          <button className="justify-self-end self-start">
            <img
              alt="Structure 3"
              className="w-12 h-12"
              height="50"
              src="https://qwbufbmxkjfaikoloudl.supabase.co/storage/v1/object/public/planets/71/TOI%20700.png"
              style={{
                aspectRatio: "50/50",
                objectFit: "cover",
              }}
              width="50"
            />
          </button>
          <button className="justify-self-start self-center">
            <img
              alt="Structure 4"
              className="w-12 h-12"
              height="50"
              src="https://qwbufbmxkjfaikoloudl.supabase.co/storage/v1/object/public/planets/71/TOI%20700.png"
              style={{
                aspectRatio: "50/50",
                objectFit: "cover",
              }}
              width="50"
            />
          </button>
          <button className="justify-self-center self-center">
            <img
              alt="Structure 5"
              className="w-48 h-48"
              height="50"
              src="https://qwbufbmxkjfaikoloudl.supabase.co/storage/v1/object/public/planets/71/TOI%20700.png"
              style={{
                aspectRatio: "50/50",
                objectFit: "cover",
              }}
              width="50"
            />
          </button>
          <button className="justify-self-end self-center">
            <img
              alt="Structure 6"
              className="w-12 h-12"
              height="50"
              src="https://qwbufbmxkjfaikoloudl.supabase.co/storage/v1/object/public/planets/71/TOI%20700.png"
              style={{
                aspectRatio: "50/50",
                objectFit: "cover",
              }}
              width="50"
            />
          </button>
          <button className="justify-self-start self-end">
            <img
              alt="Structure 7"
              className="w-12 h-12"
              height="50"
              src="https://qwbufbmxkjfaikoloudl.supabase.co/storage/v1/object/public/planets/71/TOI%20700.png"
              style={{
                aspectRatio: "50/50",
                objectFit: "cover",
              }}
              width="50"
            />
          </button>
          <button className="justify-self-center self-end">
            <img
              alt="Structure 8"
              className="w-12 h-12"
              height="50"
              src="https://qwbufbmxkjfaikoloudl.supabase.co/storage/v1/object/public/planets/71/TOI%20700.png"
              style={{
                aspectRatio: "50/50",
                objectFit: "cover",
              }}
              width="50"
            />
          </button>
          <button className="justify-self-end self-end">
            <img
              alt="Structure 9"
              className="w-12 h-12"
              height="50"
              src="https://qwbufbmxkjfaikoloudl.supabase.co/storage/v1/object/public/planets/71/TOI%20700.png"
              style={{
                aspectRatio: "50/50",
                objectFit: "cover",
              }}
              width="50"
            />
          </button>
</div>
        </div>
        <div className="absolute top-0 left-0 right-0 mx-auto mt-8 text-center">
          <h1 className="text-4xl font-bold">MYCELIUM</h1>
        </div>
        <div className="absolute bottom-0 left-0 right-0 mx-auto mb-8 text-center space-x-4">
          <span className="text-sm">GALAXY Shroomulon</span>
          <span className="text-sm">DIAMETER 56,780 km</span>
          <span className="text-sm">DAY LENGTH 12 Earth hours</span>
          <span className="text-sm">AVG TEMPERATURE 10°C to 28°C</span>
          <span className="text-sm">CLIMATE Psilocybin</span>
        </div>
      </div>
  )
}
