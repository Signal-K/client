import React from "react";
import Link from "next/link";
import { format } from "date-fns";

export type Profile = {
  id: string;
  avatar_url: string;
  username: string;
};

export type TProps = {
  id: number;
  content: string;
  created_at: string;
  profiles: Profile;
  media: any[];
  anomaly: number;
  classificationtype: any;
  anomalies: {
    avatar_url: string;
    anomalytype: string;
  };
  classificationCount: number;
  classificationConfiguration: any; // Field to check for non-null values
};

const CardForum: React.FC<TProps> = ({
  id,
  content,
  created_at,
  profiles,
  media,
  anomaly,
  classificationtype,
  anomalies,
  classificationCount,
  classificationConfiguration // Field to check for non-null values
}) => {
  const formattedDate = format(new Date(created_at), "MMM dd, yyyy");
  const userMedia = media[0] || [];
  const anomalyImage = media[1]?.assetMentioned || '';
  const anomalyAvatarUrl = anomalies?.avatar_url || '/default-anomaly-avatar.png';

  // Convert classificationtype object to an array of hashtags
  const classificationHashtags = classificationtype ? Object.keys(classificationtype).filter(key => classificationtype[key]) : [];

  // Function to handle saving the card as an image

  return (
    <div
      id={`card-${id}`} // ID for the card element for saving as an image
      className="bg-white rounded-lg shadow-md p-4 mb-4 w-full max-w-lg"
    >
      {/* User Profile and Date */}
      <Link href={`/profile/${profiles?.username}`}>
        <div className="flex items-center gap-4 cursor-pointer">
          <div className="rounded-full overflow-hidden w-16 h-16">
            <img
              src={profiles?.avatar_url || "https://cdn4.iconfinder.com/data/icons/profession-avatar-5/64/13-astronaut-512.png"}
              alt={profiles?.username}
              className="w-full h-full object-cover"
            />
          </div>
          <div>
            <h2 className="font-semibold">
              {profiles?.username || profiles?.id || "user"}
            </h2>
            <small className="text-gray-500">{formattedDate}</small>
          </div>
        </div>
      </Link>
      
      {/* Post Content */}
      <div className="mt-4">
        <p className="text-gray-700">{content}</p>
      </div>

      {/* Media */}
      {(userMedia.length > 0 || anomalyImage) && (
        <div className="mt-4">
          {userMedia.length > 0 && (
            <div className="mb-4">
              <h4 className="text-sm font-semibold">User Media</h4>
              {userMedia.map((url: string, index: number) => (
                <div key={index} className="mb-2">
                  <img src={url} alt="User media" className="rounded-md w-full h-auto object-cover" />
                </div>
              ))}
            </div>
          )}
          {anomalyImage && (
            <div className="mt-4">
              <h4 className="text-sm font-semibold">Anomaly Image</h4>
              <img src={anomalyImage} alt="Anomaly Image" className="rounded-md w-full h-auto object-cover" />
            </div>
          )}
        </div>
      )}

      {/* Classification Type as Hashtags */}
      {classificationtype && (
        <div className="flex flex-wrap gap-2 mt-4 border-t border-gray-200 pt-2">
          {Object.keys(classificationtype).map((type, index) => (
            <span
              key={index}
              className={`bg-${classificationtype[type] ? 'green-200 text-green-800' : 'red-200 text-red-800'} px-2 py-1 rounded-md text-xs`}
            >
              #{type}
            </span>
          ))}
        </div>
      )}

      {/* Anomaly Avatar and Text on Same Line */}
      <div className="flex items-center gap-2 mt-4 text-sm text-gray-500">
        <img
          src={anomalyAvatarUrl}
          alt="Anomaly Avatar"
          className="w-16 h-16 object-cover rounded-md"
        />
        <span>Anomaly: {anomaly}</span>
      </div>

      {/* Classification Count */}
      <div className="mt-2 text-sm text-gray-500">
        Classifications for this anomaly: {classificationCount}
      </div>
    </div>
  );
};

export default CardForum;